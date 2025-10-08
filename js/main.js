(function(){
  const C = window.CARTELERA_CONFIG;
  const fmtDate = new Intl.DateTimeFormat('es-PR',{weekday:'long', day:'2-digit', month:'long', year:'numeric', timeZone:C.timeZone});
  const fmtTime = new Intl.DateTimeFormat('es-PR',{hour:'numeric', minute:'2-digit', hour12:true, timeZone:C.timeZone});
  const toTZ = d => new Date(d.toLocaleString('en-US',{timeZone:C.timeZone}));
  const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);
  const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);

  function qrFor(url){
    if(!url) return '';
    const u = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${C.qrSize}x${C.qrSize}&data=${u}`;
  }
  function isTemple(text){
    if(!text) return false;
    const t = String(text).toLowerCase();
    return (C.templeKeywords||[]).some(k => t.includes(k.toLowerCase()));
  }
  function parseDesc(desc){
    const out = {preacher:'', manager:''};
    if(!desc) return out;
    const lines = String(desc).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    for(const ln of lines){
      const mP = ln.match(C.fieldsFromDescription.preacher);
      if(mP && !out.preacher) out.preacher = (mP[2]||'').trim();
      const mM = ln.match(C.fieldsFromDescription.manager);
      if(mM && !out.manager) out.manager = (mM[2]||'').trim();
    }
    return out;
  }

  function parseICS(txt){
    const blocks = txt.split(/BEGIN:VEVENT/).slice(1).map(b=>'BEGIN:VEVENT'+b.split('END:VEVENT')[0]);
    const out = [];
    for(const b of blocks){
      const get = k=>{ const m=b.match(new RegExp('^'+k+'(?:;[^:\\n]*)?:(.*)$','mi')); return m?m[1].trim():''; };
      const v = get('DTSTART'); if(!v) continue;
      const dt=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
      const d=new Date(Date.UTC(+dt[1],+dt[2]-1,+dt[3],+dt[4]+4,+dt[5]));
      out.push({start:d, end:null, summary:get('SUMMARY'), location:get('LOCATION'), url:get('URL'), desc:get('DESCRIPTION')});
    }
    return out.sort((a,b)=>a.start-b.start);
  }

  function groupWeek(events){
    const base=new Date(), sunday=startOfDay(addDays(base,-base.getDay()));
    const days=[...Array(7)].map((_,i)=>addDays(sunday,i));
    const map=new Map(days.map(d=>[startOfDay(d).getTime(),[]]));
    for(const ev of events){
      for(const d of days){
        if(startOfDay(ev.start).getTime()===startOfDay(d).getTime()){
          map.get(startOfDay(d).getTime()).push(ev);
        }
      }
    }
    return {days,map};
  }

  async function loadICS(){
    const r = await fetch(C.icsUrl + '?t='+Date.now(), {cache:'no-store'});
    const txt = await r.text();
    return parseICS(txt);
  }

  function paintWeek(events){
    const week = groupWeek(events);
    const board = document.getElementById('board');
    board.innerHTML='';
    const rangeTxt = `${fmtDate.format(week.days[0])} / ${fmtDate.format(week.days[6])}`;
    document.getElementById('weekRange').textContent=rangeTxt;

    for(const day of week.days){
      const list = week.map.get(startOfDay(day).getTime());
      const card = document.createElement('div');
      card.className='dayCard';
      card.innerHTML=`<div class="dayTitle">${fmtDate.format(day)}</div>`;

      if(!list.length){ card.innerHTML+=`<div class="eventMeta">Sin eventos</div>`; }
      else{
        for(const ev of list){
          const {preacher,manager}=parseDesc(ev.desc);
          const showQr = ev.url && !isTemple(ev.location);
          const qr = showQr ? `<div class="qrwrap"><img src="${qrFor(ev.url)}"></div>` : '';
          card.innerHTML+=`
            <div class="event">
              <div class="eventTime">${fmtTime.format(toTZ(ev.start))}</div>
              <div class="eventTitle">${ev.summary||'Evento'}</div>
              ${manager?`<div class="eventMeta"><strong>Encargado:</strong> ${manager}</div>`:''}
              ${preacher?`<div class="eventMeta"><strong>Predicador:</strong> ${preacher}</div>`:''}
              ${qr}
            </div>`;
        }
      }
      board.appendChild(card);
    }
  }

  async function boot(){
    const evs = await loadICS();
    paintWeek(evs);
    setInterval(async()=>paintWeek(await loadICS()), C.pollMs);
    setInterval(()=>{document.getElementById('clockNow').textContent=fmtTime.format(new Date());},1000);
  }
  boot();
})();