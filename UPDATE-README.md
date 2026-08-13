DragonNav V4.1 搜索引擎视觉优化

本次更新：
1. 前台搜索框左侧的搜索引擎区域改得更自然。
2. 当前选中的搜索引擎会显示对应 logo。
3. 支持搜索引擎自定义 icon 字段；留空时自动尝试该搜索引擎域名的 /favicon.ico。
4. 后台“搜索引擎管理”新增图标 URL 字段与图标预览。

需要覆盖：
- index.html
- edge-functions/[path].js
- edge-functions/api/config.js

需要删除：无
需要新增：无
不需要修改：edge-functions/api/login.js
