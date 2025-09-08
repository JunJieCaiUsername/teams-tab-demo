import {
  createStandardPublicClientApplication,
  createNestablePublicClientApplication,
} from "@azure/msal-browser";
import type {
  IPublicClientApplication,
  AuthenticationResult,
  SilentRequest,
} from "@azure/msal-browser";
import {
  isNAASupported,
  getEnvironmentType,
  Environment,
} from "./environmentDetection";
import { getMSALConfig, getRedirectUri } from "./authConfig";

let msalInstance: IPublicClientApplication | null = null;
let currentEnvironment: string | null = null;

/**
 * Initialize MSAL instance
 * Automatically selects appropriate authentication method based on NAA support:
 * - NAA supported: Use NAA (Nested App Authentication)
 * - NAA not supported (even in Teams): Use standard Public Client
 */
export async function initializeMSAL(): Promise<IPublicClientApplication> {
  try {
    // Detect environment (cached after first detection)
    const envType = await getEnvironmentType();
    const naaSupported = await isNAASupported();
    currentEnvironment = envType;

    console.log("Current environment:", envType);
    console.log("NAA supported:", naaSupported);

    if (naaSupported) {
      console.log("Initializing MSAL with NAA support for Teams");

      // Use NAA configuration only when NAA is supported
      msalInstance = await createNestablePublicClientApplication(
        getMSALConfig()
      );

      console.log("NAA instance created successfully");
    } else {
      console.log("Initializing MSAL for standard authentication");
      // Use standard authentication for Web and Teams without NAA
      // Note: handleRedirectPromise is not required in a react app, unless
      // you need to handle the redirect response manually.
      // refer to https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/FAQ.md#how-do-i-handle-the-redirect-flow-in-a-react-app
      msalInstance = await createStandardPublicClientApplication(
        getMSALConfig()
      );
      console.log("Standard instance created successfully");
    }

    return msalInstance;
  } catch (error) {
    console.error("Failed to initialize MSAL:", error);

    // Fallback to standard authentication
    console.log("Falling back to standard authentication");
    msalInstance = await createStandardPublicClientApplication(getMSALConfig());
    console.log("Fallback to standard instance successful");

    return msalInstance;
  }
}

/**
 * Get current MSAL instance
 */
export function getMSALInstance(): IPublicClientApplication {
  if (!msalInstance) {
    throw new Error(
      "MSAL instance not initialized. Call initializeMSAL() first."
    );
  }
  return msalInstance;
}

/**
 * Get access token: always try acquireTokenSilent first, then popup or redirect accordingly.
 */
export async function acquireToken(
  scopes: string[] = ["User.Read"]
): Promise<AuthenticationResult> {
  const instance = getMSALInstance();

  try {
    // Always try silent acquisition first
    const silentRequest: SilentRequest = {
      scopes,
      redirectUri: getRedirectUri(), // Add redirectUri for silent authentication to improve performance
    };
    // For NAA: get/setActiveAccount is considered NO OP api, since the account is managed by the host (Teams)
    // a bridgeproxy works as a proxy to make communication between the Teams (Host App) and Teams tab (Child App)
    // getAllAccounts will return 0 account at first call in NAA scenarios.
    // refer to https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/6d975bcac88832b21e8e1ac030d3802133640005/lib/msal-browser/docs/accounts.md#nested-app-authentication
    const accounts = instance.getAllAccounts();

    // provide the account if there is only one, prompt for selection if more than 1
    // if there is no account, try acquireTokenSilent anyway and then catch the error to acquire token interactively.
    // refer to https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/6d975bcac88832b21e8e1ac030d3802133640005/lib/msal-browser/docs/initialization.md
    if (accounts.length > 0) {
      if (accounts.length > 1) {
        silentRequest.prompt = "select_account";
      } else {
        silentRequest.account = accounts[0];
      }
    }
    console.log(
      `Attempting silent token acquisition for ${currentEnvironment}, request: ${JSON.stringify(
        silentRequest
      )}`
    );
    return await instance.acquireTokenSilent(silentRequest);
  } catch (error) {
    console.log("Silent token acquisition failed:", error);

    // Handle different fallback strategies based on environment
    if (
      currentEnvironment === Environment.TEAMS_NAA ||
      currentEnvironment === Environment.TEAMS_NO_NAA
    ) {
      // Teams environments: Use popup
      console.log("Falling back to popup login in Teams");
      return await instance.loginPopup({
        scopes,
        redirectUri: getRedirectUri(), // Add redirectUri for popup authentication to improve performance
      });
    } else {
      // Browser environment: Use redirect (on purpose, to demo redirect)
      console.log("Falling back to redirect login in browser");
      await instance.loginRedirect({ scopes });
      throw new Error("Redirecting to login...");
    }
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  const instance = getMSALInstance();
  const account = instance.getActiveAccount() || instance.getAllAccounts()[0];

  if (account) {
    if (
      currentEnvironment === Environment.TEAMS_NAA ||
      currentEnvironment === Environment.TEAMS_NO_NAA
    ) {
      // In Teams NAA environment, it won't work, cause NAA just doesn't support logout
      await instance.logoutPopup({
        account,
      });
    } else {
      // Use redirect logout in Web environment
      await instance.logoutRedirect({
        account,
      });
    }
  }
}
