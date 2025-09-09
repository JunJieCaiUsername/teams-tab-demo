import React, { Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import {
  MsalProvider,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import {
  FluentProvider,
  makeStyles,
  tokens,
  Button,
  Title1,
  Text,
  Spinner,
} from "@fluentui/react-components";
import { PanelLeftTextRegular } from "@fluentui/react-icons";
import { lightTheme } from "./theme";
import Navigation from "./layouts/Navigation";
import {
  initializeMSAL,
  acquireToken,
  getMSALInstance,
} from "./services/authService";
import { getUserInfoScopes } from "./services/graph";
import {
  getEnvironmentType,
  Environment,
  type EnvironmentType,
} from "./services/environmentDetection";

const Homepage = React.lazy(() => import("./features/homepage/Homepage"));
const TeamsAppAuthDemo = React.lazy(
  () => import("./features/teams-auth/TeamsAppAuthDemo")
);

const useStyles = makeStyles({
  appContainer: {
    display: "flex",
    minHeight: "100vh",
    overflow: "hidden",
    position: "relative",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  mainContentContainer: {
    flex: 1,
    width: "100%",
    height: "100vh",
    overflowY: "auto",
    overflowX: "hidden",
    transition: `margin-left ${tokens.durationSlower} ${tokens.curveDecelerateMax}`,
    "@media (min-width: 769px)": {
      // set up a variable gets the value based on isDrawerOpen and provide to marginLeft
      // On wider screens, push content when drawer is open
      marginLeft: "var(--drawer-width, 0px)",
    },
    "@media (max-width: 768px)": {
      // On mobile, content is not pushed (overlay behavior)
      marginLeft: "0px",
    },
  },
  mainContent: {
    // maxWidth limits content to 800px for better readability on large screens
    // When space is less than 800px, content will squeeze to fit
    // margin: 0 auto centers the content, so on medium screens it looks both pushed and squeezed
    padding: tokens.spacingVerticalXXL,
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
  },
  drawerToggleButton: {
    position: "fixed",
    top: tokens.spacingVerticalM,
    left: tokens.spacingHorizontalS,
    zIndex: 1001,
    opacity: 1,
    animationName: {
      "0%": {
        opacity: 0,
      },
      "100%": {
        opacity: 1,
      },
    },
    animationDuration: tokens.durationNormal,
    animationTimingFunction: tokens.curveEasyEase,
    animationFillMode: "both",
  },
  centerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100vw",
    padding: tokens.spacingVerticalXXL,
  },
  title: {
    textAlign: "center",
    marginBottom: tokens.spacingVerticalXXL,
  },
  environmentBadge: {
    position: "fixed",
    top: tokens.spacingVerticalM,
    right: tokens.spacingHorizontalM,
    padding: tokens.spacingHorizontalXS,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
    zIndex: 1002,
  },
  primaryText: {
    textAlign: "center",
    marginBottom: tokens.spacingVerticalL,
  },
  secondaryText: {
    textAlign: "center",
    marginBottom: tokens.spacingVerticalL,
  },
  errorTitle: {
    color: "red",
    marginBottom: tokens.spacingVerticalL,
  },
});

function MainContent({
  initializationLoading,
  initializationError,
}: {
  initializationLoading: boolean;
  initializationError: string | null;
}) {
  const styles = useStyles();
  const { inProgress } = useMsal(); // MSAL hooks
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [environment, setEnvironment] = useState<EnvironmentType>(
    Environment.UNKNOWN
  );
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [authError, setAuthError] = useState<string | null>(null);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Detect environment (only once, result will be cached)
  useEffect(() => {
    const detectEnv = async () => {
      const envType = await getEnvironmentType();
      setEnvironment(envType);
    };

    detectEnv();
  }, []);

  /*******************************************************************************
   * Authentication Logic - Use authService to handle NAA and Web environment    *
   *******************************************************************************/
  useEffect(() => {
    const handleAuthentication = async () => {
      if (inProgress === "none" && !initializationLoading && !authError) {
        try {
          console.log(`${environment} environment: attempting authentication`);
          // authService's acquireToken will automatically handle:
          // - If no account: login and get token
          // - If account exists: silent token acquisition or interactive acquisition
          const result = await acquireToken(getUserInfoScopes());
          setAccessToken(result.accessToken);
          setAuthError(null); // Clear previous errors
        } catch (error) {
          console.error("Authentication failed:", error);
          // If it's a redirect error (Web environment), this is normal
          if (error instanceof Error && error.message.includes("Redirecting")) {
            console.log("Redirecting to login page...");
          } else {
            setAuthError(
              error instanceof Error ? error.message : "Authentication failed"
            );
          }
        }
      }
    };

    // Only execute authentication after environment detection is complete
    // and only if not Teams(No NAA) environment
    if (
      environment !== Environment.UNKNOWN &&
      environment !== Environment.TEAMS_NO_NAA
    ) {
      handleAuthentication();
    }
  }, [inProgress, environment, initializationLoading, authError]); // if error, no code will run
  /***************************************************************************/

  return (
    <div className={styles.appContainer}>
      {/* Environment indicator */}
      <div className={styles.environmentBadge}>{environment}</div>

      <AuthenticatedTemplate>
        {!isDrawerOpen && (
          <Button
            appearance="subtle"
            icon={<PanelLeftTextRegular />}
            onClick={toggleDrawer}
            className={styles.drawerToggleButton}
          />
        )}

        <Navigation
          accessToken={accessToken}
          isOpen={isDrawerOpen}
          onToggle={toggleDrawer}
        />

        <div
          className={styles.mainContentContainer}
          style={
            {
              // CSS custom property to control marginLeft dynamically
              "--drawer-width": isDrawerOpen ? "280px" : "0px",
            } as React.CSSProperties
          }
        >
          <main className={styles.mainContent}>
            <Suspense fallback={<Spinner label="Loading content..." />}>
              <Routes>
                <Route path="/auth-demo" element={<TeamsAppAuthDemo />} />
                <Route path="/" element={<Homepage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <div className={styles.centerContent}>
          <Title1 className={styles.title}>Teams App Demo</Title1>

          {/* Show initialization MSAL error */}
          {initializationError && (
            <>
              <Title1 className={styles.errorTitle}>
                Initialization Error
              </Title1>
              <Text size={500} className={styles.primaryText}>
                {initializationError}
              </Text>
            </>
          )}

          {/* Show Teams(No NAA) as initialization error */}
          {environment === Environment.TEAMS_NO_NAA && (
            <>
              <Title1 className={styles.errorTitle}>
                Environment Not Supported
              </Title1>
              <Text size={500} className={styles.primaryText}>
                This application is designed to work with NAA (Nested App
                Authentication) in Teams.
              </Text>
              <Text size={300} className={styles.secondaryText}>
                Current environment: <strong>{environment}</strong>
              </Text>
              <Text size={300} className={styles.secondaryText}>
                Please use a Teams environment that supports NAA or access the
                app through a web browser.
              </Text>
            </>
          )}

          {/* Show authentication error */}
          {authError && environment !== Environment.TEAMS_NO_NAA && (
            <>
              <Title1 className={styles.errorTitle}>
                Authentication Error
              </Title1>
              <Text size={500} className={styles.primaryText}>
                {authError}
              </Text>
            </>
          )}

          {/* Normal loading state */}
          {!initializationError &&
            !authError &&
            environment !== Environment.TEAMS_NO_NAA && (
              <>
                <Text size={500} className={styles.primaryText}>
                  Current environment: <strong>{environment}</strong>
                </Text>
                <Text size={300} className={styles.secondaryText}>
                  {initializationLoading
                    ? "Initializing app..."
                    : environment === Environment.UNKNOWN
                    ? "Detecting environment..."
                    : `Signing you in automatically (${
                        environment === Environment.TEAMS_NAA
                          ? "NAA"
                          : "Redirect"
                      })...`}
                </Text>
                <Spinner
                  label={
                    initializationLoading
                      ? "Initializing app..."
                      : environment === Environment.UNKNOWN
                      ? "Detecting environment..."
                      : "Signing in..."
                  }
                />
              </>
            )}
        </div>
      </UnauthenticatedTemplate>
    </div>
  );
}

function App() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize MSAL
    initializeMSAL()
      .then(() => {
        setInitialized(true);
      })
      .catch((err) => {
        console.error("Failed to initialize MSAL:", err);
        setError("Failed to initialize authentication");
      });
  }, []);

  // If not initialized yet, show loading state
  if (!initialized) {
    return (
      <FluentProvider theme={lightTheme}>
        <MainContent
          initializationLoading={!error}
          initializationError={error}
        />
      </FluentProvider>
    );
  }

  // Initialization complete, use instance from authService directly
  return (
    <MsalProvider instance={getMSALInstance()}>
      <FluentProvider theme={lightTheme}>
        <MainContent initializationLoading={false} initializationError={null} />
      </FluentProvider>
    </MsalProvider>
  );
}

export default App;
