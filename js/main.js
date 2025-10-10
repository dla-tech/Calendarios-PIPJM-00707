(function(){
  const C = window.CARTELERA_CONFIG || {};

  // === Tema ===
  (function applyTheme(){
    const r = document.documentElement.style;
    const t = C.theme||{};
    for (const k in t) r.setProperty(`--${k}`, t[k]);
  })();

  // === sleep ===
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // === Formatos ===
  const fmtDate = new Intl.DateTimeFormat('es-PR',{weekday:'long', day:'2-digit', month:'long', year:'numeric', timeZone:C.timeZone});
  const fmtTime = new Intl.DateTimeFormat('es-PR',{hour:'numeric', minute:'2-digit', hour12:true, timeZone:C.timeZone});
  const toTZ = d => new Date(d.toLocaleString('en-US',{timeZone:C.timeZone}));
  const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);
  const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);
  const sameDay = (a,b)=>{a=toTZ(a);b=toTZ(b);return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};
  const dateLong = d => fmtDate.format(toTZ(d)).replace(/\b[a-z]/, m=>m.toUpperCase());
  const hm = d => fmtTime.format(toTZ(d)).toLowerCase().replace(/\s/g,'');

  // === Utilidades ===
  function cleanText(str){
    if(!str) return '';
    return String(str)
      .replace(/\\n/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .replace(/[•·]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function qrFor(url){
    if(!url) return '';
    const u = encodeURIComponent(url.trim());
    const size = C.qrSize || 240;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${u}`;
  }

  function parseDesc(desc){
    const out = {preacher:'', manager:''};
    if(!desc) return out;
    desc = cleanText(desc);
    const lines = desc.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    for(const ln of lines){
      const p = C.fieldsFromDescription?.preacher?.exec(ln);
      const m = C.fieldsFromDescription?.manager?.exec(ln);
      if(p && !out.preacher) out.preacher = p[2]||'';
      if(m && !out.manager)  out.manager  = m[2]||'';
    }
    return out;
  }

  function isTemple(text){
    if(!text) return false;
    const t = String(text).toLowerCase();
    return (C.templeKeywords||[]).some(k => t.includes(String(k).toLowerCase()));
  }

  // === Parse ICS ===
  function parseICS(txt){
    txt = txt.replace(/(?:\r\n|\n)[ \t]/g,'');
    const blocks = txt.split(/BEGIN:VEVENT/).slice(1);
    const out = [];
    for(const b0 of blocks){
      const b = 'BEGIN:VEVENT'+b0.split('END:VEVENT')[0];
      const get = k => { const m=b.match(new RegExp('^'+k+'(?:;[^:\\n]*)?:(.*)$','mi')); return m?m[1].trim():''; };
      const start = (()=>{
        const m=b.match(/^DTSTART[^:]*:(\d{8}T\d{6}Z?)$/mi);
        if(!m) return null;
        const v=m[1]; const Y=v.slice(0,4), M=v.slice(4,6), D=v.slice(6,8), hh=v.slice(9,11), mm=v.slice(11,13);
        return new Date(Date.UTC(Y,M-1,D,hh,mm));
      })();
      if(!start) continue;
      out.push({ start, summary:get('SUMMARY'), location:get('LOCATION'), url:get('URL'), desc:get('DESCRIPTION') });
    }
    out.sort((a,b)=>a.start-b.start);
    return out;
  }

  function groupWeek(events, base){
    const pr = toTZ(base);
    const sun = startOfDay(addDays(pr, -pr.getDay()));
    const days = [...Array(7)].map((_,i)=> addDays(sun,i));
    const map = new Map(days.map(d=>[startOfDay(d).getTime(), []]));
    for(const ev of events){
      for(const d of days){ if(sameDay(ev.start,d)){ map.get(startOfDay(d).getTime()).push(ev); break; } }
    }
    return {days, map};
  }

  let state = {events:[], week:null, idx:0, lastICS:null, running:true, paused:false};

  async function loadICS(){
    try{
      const r = await fetch(C.icsUrl+'?t='+Date.now(), {cache:'no-store'});
      const txt = await r.text();
      return txt;
    }catch(e){ console.error('Error ICS', e); return ''; }
  }

  function renderDay(day){
    const key = startOfDay(day).getTime();
    const list = state.week.map.get(key)||[];
    if(!list.length)
      return `<div class="card active"><div class="date">${dateLong(day)}</div><div class="muted">Sin eventos</div></div>`;

    const parts = list.map(ev=>{
      const {preacher, manager} = parseDesc(ev.desc);
      const pinUrl = ev.url && /^https?:\/\//.test(ev.url) ? ev.url : '';
      const showQr = pinUrl && !isTemple(ev.location);

      // QR a la derecha del texto:
      return `
        <div class="ev" style="display:flex;align-items:center;justify-content:space-between;gap:3vw;flex-wrap:wrap;">
          <div class="info" style="flex:1;min-width:240px;">
            <div class="date" style="color:var(--accent);font-weight:900;font-size:calc(2vw + 0.5vh);">${dateLong(day)}</div>
            <div class="tag" style="display:inline-block;margin:0.6vh 0;background:#122742;padding:0.4em 1em;border-radius:999px;">${hm(ev.start)}</div>
            <div class="title" style="font-weight:900;font-size:calc(1.6vw + 0.8vh);margin-top:0.6vh;">${cleanText(ev.summary)}</div>
            ${ev.location && !/^https?:\/\//.test(ev.location) ? `<div class="muted"><strong>Lugar:</strong> ${cleanText(ev.location)}</div>` : ''}
            ${manager ? `<div class="muted"><strong>Encargado:</strong> ${cleanText(manager)}</div>` : ''}
            ${preacher ? `<div class="muted"><strong>Predicador:</strong> ${cleanText(preacher)}</div>` : ''}
          </div>
          ${showQr ? `<div class="qrwrap" style="flex-shrink:0;"><img src="${qrFor(pinUrl)}" style="max-height:200px;border-radius:12px;"></div>` : ''}
        </div>`;
    });
    return `<div class="card active" style="padding:3vw;">${parts.join('<hr style="border:none;height:2px;background:rgba(255,255,255,.08);margin:2vh 0;">')}</div>`;
  }

  function paint(){
    const day = state.week.days[state.idx];
    document.getElementById('board').innerHTML = renderDay(day);
    document.getElementById('clockNow').textContent = fmtTime.format(toTZ(new Date()));
    const s = state.week.days[0], e = state.week.days[6];
    document.getElementById('weekRange').textContent = `${dateLong(s)} / ${dateLong(e)}`;
  }

  // === Botones flotantes ===
  function createControls(){
    const div = document.createElement('div');
    div.id = 'controls';
    div.innerHTML = `
      <button id="prevDay">⬅️</button>
      <button id="pauseBtn">⏸️</button>
      <button id="nextDay">➡️</button>
    `;
    document.body.appendChild(div);

    const style = document.createElement('style');
    style.textContent = `
      #controls{
        position:fixed;
        bottom:2vh;
        right:3vw;
        display:flex;
        gap:10px;
        z-index:50;
      }
      #controls button{
        background:var(--accent);
        color:#fff;
        border:none;
        border-radius:50%;
        width:58px;
        height:58px;
        font-size:22px;
        cursor:pointer;
        box-shadow:0 4px 14px rgba(0,0,0,.4);
        transition:transform .2s, background .2s;
      }
      #controls button:hover{transform:scale(1.1);background:#1fd15d;}
    `;
    document.head.appendChild(style);

    document.getElementById('prevDay').onclick = ()=>{ 
      state.idx = (state.idx - 1 + 7) % 7; 
      paint(); 
    };
    document.getElementById('nextDay').onclick = ()=>{ 
      state.idx = (state.idx + 1) % 7; 
      paint(); 
    };
    document.getElementById('pauseBtn').onclick = ()=>{
      state.paused = !state.paused;
      document.getElementById('pauseBtn').textContent = state.paused ? '▶️' : '⏸️';
    };
  }

  async function boot(){
    const txt = await loadICS();
    state.lastICS = txt;
    state.events = parseICS(txt);
    state.week = groupWeek(state.events, new Date());
    paint();
    createControls();

    // reloj en vivo
    setInterval(()=>{ document.getElementById('clockNow').textContent = fmtTime.format(toTZ(new Date())); }, 1000);

    // bucle principal
    (async function mainLoop(){
      while(state.running){
        await sleep(C.slideMs || 12000);
        if(!state.paused){
          state.idx = (state.idx + 1) % 7;
          paint();
        }
      }
    })();

    // verificación del ICS
    (async function checkLoop(){
      while(state.running){
        await sleep(C.pollMs || 60000);
        try {
          const newTxt = await loadICS();
          if(newTxt && newTxt !== state.lastICS){
            console.log("🔄 Detectado cambio en el ICS, recargando cartelera...");
            state.lastICS = newTxt;
            state.events = parseICS(newTxt);
            state.week = groupWeek(state.events, new Date());
            state.idx = 0;
            paint();
          }
        } catch(e){ console.error("Error al verificar ICS", e); }
      }
    })();
  }

  boot();
})();
