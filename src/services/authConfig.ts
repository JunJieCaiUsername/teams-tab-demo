import type { Configuration } from "@azure/msal-browser";
import { LogLevel } from "@azure/msal-browser";

// NAA (Nested App Authentication) configuration for Teams
// supportsNestedAppAuth is not required if using createNestablePublicClientApplication
// Reference: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md
const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID, // Application (client) ID
    authority: import.meta.env.VITE_AZURE_AUTHORITY, // Tenant ID
  },
  cache: {
    cacheLocation: "sessionStorage", // Configures cache location
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Verbose,
      loggerCallback: (level, message) => {
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      piiLoggingEnabled: true,
    },
  },
};

/**
 * Get the MSAL configuration
 * @returns MSAL Configuration object
 */
export function getMSALConfig(): Configuration {
  return msalConfig;
}

/**
 * Get the redirect URI for popup and silent authentication
 * This should point to a blank page to improve performance and prevent issues
 * @returns Redirect URI string
 */
export function getRedirectUri(): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/blank.html`;
}
