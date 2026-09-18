const ADMIN_HTML = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>DragonNav 后台管理</title>
<style>
:root{--bg:#f5f7fb;--panel:#fff;--text:#171923;--muted:#737b8c;--line:#e8ebf1;--primary:#111827;--danger:#d92d20;--blue:#175cd3;--green:#067647;--amber:#b54708;--shadow:0 16px 45px rgba(30,40,60,.08)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 8% 0,rgba(59,130,246,.1),transparent 28rem),var(--bg);color:var(--text);font-family:Inter,"PingFang SC","Microsoft YaHei",system-ui,-apple-system,sans-serif}button,input,select,textarea{font:inherit}button{cursor:pointer}.hidden{display:none!important}.wrap{width:min(1180px,calc(100% - 28px));margin:28px auto 60px}.login{width:min(430px,calc(100% - 24px));margin:10vh auto;background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:22px;box-shadow:var(--shadow)}.login h1{margin:0 0 6px;font-size:26px}.sub{color:var(--muted);font-size:12px;line-height:1.65}.top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}.top h1{margin:0;font-size:28px;letter-spacing:-.03em}.actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.card{background:var(--panel);border:1px solid var(--line);border-radius:19px;padding:18px;box-shadow:0 8px 26px rgba(25,35,55,.04);margin-bottom:16px}.sectionHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.sectionHead h2{margin:0;font-size:17px}.row{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}.field{grid-column:span 6}.field.full{grid-column:1/-1}.field label{display:block;margin-bottom:6px;color:var(--muted);font-size:11px;font-weight:700}.field input,.field select,.field textarea{width:100%;border:1px solid #dde1e8;border-radius:11px;background:#fff;color:var(--text);padding:10px 11px;outline:0}.field textarea{min-height:80px;resize:vertical}.field input:focus,.field select:focus,.field textarea:focus{border-color:#98a2b3;box-shadow:0 0 0 3px rgba(23,92,211,.07)}.btn{border:0;border-radius:11px;padding:9px 13px;font-weight:780}.btn.primary{background:var(--primary);color:#fff}.btn.light{background:#f0f2f5;color:#20242e}.btn.danger{background:#fff0ee;color:var(--danger)}.btn.small{padding:7px 9px;font-size:11px}.notice{display:none;border-radius:11px;padding:10px 12px;margin-bottom:13px;font-size:12px}.notice.ok{display:block;background:#ecfdf3;color:var(--green)}.notice.err{display:block;background:#fff1f0;color:#b42318}.saveState{display:inline-flex;align-items:center;gap:6px;border:1px solid #d1fadf;background:#ecfdf3;color:var(--green);border-radius:999px;padding:8px 10px;font-size:11px;font-weight:750}.saveState[data-state="saving"]{border-color:#fedf89;background:#fffaeb;color:var(--amber)}.saveState[data-state="error"]{border-color:#fecdca;background:#fff1f0;color:#b42318}.saveState:before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor}.tableWrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:10px 8px;border-bottom:1px solid #eef0f4;vertical-align:middle}th{color:var(--muted);font-size:11px}.dragRow{transition:opacity .12s,background .12s}.dragRow.dragging{opacity:.4;background:#f4f5f7}.dragHandle{display:inline-grid;place-items:center;width:30px;height:30px;border:1px solid #e1e4e9;border-radius:9px;background:#f8f9fb;color:#667085;cursor:grab;user-select:none}.catLink{border:0;background:transparent;color:var(--blue);font-weight:850;padding:0}.catLink:hover{text-decoration:underline}.muted{color:var(--muted);font-size:11px}.badge{display:inline-block;border-radius:999px;background:#f0f2f5;color:#525866;padding:3px 8px;font-size:10px}.switch{display:flex;align-items:center;gap:6px}.switch input{width:16px;height:16px}.crumb{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:12px;margin-bottom:10px}.crumb button{border:0;background:transparent;color:var(--blue);padding:0}.empty{padding:38px 16px;border:1px dashed #d7dbe3;border-radius:14px;text-align:center;color:var(--muted);font-size:12px}.modalBack{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.45);backdrop-filter:blur(5px);padding:18px}.modal{width:min(620px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:20px;box-shadow:0 30px 90px rgba(15,23,42,.25)}.modal h3{margin:0 0 17px}.modalFoot{display:flex;justify-content:flex-end;gap:8px;margin-top:18px;padding-top:14px;border-top:1px solid #eef0f4}.colorLine{display:flex;align-items:center;gap:9px}.colorLine input[type=color]{width:52px;height:39px;padding:3px}.code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;color:var(--muted)}.policyBox{grid-column:1/-1;border:1px solid #e6e9ef;border-radius:14px;background:#f8fafc;padding:13px}.policyBoxTitle{font-size:12px;font-weight:850;margin-bottom:4px}.policyBoxHint{color:var(--muted);font-size:10px;line-height:1.6;margin-bottom:11px}.policyBadge{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:4px 7px;background:#f0f2f5;color:#667085;font-size:9px}.policyBadge.on{background:#fff4e5;color:#b54708}.policyBadge:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
@media(max-width:720px){.wrap{width:calc(100% - 20px);margin-top:16px}.top{align-items:flex-start;flex-direction:column}.field{grid-column:1/-1}.card{padding:14px}th,td{white-space:nowrap}}
</style>
</head>
<body>
<div id="loginView" class="login">
  <h1>DragonNav 后台</h1>
  <div class="sub" style="margin-bottom:17px">后台地址由 ADMIN_PATH 控制，登录凭据由 EdgeOne 环境变量控制。</div>
  <div id="loginNotice" class="notice"></div>
  <div class="field full"><label>管理员账号</label><input id="username" autocomplete="username"></div>
  <div class="field full" style="margin-top:12px"><label>管理员密码</label><input id="password" type="password" autocomplete="current-password"></div>
  <button id="loginBtn" class="btn primary" style="width:100%;margin-top:15px">登录</button>
</div>

<div id="appView" class="wrap hidden">
  <div class="top">
    <div><h1 id="pageTitle">导航后台管理</h1><div id="pageSub" class="sub">配置会自动保存到 NAV_KV。</div></div>
    <div class="actions"><span id="saveState" class="saveState" data-state="saved">已同步到 KV</span><a href="/" target="_blank"><button class="btn light">打开前台</button></a><button id="logoutBtn" class="btn light">退出</button></div>
  </div>
  <div id="notice" class="notice"></div>

  <div id="homePage">
    <section class="card">
      <div class="sectionHead"><h2>首页设置</h2><span class="badge">0 = 全部显示</span></div>
      <div class="row">
        <div class="field"><label>网站标题</label><input id="title"></div>
        <div class="field"><label>首页最多显示网站数</label><input id="maxSites" type="number" min="0" step="1"></div>
        <div class="field full"><label>副标题</label><input id="subtitle"></div>
        <div class="field"><label>搜索按钮默认色</label><div class="colorLine"><input id="engineUnselectedColor" type="color"><span id="engineUnselectedColorText" class="code"></span></div></div>
        <div class="field"><label>搜索按钮悬停色</label><div class="colorLine"><input id="engineHoverColor" type="color"><span id="engineHoverColorText" class="code"></span></div></div>
        <div class="field"><label>搜索按钮选中色</label><div class="colorLine"><input id="engineSelectedColor" type="color"><span id="engineSelectedColorText" class="code"></span></div></div>
      </div>
    </section>

    <section class="card">
      <div class="sectionHead"><div><h2>分类管理</h2><div class="muted">拖拽左侧手柄调整顺序；点击分类名称管理网站。</div></div><button id="addCategoryBtn" class="btn light small">+ 新增分类</button></div>
      <div class="tableWrap"><table><thead><tr><th>拖拽</th><th>分类名称</th><th>网站数</th><th>启用</th><th>操作</th></tr></thead><tbody id="categoryBody"></tbody></table></div>
    </section>

    <section class="card">
      <div class="sectionHead"><div><h2>搜索引擎管理</h2><div class="muted">支持图标、启停和拖拽排序。</div></div><button id="addEngineBtn" class="btn light small">+ 新增搜索引擎</button></div>
      <div class="tableWrap"><table><thead><tr><th>拖拽</th><th>名称</th><th>搜索地址</th><th>启用</th><th>操作</th></tr></thead><tbody id="engineBody"></tbody></table></div>
    </section>
  </div>

  <div id="sitePage" class="hidden">
    <div class="crumb"><button id="backBtn">← 分类管理</button><span>/</span><span id="crumbName"></span></div>
    <section class="card">
      <div class="sectionHead"><div><h2 id="siteTitle">网站管理</h2><div class="muted">拖拽调整当前分类的网站显示顺序。</div></div><div><span id="siteCount" class="badge"></span> <button id="addSiteBtn" class="btn primary small">+ 新增网站</button></div></div>
      <div id="siteTable" class="tableWrap"><table><thead><tr><th>拖拽</th><th>网站</th><th>地址</th><th>访问策略</th><th>启用</th><th>操作</th></tr></thead><tbody id="siteBody"></tbody></table></div>
      <div id="siteEmpty" class="empty hidden">这个分类还没有网站。</div>
    </section>
  </div>
</div>

<div id="categoryModal" class="modalBack"><div class="modal"><h3 id="categoryModalTitle">编辑分类</h3><div class="field full"><label>分类名称</label><input id="categoryName" maxlength="80"></div><div class="modalFoot"><button data-close="categoryModal" class="btn light">取消</button><button id="saveCategoryBtn" class="btn primary">保存</button></div></div></div>
<div id="engineModal" class="modalBack"><div class="modal"><h3 id="engineModalTitle">编辑搜索引擎</h3><div class="row"><div class="field full"><label>名称</label><input id="engineName"></div><div class="field full"><label>搜索地址（使用 {q} 作为关键词）</label><input id="engineUrl" placeholder="https://www.google.com/search?q={q}"></div><div class="field full"><label>图标 URL（可留空）</label><input id="engineIcon"></div><div class="field"><label>状态</label><select id="engineEnabled"><option value="true">启用</option><option value="false">停用</option></select></div></div><div class="modalFoot"><button data-close="engineModal" class="btn light">取消</button><button id="saveEngineBtn" class="btn primary">保存</button></div></div></div>
<div id="siteModal" class="modalBack"><div class="modal"><h3 id="siteModalTitle">编辑网站</h3><div class="row">
<div class="field"><label>网站名称</label><input id="siteName"></div><div class="field"><label>分类</label><select id="siteCategory"></select></div>
<div class="field full"><label>网站地址</label><input id="siteUrl" placeholder="https://example.com/"></div>
<div class="field full"><label>图标 URL（可留空）</label><input id="siteIcon"></div>
<div class="field full"><label>说明</label><input id="siteDesc"></div>
<div class="field"><label>状态</label><select id="siteEnabled"><option value="true">启用</option><option value="false">停用</option></select></div>
<div class="policyBox"><div class="policyBoxTitle">IP 风险访问控制</div><div class="policyBoxHint">启用后，DragonNav 会根据当前访问 IP 的信誉分和风险值决定此卡片能否打开。信誉分越高越好，风险值越低越好。该规则只限制通过 DragonNav 打开链接，无法阻止用户在浏览器中直接输入外部网站地址。</div><div class="row">
<div class="field"><label>访问控制</label><select id="siteRiskGateEnabled"><option value="false">关闭</option><option value="true">启用</option></select></div>
<div class="field"><label>评分未知时</label><select id="siteBlockUnknown"><option value="false">允许访问</option><option value="true">拒绝访问</option></select></div>
<div class="field"><label>最低 IP 信誉分（0-100）</label><input id="siteMinTrustScore" type="number" min="0" max="100" step="1" value="0"></div>
<div class="field"><label>最高风险值（0-100）</label><input id="siteMaxRiskScore" type="number" min="0" max="100" step="1" value="100"></div>
</div></div>
</div><div class="modalFoot"><button data-close="siteModal" class="btn light">取消</button><button id="saveSiteBtn" class="btn primary">保存</button></div></div></div>

<script>
var token=sessionStorage.getItem('nav-admin-token')||'';
var config=null,selectedCategory='',editingCategory='',editingEngine='',editingSite='',saveTimer=0,saving=false,dirty=false;
var $=function(id){return document.getElementById(id)};
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
function uid(prefix){return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
function showMsg(text,ok,id){var el=$(id||'notice');el.textContent=text;el.className='notice '+(ok?'ok':'err');setTimeout(function(){el.className='notice'},3200)}
function authHeaders(){return {'Authorization':'Bearer '+token,'Content-Type':'application/json'}}
function saveState(state,text){var el=$('saveState');el.dataset.state=state;el.textContent=text}
function markDirty(delay){dirty=true;saveState('saving','等待自动同步…');clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,delay==null?450:delay)}
async function flushSave(){if(!dirty||saving)return;saving=true;syncSettings();saveState('saving','正在同步到 KV…');try{var r=await fetch('/api/config',{method:'POST',headers:authHeaders(),body:JSON.stringify({config:config})});var d=await r.json();if(!r.ok)throw new Error(d.error||'保存失败');config=d.config;dirty=false;saveState('saved','已同步到 KV')}catch(e){saveState('error','同步失败，将重试');showMsg(e.message||'保存失败',false);setTimeout(flushSave,3000)}finally{saving=false;if(dirty)clearTimeout(saveTimer),saveTimer=setTimeout(flushSave,500)}}
async function login(){try{var r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('username').value.trim(),password:$('password').value})});var d=await r.json();if(!r.ok)throw new Error(d.error||'登录失败');token=d.token;sessionStorage.setItem('nav-admin-token',token);await boot()}catch(e){showMsg(e.message||'登录失败',false,'loginNotice')}}
async function boot(){if(!token)return;try{var r=await fetch('/api/config?admin=1',{headers:authHeaders(),cache:'no-store'});var d=await r.json();if(!r.ok)throw new Error(d.error||'登录状态失效');config=d.config;$('loginView').classList.add('hidden');$('appView').classList.remove('hidden');hydrateSettings();renderHome()}catch(e){token='';sessionStorage.removeItem('nav-admin-token');$('appView').classList.add('hidden');$('loginView').classList.remove('hidden');showMsg(e.message||'登录状态失效',false,'loginNotice')}}
function hydrateSettings(){var s=config.settings||{};$('title').value=s.title||'';$('subtitle').value=s.subtitle||'';$('maxSites').value=Number(s.maxSites||0);['engineUnselectedColor','engineHoverColor','engineSelectedColor'].forEach(function(id){var fallback=id==='engineUnselectedColor'?'#ffffff':id==='engineHoverColor'?'#f1f2f4':'#52525b';$(id).value=s[id]||fallback;$(id+'Text').textContent=$(id).value})}
function syncSettings(){config.settings=config.settings||{};config.settings.title=$('title').value.trim()||'龙鲟导航';config.settings.subtitle=$('subtitle').value.trim();config.settings.maxSites=Math.max(0,Number($('maxSites').value||0)|0);config.settings.engineUnselectedColor=$('engineUnselectedColor').value;config.settings.engineHoverColor=$('engineHoverColor').value;config.settings.engineSelectedColor=$('engineSelectedColor').value}
function renderHome(){selectedCategory='';$('sitePage').classList.add('hidden');$('homePage').classList.remove('hidden');$('pageTitle').textContent='导航后台管理';$('pageSub').textContent='分类、网站和搜索引擎配置会自动同步到 NAV_KV。';hydrateSettings();renderCategories();renderEngines()}
function renderCategories(){var body=$('categoryBody');body.innerHTML='';(config.categories||[]).forEach(function(c){var count=(config.sites||[]).filter(function(s){return s.categoryId===c.id}).length;var tr=document.createElement('tr');tr.className='dragRow';tr.draggable=true;tr.dataset.id=c.id;tr.innerHTML='<td><span class="dragHandle">☰</span></td><td><button class="catLink" data-open="'+esc(c.id)+'">'+esc(c.name)+'</button></td><td><span class="badge">'+count+'</span></td><td><label class="switch"><input type="checkbox" data-enable="'+esc(c.id)+'" '+(c.enabled!==false?'checked':'')+'>启用</label></td><td><div class="actions"><button class="btn light small" data-edit="'+esc(c.id)+'">编辑</button><button class="btn danger small" data-del="'+esc(c.id)+'">删除</button></div></td>';body.appendChild(tr)});body.querySelectorAll('[data-open]').forEach(function(b){b.onclick=function(){openSites(b.dataset.open)}});body.querySelectorAll('[data-edit]').forEach(function(b){b.onclick=function(){openCategoryModal(b.dataset.edit)}});body.querySelectorAll('[data-del]').forEach(function(b){b.onclick=function(){deleteCategory(b.dataset.del)}});body.querySelectorAll('[data-enable]').forEach(function(x){x.onchange=function(){var c=config.categories.find(function(v){return v.id===x.dataset.enable});if(c){c.enabled=x.checked;markDirty()}}});sortable(body,function(ids){config.categories=ids.map(function(id){return config.categories.find(function(c){return c.id===id})}).filter(Boolean);markDirty()})}
function renderEngines(){var body=$('engineBody');body.innerHTML='';(config.searchEngines||[]).forEach(function(e){var tr=document.createElement('tr');tr.className='dragRow';tr.draggable=true;tr.dataset.id=e.id;tr.innerHTML='<td><span class="dragHandle">☰</span></td><td><b>'+esc(e.name)+'</b></td><td><span class="code">'+esc(e.url)+'</span></td><td><label class="switch"><input type="checkbox" data-enable="'+esc(e.id)+'" '+(e.enabled!==false?'checked':'')+'>启用</label></td><td><div class="actions"><button class="btn light small" data-edit="'+esc(e.id)+'">编辑</button><button class="btn danger small" data-del="'+esc(e.id)+'">删除</button></div></td>';body.appendChild(tr)});body.querySelectorAll('[data-edit]').forEach(function(b){b.onclick=function(){openEngineModal(b.dataset.edit)}});body.querySelectorAll('[data-del]').forEach(function(b){b.onclick=function(){if((config.searchEngines||[]).length<=1)return alert('至少保留一个搜索引擎。');if(confirm('确定删除这个搜索引擎？')){config.searchEngines=config.searchEngines.filter(function(e){return e.id!==b.dataset.del});renderEngines();markDirty()}}});body.querySelectorAll('[data-enable]').forEach(function(x){x.onchange=function(){var e=config.searchEngines.find(function(v){return v.id===x.dataset.enable});if(!e)return;if(!x.checked&&config.searchEngines.filter(function(v){return v.enabled!==false}).length<=1){x.checked=true;return alert('至少保留一个启用的搜索引擎。')}e.enabled=x.checked;markDirty()}});sortable(body,function(ids){config.searchEngines=ids.map(function(id){return config.searchEngines.find(function(e){return e.id===id})}).filter(Boolean);markDirty()})}
function openSites(id){selectedCategory=id;var cat=config.categories.find(function(c){return c.id===id});if(!cat)return;$('homePage').classList.add('hidden');$('sitePage').classList.remove('hidden');$('pageTitle').textContent=cat.name+' · 网站管理';$('pageSub').textContent='当前分类中的网站顺序可拖拽调整。';$('crumbName').textContent=cat.name;$('siteTitle').textContent=cat.name+' · 网站管理';renderSites()}
function renderSites(){var body=$('siteBody');var list=(config.sites||[]).filter(function(s){return s.categoryId===selectedCategory});body.innerHTML='';list.forEach(function(s){var tr=document.createElement('tr'),p=s.accessPolicy||{};tr.className='dragRow';tr.draggable=true;tr.dataset.id=s.id;var policy=p.enabled===true?'<span class="policyBadge on">信誉 ≥ '+Math.round(Number(p.minTrustScore||0))+' / 风险 ≤ '+Math.round(Number(p.maxRiskScore??100))+'</span>':'<span class="policyBadge">未启用</span>';tr.innerHTML='<td><span class="dragHandle">☰</span></td><td><b>'+esc(s.name)+'</b><div class="muted">'+esc(s.desc||'')+'</div></td><td><span class="code">'+esc(s.url)+'</span></td><td>'+policy+'</td><td><label class="switch"><input type="checkbox" data-enable="'+esc(s.id)+'" '+(s.enabled!==false?'checked':'')+'>启用</label></td><td><div class="actions"><button class="btn light small" data-edit="'+esc(s.id)+'">编辑</button><button class="btn danger small" data-del="'+esc(s.id)+'">删除</button></div></td>';body.appendChild(tr)});$('siteCount').textContent='共 '+list.length+' 个';$('siteEmpty').classList.toggle('hidden',list.length>0);$('siteTable').classList.toggle('hidden',list.length===0);body.querySelectorAll('[data-edit]').forEach(function(b){b.onclick=function(){openSiteModal(b.dataset.edit)}});body.querySelectorAll('[data-del]').forEach(function(b){b.onclick=function(){if(confirm('确定删除这个网站？')){config.sites=config.sites.filter(function(s){return s.id!==b.dataset.del});renderSites();markDirty()}}});body.querySelectorAll('[data-enable]').forEach(function(x){x.onchange=function(){var s=config.sites.find(function(v){return v.id===x.dataset.enable});if(s){s.enabled=x.checked;markDirty()}}});sortable(body,function(ids){var byId=new Map(config.sites.filter(function(s){return s.categoryId===selectedCategory}).map(function(s){return [s.id,s]}));var ordered=ids.map(function(id){return byId.get(id)}).filter(Boolean),i=0;config.sites=config.sites.map(function(s){return s.categoryId===selectedCategory?ordered[i++]:s});markDirty()})}
function sortable(container,onChange){var dragged=null,moved=false;container.querySelectorAll('.dragRow').forEach(function(row){row.addEventListener('dragstart',function(e){dragged=row;moved=false;row.classList.add('dragging');if(e.dataTransfer)e.dataTransfer.effectAllowed='move'});row.addEventListener('dragover',function(e){e.preventDefault();if(!dragged||dragged===row)return;var rect=row.getBoundingClientRect();container.insertBefore(dragged,e.clientY>rect.top+rect.height/2?row.nextSibling:row);moved=true});row.addEventListener('dragend',function(){if(dragged)dragged.classList.remove('dragging');dragged=null;if(moved){onChange(Array.from(container.querySelectorAll('tr[data-id]')).map(function(r){return r.dataset.id}))}})})}
function modal(id,show){$(id).style.display=show?'flex':'none'}
function openCategoryModal(id){editingCategory=id||'';var c=id?config.categories.find(function(v){return v.id===id}):null;$('categoryModalTitle').textContent=c?'编辑分类':'新增分类';$('categoryName').value=c?c.name:'';modal('categoryModal',true);setTimeout(function(){$('categoryName').focus()},20)}
function saveCategory(){var name=$('categoryName').value.trim();if(!name)return;if(editingCategory){var c=config.categories.find(function(v){return v.id===editingCategory});if(c)c.name=name}else config.categories.push({id:uid('cat'),name:name,enabled:true});modal('categoryModal',false);renderCategories();markDirty()}
function deleteCategory(id){if(config.sites.some(function(s){return s.categoryId===id}))return alert('该分类下还有网站，请先移动或删除网站。');if(confirm('确定删除这个分类？')){config.categories=config.categories.filter(function(c){return c.id!==id});renderCategories();markDirty()}}
function openEngineModal(id){editingEngine=id||'';var e=id?config.searchEngines.find(function(v){return v.id===id}):null;$('engineModalTitle').textContent=e?'编辑搜索引擎':'新增搜索引擎';$('engineName').value=e?e.name:'';$('engineUrl').value=e?e.url:'';$('engineIcon').value=e?e.icon||'':'';$('engineEnabled').value=String(e?e.enabled!==false:true);modal('engineModal',true)}
function saveEngine(){var name=$('engineName').value.trim(),url=$('engineUrl').value.trim();if(!name||!url)return alert('名称和搜索地址不能为空。');try{var u=new URL(url.split('{q}').join('test'));if(['http:','https:'].indexOf(u.protocol)<0)throw 0}catch(e){return alert('搜索地址必须是有效的 http/https 地址。')}var data={name:name,url:url,icon:$('engineIcon').value.trim(),enabled:$('engineEnabled').value==='true'};if(editingEngine){Object.assign(config.searchEngines.find(function(v){return v.id===editingEngine}),data)}else config.searchEngines.push(Object.assign({id:uid('engine')},data));modal('engineModal',false);renderEngines();markDirty()}
function fillCategories(){var html=(config.categories||[]).map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>'}).join('');$('siteCategory').innerHTML=html}
function openSiteModal(id){editingSite=id||'';fillCategories();var s=id?config.sites.find(function(v){return v.id===id}):null,p=s&&s.accessPolicy||{};$('siteModalTitle').textContent=s?'编辑网站':'新增网站';$('siteName').value=s?s.name:'';$('siteUrl').value=s?s.url:'';$('siteIcon').value=s?s.icon||'':'';$('siteDesc').value=s?s.desc||'':'';$('siteCategory').value=s?s.categoryId:selectedCategory;$('siteEnabled').value=String(s?s.enabled!==false:true);$('siteRiskGateEnabled').value=String(p.enabled===true);$('siteMinTrustScore').value=Number.isFinite(Number(p.minTrustScore))?Math.max(0,Math.min(100,Number(p.minTrustScore))):0;$('siteMaxRiskScore').value=Number.isFinite(Number(p.maxRiskScore))?Math.max(0,Math.min(100,Number(p.maxRiskScore))):100;$('siteBlockUnknown').value=String(p.blockUnknown===true);modal('siteModal',true)}
function saveSite(){var name=$('siteName').value.trim(),url=$('siteUrl').value.trim(),categoryId=$('siteCategory').value;if(!name||!url||!categoryId)return alert('名称、地址和分类不能为空。');try{var u=new URL(url);if(['http:','https:'].indexOf(u.protocol)<0)throw 0}catch(e){return alert('请输入有效的 http/https 网站地址。')}var minTrust=Math.max(0,Math.min(100,Number($('siteMinTrustScore').value||0))),maxRisk=Math.max(0,Math.min(100,Number($('siteMaxRiskScore').value||100)));var data={name:name,url:url,icon:$('siteIcon').value.trim(),desc:$('siteDesc').value.trim(),categoryId:categoryId,enabled:$('siteEnabled').value==='true',accessPolicy:{enabled:$('siteRiskGateEnabled').value==='true',minTrustScore:minTrust,maxRiskScore:maxRisk,blockUnknown:$('siteBlockUnknown').value==='true'}};if(editingSite){var old=config.sites.find(function(v){return v.id===editingSite});var moved=old&&old.categoryId!==categoryId;if(old)Object.assign(old,data);if(moved){config.sites=config.sites.filter(function(v){return v.id!==editingSite});config.sites.push(old)}}else config.sites.push(Object.assign({id:uid('site')},data));modal('siteModal',false);renderSites();markDirty()}
$('loginBtn').onclick=login;$('password').addEventListener('keydown',function(e){if(e.key==='Enter')login()});$('logoutBtn').onclick=function(){sessionStorage.removeItem('nav-admin-token');location.reload()};$('backBtn').onclick=renderHome;$('addCategoryBtn').onclick=function(){openCategoryModal('')};$('saveCategoryBtn').onclick=saveCategory;$('addEngineBtn').onclick=function(){openEngineModal('')};$('saveEngineBtn').onclick=saveEngine;$('addSiteBtn').onclick=function(){openSiteModal('')};$('saveSiteBtn').onclick=saveSite;document.querySelectorAll('[data-close]').forEach(function(b){b.onclick=function(){modal(b.dataset.close,false)}});document.querySelectorAll('.modalBack').forEach(function(m){m.onclick=function(e){if(e.target===m)modal(m.id,false)}});['title','subtitle','maxSites'].forEach(function(id){$(id).addEventListener('input',function(){markDirty(700)})});['engineUnselectedColor','engineHoverColor','engineSelectedColor'].forEach(function(id){$(id).addEventListener('input',function(){$(id+'Text').textContent=$(id).value;markDirty(250)})});window.addEventListener('beforeunload',function(e){if(dirty){e.preventDefault();e.returnValue=''}});boot();
</script>
</body>
</html>`;

function normalizeAdminPath(value) {
  let path = String(value || "").trim();
  try { path = decodeURIComponent(path); } catch {}
  path = path.replace(/^\/+|\/+$/g, "");
  return path;
}

function notFound() {
  return new Response("404: NOT_FOUND", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

export default async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET" && request.method !== "HEAD") return notFound();

  const configuredPath = normalizeAdminPath(env?.ADMIN_PATH);
  const requestPath = normalizeAdminPath(new URL(request.url).pathname);

  if (!configuredPath || !/^[A-Za-z0-9_-]{1,80}$/.test(configuredPath)) return notFound();
  if (requestPath !== configuredPath) return notFound();

  return new Response(request.method === "HEAD" ? null : ADMIN_HTML, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      "x-robots-tag": "noindex, nofollow, noarchive"
    }
  });
}
