import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  NavDrawer,
  NavDrawerHeader,
  NavDrawerBody,
  NavItem,
  Button,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Persona,
  makeStyles,
  tokens,
  AppItem,
  type DrawerProps,
} from "@fluentui/react-components";
import {
  SignOutRegular,
  People32Color,
  PanelLeftTextRegular,
  HomeRegular,
  ShieldKeyholeRegular,
} from "@fluentui/react-icons";
import { getUserInfo, getAvatarUrl } from "../services/graph";
import { signOut } from "../services/authService";
import type { UserInfo } from "../types/UserInfo";

const useStyles = makeStyles({
  toggleButton: {
    marginLeft: "auto",
  },
  navDrawer: {
    width: "280px",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  navDrawerHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  popoverContent: {
    padding: tokens.spacingVerticalM,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    minWidth: "250px",
  },
  signOutButton: {
    width: "100%",
  },
  personaContainer: {
    padding: tokens.spacingVerticalS,
    width: "100%",
    justifyContent: "flex-start",
  },
});

interface NavigationProps {
  accessToken?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  accessToken,
  isOpen,
  onToggle,
}) => {
  const styles = useStyles();
  const [navDrawerType, setNavDrawerType] =
    useState<DrawerProps["type"]>("inline");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [userData, setUserData] = useState<UserInfo>({
    displayName: "User",
    userPrincipalName: "",
    id: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  // React Router hooks:
  // useNavigate: Returns a function to programmatically navigate to a different route (e.g., navigate('/path')).
  //   Use when trying to navigate to other route in response to events (button click, etc).
  // useLocation: Returns the current location object (e.g., { pathname, search, ... }).
  //   Use when you need to read the current route, highlight navigation, or conditionally render based on path.
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user data when accessToken is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (accessToken) {
        try {
          const userInfo = await getUserInfo(accessToken);
          setUserData({
            displayName: userInfo.displayName || "User",
            userPrincipalName: userInfo.userPrincipalName || "",
            id: userInfo.id || "",
          });

          // Fetch user avatar
          if (userInfo.id) {
            const avatarObjectUrl = await getAvatarUrl(
              userInfo.id,
              accessToken
            );
            setAvatarUrl(avatarObjectUrl);
          }
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      }
    };

    fetchUserData();
  }, [accessToken]);

  const handleNavItemClick = (path: string) => {
    navigate(path);
  };

  const onMediaQueryChange = useCallback(
    ({ matches }: { matches: boolean }) =>
      setNavDrawerType(matches ? "overlay" : "inline"),
    [setNavDrawerType]
  );
  useEffect(() => {
    const match = window.matchMedia("(max-width: 768px)");

    if (match.matches) {
      setNavDrawerType("overlay");
    }

    match.addEventListener("change", onMediaQueryChange);

    return () => match.removeEventListener("change", onMediaQueryChange);
  }, [onMediaQueryChange]);
  // NavDrawer: A Fluent UI component for creating a side navigation drawer. It can be used to organize navigation links and actions in a vertical layout.
  // NavDrawerHeader: Used to display content at the top of the drawer, such as app branding, logo, or a toggle button.
  //   - You can put AppItem (for app name/logo), buttons, or any custom content in the header.
  // NavDrawerBody: The main section of the drawer, typically used for navigation links (NavItem) and other interactive elements.
  //   - You can put NavItem (for navigation), dividers, sections, or custom content in the body.
  // NavItem: Represents a single navigation option in the drawer. Each NavItem can have an icon, label, and value for selection.
  // AppItem: Used for branding or displaying the app name/logo, usually placed in the NavDrawerHeader.
  // For more details and customization options, see Fluent UI documentation:
  // https://react.fluentui.dev/?path=/docs/components-navdrawer
  return (
    <NavDrawer
      open={isOpen}
      type={navDrawerType}
      className={styles.navDrawer}
      selectedValue={location.pathname} // Use route as navItem value
    >
      <NavDrawerHeader className={styles.navDrawerHeader}>
        <AppItem icon={<People32Color />} tabIndex={-1}>
          Teams Tab Demo
        </AppItem>
        {/* Drawer Toggle Button */}
        <Button
          appearance="subtle"
          icon={<PanelLeftTextRegular />}
          onClick={onToggle}
          className={styles.toggleButton}
        />
      </NavDrawerHeader>

      <NavDrawerBody>
        <NavItem
          icon={<HomeRegular fontSize={20} />}
          value="/"
          onClick={() => handleNavItemClick("/")}
        >
          Home
        </NavItem>
        <NavItem
          icon={<ShieldKeyholeRegular fontSize={20} />}
          value="/auth-demo"
          onClick={() => handleNavItemClick("/auth-demo")}
        >
          Teams Tab Authentication
        </NavItem>

        {/* Persona Section */}
        <div style={{ marginTop: "auto", paddingTop: tokens.spacingVerticalL }}>
          <Popover
            open={popoverOpen}
            onOpenChange={(_, data) => setPopoverOpen(data.open)}
          >
            <PopoverTrigger disableButtonEnhancement>
              <Button appearance="subtle" className={styles.personaContainer}>
                <Persona
                  name={userData.displayName || "User"}
                  secondaryText={userData.userPrincipalName || ""}
                  presence={{ status: "available" }}
                  avatar={{
                    image: {
                      src: avatarUrl,
                    },
                  }}
                  size="medium"
                />
              </Button>
            </PopoverTrigger>
            <PopoverSurface className={styles.popoverContent}>
              <Button
                appearance="primary"
                icon={<SignOutRegular />}
                className={styles.signOutButton}
                onClick={() => signOut().catch(console.error)}
              >
                Sign Out
              </Button>
            </PopoverSurface>
          </Popover>
        </div>
      </NavDrawerBody>
    </NavDrawer>
  );
};

export default Navigation;
