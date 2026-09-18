# DragonNav V4 · Vue 3 + 当前线路延迟检测

DragonNav 是一个部署在 **Tencent EdgeOne Makers** 上的导航站项目。

当前版本已将前台重构为 **Vue 3 + Vite**，继续保留原来的 EdgeOne Edge Functions、KV、后台管理和现有数据结构，并新增网站访问延迟检测。

---

## 主要功能

- Vue 3 + Vite 前台
- EdgeOne Makers 部署
- EdgeOne KV 保存导航配置
- 分类管理
- 网站管理
- 搜索引擎管理
- 深色 / 浅色模式
- 当前时间
- 天气与未来天气
- 网站卡片访问延迟
- 后台管理
- 原有 `NAV_CONFIG` 数据兼容

### 网站延迟检测

首页网站卡片会显示当前访问线路到目标网站的大致访问延迟，例如：

```text
● 68 ms
● 186 ms
● 526 ms
检测中…
访问超时
暂不可测
```

默认逻辑：

```text
刷新间隔：5 秒
单站超时：3.5 秒
最大并发：4
结果平滑：最近 3 次成功结果取中位数
```

延迟由**访问者浏览器直接请求目标网站**进行计算，因此会使用访问者当前的：

- 公网 IP
- 宽带线路
- VPN
- 代理
- 网络环境

> 注意：浏览器网页不能直接发送 ICMP Ping，因此这里显示的是 HTTP/HTTPS 访问响应耗时，不是系统 `ping` 命令的 ICMP 延迟。  
> 部分网站可能因为浏览器跨域限制、目标站安全策略或广告拦截器导致无法探测，此时会显示“暂不可测”或“访问超时”。

---

# 一、项目目录

仓库根目录应该是：

```text
DragonNav/
├─ index.html
├─ package.json
├─ vite.config.js
├─ edgeone.json
├─ README.md
│
├─ src/
│  ├─ main.js
│  ├─ App.vue
│  ├─ styles.css
│  ├─ components/
│  └─ composables/
│
└─ edge-functions/
   ├─ [path].js
   └─ api/
      ├─ config.js
      └─ login.js
```

上传代码时，不要多套一层文件夹。

正确：

```text
DragonNav/
├─ src/
├─ edge-functions/
├─ package.json
└─ index.html
```

错误：

```text
DragonNav/
└─ DragonNav-Vue-Latency/
   ├─ src/
   ├─ package.json
   └─ index.html
```

---

# 二、EdgeOne KV

本项目继续使用原来的 KV。

## KV Namespace 绑定变量名

```text
NAV_KV
```

## KV Key

```text
NAV_CONFIG
```

如果你是从旧版 DragonNav 升级：

**不要删除原来的 KV Namespace，也不要删除 `NAV_CONFIG`。**

原来的：

- 分类
- 网站
- 图标
- 网站地址
- 搜索引擎
- 首页设置

都会继续读取。

---

# 三、EdgeOne 环境变量

在 EdgeOne Makers 项目中保留以下环境变量：

```text
ADMIN_PATH=你的后台路径
ADMIN_USERNAME=后台账号
ADMIN_PASSWORD=后台密码
SESSION_SECRET=随机长字符串
```

例如：

```text
ADMIN_PATH=manage2026
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的强密码
SESSION_SECRET=一段足够长的随机字符串
```

后台访问地址：

```text
https://你的域名/manage2026
```

其中 `manage2026` 替换为你自己配置的 `ADMIN_PATH`。

---

# 四、从 GitHub 部署到 EdgeOne Makers

## 1. 准备 GitHub 仓库

将本项目完整代码上传到 GitHub 仓库，例如：

```text
Dragon-Sturgron/DragonNav
```

建议生产分支使用：

```text
main
```

确认 GitHub 仓库根目录能看到：

```text
index.html
package.json
vite.config.js
edgeone.json
src/
edge-functions/
```

---

## 2. 打开 EdgeOne Makers

进入腾讯云 EdgeOne Makers，创建或打开项目。

选择：

```text
Git 仓库部署
```

然后绑定：

```text
GitHub
```

选择你的仓库：

```text
Dragon-Sturgron/DragonNav
```

生产分支选择：

```text
main
```

---

## 3. 构建配置

EdgeOne Makers 中填写：

```text
框架预设：Vite
根目录：./
输出目录：dist
构建命令：pnpm build
安装命令：pnpm install
```

如果控制台提供 `Vue / Vite` 预设，也可以选择 Vue/Vite。

### 推荐配置表

| 配置项 | 内容 |
|---|---|
| 框架预设 | `Vite` |
| 根目录 | `./` |
| 安装命令 | `pnpm install` |
| 构建命令 | `pnpm build` |
| 输出目录 | `dist` |
| 生产分支 | `main` |

本项目已经包含：

```text
edgeone.json
```

内容用于声明：

```text
pnpm install
pnpm build
dist
```

但仍建议在 EdgeOne 控制台确认一次构建配置。

---

# 五、为什么这里使用 `pnpm install`

当前仓库没有提交：

```text
pnpm-lock.yaml
```

因此第一次部署使用：

```bash
pnpm install
```

不要使用：

```bash
pnpm install --frozen-lockfile
```

