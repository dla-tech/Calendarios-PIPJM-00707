(function(){
  const C = window.CARTELERA_CONFIG || {};

  // ===== Tema =====
  (function applyTheme(){
    const r = document.documentElement.style;
    const t = C.theme||{};
    r.setProperty('--bg', t.bg||'#0b1421');
    r.setProperty('--card', t.card||'#0f1b2c');
    r.setProperty('--text', t.text||'#e6eefc');
    r.setProperty('--muted', t.muted||'#93a4bf');
    r.setProperty('--accent', t.accent||'#16a34a');
    r.setProperty('--warn', t.warn||'#ef4444');
    r.setProperty('--h1', (t.h1||40)+'px');
    r.setProperty('--h2', (t.h2||26)+'px');
    r.setProperty('--fs', (t.fs||20)+'px');
    r.setProperty('--clock', (t.clock||54)+'px');
    r.setProperty('--radius', (t.radius||18)+'px');
    r.setProperty('--shadow', t.shadow||'0 20px 60px rgba(0,0,0,.35)');
  })();

  // ===== Fecha/Hora =====
  const fmtDate = new Intl.DateTimeFormat('es-PR',{weekday:'long', day:'2-digit', month:'long', year:'numeric', timeZone:C.timeZone});
  const fmtTime = new Intl.DateTimeFormat('es-PR',{hour:'numeric', minute:'2-digit', hour12:true, timeZone:C.timeZone});
  const toTZ = d => new Date(d.toLocaleString('en-US',{timeZone:C.timeZone}));
  const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);
  const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);
  const sameDay = (a,b)=>{a=toTZ(a);b=toTZ(b);return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};
  const unfold = txt => txt.replace(/(?:\r\n|\n)[ \t]/g,'');
  const cap = s => { s=String(s||''); return s? s.charAt(0).toUpperCase()+s.slice(1): s; };
  const dateLong = d => cap(fmtDate.format(toTZ(d)));
  const hm = d => fmtTime.format(toTZ(d)).toLowerCase().replace(/\s/g,'').replace('a. m.','am').replace('p. m.','pm');

  // ===== Utils =====
  function qrFor(url){
    if(!url) return '';
    const u = encodeURIComponent(url);
    const size = C.qrSize||260;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${u}`;
  }
  function parseDesc(desc){
    const out = {preacher:'', manager:''};
    if(!desc) return out;
    const lines = String(desc).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    for(const ln of lines){
      const mP = C.fieldsFromDescription?.preacher && ln.match(C.fieldsFromDescription.preacher);
      if(mP && !out.preacher) out.preacher = (mP[2]||'').trim();
      const mM = C.fieldsFromDescription?.manager && ln.match(C.fieldsFromDescription.manager);
      if(mM && !out.manager) out.manager = (mM[2]||'').trim();
    }
    return out;
  }
  function isTemple(text){
    if(!text) return false;
    const t = String(text).toLowerCase();
    return (C.templeKeywords||[]).some(k => t.includes(String(k).toLowerCase()));
  }
  function firstPinUrl(ev){
    if (ev.url && /^https?:\/\//i.test(ev.url)) return ev.url;
    if (ev.location && /^https?:\/\//i.test(ev.location)) return ev.location;
    return '';
  }

  // ===== ICS =====
  function parseICS(txt){
    txt = unfold(txt);
    const blocks = txt.split(/BEGIN:VEVENT/).slice(1).map(b=>'BEGIN:VEVENT'+b.split('END:VEVENT')[0]);
    const out = [];
    for(const b of blocks){
      const get = (k)=>{ const m=b.match(new RegExp('^'+k+'(?:;[^:\\n]*)?:(.*)$','mi')); return m?m[1].trim():''; };
      const when = (()=>{ // DTSTART
        const m = b.match(/^DTSTART([^:\n]*)?:([^\n]+)$/mi); if(!m) return null;
        const p=(m[1]||'').toUpperCase(); const v=m[2].trim();
        const dOnly=v.match(/^(\d{4})(\d{2})(\d{2})$/);
        const dt=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
        const toDt = (Y,M,D,hh,mm,ss, z)=> z ? new Date(Date.UTC(+Y,+M-1,+D,+hh,+mm,+ss))
                                             : new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss));
        if(/VALUE=DATE/.test(p) && dOnly){ const [_,Y,M,D]=dOnly; return {start:new Date(Date.UTC(+Y,+M-1,+D,4,0,0))}; }
        if(dt){ const [_,Y,M,D,hh,mm,ss,Z]=dt; return {start:toDt(Y,M,D,hh,mm,ss,Z)}; }
        if(dOnly){ const [_,Y,M,D]=dOnly; return {start:new Date(Date.UTC(+Y,+M-1,+D,4,0,0))}; }
        return null;
      })();
      if(!when) continue;

      // DTEND
      let end = null;
      const mEnd = b.match(/^DTEND[^:]*:([^\n]+)$/mi);
      if (mEnd){
        const v = mEnd[1].trim();
        const dt=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
        const dOnly=v.match(/^(\d{4})(\d{2})(\d{2})$/);
        if(dt){ const [_,Y,M,D,hh,mm,ss,Z]=dt; end = Z?new Date(Date.UTC(+Y,+M-1,+D,+hh,+mm,+ss)):new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss)); }
        else if(dOnly){ const [_,Y,M,D]=dOnly; end = new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
      }

      out.push({
        start: when.start,
        end,
        summary:  get('SUMMARY'),
        location: get('LOCATION'),
        url:      get('URL'),
        desc:     get('DESCRIPTION')
      });
    }
    out.sort((a,b)=> a.start - b.start);
    return out;
  }
  function groupWeek(events, baseDate){
    const pr = toTZ(baseDate);
    const sun = startOfDay(addDays(pr, -pr.getDay())); // domingo
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

  // ===== Estado =====
  let state = {
    events: [],
    week: null,
    seq: [],   // [intro?] + 7 días + [outro?]
    idx: 0,
    timer: null
  };

  function buildSequence(){
    const seq = [];
    if (C.intro?.bannerUrl || C.intro?.text) seq.push({type:'intro'});
    for(let i=0;i<7;i++) seq.push({type:'day', dayOffset:i});
    if (C.outro?.bannerUrl || C.outro?.text) seq.push({type:'outro'});
    state.seq = seq;
    state.idx = 0;
  }

  // ===== Render =====
  function renderClockAndRange(){
    document.getElementById('clockNow').textContent = fmtTime.format(toTZ(new Date()));
    const s = state.week.days[0], e = state.week.days[6];
    document.getElementById('weekRange').textContent = `${dateLong(s)} / ${dateLong(e)}`;
  }

  function blockIntro(){
    const banner = C.intro?.bannerUrl;
    const txt    = C.intro?.text;
    if (banner) return `<div class="centerBanner"><img src="${banner}" alt="Inicio"></div>`;
    return `<div class="centerText"><div class="big">${txt||''}</div></div>`;
  }
  function blockOutro(){
    const banner = C.outro?.bannerUrl;
    const txt    = C.outro?.text;
    if (banner) return `<div class="centerBanner"><img src="${banner}" alt="Cierre"></div>`;
    return `<div class="centerText"><div class="big">${txt||''}</div></div>`;
  }

  function renderDay(day){
    const key = startOfDay(day).getTime();
    const list = state.week.map.get(key) || [];
    if (!list.length){
      return `
        <div class="date">${dateLong(day)}</div>
        <div class="muted">Sin eventos</div>
      `;
    }
    const parts = [];
    for(const ev of list){
      const timeStr = hm(ev.start) + (ev.end ? ' – '+hm(ev.end) : '');
      const {preacher, manager} = parseDesc(ev.desc);
      const pinUrl = firstPinUrl(ev);
      const showQr = pinUrl && !isTemple(ev.location);
      parts.push(`
        <div class="ev">
          <div class="row ${showQr ? '' : 'noqr'}">
            <div>
              <div class="date">${dateLong(day)}</div>
              <div class="tag">${timeStr}</div>
              <div class="title">${ev.summary || 'Evento'}</div>
              ${ev.location ? `<div class="muted"><strong>Lugar:</strong> ${ev.location}</div>` : ''}
              ${manager  ? `<div class="muted"><strong>Encargado:</strong> ${manager}</div>` : ''}
              ${preacher ? `<div class="muted"><strong>Predicador:</strong> ${preacher}</div>` : ''}
            </div>
            ${showQr ? `
              <div>
                <div class="qrlabel">Location</div>
                <div class="qrwrap"><img src="${qrFor(pinUrl)}" alt="QR Location"></div>
              </div>` : ``}
          </div>
        </div>
      `);
    }
    return parts.join('<div class="hr"></div>');
  }

  function renderCard(node){
    if (node.type==='intro') return `<div class="card">${blockIntro()}</div>`;
    if (node.type==='outro') return `<div class="card">${blockOutro()}</div>`;
    if (node.type==='day'){
      const d = state.week.days[node.dayOffset];
      return `<div class="card">${renderDay(d)}</div>`;
    }
    return `<div class="card"><div class="muted">—</div></div>`;
  }

  function paint(){
    renderClockAndRange();
    const N = state.seq.length;
    const cur  = state.idx % N;
    const prev = (cur - 1 + N) % N;
    const next = (cur + 1) % N;
    const html = [ renderCard(state.seq[prev]), renderCard(state.seq[cur]), renderCard(state.seq[next]) ].join('');
    document.getElementById('board').innerHTML = html;
  }

  function advance(){
    state.idx = (state.idx + 1) % state.seq.length;
    paint();
  }

  // ===== ICS / Semana =====
  async function loadICS(){
    const url = C.icsUrl + (C.icsUrl.includes('?')?'&':'?') + 't=' + Date.now();
    try{
      const r = await fetch(url, {cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const txt = await r.text();
      state.events = parseICS(txt);
      document.getElementById('status').textContent = 'ICS OK';
    }catch(e){
      console.error(e);
      document.getElementById('status').textContent = 'ICS ERROR';
    }
  }
  function rebuildWeek(){
    state.week = groupWeek(state.events, new Date());
    buildSequence();
    paint();
  }
  function maybeRolloverWeek(){
    const now = toTZ(new Date());
    const wd = now.getDay();
    const hr = now.getHours();
    if (wd === (C.weekRollover?.weekday ?? 0) && hr >= (C.weekRollover?.hour ?? 0)) {
      const curSun = startOfDay(addDays(now, -now.getDay()));
      if (!sameDay(curSun, state.week.sun)) rebuildWeek();
    }
  }

  // ===== Boot =====
  (async function boot(){
    await loadICS();
    rebuildWeek();

    // reloj + rollover
    setInterval(()=>{ 
      document.getElementById('clockNow').textContent = fmtTime.format(toTZ(new Date()));
      maybeRolloverWeek();
    }, 1000);

    // rotación ruleta
    clearInterval(state.timer);
    state.timer = setInterval(advance, C.slideMs||12000);

    // polling ICS
    setInterval(async ()=>{
      const before = state.events.length;
      await loadICS();
      if (state.events.length !== before) rebuildWeek();
    }, C.pollMs||300000);
  })();
})();