// Microsoft Graph API configuration with configurable base URL
// Supports different Microsoft clouds:
// - Global: https://graph.microsoft.com
// - China: https://microsoftgraph.chinacloudapi.cn
// - US Government: https://graph.microsoft.us
// - Germany: https://graph.microsoft.de

// API paths for Microsoft Graph endpoints
const API_PATHS = {
  me: "/v1.0/me",
  userPhoto: "/v1.0/users",
};

// Helper function to build Graph API URLs
export function buildGraphUrl(apiPath: string): string {
  const baseUrl =
    import.meta.env.VITE_GRAPH_BASE_URL || "https://graph.microsoft.com";
  return `${baseUrl}${apiPath}`;
}

// Scopes required for getUserInfo function
const USER_INFO_SCOPES = ["User.Read"];
// Get required scopes for getUserInfo function
export function getUserInfoScopes(): string[] {
  return [...USER_INFO_SCOPES];
}

//Returns information about the user
export async function getUserInfo(accessToken: string) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(buildGraphUrl(API_PATHS.me), options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

// Fetch user avatar from Microsoft Graph and return object URL
//https://learn.microsoft.com/en-us/graph/api/profilephoto-get
export async function getAvatarUrl(
  userId: string,
  accessToken: string
): Promise<string | undefined> {
  if (!userId || !accessToken) {
    return undefined;
  }

  try {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    headers.append("Authorization", bearer);

    const options = {
      method: "GET",
      headers: headers,
    };

    const response = await fetch(
      buildGraphUrl(`${API_PATHS.userPhoto}/${userId}/photo/$value`),
      options
    );

    if (!response.ok) {
      console.log(`Failed to fetch user photo: ${response.status}`);
      return undefined;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.log("Error fetching user photo:", error);
    return undefined;
  }
}

//Add more graph API calls as needed
