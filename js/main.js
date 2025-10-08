(function(){
  const C = window.CARTELERA_CONFIG || {};

  // === Formato de hora y fecha ===
  const fmtDate = new Intl.DateTimeFormat('es-PR',{weekday:'long', day:'2-digit', month:'long', timeZone:C.timeZone});
  const fmtTime = new Intl.DateTimeFormat('es-PR',{hour:'numeric', minute:'2-digit', hour12:true, timeZone:C.timeZone});
  const toTZ = d => new Date(d.toLocaleString('en-US',{timeZone:C.timeZone}));
  const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);
  const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);
  const sameDay = (a,b)=>{a=toTZ(a);b=toTZ(b);return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};

  const dateLong = d => {
    const s = fmtDate.format(toTZ(d));
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const hm = d => fmtTime.format(toTZ(d)).toLowerCase().replace(/\s/g,'').replace('a.m.','am').replace('p.m.','pm');

  // === Utilidades ===
  function qrFor(url){
    if(!url) return '';
    const u = encodeURIComponent(url);
    const size = C.qrSize||260;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${u}`;
  }
  function isTemple(text){
    if(!text) return false;
    const t = text.toLowerCase();
    return (C.templeKeywords||[]).some(k=>t.includes(k.toLowerCase()));
  }
  function parseDesc(desc){
    const out = {preacher:'', manager:''};
    if(!desc) return out;
    const lines = desc.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    for(const ln of lines){
      const p = C.fieldsFromDescription?.preacher?.exec(ln);
      const m = C.fieldsFromDescription?.manager?.exec(ln);
      if(p && !out.preacher) out.preacher = p[2]||'';
      if(m && !out.manager)  out.manager  = m[2]||'';
    }
    return out;
  }

  // === Leer ICS ===
  function parseICS(txt){
    const unfold = t=>t.replace(/(?:\r\n|\n)[ \t]/g,'');
    txt = unfold(txt);
    const blocks = txt.split(/BEGIN:VEVENT/).slice(1);
    const out = [];
    for(const b0 of blocks){
      const b = 'BEGIN:VEVENT'+b0;
      const get = k=>{
        const m=b.match(new RegExp('^'+k+'(?:;[^:\\n]*)?:(.*)$','mi'));
        return m?m[1].trim():'';
      };
      const ds = get('DTSTART'); if(!ds) continue;
      const d = ds.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
      if(!d) continue;
      const [_,Y,M,D,H,Min]=d;
      const date=new Date(Date.UTC(+Y,+M-1,+D,+H+4,+Min,0));
      out.push({
        start:date,
        summary:get('SUMMARY'),
        location:get('LOCATION'),
        url:get('URL'),
        desc:get('DESCRIPTION')
      });
    }
    out.sort((a,b)=>a.start-b.start);
    return out;
  }

  function groupWeek(events, baseDate){
    const pr = toTZ(baseDate);
    const sun = startOfDay(addDays(pr,-pr.getDay()));
    const days=[...Array(7)].map((_,i)=>addDays(sun,i));
    const map=new Map(days.map(d=>[startOfDay(d).getTime(),[]]));
    for(const ev of events){
      for(const d of days){
        if(sameDay(ev.start,d)) map.get(startOfDay(d).getTime()).push(ev);
      }
    }
    return {days,map};
  }

  // === Estado ===
  let state={events:[],week:null,idx:0,timer:null};

  function renderClock(){
    document.getElementById('clockNow').textContent=fmtTime.format(toTZ(new Date()));
  }

  function renderDay(day){
    const key=startOfDay(day).getTime();
    const list=state.week.map.get(key)||[];
    if(!list.length) return `<div class="card"><div class="date">${dateLong(day)}</div><div class="muted">Sin eventos</div></div>`;

    const parts=list.map(ev=>{
      const time=hm(ev.start);
      const {preacher,manager}=parseDesc(ev.desc);
      const showQr=ev.url && !isTemple(ev.location);
      return `
        <div class="ev">
          <div class="date">${dateLong(day)}</div>
          <div class="tag">${time}</div>
          <div class="title">${ev.summary||'Evento'}</div>
          ${ev.location?`<div class="muted"><strong>Lugar:</strong> ${ev.location}</div>`:''}
          ${manager?`<div class="muted"><strong>Encargado:</strong> ${manager}</div>`:''}
          ${preacher?`<div class="muted"><strong>Predicador:</strong> ${preacher}</div>`:''}
          ${showQr?`<div class="qrwrap"><img src="${qrFor(ev.url)}"></div>`:''}
        </div>`;
    });
    return `<div class="card">${parts.join('<div class="hr"></div>')}</div>`;
  }

  function paint(){
    renderClock();
    const d=state.week.days[state.idx];
    document.getElementById('weekRange').textContent=dateLong(d);
    document.getElementById('board').innerHTML=renderDay(d);
  }

  function advance(){
    state.idx=(state.idx+1)%7;
    paint();
  }

  async function loadICS(){
    const url=C.icsUrl+(C.icsUrl.includes('?')?'&':'?')+'t='+Date.now();
    try{
      const r=await fetch(url,{cache:'no-store'});
      const txt=await r.text();
      state.events=parseICS(txt);
      document.getElementById('status').textContent='ICS OK';
    }catch(e){
      document.getElementById('status').textContent='ICS ERROR';
      console.error(e);
    }
  }

  async function boot(){
    await loadICS();
    state.week=groupWeek(state.events,new Date());
    paint();
    clearInterval(state.timer);
    state.timer=setInterval(advance,C.slideMs||12000);
    setInterval(renderClock,1000);
  }

  boot();
})();
