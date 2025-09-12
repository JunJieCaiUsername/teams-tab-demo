import React, { useEffect, useState } from "react";
import {
  Text,
  makeStyles,
  tokens,
  Spinner,
  Title1,
  Subtitle1,
} from "@fluentui/react-components";
import ProfileData from "./ProfileData";
import NAAIntroduction from "./NAAIntroduction";
import type { UserInfo } from "../../types/UserInfo";
import { acquireToken } from "../../services/authService";
import { getUserInfo, getUserInfoScopes } from "../../services/graph";

const useStyles = makeStyles({
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
  },
  title: {
    textAlign: "left",
    marginBottom: tokens.spacingVerticalXXXL,
  },
  loading: {
    textAlign: "center",
    marginTop: tokens.spacingVerticalL,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalM,
  },
  profileContainer: {
    width: "100%",
    maxWidth: "800px",
  },
});

const TeamsAppAuthDemo: React.FC = () => {
  const styles = useStyles();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Use authService to acquire token
        const tokenResponse = await acquireToken(getUserInfoScopes());
        setAccessToken(tokenResponse.accessToken);

        // Use the token to get user information
        const userData = await getUserInfo(tokenResponse.accessToken);
        setUserInfo(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className={styles.mainContent}>
      <Title1 as="h1" className={styles.title}>
        为普通 AAD 网站启用 Teams NAA
      </Title1>

      <NAAIntroduction />
      <Subtitle1 as="h3">Graph API 调用演示</Subtitle1>
      {loading ? (
        <div className={styles.loading}>
          <Spinner size="large" />
          <Text>Loading user information...</Text>
        </div>
      ) : (
        userInfo &&
        accessToken && (
          <div className={styles.profileContainer}>
            <ProfileData graphData={userInfo} accessToken={accessToken} />
          </div>
        )
      )}
    </div>
  );
};

export default TeamsAppAuthDemo;
