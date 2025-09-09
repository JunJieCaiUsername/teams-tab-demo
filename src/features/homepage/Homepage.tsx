import {
  makeStyles,
  tokens,
  Text,
  Subtitle1,
  Card,
  CardHeader,
  Body2,
  type CardHeaderSlots,
  LargeTitle,
} from "@fluentui/react-components";
import { ArrowRightFilled, GlobeShieldColor } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";

// Define the type for demo cards
interface DemoCard {
  title: string;
  description: string;
  content: string;
  route: string;
  image?: CardHeaderSlots["image"];
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
    textAlign: "left",
  },
  title: {
    textAlign: "left",
  },
  paragraph: {
    lineHeight: 1.5,
  },
  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalL,
  },
  card: {
    padding: tokens.spacingVerticalL,
    width: "320px",
    height: "200px",
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    transition: `box-shadow ${tokens.durationNormal} ${tokens.curveEasyEase}, transform ${tokens.durationNormal} ${tokens.curveEasyEase}, background-color ${tokens.durationNormal} ${tokens.curveEasyEase}`,
    "&:hover": {
      boxShadow: tokens.shadow16,
      transform: "scale(1.02)",
      backgroundColor: `${tokens.colorNeutralBackground1} !important`,
    },
    "&:active": {
      transform: "scale(0.98)",
      boxShadow: tokens.shadow4,
      backgroundColor: `${tokens.colorNeutralBackground1} !important`,
    },
  },
  cardHeader: {
    paddingBottom: tokens.spacingVerticalS,
  },
});

const Homepage = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  // Define demo cards data
  const demoCards: DemoCard[] = [
    {
      title: "Authentication",
      description: "Implementation guide for NAA",
      content:
        "A demo demonstrates how to convert a regular Azure AD protected application to support both web browsers and Teams environments, providing a unified authentication experience.",
      route: "/auth-demo",
      image: <GlobeShieldColor fontSize={36} />,
    },
    // Add more demo cards here in the future
  ];

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className={styles.container}>
      <LargeTitle as="h1" className={styles.title}>
        Welcome to the Teams Tab Demo Hub
      </LargeTitle>
      <Body2 className={styles.paragraph}>
        This is an app demonstrating features and provide guidance for
        developing Microsoft Teams Tab App, especially within the 21Vianet
        environment in China.
      </Body2>
      <Body2 className={styles.paragraph}>
        Please select one of the demo scenarios to get started. Each demo is
        designed to showcase a specific topic of the Teams Tab.
      </Body2>

      <Subtitle1 as="h2">Topics</Subtitle1>
      <div className={styles.cardGrid}>
        {demoCards.map((card, index) => (
          <Card
            key={index}
            appearance="filled"
            size="large"
            className={styles.card}
            onClick={() => handleCardClick(card.route)}
          >
            <CardHeader
              className={styles.cardHeader}
              header={<Text weight="semibold">{card.title}</Text>}
              description={<Text size={200}>{card.description}</Text>}
              image={card.image}
              action={<ArrowRightFilled />}
            />
            <Text size={200}>{card.content}</Text>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
