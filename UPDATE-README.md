DragonNav V4.6 - 未选中搜索引擎白色背景修复

问题修复：
- 旧 KV 或深色主题可能继续把未选中搜索引擎背景覆盖为黑色。
- 本版本不再让未选中背景依赖主题变量或历史 KV 值。

现在固定规则：
- 未选中：白色 #ffffff
- 未选中文字：深色 #18181b
- 鼠标悬停：后台可自定义，默认 #f1f2f4
- 当前选中：后台可自定义，默认 #52525b
- 当前选中文字：白色
- 下拉菜单整体背景：白色
- 左侧当前搜索引擎 Logo 按钮：白色；Hover 使用悬停色

后台变化：
- 移除“搜索引擎未选中背景色”设置，避免产生“设置了却被主题覆盖”的混淆。
- 保留“搜索引擎鼠标悬停背景色”。
- 保留“搜索引擎选中背景色”。

KV 兼容：
- 旧 NAV_CONFIG 不需要删除。
- API 每次读取/保存配置时都会把 engineUnselectedColor 强制纠正为 #ffffff。

本次文件操作：

需要覆盖：
- index.html
- edge-functions/[path].js
- edge-functions/api/config.js

需要新增：无
需要删除：无

无需修改：
- edge-functions/api/login.js
