import { app, HostName, nestedAppAuth } from "@microsoft/teams-js";
import { getTeamsSDKStatus } from "./teamsSDKService";

/**
 * Environment type constants
 * In this demo, only WEB and Teams_NAA scenarios are implemented
 */
export const Environment = {
  WEB: "Web Browser",
  TEAMS_NO_NAA: "Teams (No NAA)",
  TEAMS_NAA: "Teams (NAA Supported)",
  UNKNOWN: "Unknown",
} as const;

export type EnvironmentType = (typeof Environment)[keyof typeof Environment];

// Cache environment detection result to avoid repeated detection
let cachedEnvironment: EnvironmentType | null = null;
let environmentPromise: Promise<EnvironmentType> | null = null;

/**
 * Check if currently running in Teams environment (with caching)
 * @returns Promise<boolean>
 */
export async function isRunningInTeams(): Promise<boolean> {
  const envType = await getEnvironmentType();
  return (
    envType === Environment.TEAMS_NO_NAA || envType === Environment.TEAMS_NAA
  );
}

/**
 * Check if NAA (Nested App Authentication) is supported in current environment
 * @returns Promise<boolean>
 */
export async function isNAASupported(): Promise<boolean> {
  const envType = await getEnvironmentType();
  return envType === Environment.TEAMS_NAA;
}

/**
 * Get environment type string (for display)
 * @returns Promise<EnvironmentType>
 */
export async function getEnvironmentType(): Promise<EnvironmentType> {
  // If cached result exists, return it directly
  if (cachedEnvironment !== null) {
    return cachedEnvironment;
  }

  // If detection is in progress, return the same Promise
  if (environmentPromise) {
    return environmentPromise;
  }

  // Start new environment detection
  environmentPromise = detectEnvironmentType();
  cachedEnvironment = await environmentPromise;

  return cachedEnvironment;
}

/**
 * Internal function: Actually perform environment detection
 * @returns Promise<EnvironmentType>
 */
async function detectEnvironmentType(): Promise<EnvironmentType> {
  try {
    // Check global initialization status
    const { isInitialized, error } = getTeamsSDKStatus();

    if (!isInitialized) {
      console.log(
        "Teams SDK not initialized or initialization failed:",
        error?.message
      );
      return Environment.WEB;
    }

    // Teams SDK is initialized, check if we're in Teams environment
    console.log("Detecting Teams environment...");
    const context = await app.getContext();
    console.log("Retrieved context:", context);

    // Check if we can get Teams context
    if (
      context &&
      context.app?.host?.name &&
      (context.app.host.name === HostName.teams ||
        context.app.host.name === HostName.teamsModern ||
        context.app.host.name === HostName.outlook ||
        context.app.host.name === HostName.office)
    ) {
      // We're in Teams environment, now check NAA support
      console.log("Running in Teams environment, checking NAA support...");

      try {
        const isNAARecommended = nestedAppAuth.isNAAChannelRecommended();
        console.log("NAA channel recommended:", isNAARecommended);

        if (isNAARecommended) {
          return Environment.TEAMS_NAA;
        } else {
          return Environment.TEAMS_NO_NAA;
        }
      } catch (naaError) {
        console.log("Failed to check NAA support:", naaError);
        // If NAA check fails, assume no NAA support
        return Environment.TEAMS_NO_NAA;
      }
    }
    // Not in Teams environment
    return Environment.WEB;
  } catch (error) {
    // Failed to get Teams context
    console.log("Failed to get Teams context:", error);
    return Environment.WEB;
  }
}
