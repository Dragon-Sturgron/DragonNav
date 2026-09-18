<script setup>
import { computed } from 'vue'

const props = defineProps({
  profile: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  refreshing: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const emit = defineEmits(['close'])

function countryName(location) {
  if (location?.countryCode) {
    try { return new Intl.DisplayNames(['zh-CN'], { type: 'region' }).of(location.countryCode) || location.country } catch {}
  }
  return location?.country || null
}

const locationText = computed(() => {
  const p = props.profile?.location || {}
  return [countryName(p), p.region, p.city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ') || '未知位置'
})

const trustScore = computed(() => {
  const value = props.profile?.risk?.trustScore ?? props.profile?.risk?.score
  return Number.isFinite(value) ? Math.round(value) : null
})
const riskScore = computed(() => Number.isFinite(props.profile?.risk?.riskScore) ? Math.round(props.profile.risk.riskScore) : null)

const trustLabel = computed(() => {
  if (trustScore.value === null) return '暂无评分'
  if (trustScore.value >= 75) return '高信誉'
  if (trustScore.value >= 45) return '中等信誉'
  return '低信誉'
})

const riskLabel = computed(() => {
  if (riskScore.value === null) return '暂无评分'
  if (riskScore.value <= 25) return '低风险'
  if (riskScore.value <= 55) return '中等风险'
  return '高风险'
})

const baseRows = computed(() => {
  const p = props.profile || {}
  const l = p.location || {}
  const i = p.identity || {}
  return [
    ['IP 地址', p.ip],
    ['IP 位置', locationText.value],
    ['ASN', i.asn ? `AS${i.asn}` : null],
    ['ASN 所有者', i.asnOwner],
    ['企业 / 组织', i.company],
    ['经度', l.longitude],
    ['纬度', l.latitude],
    ['IP 类型', p.risk?.ipType],
    ['IP 信誉分', trustScore.value === null ? null : `${trustScore.value} / 100 · ${trustLabel.value}`],
    ['风险值', riskScore.value === null ? null : `${riskScore.value} / 100 · ${riskLabel.value}`],
    ['IP 地址（数字）', p.numeric],
    ['原生 / 广播', p.unsupported?.nativeIp],
    ['共享人数', p.unsupported?.sharedUsers]
  ]
})

const networkRows = computed(() => {
  const p = props.profile || {}
  const i = p.identity || {}
  const f = p.risk?.flags || {}
  return [
    ['注册国家 / 地区', countryName(p.location)],
    ['数据中心', flagText(f.datacenter)],
    ['住宅网络', flagText(f.residential)],
    ['移动网络', flagText(f.mobile)],
    ['服务商', i.isp],
    ['公司域名', i.companyDomain],
    ['主机名 / PTR', i.hostname],
    ['CIDR', i.cidr],
    ['RIR', i.registry],
    ['ASN / 公司类型', i.companyType],
    ['ASN 注册日期', formatDate(i.registeredAt)],
    ['资料最后更新', formatDate(i.updatedAt)]
  ]
})

const technicalRows = computed(() => {
  const p = props.profile || {}
  const i = p.identity || {}
  return [
    ['地址类型', p.ipVersion],
    ['IP 范围', i.range],
    ['地址数量', formatNumber(i.addressCount)],
    ['RDAP 网络名称', i.rdapName],
    ['RDAP Handle', i.rdapHandle],
    ['时区', p.location?.timezone],
    ['经纬度', Number.isFinite(p.location?.latitude) && Number.isFinite(p.location?.longitude) ? `${p.location.latitude}, ${p.location.longitude}` : null]
  ]
})

const riskRows = computed(() => {
  const r = props.profile?.risk || {}
  const f = r.flags || {}
  return [
    ['VPN', flagText(f.vpn)],
    ['代理', flagText(f.proxy)],
    ['Tor', flagText(f.tor)],
    ['爬虫标记', flagText(f.crawler)],
    ['滥用标记', flagText(f.abuser)],
    ['Bogon', flagText(f.bogon)],
    ['上游滥用评分', r.abuserScore],
    ['访问评估', r.assessment]
  ]
})

function flagText(value) {
  if (value === true) return '是'
  if (value === false) return '否'
  return '未检测到'
}

function formatNumber(value) {
  if (!value) return null
  try { return BigInt(value).toLocaleString('en-US') } catch { return String(value) }
}

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('zh-CN')
}

async function copyIp() {
  const ip = props.profile?.ip
  if (!ip) return
  try { await navigator.clipboard.writeText(ip) } catch {}
}
</script>

<template>
  <div class="modal-backdrop ip-modal-backdrop" @click.self="emit('close')">
    <section class="ip-modal" role="dialog" aria-modal="true" aria-label="当前 IP 详情">
      <header class="ip-modal-head">
        <div class="ip-modal-title-wrap">
          <div class="ip-modal-flag">{{ profile?.flag || '🌐' }}</div>
          <div>
            <div class="eyebrow">CURRENT NETWORK</div>
            <div class="ip-modal-title-row">
              <h3>{{ profile?.ip || (loading ? '正在获取当前 IP…' : '当前 IP') }}</h3>
              <button v-if="profile?.ip" class="copy-btn" type="button" title="复制 IP" @click="copyIp">复制</button>
            </div>
            <p>{{ locationText }}<span v-if="profile?.identity?.isp"> · {{ profile.identity.isp }}</span></p>
          </div>
        </div>
        <div class="ip-modal-actions">
          <span class="auto-detect-badge" :data-active="refreshing ? 'true' : 'false'">
            <i></i>{{ refreshing ? '正在自动检测' : '自动检测 · 每 30 秒' }}
          </span>
          <button class="round-btn" type="button" @click="emit('close')">×</button>
        </div>
      </header>

      <div v-if="error && !profile" class="ip-error">{{ error }}</div>

      <template v-if="profile">
        <section class="ip-score-card ip-score-card--dual">
          <div class="ip-score-panel">
            <div class="ip-score-main">
              <div class="ip-score-caption">IP 信誉分</div>
              <strong>{{ trustScore === null ? '—' : trustScore }}</strong>
              <span>{{ trustLabel }}</span>
            </div>
            <div class="ip-score-body">
              <div class="ip-score-track ip-score-track--trust"><i :style="{ left: `${trustScore ?? 0}%` }"></i></div>
              <div class="ip-score-scale"><span>0 低信誉</span><span>25</span><span>50</span><span>75</span><span>100 高信誉</span></div>
            </div>
          </div>

          <div class="ip-score-panel">
            <div class="ip-score-main ip-score-main--risk">
              <div class="ip-score-caption">风险值</div>
              <strong>{{ riskScore === null ? '—' : riskScore }}</strong>
              <span>{{ riskLabel }}</span>
            </div>
            <div class="ip-score-body">
              <div class="ip-score-track ip-score-track--risk"><i :style="{ left: `${riskScore ?? 0}%` }"></i></div>
              <div class="ip-score-scale"><span>0 低风险</span><span>25</span><span>50</span><span>75</span><span>100 高风险</span></div>
            </div>
          </div>

          <div class="ip-summary-chips ip-summary-chips--full">
            <span>{{ profile.risk?.ipType || '未分类' }}</span>
            <span v-if="profile.identity?.cidr">{{ profile.identity.cidr }}</span>
            <span v-if="profile.identity?.registry">{{ profile.identity.registry }}</span>
            <span>数据源 {{ Object.values(profile.sources || {}).filter(Boolean).length }} 项</span>
            <span>信誉越高越好 · 风险越低越好</span>
          </div>
        </section>

        <div class="ip-detail-grid">
          <section class="ip-detail-card ip-detail-card--wide">
            <h4>基础信息</h4>
            <div class="ip-row-grid">
              <div v-for="row in baseRows" :key="row[0]" class="ip-data-row">
                <span>{{ row[0] }}</span><strong>{{ row[1] ?? '暂无数据' }}</strong>
              </div>
            </div>
          </section>

          <section class="ip-detail-card">
            <h4>网络属性 / ASN</h4>
            <div class="ip-data-list">
              <div v-for="row in networkRows" :key="row[0]" class="ip-data-row">
                <span>{{ row[0] }}</span><strong>{{ row[1] ?? '暂无数据' }}</strong>
              </div>
            </div>
          </section>

          <section class="ip-detail-card">
            <h4>技术指标</h4>
            <div class="ip-data-list">
              <div v-for="row in technicalRows" :key="row[0]" class="ip-data-row">
                <span>{{ row[0] }}</span><strong>{{ row[1] ?? '暂无数据' }}</strong>
              </div>
            </div>
          </section>

          <section class="ip-detail-card ip-detail-card--wide">
            <h4>风险深度检测</h4>
            <div class="risk-flags">
              <div v-for="row in riskRows" :key="row[0]" class="risk-flag">
                <span>{{ row[0] }}</span>
                <strong :data-tone="row[1] === '是' ? 'bad' : row[1] === '否' ? 'good' : 'neutral'">{{ row[1] ?? '暂无数据' }}</strong>
              </div>
            </div>
          </section>
        </div>

        <footer class="ip-modal-foot">
          <span>数据综合：EdgeOne 客户端网络信息、Net.Coffee、ipapi.is、RDAP、PTR</span>
          <span>自动刷新：30 秒 · 最近检测：{{ new Date(profile.checkedAt).toLocaleString('zh-CN') }}</span>
        </footer>
      </template>
    </section>
  </div>
</template>
