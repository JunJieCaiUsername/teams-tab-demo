# Teams Demo App - Authentication with NAA Support

这是一个 Microsoft Teams 演示应用程序，目前主要展示身份验证功能，支持 Web 浏览器和 Teams Nested app authentication（NAA）场景。未来会添加更多功能模块。

## Auth Demo 概述

本示例演示了如何将现有集成 AAD 认证普通 web app，改造为支持内嵌到 Teams 的 Tab 应用。所以认证模块覆盖了 Web 浏览器和 Teams NAA 两种主要场景，希望为开发者提供完整的身份验证的些许参考，非最佳实践。

> 若想从 0 开始了解 Teams NAA，参考：[Enable Nested app authentication](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication)，或参考后文简介

### 主要特性

- **多环境适配**: 智能检测并适配 Web 浏览器和 Microsoft Teams 环境
- **现代身份验证**: 使用最新的 Azure AD OAuth 2.0 和 MSAL.js 库
- **NAA 支持**: 完整支持 Teams 嵌套应用认证，提供无缝 SSO 体验
- **用户友好**: 基于 FluentUI 的响应式界面设计
- **开发友好**: TypeScript + React 19 + Vite 现代开发栈

## 开发环境搭建

### 1. 前置要求

确保已安装以下软件：

- **Node.js** (版本 >= 18.0.0) - [下载地址](https://nodejs.org/)
- **npm** (通常随 Node.js 一起安装)

### 2. 项目初始化

```bash
# 克隆项目并进入目录
cd tab-auth-demo

# 安装依赖 (必须使用 --legacy-peer-deps 参数)
npm install --legacy-peer-deps

```

**注意**: 必须使用 `--legacy-peer-deps` 参数安装依赖，这是因为 FluentUI 的依赖的版本冲突需要这种方式解决。

### 3. 环境配置

#### 3.1 注册 Azure AD 应用并配置重定向 URI

1. 登录 [Azure Portal](https://portal.azure.com/)，进入“Azure Active Directory” > “应用注册”，点击“新注册”。
2. 填写应用名称，选择“单页应用（SPA）”类型。
3. 在“重定向 URI”中添加：
   - `http://localhost:5173`
   - `https://<your-ngrok-or-codespaces-url>` #用 ngrok，dev tunnel，或使用 codespaces 获得的公网地址
   - `brk-multihub://<your-ngrok-or-codespaces-domain>` #注意仅填域名
4. 注册完成后，在应用概览页获取 **应用(客户端)ID/Application ID** 和 **目录(租户)ID/Tenant ID**。

#### 3.2 创建环境配置文件

在项目根目录创建 `.env.development.local` , 参考`.env.example`文件填写：

```.env.example
# Azure AD 应用配置
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_GRAPH_BASE_URL=https://graph.microsoft.com

# 可选：为不同环境配置不同的权限端点
# 中国区用户需要使用不同的端点
# VITE_AZURE_AUTHORITY=https://login.partner.microsoftonline.cn/your-tenant-id
# VITE_GRAPH_BASE_URL=https://microsoftgraph.chinacloudapi.cn
```

> 更多可见 [Vite env guide](https://vite.dev/guide/env-and-mode.html)

### 4. 启动开发服务器

```bash
npm run dev
```

> 关于 Vite
>
> 本项目基于 [Vite](https://vite.dev/) 构建，Vite 是现代前端开发工具，只需保存代码，页面会自动实时刷新，无需手动重启服务，大幅提升开发效率。

应用将一般在 `http://localhost:5173` 启动。

> ⚠️ **注意：Teams 要求 Tab 应用必须通过 HTTPS 访问。**
>
> - 本地开发时可使用 [ngrok](https://ngrok.com/) 或[dev tunnel](https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/get-started)将本地端口映射为 HTTPS 外网地址。
> - 更推荐使用 GitHub Codespaces，自动为你的应用分配一个公网 HTTPS 地址，适合 Teams 预览和调试。

## Teams 应用包部署

### 1. 构建应用包

```bash
npm run build:teams
```

此命令会生成 `dist/teams-app.zip` 文件，包含：

- `manifest.json` - Teams App Manifest 文件
- `color.png` - 应用彩色图标 (192x192)
- `outline.png` - 应用轮廓图标 (32x32)

### 2. 上传到 Teams

#### 2.1 中国区：Teams 管理中心

**适用于**: 中国区 Teams 租户，需要 Teams 管理员权限

1. 登录 [Teams 管理中心](https://admin.teams.microsoftonline.cn/)
2. 导航至 "Teams 应用" > "管理应用"
3. 点击 "上传新应用"
4. 上传生成的 `teams-app.zip` 文件
5. 审核并发布应用

#### 2.2 全球商业版：Teams Developer Portal 或 Microsoft 365 Agents Toolkit

**适用于**: 全球商业版 Teams，支持预览和测试

本项目主要演示如何将一个常规 Web 应用简单改造为 Teams 应用。如果你希望从零开始开发 Teams 应用，推荐直接使用 [Microsoft 365 Agents Toolkit](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/agents-toolkit-fundamentals)（适用于 Visual Studio Code），它可以帮助你管理 Teams 应用开发的全生命周期，包括：

- 项目模板：一键创建 Tab、Bot、消息扩展等常见场景的 Teams 应用
- 自动化任务：自动完成应用注册、Bot 注册、Entra ID 配置等繁琐步骤
- 多环境支持：方便地切换和管理 dev/test/prod 等不同环境
- 快速访问 Teams Developer Portal：一站式配置、发布和管理你的 Teams 应用
- 本地调试与 HTTPS 隧道：集成 Dev Tunnels，支持本地调试和 HTTPS 访问
- Playground 测试工具：无需注册即可快速调试 Bot 和消息卡片

你可以通过 VS Code 扩展市场安装 Agents Toolkit，体验更高效的 Teams 应用开发流程。

当然，你也可以像本项目一样，手动构建并上传，或直接新建应用：

1. 访问 [Teams Developer Portal](https://dev.teams.microsoft.com/)
2. 点击 "Apps" > "New App"
3. 填写所有必须项，在"Apps Feature"中新建一个"Personal app"
4. 在 Developer Portal 中预览和测试
5. 发布到个人或组织

### 3. Teams App Manifest 详解

Teams App Manifest 是定义 App 在 Teams 中的配置文件，比如你的 app id，app 的 url 等。以下是关键配置说明：

#### 3.1 新建 Manifest

- 可以在全球版 Teams Developer Portal，新建应用，以图形化方式配置 Manifest，或使用 Microsoft 365 Agents Toolkit。中国区没有，但可以导出成 Teams App package 上传到国区 Teams 即可。

- 参考 [Teams App Manifest schema 文档](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema) 了解完整的 Manifest schema。

#### 3.2 NAA 配置部分

```json
{
  "webApplicationInfo": {
    "id": "your-client-id",
    "resource": "https://example",
    "nestedAppAuthInfo": [
      {
        "redirectUri": "brk-multihub://your-domain.com",
        "scopes": ["User.Read"],
        "claims": "{\"access_token\":{\"xms_cc\":{\"values\":[\"CP1\"]}}}"
      }
    ]
  }
}
```

**NAA 配置说明**:

- `redirectUri`: 必须使用 `brk-multihub://` 协议，告知 Teams 此应用支持 NAA
- `scopes`: 应用需要的权限范围
- `claims`: 令牌中需要包含的额外声明信息
- `resource`: 用于传统 Teams SSO，如果不使用，填一个 dummy 字符串，参见 [webApplicationInfo](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema#webapplicationinfo)

更多 NAA 配置详情，请参考：[Teams NAA 令牌预取文档](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication#token-prefetching-for-nested-app-authentication-naa)

## Azure Static Web Apps 部署与 GitHub Actions 集成指南

[👉 部署与集成详细指南](./DeployToAzureSWA.md)

## 项目结构说明

```
src/
├── assets/                 # 静态资源文件
│   └── react.svg
├── features/               # 功能模块
│   ├── homepage/           # 首页模块
│   │   └── Homepage.tsx
│   └── teams-auth/         # Teams 认证模块
│       ├── ProfileData.tsx        # 用户资料显示组件
│       └── TeamsAppAuthDemo.tsx   # 认证演示主组件
├── layouts/                # 布局组件
│   └── Navigation.tsx      # 导航栏组件
├── services/               # 服务层
│   ├── authConfig.ts       # MSAL 认证配置
│   ├── authService.ts      # 认证服务封装
│   ├── environmentDetection.ts  # 环境检测服务
│   ├── graph.ts           # Microsoft Graph API 调用
│   ├── teamsSDKService.ts # Teams SDK 服务封装
│   └── tools.ts          # 工具函数
├── types/                 # TypeScript 类型定义
│   └── UserInfo.ts        # 用户信息类型
├── App.tsx               # 应用主组件
├── main.tsx             # 应用入口点
└── theme.ts             # FluentUI 主题配置
```

### 关键文件说明

#### 🔑 认证服务 (`src/services/`)

- **`authConfig.ts`**: 配置 MSAL 认证参数，支持 Web 和 NAA 两种模式
- **`authService.ts`**: 提供统一的认证接口，封装 MSAL 操作
- **`environmentDetection.ts`**: 智能检测当前运行环境（Web/Teams/NAA）, **本例中传统 Teams OBO SSO 没有实现**
- **`teamsSDKService.ts`**: Teams SDK 初始化和状态管理

#### 🎨 用户界面 (`src/features/teams-auth/`)

- **`TeamsAppAuthDemo.tsx`**: 认证演示的主要界面
- **`ProfileData.tsx`**: 用户资料展示组件，包含令牌信息查看

#### 🏗️ 基础架构

- **`App.tsx`**: 应用主组件，处理全局状态和路由
- **`Navigation.tsx`**: 响应式导航组件，适配不同屏幕尺寸

## NAA (Nested App Authentication) 简介

> 以下内容(其实是整篇:)由 Copilot 综合微软 blog， MSAL.js 和 TeamsJS 的 github 库分析而来，实际上微软除了简介外，没有底层相关技术解析文档，所以下文看看就好，建议深究源码。
>
> 简单理解： Teams 的 Tab app，本质作为 iframe 嵌入 Teams 的子应用，通过 MSAL 的 BridgeProxy 模块，与上层的 Host 进行通信, 拿到了 Access Token。Teams，作为子应用的 Host，相当于顶层的 web app，作为**代理**向 AAD 进行申请 Token 等操作。
> 而在 NAA 之前，传统的 OBO 模式，即使 Tab 是个纯前端 app，因为从 Teams 只能拿到 aud（受众）为 Teams 的 token，app 必须写一个后端服务，再去向 AAD 换一个 aud 为目标 api(比如 graph)的 access token。 NAA 推出后，Teams 本身代替了那个后端服务的任务，所以 App 无需再写个后端了。

### 什么是 NAA？

NAA (Nested App Authentication) 是 Microsoft 为嵌入式应用场景设计的新一代身份验证协议。它专门解决了在 Teams、Outlook 等宿主环境中运行的应用的身份验证问题。

### NAA vs 传统 SSO

| 特性           | 传统 On-Behalf-Of (OBO) 流程          | NAA 流程                   |
| -------------- | ------------------------------------- | -------------------------- |
| **架构复杂度** | 需要中间层服务器，复杂的令牌交换      | 直接客户端认证，无需中间层 |
| **SDK 依赖**   | 需要 Teams SDK + MSAL + 后端 API      | 仅需 MSAL.js               |
| **权限管理**   | 需要预授权宿主应用                    | 支持动态和增量权限请求     |
| **令牌获取**   | 通过 `getAuthToken()` + 后端 OBO 交换 | 直接通过 MSAL 获取         |
| **开发复杂度** | 高（需要前后端配合）                  | 低（纯前端实现）           |
| **用户体验**   | 可能需要多次弹窗                      | 无缝 SSO 体验              |

### NAA 的核心优势

1. **简化架构**: 无需中间层服务器，降低部署和维护成本
2. **更好的用户体验**: 真正的无缝 SSO，减少用户交互
3. **增强的安全性**: 减少令牌传输环节，降低安全风险
4. **动态权限**: 支持运行时权限请求，更灵活的权限管理
5. **开发效率**: 显著减少开发和维护工作量

### NAA 技术架构深度解析

#### 核心组件关系

```
┌─────────────────────────────────────────────────────────────┐
│                    Teams Host Application                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Teams JavaScript SDK                 │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │            NAA Bridge                       │   │   │
│  │  │  • postMessage API                          │   │   │
│  │  │  • Event listeners                          │   │   │
│  │  │  • Message routing                          │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                │
│         (window.nestedAppAuthBridge)                       │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  Nested App (Your App)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    MSAL.js                          │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │        NestedAppAuthController              │   │   │
│  │  │  • Token acquisition logic                 │   │   │
│  │  │  • Cache management                        │   │   │
│  │  │  • Bridge communication                    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │            BridgeProxy                      │   │   │
│  │  │  • Message serialization                   │   │   │
│  │  │  • Response handling                       │   │   │
│  │  │  • Error management                        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### NAA 通信流程详解

基于对 MSAL.js 和 Teams.js 源码的分析，NAA 的工作流程如下：

1. **Bridge 初始化阶段**

   ```typescript
   // Teams 宿主应用创建 bridge 对象，在顶层window里
   window.nestedAppAuthBridge = {
     postMessage: (message: string) => void,
     addEventListener: (event: 'message', callback: Function) => void,
     removeEventListener: (event: 'message', callback: Function) => void
   }
   ```

2. **MSAL 控制器创建**

   ```typescript
   // 应用调用 createNestablePublicClientApplication
   const controller = new NestedAppAuthController(operatingContext);
   const bridgeProxy = await BridgeProxy.create();
   ```

3. **令牌获取流程**

   ```typescript
   // 1. 应用请求令牌
   const result = await pca.acquireTokenSilent(request);

   // 2. NestedAppAuthController 处理请求
   const naaRequest = this.nestedAppAuthAdapter.toNaaTokenRequest(request);

   // 3. BridgeProxy 发送到宿主
   const response = await this.bridgeProxy.getTokenSilent(naaRequest);

   // 4. 宿主处理并返回令牌
   // 5. 适配器转换响应格式
   const authResult = this.nestedAppAuthAdapter.fromNaaTokenResponse(response);
   ```

#### 关键源码组件分析

**1. BridgeProxy (桥接代理)**

- **作用**: 负责与 Teams 宿主的通信
- **核心方法**:
  - `getTokenSilent()`: 静默获取令牌
  - `getTokenInteractive()`: 交互式获取令牌
  - `sendRequest()`: 发送请求到宿主

**2. NestedAppAuthController (NAA 控制器)**

- **作用**: NAA 模式下的主要认证控制器
- **核心功能**:
  - 令牌缓存管理
  - 认证状态维护
  - 错误处理和重试

**3. NestedAppAuthAdapter (适配器)**

- **作用**: 转换 MSAL 请求格式和 NAA 协议格式
- **核心方法**:
  - `toNaaTokenRequest()`: 转换请求格式
  - `fromNaaTokenResponse()`: 转换响应格式
  - `fromNaaAccountInfo()`: 转换账户信息

#### Teams 宿主的角色

Teams 宿主应用充当**认证代理**的角色：

1. **身份提供者**: 管理用户的主身份，维护登录状态
2. **令牌代理**: 代表嵌套应用向 Azure AD 请求令牌
3. **安全网关**: 验证嵌套应用的权限，确保安全访问
4. **性能优化**: 通过令牌预取和缓存机制提升用户体验

#### 令牌预取机制

NAA 支持令牌预取，这是相比传统 SSO 的重要优势：

```json
// Teams 清单中的预取配置
"nestedAppAuthInfo": [
  {
    "redirectUri": "brk-multihub://your-domain.com",
    "scopes": ["User.Read"],
    "claims": "{\"access_token\":{\"xms_cc\":{\"values\":[\"CP1\"]}}}"
  }
]
```

**预取工作原理**:

1. Teams 在加载应用前读取清单配置
2. 根据 `nestedAppAuthInfo` 预先获取令牌
3. 应用启动时直接从缓存获取令牌
4. 显著减少首次认证延迟

## 许可证

MIT License

---

更多技术资源：

- [Microsoft Teams 开发文档](https://docs.microsoft.com/en-us/microsoftteams/platform/)
- [NAA 官方文档](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication)
- [MSAL.js 库](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Teams JavaScript SDK](https://github.com/OfficeDev/microsoft-teams-library-js)
