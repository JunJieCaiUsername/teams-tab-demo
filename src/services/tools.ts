/**
 * Utility functions for token and data manipulation
 */

/**
 * Interface for JWT token claims
 */
export interface TokenClaims {
  [key: string]: string | number | boolean | object | undefined;
}

/**
 * Decode JWT token to get claims
 * @param token - The JWT token to decode
 * @returns The decoded token payload as an object
 */
export const decodeToken = (token: string): TokenClaims => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return {};
  }
};
