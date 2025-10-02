// === Lee config global (no tocar nombres) ===
const C = window.CARTELERA_CONFIG || window.MONITOR_CONFIG || {
  icsUrl: (location.origin + '/calendarios/calendario.ics'),
  timeZone:'America/Puerto_Rico',
  slideMs: 12000,
  pollMs:  5*60*1000,
  qrSize:  240,
  intro: { bannerUrl:'', text:'📖 Dios les bendiga — Calendario de la semana' },
  outro: { bannerUrl:'', text:'' },
  theme: { bg:'#0b1421', card:'#0f1b2c', text:'#e6eefc', muted:'#93a4bf', accent:'#16a34a', warn:'#ef4444',
           h1:42, h2:28, bigClock:64, fontSize:22 },
  rest: { enabled:false, start:'23:00', end:'06:00' },
  weekRolloverDay: 0,       // domingo
  weekRolloverHour: 0,      // 00:00
  templeKeywords: ['templo','iglesia','auditorio','santuario'],
  fieldsFromDescription: {
    preacher: /(predicador|predica)\s*:\s*(.+)/i,
    manager:  /(encargad[oa])\s*:\s*(.+)/i
  },
  defaultsByWeekday: { /* 0..6 si quieres defaults cuando no hay ICS */ }
};

// === Aplica tema desde config ===
(function applyTheme(){
  const r = document.documentElement;
  r.style.setProperty('--bg', C.theme.bg);
  r.style.setProperty('--card', C.theme.card);
  r.style.setProperty('--text', C.theme.text);
  r.style.setProperty('--muted', C.theme.muted);
  r.style.setProperty('--accent', C.theme.accent);
  r.style.setProperty('--warn', C.theme.warn);
  r.style.setProperty('--fs', (C.theme.fontSize||22)+'px');
  r.style.setProperty('--fs-big', (C.theme.bigClock||64)+'px');
  r.style.setProperty('--fs-h1', (C.theme.h1||42)+'px');
  r.style.setProperty('--fs-h2', (C.theme.h2||28)+'px');
})();

// === Utilidades de fecha/hora ===
const fmtDate = new Intl.DateTimeFormat('es-PR',{weekday:'long', day:'2-digit', month:'long', year:'numeric', timeZone:C.timeZone});
const fmtTime = new Intl.DateTimeFormat('es-PR',{hour:'numeric', minute:'2-digit', hour12:true, timeZone:C.timeZone});
const toTZ = d => new Date(d.toLocaleString('en-US',{timeZone:C.timeZone}));
const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);
const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);
const sameDay = (a,b)=>{a=toTZ(a);b=toTZ(b);return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};
const unfold = txt => txt.replace(/(?:\r\n|\n)[ \t]/g,'');
const pad2 = n => n<10?'0'+n:''+n;

