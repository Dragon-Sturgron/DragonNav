import { ref } from 'vue'

const WEATHER_CACHE_KEY = 'dragonnav-weather-cache-v4'
const LOCATION_CACHE_KEY = 'dragonnav-location-cache-v4'
const WEATHER_TTL = 15 * 60 * 1000
const LOCATION_TTL = 24 * 60 * 60 * 1000

function cacheGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}
function cacheSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function weatherInfo(code) {
  const c = Number(code)
  if (c === 0) return { icon: '☀️', text: '晴' }
  if (c === 1) return { icon: '🌤️', text: '大致晴朗' }
  if (c === 2) return { icon: '⛅', text: '多云' }
  if (c === 3) return { icon: '☁️', text: '阴' }
  if (c === 45 || c === 48) return { icon: '🌫️', text: '雾' }
  if ([51, 53, 55, 56, 57].includes(c)) return { icon: '🌦️', text: '毛毛雨' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return { icon: '🌧️', text: '雨' }
  if ([71, 73, 75, 77, 85, 86].includes(c)) return { icon: '🌨️', text: '雪' }
  if ([95, 96, 99].includes(c)) return { icon: '⛈️', text: '雷雨' }
  return { icon: '🌡️', text: '天气' }
}

function cleanLocation(parts) {
  const out = []
  for (const raw of parts) {
    const value = String(raw || '').trim()
    if (!value) continue
    if (out.some(x => x === value || x.includes(value) || value.includes(x))) continue
    out.push(value)
  }
  return out.slice(0, 2).join(' · ') || '当前位置'
}

async function reverseLocation(lat, lon) {
  const cached = cacheGet(LOCATION_CACHE_KEY)
  if (
    cached &&
    Date.now() - cached.ts < LOCATION_TTL &&
    Math.abs(cached.lat - lat) < 0.03 &&
    Math.abs(cached.lon - lon) < 0.03
  ) return cached.name

  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', lat)
  url.searchParams.set('lon', lon)
  url.searchParams.set('zoom', '16')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', 'zh-CN')

  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('地址解析失败')
  const data = await response.json()
  const address = data.address || {}
  const name = cleanLocation([
    address.city || address.town || address.municipality || address.county,
    address.suburb || address.city_district || address.district || address.borough
  ])
  cacheSet(LOCATION_CACHE_KEY, { ts: Date.now(), lat, lon, name })
  return name
}

async function fetchForecast(lat, lon, location) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lon)
  url.searchParams.set('current', 'temperature_2m,weather_code')
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '7')

  const response = await fetch(url)
  if (!response.ok) throw new Error('天气获取失败')
  const data = await response.json()
  const dates = data.daily?.time || []
  const forecast = dates.map((date, index) => ({
    date,
    code: Number(data.daily?.weather_code?.[index]),
    max: Number(data.daily?.temperature_2m_max?.[index]),
    min: Number(data.daily?.temperature_2m_min?.[index]),
    rain: Number(data.daily?.precipitation_probability_max?.[index])
  }))

  return {
    ts: Date.now(),
    lat,
    lon,
    location,
    temp: Number(data.current?.temperature_2m),
    code: Number(data.current?.weather_code),
    max: Number(data.daily?.temperature_2m_max?.[0]),
    min: Number(data.daily?.temperature_2m_min?.[0]),
    forecast
  }
}

export function useWeather() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function load(force = false) {
    const cached = cacheGet(WEATHER_CACHE_KEY)
    if (cached) data.value = cached
    if (!force && cached && Date.now() - cached.ts < WEATHER_TTL && cached.forecast?.length) return cached

    if (!navigator.geolocation) {
      error.value = '浏览器不支持定位'
      return cached
    }

    loading.value = true
    error.value = ''
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 10 * 60 * 1000
        })
      })
      const lat = position.coords.latitude
      const lon = position.coords.longitude
      let location = '当前位置'
      try { location = await reverseLocation(lat, lon) } catch {}
      const result = await fetchForecast(lat, lon, location)
      data.value = result
      cacheSet(WEATHER_CACHE_KEY, result)
      return result
    } catch (err) {
      error.value = err?.code === 1 ? '允许定位后显示天气' : '天气暂时无法获取'
      return cached
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load }
}
