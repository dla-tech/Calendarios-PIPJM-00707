/* ===============================
   Monitor Cartelera Semanal PIPJM
   =============================== */
const C = window.CARTELERA_CONFIG;

/* ======== Helpers ======== */
function applyTheme(){
  const r = document.documentElement;
  r.style.setProperty('--bg', C.theme.bg);
  r.style.setProperty('--card', C.theme.card);
  r.style.setProperty('--text', C.theme.text);
  r.style.setProperty('--muted', C.theme.muted);
  r.style.setProperty('--accent', C.theme.accent);
  r.style.setProperty('--warn', C.theme.warn);
}
applyTheme();

const fmt = new Intl.DateTimeFormat('es-PR',{weekday:'long', day:'2-digit', month:'long', year:'numeric', timeZone:C.timeZone});
const fmtTime = new Intl.DateTimeFormat('es-PR',{hour:'numeric', minute:'2-digit', hour12:true, timeZone:C.timeZone});
const toTZ = d => new Date(d.toLocaleString('en-US',{timeZone:C.timeZone}));
const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);
const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);
const sameDay = (a,b)=>{a=toTZ(a);b=toTZ(b);return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};
const unfold = txt => txt.replace(/(?:\r\n|\n)[ \t]/g,'');

function hm(d){
  return fmtTime.format(toTZ(d)).toLowerCase()
    .replace(/\s/g,'').replace('a. m.','am').replace('p. m.','pm');
}
function dateLong(d){ const s = fmt.format(toTZ(d)); return s.charAt(0).toUpperCase()+s.slice(1); }

