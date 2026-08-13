DragonNav V4.4 - 搜索引擎背景自动跟随导航主题

新增逻辑：
- 默认开启“搜索引擎背景跟随导航主题”。
- 浅色导航时自动使用浅色背景。
- 深色导航时自动使用深色背景。
- 切换导航浅色 / 深色主题时，搜索引擎背景实时跟随。
- 自动模式直接使用导航现有 CSS 主题变量，不需要额外保存两套颜色。
- 后台仍保留“选中背景色 / 未选中背景色”自定义功能。
- 只有关闭“搜索引擎背景跟随导航主题”后，自定义颜色才生效。
- 开关和颜色修改都自动同步到 KV。

自动模式：
- 选中背景：跟随导航 `--chip`
- 未选中背景：根据导航 `--bg` 与 `--solid` 自动混合

本次文件操作：

需要覆盖：
- index.html
- edge-functions/[path].js
- edge-functions/api/config.js

需要新增：无
需要删除：无

无需修改：
- edge-functions/api/login.js

现有 NAV_CONFIG 无需删除。旧配置读取后会自动补充：
engineColorFollowTheme = true
