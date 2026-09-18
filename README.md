# DragonNav V4 · Vue 3 + 当前线路延迟检测

这是 DragonNav 的 Vue 3 / Vite 重构版，继续使用 Tencent EdgeOne Makers + KV。

## 本版变化

- 前台重构为 Vue 3 + Vite。
- 保留原来的分类、网站、搜索引擎、天气、时钟、深浅色模式。
- 网站卡片新增“访问延迟”。
- 延迟默认每 5 秒刷新一轮。
- 延迟由访问者浏览器直接请求目标网站，因此使用访问者当前公网 IP / VPN / 代理线路。
- 最多 4 个并发探测，单站 3.5 秒超时。
- 最近 3 次成功结果取中位数，减少网络抖动。
- 仅持续刷新当前屏幕附近的卡片；页面切后台后自动暂停。
- 后台、NAV_KV 和原有数据结构继续兼容。

> 注意：浏览器网页不能直接做 ICMP Ping。这里显示的是目标网站 HTTP/HTTPS 请求从发起到收到响应头的大致耗时，更接近“实际打开网站”的访问延迟。部分网站可能被浏览器安全策略、广告拦截器或目标站策略阻止探测，此时会显示“暂不可测”或“访问超时”。

## EdgeOne 环境变量

保持原项目配置：

```text
ADMIN_PATH=你的后台路径
ADMIN_USERNAME=后台账号
ADMIN_PASSWORD=后台密码
SESSION_SECRET=随机长字符串
```

KV Namespace 绑定变量名：

```text
NAV_KV
```

KV Key 仍然是：

```text
NAV_CONFIG
```

现有 KV 不需要删除，也不需要重新建。

## EdgeOne Makers 构建设置

```text
框架预设：Vite（或 Vue/Vite）
根目录：./
安装命令：pnpm install
构建命令：pnpm build
输出目录：dist
```

本仓库包含 `edgeone.json`，但控制台中仍建议确认以上设置。

## 覆盖旧仓库

如果你准备“删库覆盖”：

1. 不要删除 EdgeOne 控制台中的 KV Namespace 和环境变量。
2. 删除 GitHub 仓库里的旧代码文件。
3. 将本压缩包解压后的**内容**上传到仓库根目录，不要多套一层 `DragonNav-Vue-Latency/` 文件夹。
4. 提交到当前 EdgeOne 绑定的生产分支。
5. 在 EdgeOne Makers 把构建配置改成上面的 Vite 配置。
6. 等待自动部署。

正确根目录应看到：

```text
index.html
package.json
vite.config.js
edgeone.json
src/
edge-functions/
```

## 延迟逻辑

核心文件：

```text
src/composables/useLatency.js
```

默认参数：

```js
REFRESH_MS = 5000
TIMEOUT_MS = 3500
CONCURRENCY = 4
HISTORY_SIZE = 3
```

如果以后想改为 3 秒，把：

```js
const REFRESH_MS = 5000
```

改为：

```js
const REFRESH_MS = 3000
```

不建议低于 3 秒。

## 后台

后台仍通过：

```text
https://你的域名/{ADMIN_PATH}
```

访问，可继续管理：

- 首页标题、副标题、最大显示数量
- 搜索按钮颜色
- 分类新增/编辑/删除/启停/拖拽排序
- 网站新增/编辑/删除/启停/拖拽排序
- 搜索引擎新增/编辑/删除/启停/拖拽排序

