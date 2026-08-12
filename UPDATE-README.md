# DragonNav V4 自动同步更新

本更新基于当前 DragonNav V3。

## V4 主要变化

- 删除后台“保存到 KV”按钮。
- 新增、编辑、删除后自动同步到 KV。
- 启用 / 停用后自动同步到 KV。
- 分类、网站、搜索引擎拖拽排序后自动同步到 KV。
- 首页标题、副标题、最多显示网站数在停止输入约 700ms 后自动同步。
- 后台右上角显示自动同步状态：等待同步 / 正在同步 / 已同步 / 同步失败。
- 前台搜索引擎由搜索框上方按钮改为搜索框内部左侧下拉选择。
- 搜索引擎配置迁移到 NAV_CONFIG。
- 后台新增“搜索引擎管理”：
  - 新增
  - 编辑
  - 删除
  - 启用 / 停用
  - 拖拽调整顺序
- 搜索地址支持 `{q}` 作为搜索关键词占位符。
- 旧 KV 配置无需删除，读取旧数据时自动补充默认搜索引擎。

## 本次文件操作

需要覆盖：

- `index.html`
- `edge-functions/[path].js`
- `edge-functions/api/config.js`

需要新增：无

需要删除：无

无需修改：

- `edge-functions/api/login.js`

环境变量保持不变：

- `ADMIN_PATH`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

KV 绑定保持：

- `NAV_KV`

后台地址继续由 `ADMIN_PATH` 控制。