function hm(d){
  return fmtTime.format(toTZ(d)).toLowerCase()
    .replace(/\s/g,'').replace('a. m.','am').replace('p. m.','pm');
}
function dateLong(d){ const s = fmtDate.format(toTZ(d)); return s.charAt(0).toUpperCase()+s.slice(1); }
function isTemple(text){
  if(!text) return false;
  const t = String(text).toLowerCase();
  return (C.templeKeywords||[]).some(k => t.includes(String(k).toLowerCase()));
}
function firstUrl(...vals){ for(const v of vals){ if (v && /^https?:\/\//i.test(v)) return v; } return ''; }
function qrFor(url){ if(!url) return ''; return `https://api.qrserver.com/v1/create-qr-code/?size=${C.qrSize}x${C.qrSize}&data=${encodeURIComponent(url)}`; }
function parseDescFields(desc){
  const out = { preacher:'', manager:'', extra:'' };
  if(!desc) return out;
  const lines = String(desc).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  for(const ln of lines){
    const mP = C.fieldsFromDescription.preacher && ln.match(C.fieldsFromDescription.preacher);
    if (mP && !out.preacher) out.preacher = (mP[2]||'').trim();
    const mM = C.fieldsFromDescription.manager && ln.match(C.fieldsFromDescription.manager);
    if (mM && !out.manager) out.manager = (mM[2]||'').trim();
  }
  out.extra = lines.filter(ln=>!/(predicador|predica|encargad[oa])\s*:/i.test(ln)).join(' · ');
  return out;
}
function toDateFromHm(baseDate, hmStr){
  if(!hmStr) return null;
  const [H,M] = hmStr.split(':').map(n=>parseInt(n,10));
  const d = new Date(startOfDay(baseDate));
  // Puerto Rico: aproximación UTC = local +4
  d.setHours((H||0)-4, (M||0), 0, 0);
  return d;
}

// === Parse ICS ===
function parseICS(txt){
  txt = unfold(txt);
  const blocks = txt.split(/BEGIN:VEVENT/).slice(1).map(b=>'BEGIN:VEVENT'+b.split('END:VEVENT')[0]);
  const out = [];
  for(const b of blocks){
    const get = (k)=>{ const m=b.match(new RegExp('^'+k+'(?:;[^:\\n]*)?:(.*)$','mi')); return m?m[1].trim():''; };
    const m = b.match(/^DTSTART([^:\n]*)?:([^\n]+)$/mi); if(!m) continue;
    const p=(m[1]||'').toUpperCase(); const v=m[2].trim();
    const dOnly=v.match(/^(\d{4})(\d{2})(\d{2})$/);
    const dt=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
    let start=null;
    if(/VALUE=DATE/.test(p) && dOnly){ const [_,Y,M,D]=dOnly; start=new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
    else if(dt){ const [_,Y,M,D,hh,mm,ss,Z]=dt; start = Z?new Date(Date.UTC(+Y,+M-1,+D,+hh,+mm,+ss)):new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss)); }
    else if(dOnly){ const [_,Y,M,D]=dOnly; start=new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
    if(!start) continue;

    let end=null;
    const m2 = b.match(/^DTEND[^:]*:([^\n]+)$/mi);
    if(m2){
      const v2=m2[1].trim();
      const dt2=v2.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
      const dOnly2=v2.match(/^(\d{4})(\d{2})(\d{2})$/);
      if(dt2){ const [_,Y,M,D,hh,mm,ss,Z]=dt2; end = Z?new Date(Date.UTC(+Y,+M-1,+D,+hh,+mm,+ss)):new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss)); }
      else if(dOnly2){ const [_,Y,M,D]=dOnly2; end=new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
    }

    out.push({ start, end, summary:get('SUMMARY'), location:get('LOCATION'), url:get('URL'), desc:get('DESCRIPTION') });
  }
  out.sort((a,b)=> a.start - b.start);
  return out;
}
function groupByDayWeek(events, baseDate){
  const pr = toTZ(baseDate);
  const sun = startOfDay(addDays(pr, -pr.getDay()));
  const weekDays = [...Array(7)].map((_,i)=> addDays(sun,i));
  const map = new Map(weekDays.map(d=>[startOfDay(d).getTime(), []]));
  for(const ev of events){
    for(const d of weekDays){
      if (sameDay(ev.start, d)){ map.get(startOfDay(d).getTime()).push(ev); break; }
    }
  }
  for(const [k,list] of map){ list.sort((a,b)=> a.start - b.start); }
  return {sun, days: weekDays, map};
}

// === Estado ===
const ST = {
  allEvents: [],
  week: null,
  // Secuencia de "tarjetas" (intro/banner, intro/text, day(0..6), outro/banner, outro/text)
  seq: [],
  idx: 0,     // índice de la tarjeta actual
  evIdx: 0,   // índice del evento dentro del día actual
  timer: null
};

// Construye la secuencia semanal
function buildSequence(){
  const s=[];
  if (C.intro?.bannerUrl) s.push({type:'banner', url:C.intro.bannerUrl, label:'Portada'});
  if (C.intro?.text)      s.push({type:'text',   text:C.intro.text,     label:'Portada'});
  for(let i=0;i<7;i++)    s.push({type:'day',    dayOffset:i,            label:'Día'});
  if (C.outro?.bannerUrl) s.push({type:'banner', url:C.outro.bannerUrl, label:'Cierre'});
  if (C.outro?.text)      s.push({type:'text',   text:C.outro.text,     label:'Cierre'});
  ST.seq = s;
  ST.idx = 0;
  ST.evIdx = 0;
}

// === Sleep window (apagado suave de pantalla) ===
function withinRestWindow(now){
  if (!C.rest || !C.rest.enabled) return false;
  const [sH,sM] = (C.rest.start||'23:00').split(':').map(n=>parseInt(n,10));
  const [eH,eM] = (C.rest.end||'06:00').split(':').map(n=>parseInt(n,10));
  const local = toTZ(now);
  const curM = local.getHours()*60 + local.getMinutes();
  const sMin = (sH*60 + (sM||0));
  const eMin = (eH*60 + (eM||0));

  // rango puede cruzar medianoche
  if (sMin <= eMin) return curM>=sMin && curM<eMin;
  return (curM>=sMin) || (curM<eMin);
}
function applyRestDim(){
  const on = withinRestWindow(new Date());
  const body = document.body;
  if (on){
    if (!document.getElementById('sleep-mask')){
      const m = document.createElement('div');
      m.id='sleep-mask';
      m.style.cssText='position:fixed;inset:0;background:#000;opacity:.98;z-index:99999;transition:opacity .8s ease';
      body.appendChild(m);
    }
  }else{
    document.getElementById('sleep-mask')?.remove();
  }
}

// === Render de 3 paneles ===
function setH(elId, text){ const el=document.getElementById(elId); if(el) el.textContent=text; }
function setBody(elId, html){ const el=document.getElementById(elId); if(el) el.innerHTML=html; }

function renderClock(){
  const now = new Date();
  document.getElementById('now').textContent = fmtTime.format(toTZ(now));
  document.getElementById('date').textContent= dateLong(now);
  applyRestDim();
}

function compactCardForDay(day, items){
  if(!items.length){
    return `
      <div class="ev">
        <div class="tag">—</div>
        <div class="muted">Sin eventos</div>
      </div>`;
  }
  const ev = items[0];
  const end = ev.end ? ' – ' + hm(ev.end) : '';
  const hasPin = firstUrl(ev.url, ev.location);
  const temple = isTemple(ev.location) || (!hasPin && ev.location && isTemple(ev.location));
  const place = hasPin && !temple ? 'Pin disponible' : (ev.location || (temple?'Templo':''));
  return `
    <div class="ev">
      <div class="tag">${ev.start ? hm(ev.start) : '—'}${end}</div>
      <div style="font-weight:900" class="marquee">${ev.summary||'Evento'}</div>
      <div class="muted">${place||''}</div>
    </div>`;
}

function renderList(dayTs){
  const box = document.getElementById('list');
  if(!box) return;
  const list = ST.week.map.get(dayTs) || [];
  box.innerHTML = '';
  if(!list.length){ box.innerHTML = `<div class="muted">Sin eventos para este día</div>`; return; }
  for(const ev of list){
    const end = ev.end ? ' – ' + hm(ev.end) : '';
    const div = document.createElement('div');
    div.className='ev';
    div.innerHTML = `
      <div class="time">${hm(ev.start)}${end}</div>
      <div style="font-weight:900">${ev.summary||'Evento'}</div>
      ${ev.location? `<div class="muted">${ev.location}</div>`:''}
    `;
    box.appendChild(div);
  }
}

function renderStage(target, stageObj){
  const holder = document.getElementById(target);
  if(!holder) return;

  if(stageObj.type==='banner'){
    return `
      <div class="banner">
        <img src="${stageObj.url}" alt="Banner">
      </div>`;
  }
  if(stageObj.type==='text'){
    const s = ST.week.days[0], e = ST.week.days[6];
    return `
      <div class="centerText">
        <div class="titleCenter">${stageObj.text}</div>
        <div class="subCenter">${dateLong(s)} — ${dateLong(e)}</div>
      </div>`;
  }
  if(stageObj.type==='day'){
    const d = ST.week.days[stageObj.dayOffset];
    const dayKey = startOfDay(d).getTime();
    let items = (ST.week.map.get(dayKey)||[]).slice();

    // Defaults cuando no hay ICS
    const wkd = toTZ(d).getDay();
    if(!items.length && C.defaultsByWeekday && C.defaultsByWeekday[wkd]?.length){
      items = C.defaultsByWeekday[wkd].map(x=>({
        start: x.start ? toDateFromHm(d, x.start) : d,
        end:   x.end   ? toDateFromHm(d, x.end)   : null,
        summary: x.title || 'Evento',
        location: x.where || '',
        url: '',
        desc: x.desc || ''
      }));
    }

    if(target==='body-now'){
      // panel central (detallado) usa ST.evIdx rotando
      const ev = items.length ? items[ST.evIdx % items.length] : null;
      if(!ev){
        return `
          <h2 class="muted">Sin eventos</h2>
          <div class="ev"><div class="muted">No hay actividades programadas para ${dateLong(d)}</div></div>`;
      }
      const end = ev.end ? ' – ' + hm(ev.end) : '';
      const pin = firstUrl(ev.url, ev.location);
      const temple = isTemple(ev.location) || (!pin && ev.location && isTemple(ev.location));
      const showQr = pin && !temple;
      const df = parseDescFields(ev.desc);
      const preacher = df.preacher ? `<div class="muted">Predicador: ${df.preacher}</div>` : '';
      const manager  = df.manager  ? `<div class="muted">Encargado: ${df.manager}</div>`  : '';
      const extra    = df.extra    ? `<div class="muted" style="margin-top:6px">${df.extra}</div>` : '';
      const place = showQr ? 'Pin disponible (escanea el QR)' : (ev.location || (temple?'Templo':''));

      return `
        <h2>${dateLong(d)}</h2>
        <div class="ev">
          <div class="row2">
            <div>
              <div class="tag">${ev.start ? hm(ev.start) : ''}${end}</div>
              <div style="font-weight:900; font-size:calc(var(--fs-h2) + 2px)" class="marquee">${ev.summary||'Evento'}</div>
              <div class="muted">${place||''}</div>
              ${preacher}${manager}${extra}
            </div>
            <div class="qr">${ showQr ? `<img src="${qrFor(pin)}" alt="QR localización">` : '' }</div>
          </div>
        </div>`;
    }else{
      // panel lateral (compacto)
      return `
        <h2>${stageObj.type==='day' ? dateLong(d) : ''}</h2>
        ${compactCardForDay(d, items)}`;
    }
  }
  return `<div class="muted">—</div>`;
}

function paintAll(){
  // reloj y status
  renderClock();

  // rollover de semana (domingo a la hora configurada)
  const now = toTZ(new Date());
  const wkSun = startOfDay(addDays(now, -now.getDay()));
  if (now.getDay()===(+C.weekRolloverDay||0) && now.getHours()>=(+C.weekRolloverHour||0) && !sameDay(ST.week.sun, wkSun)){
    rebuildWeek();
  }

  // índice prev/now/next
  const N = ST.seq.length;
  const iNow  = ST.idx % N;
  const iPrev = (ST.idx - 1 + N) % N;
  const iNext = (ST.idx + 1) % N;

  const sPrev = ST.seq[iPrev];
  const sNow  = ST.seq[iNow];
  const sNext = ST.seq[iNext];

  // Cabeceras
  setH('h-prev', sPrev.type==='day' ? 'Anterior' : (sPrev.label||'Anterior'));
  setH('h-now',  sNow.type==='day'  ? 'Tarjeta actual' : (sNow.label||'Actual'));
  setH('h-next', sNext.type==='day' ? 'Siguiente' : (sNext.label||'Siguiente'));

  // Cuerpos
  setBody('body-prev', renderStage('body-prev', sPrev));
  setBody('body-now',  renderStage('body-now',  sNow));
  setBody('body-next', renderStage('body-next', sNext));

  // Listado del día actual (si la tarjeta central es “day”)
  if (sNow.type==='day'){
    const d = ST.week.days[sNow.dayOffset];
    document.getElementById('listTitle').textContent = 'Eventos de ' + dateLong(d);
    renderList(startOfDay(d).getTime());
  }else{
    document.getElementById('listTitle').textContent = 'Eventos de hoy';
    const todayKey = startOfDay(now).getTime();
    renderList(todayKey);
  }
}

function advance(){
  const sNow = ST.seq[ST.idx % ST.seq.length];
  if (sNow.type==='day'){
    // gira dentro del día si hay varios
    const d = ST.week.days[sNow.dayOffset];
    const dayKey = startOfDay(d).getTime();
    const list = ST.week.map.get(dayKey) || [];
    const wkd  = toTZ(d).getDay();
    const defN = (C.defaultsByWeekday && C.defaultsByWeekday[wkd]) ? C.defaultsByWeekday[wkd].length : 0;
    const total = list.length || defN || 1;
    if (total>1 && ST.evIdx < total-1){
      ST.evIdx++;
      paintAll();
      return;
    }
    ST.evIdx = 0;
  }
  ST.idx = (ST.idx + 1) % ST.seq.length;
  paintAll();
}

// === Carga ICS / armado de semana / polling ===
async function loadICS(){
  const url = C.icsUrl + (C.icsUrl.includes('?')?'&':'?') + 't=' + Date.now();
  try{
    const r = await fetch(url, {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const txt = await r.text();
    ST.allEvents = parseICS(txt);
    document.getElementById('status').textContent = 'ICS OK';
  }catch(e){
    console.error('ICS error:', e);
    document.getElementById('status').textContent = 'ICS ERROR';
  }
}
function rebuildWeek(){
  ST.week = groupByDayWeek(ST.allEvents, new Date());
  buildSequence();
  ST.idx = 0;
  ST.evIdx = 0;
  paintAll();
}
async function boot(){
  await loadICS();
  rebuildWeek();

  // slide
  clearInterval(ST.timer);
  ST.timer = setInterval(advance, C.slideMs||12000);

  // reloj
  setInterval(renderClock, 1000);

  // polling ICS
  setInterval(async ()=>{
    const before = (ST.allEvents||[]).length;
    await loadICS();
    const after = (ST.allEvents||[]).length;
    if (after !== before) rebuildWeek();
  }, C.pollMs||300000);
}
boot();