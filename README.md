# 龙鲟导航 - EdgeOne Makers + KV 后台版

## 已实现

- 首页搜索引擎：必应、百度、Google、搜狗、DuckDuckGo。
- 下方网站改成“图标在上、名称在下”的按钮式导航。
- 点击网站按钮在新标签页打开。
- 网站图标支持后台填写自定义图标 URL。
- 图标 URL 留空时，前台自动尝试读取该网站的 `/favicon.ico`。
- 后台管理地址：`https://你的域名/admin.html`
- 后台管理网站：
  - 新增
  - 编辑
  - 删除
  - 启用 / 停用
  - 调整排序
  - 修改分类
  - 设置网站图标
- 后台管理分类：
  - 新增
  - 删除
  - 改名
  - 排序
  - 启用 / 停用
- 首页设置：
  - 网站标题
  - 副标题
  - “首页最多显示网站数”
  - `0` 代表显示所有启用的网站
- 所有导航配置保存到 EdgeOne Makers KV。
- 后台账号密码使用 Makers 环境变量，不写在前端代码里。
- 后台登录成功后使用 12 小时签名 Token。

## 项目结构

```text
edgeone-makers-nav-kv/
├─ index.html
├─ admin.html
├─ README.md
└─ edge-functions/
   └─ api/
      ├─ config.js
      └─ login.js
```

当前 Makers 文档推荐使用 `edge-functions/` 创建 Edge Functions。项目可以通过文件夹 / ZIP 上传，也可以通过 GitHub / Gitee 导入。

## 一、部署项目

### 方式 A：直接上传 ZIP / 文件夹

在 EdgeOne Makers 创建项目时，选择上传本项目文件夹或 ZIP。

这个项目包含静态页面与 `edge-functions/`，不要只上传 `index.html`，否则后台 API 不会部署。

### 方式 B：Git 仓库部署（更推荐）

1. 新建 GitHub 或 Gitee 仓库。
2. 将本项目所有文件上传到仓库根目录。
3. 在 EdgeOne Makers 中创建项目。
4. 选择从 Git 仓库导入。
5. 以后每次提交代码，Makers 可以重新部署。

## 二、创建 KV

进入 EdgeOne Makers / 存储 / KV：

1. 开通 KV。
2. 创建一个 Namespace，例如：

```text
navigation
```

3. 将这个 Namespace 绑定到当前 Makers 项目。
4. **变量名称必须填写：**

```text
NAV_KV
```

项目代码会通过 `NAV_KV` 访问这个 KV。

KV 中使用的配置 Key 是：

```text
NAV_CONFIG
```

首次访问前台 `/api/config` 时，如果 KV 里还没有这个 Key，系统会自动写入内置默认导航。

## 三、配置后台环境变量

进入 Makers 项目的“环境变量”，添加：

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=请填写你自己的强密码
SESSION_SECRET=请填写一段足够长的随机字符串
```

建议：

- `ADMIN_USERNAME`：后台账号。
- `ADMIN_PASSWORD`：至少 12 位，不要使用简单密码。
- `SESSION_SECRET`：建议 32 位以上随机字符。
- 不要把真实密码或 SESSION_SECRET 提交到 Git 仓库。

修改环境变量后，请重新部署项目。

## 四、访问

前台：

```text
https://你的域名/
```

后台：

```text
https://你的域名/admin.html
```

登录后台后即可修改网站和分类。

## 五、如何控制“显示多少网站”

后台 → 首页设置 → `首页最多显示网站数`

例如：

```text
0  = 显示全部启用的网站
8  = 首页最多显示 8 个
12 = 首页最多显示 12 个
20 = 首页最多显示 20 个
```

同时，每个网站都有“启用 / 停用”。

因此可以有 30 个网站保存在 KV 中，但只启用其中 20 个，再设置首页最多显示 12 个。

## 六、网站图标

每个网站可以填写：

```text
https://example.com/icon.png
```

如果图标 URL 留空，系统会尝试：

```text
https://example.com/favicon.ico
```

如果自动图标加载失败，会显示网站名称前两个字符作为备用图标。

## 七、KV 数据结构

整个配置保存为一个 JSON，示意：

```json
{
  "settings": {
    "title": "龙鲟导航",
    "subtitle": "搜索一下，或者直接打开常用网站",
    "maxSites": 0
  },
  "categories": [],
  "sites": []
}
```

这种方式特别适合导航站，因为配置数据很小，而且“读取远多于修改”。

## 八、注意：KV 是最终一致性

EdgeOne Makers KV 是多边缘节点 KV。后台保存后，当前节点可以立即读取新数据，但其他边缘节点最长可能约 60 秒后才读到最新配置。

因此后台点击保存后：
- 你自己刷新通常很快能看到；
- 其他地区用户可能在短时间内看到旧数据；
- 最长约 60 秒后会同步。

这属于 KV 的正常工作机制，不是程序故障。

## 九、安全说明

`admin.html` 本身是静态页面，任何知道地址的人都可能打开登录界面，但无法读取后台配置或修改 KV。

真正的权限校验在 Edge Function 中：

- `/api/login`
- `/api/config?admin=1`
- `POST /api/config`

保存配置必须带有效的后台 Token。

账号、密码和签名密钥都放在 Makers 环境变量中。
