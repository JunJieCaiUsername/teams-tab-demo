# NAA (Nested App Authentication) 简介

> 以下内容(其实是整篇:)由 Copilot 综合微软 blog， MSAL.js 和 TeamsJS 的 github 库分析而来，实际上微软除了简介外，没有底层相关技术解析文档，所以下文看看就好，建议深究源码。
>
> 简单理解： Teams 的 Tab app，本质作为 iframe 嵌入 Teams 的子应用，通过 MSAL 的 BridgeProxy 模块，与上层的 Host 进行通信, 拿到了 Access Token。Teams，作为子应用的 Host，相当于顶层的 web app，作为**代理**向 AAD 进行申请 Token 等操作。
> 而在 NAA 之前，传统的 OBO 模式，即使 Tab 是个纯前端 app，因为从 Teams 只能拿到 aud（受众）为 Teams 的 token，app 必须写一个后端服务，再去向 AAD 换一个 aud 为目标 api(比如 graph)的 access token。 NAA 推出后，Teams 本身代替了那个后端服务的任务，所以 App 无需再写个后端了。

## 什么是 NAA？

NAA (Nested App Authentication) 是 Microsoft 为嵌入式应用场景设计的新一代身份验证协议。它专门解决了在 Teams、Outlook 等宿主环境中运行的应用的身份验证问题。

## NAA vs 传统 SSO

| 特性           | 传统 On-Behalf-Of (OBO) 流程          | NAA 流程                   |
| -------------- | ------------------------------------- | -------------------------- |
| **架构复杂度** | 需要中间层服务器，复杂的令牌交换      | 直接客户端认证，无需中间层 |
| **SDK 依赖**   | 需要 Teams SDK + MSAL + 后端 API      | 仅需 MSAL.js               |
| **权限管理**   | 需要预授权宿主应用                    | 支持动态和增量权限请求     |
| **令牌获取**   | 通过 `getAuthToken()` + 后端 OBO 交换 | 直接通过 MSAL 获取         |
| **开发复杂度** | 高（需要前后端配合）                  | 低（纯前端实现）           |
| **用户体验**   | 可能需要多次弹窗                      | 无缝 SSO 体验              |

## NAA 的核心优势

1. **简化架构**: 无需中间层服务器，降低部署和维护成本
2. **更好的用户体验**: 真正的无缝 SSO，减少用户交互
3. **增强的安全性**: 减少令牌传输环节，降低安全风险
4. **动态权限**: 支持运行时权限请求，更灵活的权限管理
5. **开发效率**: 显著减少开发和维护工作量

## NAA 技术架构深度解析

### 核心组件关系

```
┌─────────────────────────────────────────────────────────────┐
│                    Teams Host Application                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                Teams JavaScript SDK                 │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │            NAA Bridge                       │    │    │
│  │  │  • postMessage API                          │    │    │
│  │  │  • Event listeners                          │    │    │
│  │  │  • Message routing                          │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↕                                 │
│         (window.nestedAppAuthBridge)                        │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  Nested App (Your App)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    MSAL.js                          │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │        NestedAppAuthController              │    │    │
│  │  │  • Token acquisition logic                  │    │    │
│  │  │  • Cache management                         │    │    │
│  │  │  • Bridge communication                     │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │            BridgeProxy                      │    │    │
│  │  │  • Message serialization                    │    │    │
│  │  │  • Response handling                        │    │    │
│  │  │  • Error management                         │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### NAA 通信流程详解

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

### 关键源码组件分析

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

### Teams 宿主的角色

Teams 宿主应用充当**认证代理**的角色：

1. **身份提供者**: 管理用户的主身份，维护登录状态
2. **令牌代理**: 代表嵌套应用向 Azure AD 请求令牌
3. **安全网关**: 验证嵌套应用的权限，确保安全访问
4. **性能优化**: 通过令牌预取和缓存机制提升用户体验

### 令牌预取机制

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

---

**相关资源：**

- [NAA 官方文档](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication)
- [MSAL.js 库](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Teams JavaScript SDK](https://github.com/OfficeDev/microsoft-teams-library-js)
