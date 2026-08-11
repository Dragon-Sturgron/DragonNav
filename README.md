# DragonNav V3 - EdgeOne Makers + KV

## V3 更新

后台结构已调整为“分类管理 → 分类网站管理”两层。

### 分类管理

- 取消“排序”数字列。
- 分类顺序直接通过拖拽左侧 `☰` 手柄调整。
- 点击“分类名称”进入该分类的网站管理页面。
- 显示每个分类当前的网站数量。
- 保留启用 / 停用、编辑名称、删除分类。

### 网站管理

- 不再与分类管理放在同一个页面。
- 点击分类名称后进入该分类的网站管理。
- 只显示当前分类的网站。
- 取消“排序”数字列和网站编辑弹窗里的排序字段。
- 网站顺序通过拖拽左侧 `☰` 手柄调整。
- 新增网站默认属于当前分类。
- 编辑网站时仍然可以修改到其他分类。
- 支持网站启用 / 停用、编辑、删除。

### 保存逻辑

拖拽、编辑、启用/停用后，右上角“保存到 KV”按钮会提示“有修改”。

只有点击“保存到 KV”后才正式写入 KV。

### 旧数据兼容

V2 以及更早版本使用：

```text
sort: 10
sort: 20
sort: 30
```

V3 首次读取旧 KV 时，会先按照旧 `sort` 数值恢复当前顺序，再转换为数组顺序。

因此不需要清空 `NAV_CONFIG`，现有分类、网站、图标和地址都会继续保留。

保存一次 V3 配置后，KV 数据版本升级为：

```json
{
  "version": 2
}
```

之后显示顺序完全由 `categories` 和 `sites` 数组顺序决定。

## 后台地址

仍然由环境变量：

```text
ADMIN_PATH
```

控制。

例如：

```text
ADMIN_PATH=manage2026
```

后台访问：

```text
https://你的域名/manage2026
```

分类的网站管理使用同一个后台地址，通过页面参数切换，例如：

```text
https://你的域名/manage2026?view=sites&category=ai
```

用户不需要手动拼地址，直接点击分类名称即可进入。

## 环境变量

保持不变：

```text
ADMIN_PATH=你的后台后缀
ADMIN_USERNAME=后台账号
ADMIN_PASSWORD=后台密码
SESSION_SECRET=随机签名密钥
```

KV 项目绑定变量：

```text
NAV_KV
```

KV Key：

```text
NAV_CONFIG
```

## 部署

项目根目录：

```text
index.html
README.md
edge-functions/
  [path].js
  api/
    config.js
    login.js
```

EdgeOne Makers 构建设置：

```text
框架预设：Other
根目录：./
输出目录：留空
构建命令：留空
安装命令：留空
```

直接覆盖 GitHub 仓库中的旧文件并提交，等待 Makers 自动部署即可。

原来的 KV Namespace 和环境变量无需重新创建。