否则在没有 lockfile 的情况下可能导致构建失败。

如果以后你在本地执行：

```bash
pnpm install
```

并将生成的：

```text
pnpm-lock.yaml
```

一起提交到 GitHub，那么可以再改为：

```bash
pnpm install --frozen-lockfile
```

用于固定生产依赖版本。

---

# 六、部署

确认配置完成后点击：

```text
开始部署
```

正常流程应该依次看到：

```text
初始化
↓
克隆仓库
↓
安装依赖
↓
构建
↓
部署
```

其中：

```text
安装依赖
```

会执行：

```bash
pnpm install
```

构建阶段执行：

```bash
pnpm build
```

Vite 最终生成：

```text
dist/
```

EdgeOne 会发布 `dist` 中的前端文件，同时继续识别仓库中的：

```text
edge-functions/
```

作为 Edge Functions。

---

# 七、第一次部署后的检查

部署完成后，EdgeOne 会提供默认访问域名。

先打开：

```text
https://你的EdgeOne默认域名/
```

确认首页可以正常显示。

然后检查配置接口：

```text
https://你的EdgeOne默认域名/api/config
```

正常情况下应该返回 JSON，并包含：

```text
config
categories
sites
searchEngines
settings
```

如果 `/api/config` 正常，说明：

```text
Vue 前台 ✅
Edge Functions ✅
KV ✅
```

都已经工作。

再访问后台：

```text
https://你的EdgeOne默认域名/{ADMIN_PATH}
```

例如：

```text
https://你的EdgeOne默认域名/manage2026
```

确认可以登录和管理网站。

---

# 八、绑定自定义域名

确认默认域名运行正常后，再进入：

```text
EdgeOne Makers
→ 项目
→ 域名管理
→ 添加自定义域名
```

绑定你自己的域名，例如：

```text
nav.example.com
```

按照 EdgeOne 提示配置 CNAME。

建议先用 EdgeOne 默认域名确认网站完全正常，再绑定正式域名。

---

# 九、完整覆盖旧版本时的注意事项

如果你准备将旧版仓库代码全部删除后重新覆盖：

### 可以删除

GitHub 仓库中的旧源码可以删除并重新上传。

### 不要删除

EdgeOne 中以下内容不要删：

```text
NAV_KV
NAV_CONFIG
ADMIN_PATH
ADMIN_USERNAME
ADMIN_PASSWORD
SESSION_SECRET
```

否则旧的导航数据和后台设置会丢失。

---

# 十、出现 `Commit checkout failed`

如果 EdgeOne 日志出现：

```text
Cloning completed
Commit checkout failed
Build error
```

而 GitHub 仓库本身可以正常打开，通常说明 EdgeOne 正在尝试部署一个已经不存在的旧 Commit。

处理方法：

1. 回到 GitHub 仓库。
2. 随便修改一次 `README.md`。
3. 提交一个新的 Commit，例如：

```text
chore: trigger EdgeOne deployment
```

4. 等待 EdgeOne 自动生成一条新的部署记录。

不要一直对旧的失败记录点击重新部署。

如果新的提交仍然无法触发正确构建：

```text
EdgeOne
→ 项目设置
→ Git 仓库
```

确认：

```text
仓库：Dragon-Sturgron/DragonNav
生产分支：main
```

仍然异常时，可以解除 GitHub 仓库绑定后重新绑定一次。

---

# 十一、修改延迟刷新时间

延迟检测核心文件：

```text
src/composables/useLatency.js
```

默认：

```js
REFRESH_MS = 5000
TIMEOUT_MS = 3500
CONCURRENCY = 4
HISTORY_SIZE = 3
```

如果希望每 3 秒刷新：

```js
const REFRESH_MS = 3000
```

不建议设置低于：

```text
3000 ms
```

网站数量较多时，刷新太快会增加浏览器请求量。

---

# 十二、后台管理

后台继续支持：

- 首页标题
- 首页副标题
- 最大显示网站数量
- 搜索引擎按钮颜色
- 分类新增
- 分类编辑
- 分类删除
- 分类启用 / 停用
- 分类拖拽排序
- 网站新增
- 网站编辑
- 网站删除
- 网站启用 / 停用
- 网站拖拽排序
- 搜索引擎新增
- 搜索引擎编辑
- 搜索引擎删除
- 搜索引擎启用 / 停用
- 搜索引擎拖拽排序

后台数据继续写入：

```text
NAV_KV
```

中的：

```text
NAV_CONFIG
```

---

# 十三、本地开发

如果需要在本地运行：

```bash
pnpm install
pnpm dev
```

构建生产版本：

```bash
pnpm build
```

本地预览构建结果：

```bash
pnpm preview
```

---

# 十四、升级建议

以后如果继续更新 DragonNav，建议：

1. 先备份 GitHub 仓库。
2. 不删除 EdgeOne KV。
3. 不改变 `NAV_KV` 绑定名。
4. 不改变 `NAV_CONFIG` Key。
5. 新版本先用 EdgeOne 默认域名测试。
6. 确认前台、API、后台都正常后再使用正式域名。

---

## 当前版本

```text
DragonNav V4
Vue 3
Vite
Tencent EdgeOne Makers
EdgeOne KV
当前访问线路延迟检测
```
