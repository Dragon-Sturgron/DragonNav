DragonNav V5.3 - 区县定位增强 + 未来 7 天天气

本次更新：

1. 地址定位增强
- 地址反查改用 Nominatim geocodejson。
- 优先读取行政层级中的城市和区/县。
- 对中国地址额外识别“市 / 区 / 县 / 旗 / 新区 / 自治县”等后缀。
- 显示目标：例如“广州市 · 荔湾区”。
- 地址缓存 Key 升级，旧地址缓存不会继续影响结果。

2. 未来 7 天天气
- 点击右上角天气卡片，打开未来 7 天天气弹窗。
- 每天显示：
  - 今天 / 明天 / 星期
  - 日期
  - 天气图标与状态
  - 最高 / 最低温
  - 最大降雨概率
- 弹窗支持“重新定位”。
- 点击空白区域或按 Esc 可关闭。
- 移动端自适应。

3. 天气接口
- Open-Meteo Forecast API
- daily:
  - weather_code
  - temperature_2m_max
  - temperature_2m_min
  - precipitation_probability_max
- forecast_days=7

本次文件操作：

需要覆盖：
- index.html

需要新增：无
需要删除：无

其他文件无需修改。
