(function(){
  const C = window.CARTELERA_CONFIG || {};

  const fmtDate = new Intl.DateTimeFormat('es-PR',{weekday:'long', day:'2-digit', month:'long', year:'numeric', timeZone:C.timeZone});
  const fmtTime = new Intl.DateTimeFormat('es-PR',{hour:'numeric', minute:'2-digit', hour12:true, timeZone:C.timeZone});
  const toTZ = d => new Date(d.toLocaleString('en-US',{timeZone:C.timeZone}));
  const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);

  function parseICS(txt){
    const blocks = txt.split(/BEGIN:VEVENT/).slice(1).map(b=>'BEGIN:VEVENT'+b.split('END:VEVENT')[0]);
    const out = [];
    for(const b of blocks){
      const get = (k)=>{ const m=b.match(new RegExp('^'+k+'(?:;[^:\\n]*)?:(.*)$','mi')); return m?m[1].trim():''; };
      const vStart = get('DTSTART');
      const vEnd   = get('DTEND');
      const summary = get('SUMMARY');
      const location = get('LOCATION');
      const desc = get('DESCRIPTION').replace(/\\n|\\r|•/g,' ').replace(/\s+/g,' ').trim();
      const url = get('URL');
      const parseDate = v=>{
        const dt=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
        return dt?new Date(Date.UTC(dt[1],dt[2]-1,dt[3],dt[4],dt[5])):null;
      };
      const start=parseDate(vStart), end=parseDate(vEnd);
      out.push({start,end,summary,location,desc,url});
    }
    return out.sort((a,b)=>a.start-b.start);
  }

  function formatDate(d){ return fmtDate.format(toTZ(d)); }
  function formatTime(d){ return fmtTime.format(toTZ(d)).toLowerCase(); }

  function qr(url){
    if(!url) return '';
    return `<div class="qrwrap"><img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}"></div>`;
  }

  async function loadICS(){
    const r = await fetch(C.icsUrl + '?t=' + Date.now(), {cache:'no-store'});
    const txt = await r.text();
    return parseICS(txt);
  }

  function render(ev){
    const el = document.getElementById('board');
    el.innerHTML = `
      <div class="card">
        <div class="date">${formatDate(ev.start)}</div>
        <div class="title">${ev.summary || 'Evento'}</div>
        <div class="time">${formatTime(ev.start)}${ev.end ? ' — '+formatTime(ev.end) : ''}</div>
        <div class="muted">
          ${ev.location ? '<b>Lugar:</b> '+ev.location+'<br>' : ''}
          ${ev.desc ? ev.desc : ''}
        </div>
        ${ev.url ? qr(ev.url) : ''}
      </div>`;
  }

  function updateClock(){
    document.getElementById('clockNow').textContent = fmtTime.format(toTZ(new Date()));
  }

  (async function(){
    updateClock();
    setInterval(updateClock, 1000);
    const events = await loadICS();
    let i = 0;
    render(events[i]);
    setInterval(()=>{
      i = (i+1) % events.length;
      render(events[i]);
    }, C.slideMs || 12000);
  })();
})();