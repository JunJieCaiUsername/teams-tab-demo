import {
  makeStyles,
  tokens,
  Title1,
  Text,
  Subtitle1,
  Card,
  CardHeader,
  Body2,
  Body1,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
    textAlign: "left",
  },
  title: {
    textAlign: "center",
  },
  paragraph: {
    lineHeight: 1.5,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: tokens.spacingHorizontalL,
  },
  card: {
    padding: tokens.spacingVerticalL,
  },
  cardHeader: {
    paddingBottom: tokens.spacingVerticalS,
  },
});

const Homepage = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Title1 as="h1" className={styles.title}>
        Welcome to the Teams Tab Demo Hub
      </Title1>
      <Body2 className={styles.paragraph}>
        This is an app demonstrating features and provide guidance for
        developing Microsoft Teams Tab App, especially within the 21Vianet
        environment in China.
      </Body2>
      <Body2 className={styles.paragraph}>
        Please select one of the demo scenarios from the navigation bar on the
        left to get started. Each demo is designed to showcase a specific topic
        of the Teams Tab.
      </Body2>

      <Subtitle1 as="h2">Topics</Subtitle1>
      <div className={styles.cardGrid}>
        <Card className={styles.card}>
          <CardHeader
            className={styles.cardHeader}
            header={<Text weight="semibold">Authentications</Text>}
            description={
              <Text size={200}>Embed your web content within Teams.</Text>
            }
          />

          <Body1>
            Tabs are Teams-aware webpages that you can embed in channels, group
            chats, or as a personal app. They provide a full-screen, interactive
            experience for your users right inside the Teams client.
          </Body1>
        </Card>
      </div>
    </div>
  );
};

export default Homepage;
