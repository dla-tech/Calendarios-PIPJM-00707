(function () {
  const C = window.CARTELERA_CONFIG || {};
  // === Tema desde config
  (function applyTheme(){
    const r = document.documentElement;
    r.style.setProperty('--bg', C.theme?.bg || '#0b1421');
    r.style.setProperty('--card', C.theme?.card || '#0f1b2c');
    r.style.setProperty('--text', C.theme?.text || '#e6eefc');
    r.style.setProperty('--muted', C.theme?.muted || '#93a4bf');
    r.style.setProperty('--accent', C.theme?.accent || '#16a34a');
    r.style.setProperty('--warn', C.theme?.warn || '#ef4444');
    r.style.setProperty('--fs', (C.theme?.base||22)+'px');
    r.style.setProperty('--fs-h1', (C.theme?.h1||42)+'px');
    r.style.setProperty('--fs-h2', (C.theme?.h2||28)+'px');
    r.style.setProperty('--clock', (C.theme?.clock||64)+'px');
  })();

  // === Helpers de fechas
  const fmtClock  = new Intl.DateTimeFormat('es-PR',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:C.timeZone});
  const fmtDay    = new Intl.DateTimeFormat('es-PR',{weekday:'long',day:'2-digit',month:'long',year:'numeric',timeZone:C.timeZone});
  const fmtShort  = new Intl.DateTimeFormat('es-PR',{day:'2-digit',month:'long',year:'numeric',timeZone:C.timeZone});
  const fmtHm     = new Intl.DateTimeFormat('es-PR',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:C.timeZone});
  const toTZ = d => new Date(d.toLocaleString('en-US',{timeZone:C.timeZone}));
  const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);
  const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);
  const sameDay = (a,b)=>{a=toTZ(a);b=toTZ(b);return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};
  const cap1 = s => s ? s.charAt(0).toUpperCase()+s.slice(1) : s;

  // === Reloj + rango
  function paintClock(){
    document.getElementById('now').textContent =
      fmtClock.format(toTZ(new Date())).toLowerCase().replace(/\s/g,'').replace('a. m.',' a. m.').replace('p. m.',' p. m.');
  }
  function paintWeekRange(week){
    const s = fmtShort.format(week.days[0]);
    const e = fmtShort.format(week.days[6]);
    document.getElementById('weekRange').textContent = `${cap1(s)} / ${cap1(e)}`;
  }

  // === ICS
  const unfold = txt => txt.replace(/(?:\r\n|\n)[ \t]/g,'');
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
      else if(dt){ const [_,Y,M,D,hh,mm,ss,Z]=dt; start=Z?new Date(Date.UTC(+Y,+M-1,+D,+hh,+mm,+ss)):new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss)); }
      else if(dOnly){ const [_,Y,M,D]=dOnly; start=new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
      if(!start) continue;

      let end=null;
      const mend=b.match(/^DTEND[^:]*:([^\n]+)$/mi);
      if(mend){
        const vv=mend[1].trim();
        const dt2=vv.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
        const d2=vv.match(/^(\d{4})(\d{2})(\d{2})$/);
        if(dt2){ const [_,Y,M,D,hh,mm,ss,Z]=dt2; end=Z?new Date(Date.UTC(+Y,+M-1,+D,+hh,+mm,+ss)):new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss)); }
        else if(d2){ const [_,Y,M,D]=d2; end=new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
      }

      out.push({
        start, end,
        summary:  get('SUMMARY'),
        location: get('LOCATION'),
        url:      get('URL'),
        desc:     get('DESCRIPTION')
      });
    }
    out.sort((a,b)=> a.start - b.start);
    return out;
  }

  function groupByWeek(events, baseDate){
    const pr = toTZ(baseDate);
    const sun = startOfDay(addDays(pr,-pr.getDay()));
    const days = [...Array(7)].map((_,i)=> addDays(sun,i));
    const map = new Map(days.map(d=>[startOfDay(d).getTime(), []]));
    for(const ev of events){
      for(const d of days){ if(sameDay(ev.start,d)){ map.get(startOfDay(d).getTime()).push(ev); break; } }
    }
    for(const [k,list] of map){ list.sort((a,b)=> a.start-b.start); }
    return {sun, days, map};
  }

  // === “Campos” desde DESCRIPTION
  function parseDescFields(desc){
    const out = { preacher:'', manager:'', extra:[] };
    if(!desc) return out;
    const lines = String(desc).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    for(const ln of lines){
      const mp = C.fieldsFromDescription?.preacher && ln.match(C.fieldsFromDescription.preacher);
      if(mp && !out.preacher) out.preacher = (mp[2]||'').trim();
      const mm = C.fieldsFromDescription?.manager && ln.match(C.fieldsFromDescription.manager);
      if(mm && !out.manager) out.manager = (mm[2]||'').trim();
    }
  
  const hasPin = (ev)=> /^https?:\/\//i.test(ev.url||'') || /^https?:\/\//i.test(ev.location||'');
  const isTemple = (txt)=> !!txt && (C.templeKeywords||[]).some(k => String(txt).toLowerCase().includes(k.toLowerCase()));
  const hm = d => fmtHm.format(toTZ(d)).toLowerCase().replace(/\s/g,'').replace('a. m.','am').replace('p. m.','pm');
  const qrFor = (url)=> `https://api.qrserver.com/v1/create-qr-code/?size=${C.qrSize||180}x${C.qrSize||180}&data=${encodeURIComponent(url)}`;

  // === Render de tarjetas
  function bannerCard(url, text){
    if(url) return `<div class="center"><img src="${url}" alt="Banner" style="max-width:100%;max-height:50vh;border-radius:14px;box-shadow:var(--shadow)"/></div>`;
    return `<div class="center">
              <div style="display:flex;flex-direction:column;gap:8px">
                <div class="title center">${text||''}</div>
                <div class="muted center" id="rangeCopy"></div>
              </div>
            </div>`;
  }

function dayCard(day, evs){
  const dayName = dateLong(day);
  if(!evs.length){
    return `
      <div class="ev">
        <h2>${dayName}</h2>
        <p class="muted">Sin eventos</p>
      </div>`;
  }

  return `
    <div class="ev">
      <h2>${dayName}</h2>
      ${evs.map(ev=>{
        const end = ev.end ? ' – ' + hm(ev.end) : '';
        const place = ev.location || '';
        const hasPinUrl = firstUrl(ev.url, ev.location);
        const temple = isTemple(ev.location);
        const showQr = hasPinUrl && !temple;
        const qr = showQr ? `<div class="qr center"><img src="${qrFor(hasPinUrl)}" alt="QR localización"></div>` : '';

        return `
          <div class="card-body">
            <div class="tag">${hm(ev.start)}${end}</div>
            <h3>${ev.summary||'Evento'}</h3>
            <p class="muted">${place}</p>
            ${qr}
          </div>
        `;
      }).join('')}
    </div>`;
}

  // === Secuencia (intro → 7 días → outro)
  function buildSequence(week){
    const seq = [];
    if (C.intro?.bannerUrl || C.intro?.text) seq.push({type:'intro'});
    for(let i=0;i<7;i++) seq.push({type:'day', offset:i});
    if (C.outro?.bannerUrl || C.outro?.text) seq.push({type:'outro'});
    return seq;
  }

  // === Estado
  const S = { events:[], week:null, seq:[], idx:0, timer:null };

  async function loadICS(){
    const url = (C.icsUrl||'calendarios/calendario.ics') + (/\?/.test(C.icsUrl)?'&':'?') + 't=' + Date.now();
    const r = await fetch(url, {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const txt = await r.text();
    return parseICS(txt);
  }

  function renderAll(){
    paintClock();

    const prevEl = document.getElementById('cardPrev');
    const currEl = document.getElementById('cardCurr');
    const nextEl = document.getElementById('cardNext');

    const seq = S.seq;
    const i   = S.idx % seq.length;
    const iL  = (i-1+seq.length)%seq.length;
    const iR  = (i+1)%seq.length;

    function renderPos(posIdx){
      const st = seq[posIdx];
      if(st.type==='intro'){ return bannerCard(C.intro.bannerUrl, C.intro.text); }
      if(st.type==='outro'){ return bannerCard(C.outro.bannerUrl, C.outro.text); }
      // día
      const day = S.week.days[st.offset];
      const list = S.week.map.get(startOfDay(day).getTime()) || [];
      return dayCard(day, list);
    }

    prevEl.innerHTML = renderPos(iL);
    currEl.innerHTML = renderPos(i);
    nextEl.innerHTML = renderPos(iR);

    // si la tarjeta central es “intro/outro” sin banner, completar rango debajo del texto
    const rc = document.querySelector('#cardCurr #rangeCopy');
    if (rc){
      const s = S.week.days[0], e = S.week.days[6];
      rc.textContent = `${cap1(fmtShort.format(s))} / ${cap1(fmtShort.format(e))}`;
    }
  }

  function advance(){
    S.idx = (S.idx + 1) % S.seq.length;
    renderAll();
  }

  async function boot(){
    try{
      S.events = await loadICS();
    }catch{ S.events = []; }
    S.week = groupByWeek(S.events, new Date());
    paintWeekRange(S.week);
    S.seq = buildSequence(S.week);
    S.idx = 0;
    renderAll();

    clearInterval(S.timer);
    S.timer = setInterval(advance, C.slideMs||12000);

    setInterval(paintClock, 1000);

    // polling ICS
    setInterval(async ()=>{
      let next = [];
      try{ next = await loadICS(); }catch{}
      if(JSON.stringify(next.map(e=>[e.start?.toISOString(),e.end?.toISOString(),e.summary,e.location,e.url])) !==
         JSON.stringify(S.events.map(e=>[e.start?.toISOString(),e.end?.toISOString(),e.summary,e.location,e.url]))){
        S.events = next;
        S.week = groupByWeek(S.events, new Date());
        paintWeekRange(S.week);
        S.seq = buildSequence(S.week);
        S.idx = 0;
        renderAll();
      }
    }, C.pollMs||300000);
  }

  boot();
})();