function qrFor(url){
  if(!url) return '';
  const u = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${C.qrSize}x${C.qrSize}&data=${u}`;
}
function firstUrl(...vals){
  for(const v of vals){
    if (v && /^https?:\/\//i.test(v)) return v;
  }
  return '';
}

/* ======== ICS Parser ======== */
function parseICS(txt){
  txt = unfold(txt);
  const blocks = txt.split(/BEGIN:VEVENT/).slice(1).map(b=>'BEGIN:VEVENT'+b.split('END:VEVENT')[0]);
  const out = [];
  for(const b of blocks){
    const get = (k)=>{ const m=b.match(new RegExp('^'+k+'(?:;[^:\\n]*)?:(.*)$','mi')); return m?m[1].trim():''; };
    const when = (()=>{ 
      const m = b.match(/^DTSTART([^:\n]*)?:([^\n]+)$/mi); if(!m) return null;
      const p=(m[1]||'').toUpperCase(); const v=m[2].trim();
      const dOnly=v.match(/^(\d{4})(\d{2})(\d{2})$/);
      const dt=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
      const toDt = (Y,M,D,hh,mm,ss, z)=> z ? new Date(Date.UTC(+Y,+M-1,+D,+hh,+mm,+ss))
                                           : new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss));
      if(/VALUE=DATE/.test(p) && dOnly){ const [_,Y,M,D]=dOnly; return {start:new Date(Date.UTC(+Y,+M-1,+D,4,0,0)), end:null}; }
      if(dt){ const [_,Y,M,D,hh,mm,ss,Z]=dt; return {start:toDt(Y,M,D,hh,mm,ss,Z), end:null}; }
      if(dOnly){ const [_,Y,M,D]=dOnly; return {start:new Date(Date.UTC(+Y,+M-1,+D,4,0,0)), end:null}; }
      return null;
    })();
    if(!when) continue;
    out.push({
      start: when.start,
      summary: get('SUMMARY'),
      location: get('LOCATION'),
      url: get('URL'),
      desc: get('DESCRIPTION')
    });
  }
  out.sort((a,b)=> a.start - b.start);
  return out;
}

function groupByDayWeek(events, baseDate){
  const pr = toTZ(baseDate);
  const sun = startOfDay(addDays(pr, -pr.getDay())); // domingo
  const weekDays = [...Array(7)].map((_,i)=> addDays(sun,i));
  const map = new Map(weekDays.map(d=>[startOfDay(d).getTime(), []]));
  for(const ev of events){
    for(const d of weekDays){
      if (sameDay(ev.start, d)){ map.get(startOfDay(d).getTime()).push(ev); break; }
    }
  }
  return {sun, days: weekDays, map};
}

/* ======== Estado ======== */
let state = {
  allEvents: [],
  week: null,
  stageSeq: [],
  stageIdx: 0,
  evIdx: 0
};

function buildStageSequence(){
  const seq = [];
  if (C.intro.bannerUrl) seq.push({type:'banner', url:C.intro.bannerUrl});
  if (C.intro.text)      seq.push({type:'text', text:C.intro.text});
  for (let i=0;i<7;i++) seq.push({type:'day', dayOffset:i});
  if (C.outro.bannerUrl) seq.push({type:'banner', url:C.outro.bannerUrl});
  if (C.outro.text)      seq.push({type:'text', text:C.outro.text});
  state.stageSeq = seq;
  state.stageIdx = 0;
}

/* ======== Render ======== */
function renderClock(){
  const now = new Date();
  document.getElementById('now').textContent = fmtTime.format(toTZ(now));
  document.getElementById('date').textContent= dateLong(now);
}

function paintStage(){
  renderClock();

  // Sleep mode
  if(C.rest.enabled){
    const now = toTZ(new Date());
    const [sH,sM] = C.rest.start.split(':').map(Number);
    const [eH,eM] = C.rest.end.split(':').map(Number);
    const start = new Date(now); start.setHours(sH,sM,0,0);
    const end   = new Date(now); end.setHours(eH,eM,0,0);
    const inSleep = (start<end) ? (now>=start && now<end)
                                : (now>=start || now<end);
    if(inSleep){
      document.getElementById('stage').innerHTML = `
        <div class="banner"><div style="text-align:center;font-size:36px">⏸️ Monitor en descanso<br>${C.rest.start} – ${C.rest.end}</div></div>`;
      document.getElementById('list').innerHTML='';
      return;
    }
  }

  const stage = state.stageSeq[state.stageIdx % state.stageSeq.length];
  const holder = document.getElementById('stage');

  if (stage.type==='banner'){
    holder.innerHTML = `<div class="banner"><img src="${stage.url}" /></div>`;
    return;
  }
  if (stage.type==='text'){
    holder.innerHTML = `<div class="center" style="height:62vh"><div class="titleCenter">${stage.text}</div></div>`;
    return;
  }
  if (stage.type==='day'){
    const day = state.week.days[stage.dayOffset];
    const list = state.week.map.get(startOfDay(day).getTime()) || [];
    if(!list.length){
      holder.innerHTML = `<h1>${dateLong(day)}</h1><div>Sin eventos</div>`;
      return;
    }
    const ev = list[state.evIdx % list.length];
    const pin = firstUrl(ev.url, ev.location);
    holder.innerHTML = `
      <h1>${dateLong(day)}</h1>
      <div class="ev">
        <div class="time">${hm(ev.start)}</div>
        <h2>${ev.summary}</h2>
        <div>${ev.location||''}</div>
        ${pin? `<div class="qr"><img src="${qrFor(pin)}"/></div>`:''}
      </div>`;
  }
}

function advance(){
  const stage = state.stageSeq[state.stageIdx % state.stageSeq.length];
  if(stage.type==='day'){
    const day = state.week.days[stage.dayOffset];
    const list = state.week.map.get(startOfDay(day).getTime()) || [];
    if(list.length && state.evIdx < list.length-1){
      state.evIdx++;
      paintStage();
      return;
    }
    state.evIdx=0;
  }
  state.stageIdx = (state.stageIdx+1)%state.stageSeq.length;
  paintStage();
}

/* ======== Boot ======== */
async function loadICS(){
  const url = C.icsUrl + (C.icsUrl.includes('?')?'&':'?')+'t='+Date.now();
  try{
    const r = await fetch(url,{cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const txt = await r.text();
    state.allEvents=parseICS(txt);
  }catch(e){ console.error(e); }
}

async function boot(){
  await loadICS();
  state.week=groupByDayWeek(state.allEvents,new Date());
  buildStageSequence();
  paintStage();
  setInterval(advance,C.slideMs);
  setInterval(()=>paintStage(),1000);
  setInterval(loadICS,C.pollMs);
}
boot();
