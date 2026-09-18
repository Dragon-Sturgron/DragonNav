# DragonNav V6 · Vue 3 + 当前 IP 风控访问控制

DragonNav V6 继续部署在 Tencent EdgeOne Makers，使用 Vue 3 + Vite + Edge Functions + NAV_KV。

本版在 V5 基础上主要加入：

- 打开首页后自动检测当前公网 IP；
- 每 30 秒自动更新一次 IP 画像、IP 信誉分和风险值；
- 删除“手动重新检测”按钮；
- 删除“应用场景参考”板块；
- 每个导航网站可单独设置 IP 风控访问规则；
- 网站卡片延迟改为由访问者当前浏览器直接请求目标域名的轻量资源；
- 当前公网 IP 改变后自动清空旧延迟历史并重新测量；
- 仍兼容现有 NAV_KV 数据，不需要清空原导航配置。

---

## 1. IP 自动检测

首页加载后会立即调用：

```text
/api/ip-profile
```

之后每：

```text
30 秒
```

自动重新检测一次。

浏览器切换到后台时不会重复发起无意义检测；重新回到页面且数据已经超过 30 秒，会立即补一次检测。

IP 弹窗中会显示：

```text
IP 地址
IP 国家 / 地区 / 城市
ASN
ASN 所有者
ISP
企业 / 组织
经纬度
IP 类型
IP 信誉分
风险值
CIDR
IP 范围
PTR
RIR
VPN / Proxy / Tor / 爬虫 / 滥用 / Bogon 等风险信号
```

其中：

```text
IP 信誉分：0 - 100，越高越好
风险值：0 - 100，越低越好
```

风险值会综合已取得的上游风险评分、信誉分反向值以及 VPN / Proxy / Tor / Abuser / Datacenter 等风险标记。

> 这些数据用于本导航站的访问策略参考，不代表目标网站官方的账号风控评分。

---

## 2. 网站 IP 风控访问控制

后台编辑网站时新增：

```text
IP 风险访问控制
最低 IP 信誉分
最高风险值
评分未知时允许 / 拒绝
```

例如你希望 ChatGPT 只有在：

```text
IP 信誉分 >= 70
风险值 <= 45
```

时才能通过 DragonNav 打开，就在后台把该网站设置为：

```text
访问控制：启用
最低 IP 信誉分：70
最高风险值：45
评分未知时：拒绝访问
```

如果当前 IP 为：

```text
信誉分 61
风险值 52
```

网站卡片会被锁定，例如显示：

```text
🔒 信誉 61 < 70 · 风险 52 > 45
```

点击不会打开目标网站。

如果当前 IP 满足要求，卡片正常打开。

### 重要说明

这个功能控制的是：

```text
用户通过 DragonNav 打开网站
```

它不能阻止用户绕过 DragonNav，直接在浏览器地址栏输入外部网站地址。

如果以后需要真正的服务端访问授权，需要目标业务本身也接入鉴权或代理网关。

---

## 3. 网站延迟检测

延迟仍然默认：

```text
每 5 秒刷新
最多 4 个并发
单次超时 3.2 秒
最近 5 次成功数据取中位数
```

V6 不再直接请求目标网站完整首页，而是从访问者浏览器直接请求：

```text
https://目标网站/favicon.ico?随机参数
```

这样可以：

- 避免整页 HTML 下载时间干扰；
- 避免浏览器缓存影响；
- 让请求真正从当前浏览器、当前公网 IP、当前 VPN / 代理线路发出；
- 当前 IP 改变后清空上一条线路的历史数据。

> 浏览器网页无法直接发送 ICMP Ping，因此卡片显示的仍是 HTTP/HTTPS 访问响应耗时，不是系统命令 `ping` 的 ICMP 延迟。

---

## 4. EdgeOne KV

KV Namespace 绑定变量：

```text
NAV_KV
```

KV Key：

```text
NAV_CONFIG
```

升级 V6 时不要删除现有 KV。

旧网站没有风控配置时，会自动视为：

```text
访问控制：关闭
```

不会因为升级而突然锁定原有网站。

---

## 5. EdgeOne 环境变量

继续保留：

```text
ADMIN_PATH=你的后台路径
ADMIN_USERNAME=后台账号
ADMIN_PASSWORD=后台密码
SESSION_SECRET=随机长字符串
```

可选：

```text
IPAPI_KEY=你的 ipapi.is API Key
```

不配置 `IPAPI_KEY` 也能运行；配置后可在上游允许的情况下取得更多 IP 风险字段。

---

## 6. EdgeOne Makers 部署配置

```text
框架预设：Vite
根目录：./
安装命令：pnpm install
构建命令：pnpm build
输出目录：dist
生产分支：main
```

仓库根目录应该直接看到：

```text
index.html
package.json
vite.config.js
edgeone.json
src/
edge-functions/
README.md
```

不要多套一层目录。

---

## 7. 覆盖旧仓库

如果你采用“删除 GitHub 旧代码后完整覆盖”的方式：

1. 不要删除 EdgeOne 的 `NAV_KV`；
2. 不要删除 `NAV_CONFIG`；
3. 不要删除原有后台环境变量；
4. 解压本项目；
5. 将解压后的**内容**上传到 GitHub 仓库根目录；
6. 提交到 EdgeOne 绑定的 `main` 分支；
7. 等待 EdgeOne 自动部署。

---

## 8. 后台地址

后台仍然是：

```text
https://你的域名/{ADMIN_PATH}
```

例如：

```text
ADMIN_PATH=manage2026
```

则访问：

```text
https://你的域名/manage2026
```

---

## 9. 建议的风控阈值示例

这些只是配置示例，不代表任何第三方平台的官方要求：

```text
宽松：信誉 >= 45，风险 <= 75
普通：信誉 >= 60，风险 <= 60
严格：信誉 >= 75，风险 <= 40
```

具体阈值由你在每个网站的后台配置中自行决定。

---

## 10. 当前版本

```text
DragonNav V6
Vue 3
Vite
Tencent EdgeOne Makers
NAV_KV
IP 自动检测：30 秒
网站延迟：当前浏览器 / 当前 IP 直连测量
网站访问：支持按 IP 信誉分 + 风险值限制
```
