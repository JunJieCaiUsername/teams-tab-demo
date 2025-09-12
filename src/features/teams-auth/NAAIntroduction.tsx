import React from "react";
import {
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
    margin: `0 ${tokens.spacingHorizontalXS}`,
  },
  importantNote: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    backgroundColor: tokens.colorPaletteYellowBackground1,
    border: `1px solid ${tokens.colorPaletteYellowBorder2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalM,
    lineHeight: 2,
  },
  noIndentList: {
    margin: 0,
    padding: 0,
    listStylePosition: "inside",
    lineHeight: 2, // 可选，保持圆点在内容内侧
  },
  accordion: {
    "& button": {
      paddingInline: `0 !important`,
    },
    marginBottom: tokens.spacingVerticalL,
  },
});

const NAAIntroduction: React.FC = () => {
  const styles = useStyles();

  // Code snippets for demonstration
  const manifestCode = `{
  "webApplicationInfo": {
    "id": "your-client-id",
    "resource": "https://example",
    "nestedAppAuthInfo": [
      {
        "redirectUri": "brk-multihub://your-domain.com",
        "scopes": ["User.Read", "Mail.Read"],
        "claims": "{\\"access_token\\":{\\"xms_cc\\":{\\"values\\":[\\"CP1\\"]}}}" //optional
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
        等宿主环境设计的新一代身份验证协议。 它通过让 Teams 等 Host
        充当认证代理，直接为嵌套应用获取访问Token，从而简化了架构并提升了用户体验。
        相比传统的 On-Behalf-Of 流程，NAA
        消除了中间层服务的需求，支持Token预取，并提供更好的性能和安全性。
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
      {/* Accordions */}
      <Accordion multiple collapsible className={styles.accordion}>
        {/* Step 1 */}
        <AccordionItem value="step1">
          <AccordionHeader>
            <Subtitle2>
              Step 1: 配置 Azure AD App Registration 和 Teams App Manifest
            </Subtitle2>
          </AccordionHeader>
          <AccordionPanel>
            <Card className={styles.stepCard}>
              <Body1Strong>1. Azure AD App Registration 配置：</Body1Strong>
              <Body1>
                在你的 Azure AD App Registration 中，需要添加 NAA
                专用的重定向URL：
                <Badge
                  shape="rounded"
                  color="informative"
                  className={styles.highlight}
                >
                  brk-multihub://&lt;your-domain&gt;
                </Badge>
              </Body1>

              <Body1>
                例如：brk-multihub://contoso.com 或
                brk-multihub://your-app.ngrok.io，切记只要域名
              </Body1>

              <Body1Strong>2. (可选) Teams App Manifest配置：</Body1Strong>
              <Body1>
                * 经测试，未成功启用，已向微软提交{" "}
                <Link
                  href="https://github.com/MicrosoftDocs/msteams-docs/issues/13311"
                  target="_blank"
                >
                  issue
                </Link>
              </Body1>
              <div className={styles.codeContainer}>
                <Body1>
                  在 Teams App Manifest 中添加
                  <Badge
                    shape="rounded"
                    color="informative"
                    className={styles.highlight}
                  >
                    nestedAppAuthInfo
                  </Badge>
                  部分， 启用 Token 预取功能。 Teams 可以提前获取并缓存 Access
                  Token， 供 Tab 调用：
                </Body1>

                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "6px" }}
                >
                  {manifestCode}
                </SyntaxHighlighter>
              </div>

              <div className={styles.importantNote}>
                <Body1Strong>⚠️ 重要说明</Body1Strong>
                <ul className={styles.noIndentList}>
                  <li>
                    <Body1>
                      预取相当于提前调用了 acquireToken，所以一般预取 Tab
                      首次载入时需要的 Token 即可，比如获得用户信息
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        nestedAppAuthInfo
                      </Badge>{" "}
                      填写的内容必须和代码中的 Request 一致，Teams
                      才会把缓存交给 Tab 使用
                    </Body1>
                  </li>

                  <li>
                    <Body1>
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        webApplicationInfo.id
                      </Badge>
                      必须与你的 AAD App 的 Client ID 完全匹配
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        resource
                      </Badge>
                      文档称：若不配置传统 OBO SSO ，填写 Dummy 字符串， 参考{" "}
                      <Link
                        href="https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema#webapplicationinfo"
                        target="_blank"
                      >
                        webApplicationInfo
                      </Link>
                      。但实际测试后，仅使用NAA时不添加此属性也能工作，添加了反而会有个AAD错误。
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        redirectUri
                      </Badge>
                      必须使用
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        brk-multihub://&lt;your-domain&gt;
                      </Badge>
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        scopes
                      </Badge>
                      必须和代码中 Token Request 的 scope 内容和顺序一致
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        claims
                      </Badge>
                      用作
                      <Link
                        href="https://learn.microsoft.com/en-us/entra/identity-platform/app-resilience-continuous-access-evaluation"
                        target="_blank"
                      >
                        启用 CAE
                      </Link>{" "}
                      和 Authentication Context，不使用的话
                      <Body1Strong>不要添加</Body1Strong>
                    </Body1>
                  </li>
                </ul>
              </div>
              <Body1>
                更多详情请参考:{" "}
                <Link
                  href="https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication#token-prefetching-for-nested-app-authentication-naa"
                  target="_blank"
                >
                  Teams NAA Token 预取文档
                </Link>
              </Body1>
            </Card>
          </AccordionPanel>
        </AccordionItem>

        {/* Step 2 */}
        <AccordionItem value="step2">
          <AccordionHeader>
            <Subtitle2>Step 2: 环境检测和 TeamsJS 初始化</Subtitle2>
          </AccordionHeader>
          <AccordionPanel>
            <Card className={styles.stepCard}>
              <Body1Strong>1. TeamsJS 初始化：</Body1Strong>
              <Body1>
                必须在 MSAL 初始化之前先初始化 TeamsJS，
                <Badge appearance="filled" color="brand">
                  中国区用户特别注意
                </Badge>
                : 需要添加特定的 validMessageOrigins：
              </Body1>

              <div className={styles.codeContainer}>
                <Badge
                  shape="rounded"
                  color="informative"
                  className={styles.highlight}
                >
                  src/services/teamsSDKService.ts
                </Badge>

                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "6px" }}
                >
                  {teamsSDKCode}
                </SyntaxHighlighter>
              </div>

              <Body1Strong>2. 环境检测逻辑：</Body1Strong>
              <Body1>通过三步检测确定当前运行环境和 NAA 支持状态：</Body1>

              <div className={styles.codeContainer}>
                <Badge
                  shape="rounded"
                  color="informative"
                  className={styles.highlight}
                >
                  src/services/environmentDetection.ts
                </Badge>

                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "6px" }}
                >
                  {environmentDetectionCode}
                </SyntaxHighlighter>
              </div>

              <div className={styles.importantNote}>
                <Body1Strong>🔍 检测流程说明</Body1Strong>
                <ul className={styles.noIndentList}>
                  <li>
                    <Body1>
                      <Body1Strong>第一步</Body1Strong>: 检查 TeamsJS
                      是否成功初始化 → 失败则为 Web 环境
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Body1Strong>第二步</Body1Strong>: 获取上下文验证宿主环境
                      → 检查是否运行在 Teams 中
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Body1Strong>第三步</Body1Strong>: 调用 NAA API
                      检查支持状态 → 确定 NAA 可用性
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      本示例并未配置传统 OBO 流程，所以 Teams_NO_NAA
                      情况并未部署。微软建议部署 fallback 到
                      OBO方式，以防部分老旧客户端不支持 NAA。
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      这里的环境检测逻辑非最佳实践，Teams Personal Tab
                      还可以运行在 Outlook 和 Office Portal
                      上，客户端支持情况不一
                    </Body1>
                  </li>
                </ul>
              </div>
            </Card>
          </AccordionPanel>
        </AccordionItem>

        {/* Step 3 */}
        <AccordionItem value="step3">
          <AccordionHeader>
            <Subtitle2>Step 3: 基于环境创建 MSAL 客户端和 Token 获取</Subtitle2>
          </AccordionHeader>
          <AccordionPanel>
            <Card className={styles.stepCard}>
              <Body1Strong>MSAL 客户端初始化：</Body1Strong>
              <Body1>根据环境检测结果，自动选择合适的 MSAL 客户端类型：</Body1>

              <div className={styles.codeContainer}>
                <Badge
                  shape="rounded"
                  color="informative"
                  className={styles.highlight}
                >
                  src/services/authService.ts
                </Badge>

                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "6px" }}
                >
                  {msalInitCode}
                </SyntaxHighlighter>
              </div>

              <Body1Strong>Token 获取策略：</Body1Strong>
              <Body1>
                遵循 MSAL.js
                最佳实践，始终先尝试静默获取，失败后根据环境选择合适的交互式方法：
              </Body1>

              <div className={styles.codeContainer}>
                <Badge
                  shape="rounded"
                  color="informative"
                  className={styles.highlight}
                >
                  src/services/authService.ts
                </Badge>
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: "8px" }}
                >
                  {authServiceCode}
                </SyntaxHighlighter>
              </div>

              <div className={styles.importantNote}>
                <Body1Strong>💡 微软建议说明</Body1Strong>
                <ul className={styles.noIndentList}>
                  <li>
                    <Body1>
                      <Body1Strong>静默优先</Body1Strong>: 始终先尝试
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        acquireTokenSilent()
                      </Badge>
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Body1Strong>环境适配</Body1Strong>: Teams 环境使用
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        loginPopup()
                      </Badge>
                      ，浏览器使用
                      <Badge
                        shape="rounded"
                        color="informative"
                        className={styles.highlight}
                      >
                        loginRedirect()
                      </Badge>
                      (当然也可以用 loginPopup，这里只是为了演示 redirect)
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Body1Strong>错误处理</Body1Strong>:
                      完整的错误捕获和降级策略
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      <Body1Strong>性能优化</Body1Strong>: acquireTokenSilent 和
                      loginPopup 添加 redirectUri 参数提升认证性能，参考
                      <Link
                        href="https://learn.microsoft.com/en-us/entra/msal/javascript/browser/errors#block_iframe_reload"
                        target="_blank"
                      >
                        此文档
                      </Link>
                    </Body1>
                  </li>
                  <li>
                    <Body1>
                      本示例<Body1Strong>非最佳实践</Body1Strong>
                      ，仅为演示目的将认证代码集中在一个模块中，请按需构建代码结构。
                    </Body1>
                  </li>
                </ul>
              </div>

              <Body1Strong>🎉 完成改造！</Body1Strong>
              <Body1 className={styles.paragraph}>
                是不是发现 NAA 获取Token方式和常规 MSAL OAuth 没什么区别呢？
                这就对了，NAA 正是依靠 Teams 作为 Host 代理获得 API 的 access
                token，让 SPA 应用使用统一的 MSAL.js 代码获取 token
              </Body1>
              <Body1 className={styles.paragraph}>
                按照以上步骤，你的网站就能
                <Body1Strong>同时支持 Web 和 Teams NAA</Body1Strong>了。
                接着只需使用 Access Token 调用 Graph 或其他 API 即可
              </Body1>
            </Card>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Subtitle1 as="h3">参考资源</Subtitle1>
      <Body2 as="p" className={styles.paragraph}>
        以下是相关的官方文档和资源，可以帮助您深入了解 Teams Tab 开发、NAA
        认证、MSAL.js 库和相关技术：
      </Body2>
      <ul className={styles.noIndentList}>
        <li>
          <Body2>
            <Link
              href="https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/what-are-tabs"
              target="_blank"
            >
              Microsoft Teams Tabs 基本概念、类型和应用场景
            </Link>
          </Body2>
        </li>
        <li>
          <Body2>
            <Link
              href="https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication"
              target="_blank"
            >
              Teams NAA (Nested App Authentication)
              认证协议的完整介绍、配置方法和最佳实践
            </Link>
          </Body2>
        </li>
        <li>
          <Body2>
            <Link
              href="https://learn.microsoft.com/en-us/entra/msal/javascript/browser/about-msal-browser"
              target="_blank"
            >
              MSAL.js Browser 文档
            </Link>
          </Body2>
        </li>
        <li>
          <Body2>
            <Link
              href="https://learn.microsoft.com/en-us/javascript/api/%40microsoft/teams-js/?view=msteams-client-js-latest"
              target="_blank"
            >
              Teams JavaScript SDK API 参考
            </Link>
          </Body2>
        </li>
        <li>
          <Body2>
            <Link
              href="https://react.fluentui.dev/?path=/docs/concepts-introduction--docs"
              target="_blank"
            >
              Microsoft Fluent UI 设计系统的 React 组件库文档
            </Link>
          </Body2>
        </li>
        <li>
          <Body2>
            <Link
              href="https://github.com/AzureAD/microsoft-authentication-library-for-js"
              target="_blank"
            >
              MSAL.js GitHub Repo
            </Link>
          </Body2>
        </li>
        <li>
          <Body2>
            <Link
              href="https://github.com/OfficeDev/microsoft-teams-library-js"
              target="_blank"
            >
              Teams SDK GitHub Repo
            </Link>
          </Body2>
        </li>
      </ul>
    </div>
  );
};

export default NAAIntroduction;
