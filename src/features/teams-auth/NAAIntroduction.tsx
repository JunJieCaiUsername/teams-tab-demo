import React from "react";
import {
  Text,
  Card,
  makeStyles,
  tokens,
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Badge,
  Link,
  CardHeader,
  mergeClasses,
  Subtitle1,
  Body2,
  Subtitle2,
  Body1Strong,
  Body1,
} from "@fluentui/react-components";
import {
  CheckmarkCircleColor,
  DismissCircleColor,
} from "@fluentui/react-icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: tokens.spacingVerticalXXL,
    lineHeight: 1.7,
  },
  paragraph: {
    lineHeight: 1.7,
  },
  title: {
    textAlign: "left",
    marginBottom: tokens.spacingVerticalL,
  },
  stepCard: {
    marginBottom: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  codeContainer: {
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalM,
  },
  stepHeader: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
  },
  comparison: {
    display: "flex",
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalXXL,
  },
  comparisonCard: {
    flex: 1,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
  },
  oldWay: {
    backgroundColor: tokens.colorPaletteRedBackground1,
  },
  newWay: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    border: `1px solid ${tokens.colorPaletteGreenBorder2}`,
  },
  highlight: {
    backgroundColor: tokens.colorNeutralBackground6,
    padding: tokens.spacingHorizontalXS,
    borderRadius: tokens.borderRadiusSmall,
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
  },
  importantNote: {
    backgroundColor: tokens.colorPaletteYellowBackground1,
    border: `1px solid ${tokens.colorPaletteYellowBorder2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalM,
  },
  noIndentList: {
    margin: 0,
    padding: 0,
    listStylePosition: "inside", // 可选，保持圆点在内容内侧
  },
  accordionHeader: {
    "& button": {
      paddingInline: `0 !important`,
    },
  },
});

const NAAIntroduction: React.FC = () => {
  const styles = useStyles();

  // Code snippets for demonstration
  const manifestCode = `{
  "webApplicationInfo": {
    "id": "your-client-id",
    "resource": "https://example.com",
    "nestedAppAuthInfo": [
      {
        "redirectUri": "brk-multihub://your-domain.com",
        "scopes": ["User.Read", "Mail.Read"],
        "claims": "{\\"access_token\\":{\\"xms_cc\\":{\\"values\\":[\\"CP1\\"]}}}"
      }
    ]
  }
}`;

  const teamsSDKCode = `import { app } from "@microsoft/teams-js";

// 必须在 MSAL 初始化之前先初始化 Teams SDK
export async function initializeTeamsSDK(): Promise<void> {
  try {
    console.log("Initializing Teams SDK...");
    // 中国区用户必须添加这个 validMessageOrigins 参数
    await app.initialize(["https://teams.microsoftonline.cn"]);
    console.log("Teams SDK initialized successfully");
    isTeamsSDKInitialized = true;
  } catch (error) {
    console.log("Teams SDK initialization failed:", error);
    // 初始化失败通常意味着不在 Teams 环境中运行
    isTeamsSDKInitialized = false;
  }
}`;

  const environmentDetectionCode = `export async function detectEnvironmentType(): Promise<EnvironmentType> {
  try {
    // 第一步：检查 TeamsJS 是否初始化成功
    const { isInitialized, error } = getTeamsSDKStatus();
    if (!isInitialized) {
      console.log("Teams SDK not initialized:", error?.message);
      return Environment.WEB; // 返回 Web 浏览器环境
    }

    // 第二步：获取 Teams 上下文，验证是否在正确的宿主环境中
    console.log("Detecting Teams environment...");
    const context = await app.getContext();
    
    if (context?.app?.host?.name === HostName.teams ||
        context?.app?.host?.name === HostName.teamsModern) {
      
      // 第三步：检查是否支持 NAA
      try {
        const isNAARecommended = nestedAppAuth.isNAAChannelRecommended();
        console.log("NAA channel recommended:", isNAARecommended);
        
        if (isNAARecommended) {
          return Environment.TEAMS_NAA;  // 支持 NAA 的 Teams 环境
        } else {
          return Environment.TEAMS_NO_NAA; // 不支持 NAA 的 Teams 环境
        }
      } catch (naaError) {
        console.log("Failed to check NAA support:", naaError);
        return Environment.TEAMS_NO_NAA;
      }
    }
    
    return Environment.WEB;
  } catch (error) {
    console.log("Failed to get Teams context:", error);
    return Environment.WEB;
  }
}`;

  const authServiceCode = `export async function acquireToken(
  scopes: string[] = ["User.Read"]
): Promise<AuthenticationResult> {
  const instance = getMSALInstance();

  try {
    // 第一步：总是先尝试静默获取Token
    const silentRequest: SilentRequest = {
      scopes,
      redirectUri: getRedirectUri(),
    };
    
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      if (accounts.length > 1) {
        silentRequest.prompt = "select_account";
      } else {
        silentRequest.account = accounts[0];
      }
    }
    
    console.log(\`Attempting silent token acquisition for \${currentEnvironment}\`);
    return await instance.acquireTokenSilent(silentRequest);
    
  } catch (error) {
    console.log("Silent token acquisition failed:", error);

    // 第二步：根据环境选择合适的交互式获取方式
    if (currentEnvironment === Environment.TEAMS_NAA || 
        currentEnvironment === Environment.TEAMS_NO_NAA) {
      // Teams 环境：使用弹窗方式
      console.log("Falling back to popup login in Teams");
      return await instance.loginPopup({
        scopes,
        redirectUri: getRedirectUri(),
      });
    } else {
      // 浏览器环境：使用重定向方式
      console.log("Falling back to redirect login in browser");
      await instance.loginRedirect({ scopes });
      throw new Error("Redirecting to login...");
    }
  }
}`;

  const msalInitCode = `export async function initializeMSAL(): Promise<IPublicClientApplication> {
  try {
    const envType = await getEnvironmentType();
    const naaSupported = await isNAASupported();
    
    console.log("Current environment:", envType);
    console.log("NAA supported:", naaSupported);

    if (naaSupported) {
      console.log("Initializing MSAL with NAA support for Teams");
      // 创建支持 NAA 的客户端
      msalInstance = await createNestablePublicClientApplication(
        getMSALConfig()
      );
      console.log("NAA instance created successfully");
    } else {
      console.log("Initializing MSAL for standard authentication");
      // 创建标准客户端（用于 Web 浏览器和不支持 NAA 的 Teams）
      msalInstance = await createStandardPublicClientApplication(
        getMSALConfig()
      );
      console.log("Standard instance created successfully");
    }

    return msalInstance;
  } catch (error) {
    console.error("Failed to initialize MSAL:", error);
    // 降级处理：使用标准认证
    msalInstance = await createStandardPublicClientApplication(getMSALConfig());
    return msalInstance;
  }
}`;

  return (
    <div className={styles.container}>
      <Subtitle1 as="h3">为什么推荐 NAA?</Subtitle1>
      <Body2 as="p" className={styles.paragraph}>
        NAA (Nested App Authentication) 是 Microsoft 专为 Teams、Outlook
        等宿主环境设计的新一代身份验证协议。 它通过让 Teams
        充当认证代理，直接为嵌套应用获取访问Token，从而简化了架构并提升了用户体验。
        相比传统的 On-Behalf-Of 流程，NAA
        消除了中间层服务器的需求，支持Token预取，并提供更好的性能和安全性。
      </Body2>
      <div className={styles.comparison}>
        <Card
          className={mergeClasses(styles.comparisonCard, styles.newWay)}
          appearance="filled"
          size="large"
        >
          <CardHeader
            header={<Subtitle1>NAA 模式</Subtitle1>}
            image={<CheckmarkCircleColor fontSize={36} />}
          />
          <ul className={styles.noIndentList}>
            <li>
              <Body2>可纯前端实现，无需后端服务</Body2>
            </li>
            <li>
              <Body2>简化的架构和部署</Body2>
            </li>
            <li>
              <Body2>支持动态权限请求</Body2>
            </li>
            <li>
              <Body2>真正的无缝 SSO 体验</Body2>
            </li>
            <li>
              <Body2>显著降低开发复杂度</Body2>
            </li>
          </ul>
        </Card>
        <Card
          className={mergeClasses(styles.oldWay, styles.comparisonCard)}
          appearance="filled"
          size="large"
        >
          <CardHeader
            header={<Subtitle1>传统 OBO 模式</Subtitle1>}
            image={<DismissCircleColor fontSize={36} />}
          />
          <ul className={styles.noIndentList}>
            <li>
              <Body2>需要写后端服务进行Token交换</Body2>
            </li>
            <li>
              <Body2>复杂的架构和部署</Body2>
            </li>
            <li>
              <Body2>需要预授权宿主应用</Body2>
            </li>
            <li>
              <Body2>可能需要多次用户交互</Body2>
            </li>
            <li>
              <Body2>更高的开发和维护成本</Body2>
            </li>
          </ul>
        </Card>
      </div>
      <Subtitle1 as="h3">简要步骤</Subtitle1>
      <Accordion multiple collapsible className={styles.accordionHeader}>
        {/* Step 1 */}
        <AccordionItem value="step1">
          <AccordionHeader>
            <Subtitle2>Step 1: 配置 Azure AD 应用注册和 Teams 清单</Subtitle2>
          </AccordionHeader>
          <AccordionPanel>
            <Card className={styles.stepCard}>
              <Body1Strong>Azure AD 应用注册配置：</Body1Strong>
              <Body1>
                在你的 Azure AD 应用注册中，需要添加 NAA 专用的重定向 URI：
              </Body1>
              <Body1 className={styles.highlight}>
                brk-multihub://&lt;your-domain&gt;
              </Body1>
              <Body1>
                例如：brk-multihub://contoso.com 或
                brk-multihub://your-app.ngrok.io
              </Body1>

              <Text>
                <strong>Teams 应用清单配置：</strong>
                <br />在 Teams 应用清单中添加{" "}
                <span className={styles.highlight}>nestedAppAuthInfo</span>{" "}
                部分， 启用Token预取功能以提升性能：
              </Text>

              <div className={styles.codeContainer}>
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "8px" }}
                >
                  {manifestCode}
                </SyntaxHighlighter>
              </div>

              <div className={styles.importantNote}>
                <Text weight="semibold">⚠️ 重要说明</Text>
                <Text>
                  •{" "}
                  <span className={styles.highlight}>
                    webApplicationInfo.id
                  </span>{" "}
                  必须与你的 Azure AD 应用客户端 ID 完全匹配
                  <br />• <span className={styles.highlight}>
                    redirectUri
                  </span>{" "}
                  必须与 Azure AD 中配置的重定向 URI 一致
                  <br />• <span className={styles.highlight}>scopes</span>{" "}
                  定义应用启动时预取的权限范围
                  <br />• Token预取功能可显著减少首次认证延迟
                </Text>
              </div>

              <Text>
                更多详情请参考:{" "}
                <Link
                  href="https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication#token-prefetching-for-nested-app-authentication-naa"
                  target="_blank"
                >
                  Teams NAA Token预取文档
                </Link>
              </Text>
            </Card>
          </AccordionPanel>
        </AccordionItem>

        {/* Step 2 */}
        <AccordionItem value="step2">
          <AccordionHeader>
            <Subtitle2>Step 2: 环境检测和 Teams SDK 初始化</Subtitle2>
          </AccordionHeader>
          <AccordionPanel>
            <Card className={styles.stepCard}>
              <Text>
                <strong>Teams SDK 初始化：</strong>
                <br />
                必须在 MSAL 初始化之前先初始化 Teams SDK，
                <Badge appearance="filled" color="important">
                  中国区用户特别注意
                </Badge>{" "}
                需要添加特定的 validMessageOrigins：
              </Text>

              <div className={styles.codeContainer}>
                <Text size={200}>
                  来源文件:{" "}
                  <span className={styles.highlight}>
                    src/services/teamsSDKService.ts
                  </span>
                </Text>
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "8px" }}
                >
                  {teamsSDKCode}
                </SyntaxHighlighter>
              </div>

              <Text>
                <strong>环境检测逻辑：</strong>
                <br />
                通过三步检测确定当前运行环境和 NAA 支持状态：
              </Text>

              <div className={styles.codeContainer}>
                <Text size={200}>
                  来源文件:{" "}
                  <span className={styles.highlight}>
                    src/services/environmentDetection.ts
                  </span>
                </Text>
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "8px" }}
                >
                  {environmentDetectionCode}
                </SyntaxHighlighter>
              </div>

              <div className={styles.importantNote}>
                <Text weight="semibold">🔍 检测流程说明</Text>
                <Text>
                  <strong>第一步</strong>: 检查 TeamsJS 是否成功初始化 →
                  失败则为 Web 环境
                  <br />
                  <strong>第二步</strong>: 获取上下文验证宿主环境 →
                  检查是否运行在 Teams 中<br />
                  <strong>第三步</strong>: 调用 NAA API 检查支持状态 → 确定 NAA
                  可用性
                </Text>
              </div>
            </Card>
          </AccordionPanel>
        </AccordionItem>

        {/* Step 3 */}
        <AccordionItem value="step3">
          <AccordionHeader>
            <Subtitle2>Step 3: 基于环境创建 MSAL 客户端和Token获取</Subtitle2>
          </AccordionHeader>
          <AccordionPanel>
            <Card className={styles.stepCard}>
              <Text>
                <strong>MSAL 客户端初始化：</strong>
                <br />
                根据环境检测结果，自动选择合适的 MSAL 客户端类型：
              </Text>

              <div className={styles.codeContainer}>
                <Text size={200}>
                  来源文件:{" "}
                  <span className={styles.highlight}>
                    src/services/authService.ts
                  </span>
                </Text>
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "8px" }}
                >
                  {msalInitCode}
                </SyntaxHighlighter>
              </div>

              <Text>
                <strong>Token获取策略：</strong>
                <br />
                遵循 MSAL.js
                最佳实践，始终先尝试静默获取，失败后根据环境选择合适的交互式方法：
              </Text>

              <div className={styles.codeContainer}>
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "8px" }}
                >
                  {authServiceCode}
                </SyntaxHighlighter>
              </div>

              <div className={styles.importantNote}>
                <Text weight="semibold">💡 最佳实践说明</Text>
                <Text>
                  • <strong>静默优先</strong>: 始终先尝试{" "}
                  <span className={styles.highlight}>acquireTokenSilent()</span>
                  <br />• <strong>环境适配</strong>: Teams 环境使用{" "}
                  <span className={styles.highlight}>loginPopup()</span>
                  ，浏览器使用{" "}
                  <span className={styles.highlight}>loginRedirect()</span>
                  <br />• <strong>错误处理</strong>: 完整的错误捕获和降级策略
                  <br />• <strong>性能优化</strong>: 添加 redirectUri
                  参数提升认证性能
                </Text>
              </div>

              <Text>
                更多 MSAL.js 最佳实践:{" "}
                <Link
                  href="https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/acquire-token.md"
                  target="_blank"
                >
                  MSAL.js Token获取文档
                </Link>
              </Text>
            </Card>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <div className={styles.stepCard}>
        <Text>
          <strong>🎉 完成改造！</strong>
          <br />
          按照以上步骤，你的普通 AAD 保护网站就能完美支持 Teams NAA 了。 用户在
          Teams 中使用你的应用时将享受到无缝的单点登录体验，
          而在浏览器中访问时仍然保持原有的认证流程。
        </Text>

        <Text>
          想了解更多技术细节？查看{" "}
          <Link
            href="https://github.com/AzureAD/microsoft-authentication-library-for-js"
            target="_blank"
          >
            MSAL.js GitHub
          </Link>{" "}
          和{" "}
          <Link
            href="https://github.com/OfficeDev/microsoft-teams-library-js"
            target="_blank"
          >
            Teams SDK GitHub
          </Link>{" "}
          了解底层实现原理。
        </Text>
      </div>
    </div>
  );
};

export default NAAIntroduction;
