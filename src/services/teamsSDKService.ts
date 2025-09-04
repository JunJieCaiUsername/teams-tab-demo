import { app } from "@microsoft/teams-js";

// Teams SDK initialization status
let isTeamsSDKInitialized = false;
let teamsInitializationError: Error | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize Teams SDK (should be called once at app startup)
 * @returns Promise<void>
 */
export async function initializeTeamsSDK(): Promise<void> {
  // If already initialized or in progress, return existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = performInitialization();
  return initializationPromise;
}

/**
 * Get current Teams SDK initialization status
 * @returns Object with initialization status and error (if any)
 */
export function getTeamsSDKStatus() {
  return {
    isInitialized: isTeamsSDKInitialized,
    error: teamsInitializationError,
  };
}

/**
 * Internal function to perform the actual initialization
 * Must include the validMessageOrigins parameter for China cloud
 */
async function performInitialization(): Promise<void> {
  try {
    console.log("Initializing Teams SDK...");
    await app.initialize(["https://teams.microsoftonline.cn"]);
    console.log("Teams SDK initialized successfully");
    isTeamsSDKInitialized = true;
    teamsInitializationError = null;
  } catch (error) {
    console.log(
      "Teams SDK initialization failed (probably not in Teams environment):",
      error
    );
    teamsInitializationError = error as Error;
    isTeamsSDKInitialized = false;

    // According to official docs, initialization failure usually means:
    // 1. Not running in Teams environment (most common)
    // 2. Network timeout
    // 3. Parent window communication failure
  }
}
