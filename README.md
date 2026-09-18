# DragonNav V5 · Vue 3 + 当前线路延迟 + 当前 IP 画像

DragonNav 是一个部署在 **Tencent EdgeOne Makers** 上的导航站项目。

V5 在 V4 的 Vue 3 + Vite 基础上继续优化首页，并新增当前访问 IP 卡片和 IP 详情面板。

## V5 变化

- 左上角原“龙鲟导航”品牌卡改为**当前访问 IP 卡片**。
- IP 卡片默认只显示：**国家/地区 + 当前公网 IP**。
- 点击 IP 卡片弹出 IP 详情面板。
- 移除搜索框下方“5 秒刷新 / 并发 / 中位延迟”说明胶囊。
- 移除“DRAGONNAV / 网站导航 / 延迟说明”区块，仅保留网站筛选框和分类卡片。
- 保留网站卡片每 5 秒刷新当前浏览器线路的访问延迟。
- 保留天气、未来 7 天天气、深浅色、时钟、搜索、KV 后台等原有功能。

## IP 详情内容

弹窗会对重复信息去重后展示：

- IP 地址
- 国家 / 地区 / 城市
- ASN
- ASN 所有者
- ISP / 企业 / 组织
- 经度 / 纬度
- IPv4 / IPv6
- IP 地址数字值（IPv4）
- 数据中心 / 住宅 / 移动网络
- VPN / Proxy / Tor
- 爬虫 / 滥用 / Bogon 标记
- IP 信任分
- CIDR
- IP 范围
- 地址数量
- RIR
- ASN / 公司类型
- ASN 注册时间 / 资料更新时间
- PTR / 主机名
- RDAP 网络名称
- 时区
- 应用场景网络风险参考

“原生 / 广播 IP”“共享人数”“具体平台解锁”如果没有可靠公开数据，会明确显示未做结论，不会伪造结果。

## IP 数据来源

`/api/ip-profile` 会综合：

- EdgeOne 当前客户端 IP / GEO
- Net.Coffee IP health
- ipapi.is
- RDAP
- DNS PTR

基础功能**无需新增 API Key**。

如果希望 ipapi.is 返回更完整的安全 / ASN / 公司字段，可选在 EdgeOne 环境变量中增加：

```text
IPAPI_KEY=你的 ipapi.is API Key
```

不配置也能使用，系统会自动使用其他来源补齐可获得的信息。

> IP 地址会被用于上述网络信息查询。如果公开提供给其他用户访问，请根据你的实际使用地区补充合适的隐私说明。

---

# EdgeOne 环境变量

保留原项目配置：

```text
ADMIN_PATH=你的后台路径
ADMIN_USERNAME=后台账号
ADMIN_PASSWORD=后台密码
SESSION_SECRET=随机长字符串
```

可选：

```text
IPAPI_KEY=ipapi.is API Key
```

KV Namespace 绑定变量名：

```text
NAV_KV
```

KV Key：

```text
NAV_CONFIG
```

现有 KV 不需要删除。

---

# EdgeOne Makers 部署

仓库根目录：

```text
index.html
package.json
vite.config.js
edgeone.json
README.md
src/
edge-functions/
```

构建设置：

```text
框架预设：Vite（或 Vue/Vite）
根目录：./
安装命令：pnpm install
构建命令：pnpm build
输出目录：dist
生产分支：main
```

本仓库已有 `edgeone.json`：

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": "dist"
}
```

当前仓库没有 `pnpm-lock.yaml`，所以使用：

```bash
pnpm install
```

不要改成：

```bash
pnpm install --frozen-lockfile
```

除非以后已经把 `pnpm-lock.yaml` 一起提交到仓库。

## 部署后检查

依次访问：

```text
https://你的域名/
https://你的域名/api/config
https://你的域名/api/ip-profile
https://你的域名/{ADMIN_PATH}
```

其中 `/api/ip-profile` 正常时应返回当前访问者的 IP 画像 JSON。

---

# 网站延迟检测

核心文件：

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

延迟由访问者浏览器发起，因此反映当前公网 IP / VPN / 代理线路的 HTTP/HTTPS 访问响应耗时，不是 ICMP Ping。

---

# 后台

后台地址：

```text
https://你的域名/{ADMIN_PATH}
```

仍可管理：

- 首页标题 / 副标题 / 最大显示数量
- 分类
- 网站
- 搜索引擎
- 拖拽排序
- 启用 / 停用
- 搜索按钮颜色

后台仍写入 `NAV_KV` 中的 `NAV_CONFIG`，与旧数据兼容。

---

## 当前版本

```text
DragonNav V5
Vue 3
Vite
Tencent EdgeOne Makers
EdgeOne KV
当前浏览器线路延迟检测
当前访问 IP 画像
```
