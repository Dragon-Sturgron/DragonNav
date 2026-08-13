DragonNav V4.5 - 搜索引擎状态颜色优化

默认状态：

- 未选中：白色 #ffffff
- 鼠标悬停：浅灰 #f1f2f4
- 当前已选中：深灰 #52525b
- 已选中文字/勾选：白色
- 搜索框左侧当前 Logo 按钮：默认白色，Hover 浅灰

后台“首页设置”保留自定义能力，可以分别调整：

1. 搜索引擎未选中背景色
2. 鼠标悬停背景色
3. 搜索引擎选中背景色

三个颜色修改后都会自动同步到 KV。

本版本取消上一版“跟随导航主题”的逻辑，避免深色主题导致搜索引擎背景变成黑色。

本次文件操作：

需要覆盖：
- index.html
- edge-functions/[path].js
- edge-functions/api/config.js

需要新增：无
需要删除：无

无需修改：
- edge-functions/api/login.js
