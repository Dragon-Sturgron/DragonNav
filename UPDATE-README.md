DragonNav V4.9 - 后台模块顺序调整

调整后后台首页顺序：

1. 首页设置
2. 分类管理
3. 搜索引擎管理

仅交换“分类管理”和“搜索引擎管理”的位置。
功能、拖拽、自动同步 KV、后台路径和数据结构均不变。

本次文件操作：

需要覆盖：
- edge-functions/[path].js

需要新增：无
需要删除：无

无需修改：
- index.html
- edge-functions/api/config.js
- edge-functions/api/login.js
