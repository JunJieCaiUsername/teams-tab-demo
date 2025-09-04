import {
  makeStyles,
  tokens,
  Title1,
  Text,
  Subtitle1,
  Card,
  CardHeader,
  CardPreview,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "left",
  },
  title: {
    textAlign: "center",
    marginBottom: tokens.spacingVerticalL,
  },
  paragraph: {
    marginBottom: tokens.spacingVerticalL,
    lineHeight: "1.6",
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
      <Text size={400} className={styles.paragraph}>
        This is an app demonstrating features and provide guidance for
        developing Microsoft Teams apps, especially within the 21Vianet
        environment in China.
      </Text>
      <Text size={400} className={styles.paragraph}>
        Please select one of the demo scenarios from the navigation bar on the
        left to get started. Each demo is designed to showcase a specific
        capability of the Teams Tab.
      </Text>

      <Subtitle1 as="h2">Teams App Types</Subtitle1>
      <div className={styles.cardGrid}>
        <Card className={styles.card}>
          <CardHeader
            className={styles.cardHeader}
            header={<Text weight="semibold">Tabs</Text>}
            description={
              <Text size={200}>Embed your web content within Teams.</Text>
            }
          />
          <CardPreview>
            <Text>
              Tabs are Teams-aware webpages that you can embed in channels,
              group chats, or as a personal app. They provide a full-screen,
              interactive experience for your users right inside the Teams
              client.
            </Text>
          </CardPreview>
        </Card>
        <Card className={styles.card}>
          <CardHeader
            className={styles.cardHeader}
            header={<Text weight="semibold">Bots</Text>}
            description={
              <Text size={200}>Conversational AI for your users.</Text>
            }
          />
          <CardPreview>
            <Text>
              Bots allow users to interact with your service through text,
              interactive cards, and task modules. They can be used for Q&A,
              initiating workflows, or receiving notifications.
            </Text>
          </CardPreview>
        </Card>
        <Card className={styles.card}>
          <CardHeader
            className={styles.cardHeader}
            header={<Text weight="semibold">Message Extensions</Text>}
            description={<Text size={200}>Extend the compose box.</Text>}
          />
          <CardPreview>
            <Text>
              Message extensions allow users to interact with your web service
              through buttons and forms in the Teams client. They can search or
              create external content and insert it into a message.
            </Text>
          </CardPreview>
        </Card>
      </div>
    </div>
  );
};

export default Homepage;
