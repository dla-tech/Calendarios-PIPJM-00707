/* app.js (LIMPIO: sin Firebase / sin notificaciones / sin tokens) */

const $  = (s,r=document)=>r.querySelector(s);
const el = (t,p={})=>Object.assign(document.createElement(t),p);
const cssv=(n,v)=>document.documentElement.style.setProperty(n,v);

/* ───────── Guard ───────── */
(function(){
  const {security}=window.APP_CONFIG||{};
  if(!security) return;
  const host=location.hostname;
  const ok = !security.enforceHostCheck ||
             (security.allowedHosts||[]).some(h=>host===h || host.endsWith('.'+h));
  window.__CFG_ALLOWED = ok;
  if(security.verbose) console.log(ok?'✅ host ok:':'⛔ host bloqueado:', host);
  if(!ok){
    const bar=el('div',{textContent:'Dominio no autorizado para esta configuración.'});
    bar.style.cssText='position:fixed;top:0;left:0;right:0;z-index:999999;padding:8px 12px;background:#b91c1c;color:#fff;font:600 13px system-ui;text-align:center';
    document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(bar));
  }
})();

/* ───────── HOTFIX: loader suave si el index lo mata ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG||{};
  const L   = cfg.loader||{};

  const killerRan = !document.documentElement.classList.contains('loading') ||
                    !document.getElementById('preload-style');
  if (!killerRan) return;

  let s = document.getElementById('preload-style-soft');
  if(!s){
    s = document.createElement('style');
    s.id = 'preload-style-soft';
    s.textContent = 'body > *:not(#loader2){visibility:hidden}';
    document.head.appendChild(s);
  }
  document.documentElement.classList.add('loading');

  let ld = document.getElementById('loader2');
  if(!ld){
    ld = document.createElement('div');
    ld.id = 'loader2';
    ld.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:transparent;z-index:100001;opacity:1;transition:opacity '+(+L.fadeMs||800)+'ms ease';
    if (L.image){
      const img = document.createElement('img');
      img.src = L.image;
      img.alt = 'Cargando';
      img.style.cssText = 'position:absolute;inset:0;width:100vw;height:100vh;object-fit:'+(L.objectFit||'cover')+';object-position:'+(L.objectPosition||'50% 45%');
      ld.appendChild(img);
    }
    document.body.appendChild(ld);
  }

  const MIN  = +L.minVisibleMs || 5000;
  const FADE = +L.fadeMs       || 9000;
  const HARD = (+L.hardFallbackMs || MIN+FADE+2000);
  const start = performance.now();

  function done2(){
    document.documentElement.classList.remove('loading');
    ld.style.opacity = '0';
    setTimeout(()=>{ try{ ld.remove(); }catch(_){ } }, FADE+100);
    document.getElementById('preload-style-soft')?.remove();
  }

  window.addEventListener('load', ()=>{
    const wait = Math.max(0, MIN - (performance.now()-start));
    setTimeout(done2, wait);
  }, {once:true});

  setTimeout(done2, HARD);
})();

/* ───────── Theme/Meta/Loader ───────── */
/* config/config.js */
window.APP_CONFIG = {
  /* ───────── Meta/branding ───────── */
  meta: {
    appName: "Programaciones mensuales",
    themeColor: "#0b1421"
  },

  /* ───────── Seguridad de dominio ───────── */
  security: {
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "dla-tech.github.io"
    ],
    enforceHostCheck: true,
    useBackendForSensitiveWrites: false,
    verbose: true
  },

  /* ───────── Tema / Layout ───────── */
  theme: {
    colors: {
      pageOverlay: "linear-gradient(180deg,rgba(8,11,20,.35),rgba(8,11,20,.6))"
    }
  },
  layout: {
    pageBackground: {
      image: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_7782.jpeg",
      overlay: "linear-gradient(180deg,rgba(8,11,20,.35),rgba(8,11,20,.6))"
    },
    header: {
      bg: "rgba(255,255,255,.55)",
      borderColor: "rgba(0,0,0,.08)",
      glass: { saturate: 1.2, blur: "8px" }
    },
    footer: { text: "© 2025 — Iglesia. Todos los derechos reservados.", color: "#e5e7eb" }
  },

  /* ───────── Assets ───────── */
  assets: {
    loaderImage: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_8023.jpeg",
    pageBackgroundImage: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_7782.jpeg",
    logoRotating: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/Logo%20de%20la%20iglesia%20PIPJM-2.png"
  },

  /* ───────── Loader / Pantalla de carga (Editable) ───────── */
  loader: {
    enabled: true,
    video: "",
    image: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_8023.jpeg",
    poster: "",
    objectFit: "cover",
    objectPosition: "50% 45%",
    minVisibleMs: 4500,
    fadeMs: 600,
    hardFallbackMs: 4500 + 600 + 2000,
    text: { enabled: false }
  },

  /* ───────── Nav / botones de arriba ───────── */
  nav: {
    links: [
      { id: "cal",  label: "Calendarios",           href: "#calendarios" },
      { id: "red",  label: "Redes sociales",        href: "#redes" },
      { id: "tpl",  label: "Ubicación del templo",  href: "#ubicacion-templo" },
      { id: "ctos", label: "Ubicación de los cultos", href: "#ubicacion-cultos" },
      { id: "prop", label: "Propósito",             href: "#proposito" }
    ],
    installButton: {
      id: "btn-install",
      visible: true,
      label: "Descargar App",
      styles: { bg: "#7c3aed", color: "#fff" }
    }
  },

  /* ───────── Calendarios ───────── */
  calendars: {
    google: {
      calendarId: "72086005a3ac9a324642e6977fb8f296d531c3520b03c6cf342495ed215e0186@group.calendar.google.com",
      embedUrl:
        "https://calendar.google.com/calendar/embed?src=72086005a3ac9a324642e6977fb8f296d531c3520b03c6cf342495ed215e0186%40group.calendar.google.com&ctz=America%2FPuerto_Rico&bgcolor=%23f4f7fb&hl=en",
      webUrlPrefix: "https://calendar.google.com/calendar/u/0/r?cid="
    },
    icloudWebcal:
      "webcal://p158-caldav.icloud.com/published/2/MTYyMzg4NDUwMjAxNjIzOFc_RCw-iCOSeM_LMqkWZcQMuX9sTzZF-PyrU9d06Oy4V0VhxUSZVqCmqzUsygyCHgAllfl2DFW34WcFi8EvPD8"
  },

  /* ───────── ICS (martes/miércoles) ───────── */
  ics: {
    url: "https://raw.githubusercontent.com/dla-tech/Media-privada/main/calendarios/calendario.ics",
    timeZone: "America/Puerto_Rico",
    labels: {
      martesPrefix: "Martes",
      miercolesPrefix: "Miércoles"
    },
    cacheBuster: true,
    fallbackTown: "Maunabo, Puerto Rico"
  },

  /* ───────── Promos (JSON externo) ───────── */
  promos: {
    manifestUrl: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/Promo/Promos.json",
    grid: { downloadAllLabel: "⬆️DESCARGAR PROMOS⬆️", titleColor: "#fff" }
  },

  /* ───────── YouTube Live ───────── */
  youtube: {
    handle: "@pipjm9752",
    channelId: "UCIecC8LfuWsK82SnPIjbqGQ"
  },

  /* ───────── PWA / install copy ───────── */
  pwa: {
    install: {
      buttonId: "btn-install",
      fallbackTutorial:
        'Paso 1: Presiona los tres puntos\n\nPaso 2: "Compartir"\n\nPaso 3: "Agregar a Inicio"\n\nPaso 4: "Agregar"',
      shareText: "Instala la app en tu pantalla de inicio"
    }
  },

  /* ───────── Logo fijo girando ───────── */
  floatingLogo: {
    src: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/Logo%20de%20la%20iglesia%20PIPJM-2.png",
    position: { bottom: "20px", left: "20px", width: "80px" },
    spin: { speed: "6s" }
  },

  /* ───────── Mensajes/otros ───────── */
  messages: {
    globalNotice: { enabled: false }
  }
};

/* ───────── Header/Nav + autohide ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG;
  const header = $('#header'); if(!header) return;

  header.style.backdropFilter = `saturate(${cfg.layout?.header?.glass?.saturate||1.2}) blur(${cfg.layout?.header?.glass?.blur||'8px'})`;
  header.style.background = cfg.layout?.header?.bg || 'rgba(255,255,255,.55)';
  header.style.borderBottom = `1px solid ${cfg.layout?.header?.borderColor || 'rgba(0,0,0,.08)'}`;

  const nav=el('nav'); nav.className='nav';
  const spacer=el('div'); spacer.className='spacer'; nav.appendChild(spacer);

  (cfg.nav?.links||[]).forEach(l=>{
    nav.appendChild(el('a',{href:l.href||'#',textContent:l.label||l.id||'Link',className:'navlink'}));
  });

  // Botón de instalar
  const ibCfg = cfg.nav?.installButton;
  const ib = el('a',{id:ibCfg?.id||'btn-install',className:'navlink',href:'#',textContent:ibCfg?.label||'Descargar App'});
  ib.style.background = ibCfg?.styles?.bg || '#7c3aed';
  ib.style.color = ibCfg?.styles?.color || '#fff';
  ib.style.fontWeight = '800';

  nav.append(ib);
  header.innerHTML=''; header.appendChild(nav);

  // autohide
  (function(){
    let lastY=window.scrollY||0, down=0, up=0; const TH=12, MIN_TOP=24;
    window.addEventListener('scroll',()=>{
      const y=window.scrollY||0, d=y-lastY;
      if(d>0){ down+=d; up=0; if(y>MIN_TOP && down>TH) header.classList.add('hide'); }
      else if(d<0){ up+=-d; down=0; if(up>TH) header.classList.remove('hide'); if(y<=0) header.classList.remove('hide'); }
      lastY=y;
    }, {passive:true});
  })();
})();

/* ───────── Calendarios (embed + botones + modal) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG;
  const sec = $('#calendarios'); if(!sec) return;

  const h1=el('h1'); h1.style.cssText='font-size:1.35em;line-height:1.25;font-weight:700;color:#fff;text-align:center;margin:10px 0 14px';
  h1.textContent = "Primera Iglesia Pentecostal de Jesucristo de Maunabo, P.R. Inc.";

  const promosWrap = $('#promos');
  if (promosWrap){
    promosWrap.className = 'promos-wrap';
    promosWrap.style.display = 'none';
    promosWrap.innerHTML = `
      <div id="promoGrid" class="promo-grid" style="--gap:12px;--radius:12px"></div>
      <div class="promo-actions" style="display:flex;justify-content:center;margin:10px 0 16px">
        <button id="btn-descargar-todo" class="promo-dl">${cfg.promos?.grid?.downloadAllLabel||'⬆️DESCARGAR PROMOS⬆️'}</button>
      </div>`;
  }

  const card=el('div'); card.className='card'; card.style.marginBottom='12px';
  const ifr=el('iframe',{src:cfg.calendars?.google?.embedUrl||'',title:'Calendario Google',loading:'lazy',referrerPolicy:'no-referrer-when-downgrade',height:'600'});
  card.appendChild(ifr);

  const grid=el('div'); grid.className='grid cols-3';
  grid.append(
    el('a',{id:'btn-gcal',className:'btn btn-g',href:'#',textContent:'🟢 Añadir en Google Calendar (Android/PC)'}),
    el('a',{id:'btn-ios', className:'btn btn-i', href:'#', textContent:'📱 Añadir en Apple Calendar (iPhone/Mac)'}),
    el('a',{id:'btn-download',className:'btn btn-y',href:'#',textContent:'⬇️ Descargar Google Calendar'})
  );

  const modal = el('div',{id:'gcal-choice',className:'contact-modal'});
  modal.innerHTML = `<div class="modal-content">
    <h3 style="margin:0 0 10px">¿Cómo quieres abrirlo?</h3>
    <a id="gcal-open-web" class="btn btn-g" href="#">🌐 Abrir en la web</a>
    <button id="gcal-open-app" class="btn-d">📱 Abrir en la app</button>
    <button id="gcal-cancel" class="btn-d" style="background:#6b7280">Cancelar</button>
  </div>`;

  const note = el('p'); note.className='card note'; note.style.marginTop='12px';
  note.textContent='📌 Todo cambio en la programación de la iglesia se reflejará automáticamente en tu calendario.';

  sec.innerHTML='';
  if (promosWrap) sec.append(h1, promosWrap, card, grid, modal, note);
  else            sec.append(h1, card, grid, modal, note);

  (function(){
    const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid=/Android/i.test(navigator.userAgent);
    const CAL_ID = cfg.calendars?.google?.calendarId||'';
    const WEB_URL = (cfg.calendars?.google?.webUrlPrefix||'https://calendar.google.com/calendar/u/0/r?cid=') + encodeURIComponent(CAL_ID);
    const ICLOUD = cfg.calendars?.icloudWebcal||'';

    $('#btn-ios')?.addEventListener('click', (e)=>{
      e.preventDefault();
      if(!ICLOUD) return;
      const go=url=>{ if(window.self!==window.top && isIOS) window.top.location.href=url; else location.href=url; };
      go(ICLOUD);
      setTimeout(()=>alert("Si no se abrió el calendario, copia y pega este enlace en Safari:\n"+ICLOUD),2500);
    });

    const choice=$('#gcal-choice'), openWeb=$('#gcal-open-web'), openApp=$('#gcal-open-app'), cancel=$('#gcal-cancel');
    const show=()=>choice&&(choice.style.display='flex'), hide=()=>choice&&(choice.style.display='none');
    $('#btn-gcal')?.addEventListener('click',e=>{e.preventDefault();show();});
    cancel?.addEventListener('click',hide);
    choice?.addEventListener('click',e=>{ if(e.target===choice) hide(); });
    openWeb?.addEventListener('click',e=>{
      e.preventDefault(); hide();
      try{ const w=window.open(WEB_URL,'_blank','noopener'); if(!w) location.href=WEB_URL; }catch(_){ location.href=WEB_URL; }
    });
    openApp?.addEventListener('click',e=>{
      e.preventDefault(); hide();
      const go=u=>{ if(window.self!==window.top) window.top.location.href=u; else location.href=u; };
      if(isAndroid){
        const intent='intent://calendar.google.com/calendar/r?cid='+encodeURIComponent(CAL_ID)+'#Intent;scheme=https;package=com.google.android.calendar;S.browser_fallback_url='+encodeURIComponent(WEB_URL)+';end';
        let f=false; const fin=()=>{ if(f) return; f=true; clearTimeout(t1); clearTimeout(t2); };
        go(intent);
        const onHidden=()=>fin(); window.addEventListener('pagehide',onHidden,{once:true});
        document.addEventListener('visibilitychange',()=>{ if(document.hidden) fin(); },{once:true});
        window.addEventListener('blur',onHidden,{once:true});
        const t1=setTimeout(()=>{ if(!f && !document.hidden) go(WEB_URL); },2200);
        const t2=setTimeout(()=>{ if(!f && !document.hidden) go('https://play.google.com/store/apps/details?id=com.google.android.calendar'); },4500);
      }else go(WEB_URL);
    });

    $('#btn-download')?.addEventListener('click',e=>{
      e.preventDefault();
      if(isAndroid) location.href='https://play.google.com/store/apps/details?id=com.google.android.calendar';
      else if(isIOS) location.href='https://apps.apple.com/app/google-calendar/id909319292';
      else location.href='https://calendar.google.com/';
    });
  })();
})();

/* ───────── Secciones estáticas: templo+propósito ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const t = $('#ubicacion-templo');
  if(t){
    t.innerHTML = `
      <h2>Ubicación del templo</h2>
      <div class="card">
        <p><strong>Dirección:</strong> <a href="https://maps.app.goo.gl/4R9ZXAmw1ZcnBTL49?g_st=ipc" target="_blank" rel="noopener">Ver en Google Maps</a></p>
        <a href="https://maps.app.goo.gl/4R9ZXAmw1ZcnBTL49?g_st=ipc" target="_blank" rel="noopener">
          <img src="https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_7782.jpeg" alt="Ubicación del templo" style="width:100%; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,.25)">
        </a>
      </div>`;
  }
  const p = $('#proposito');
  if(p){
    p.innerHTML = `
      <h2>Propósito</h2>
      <div class="card">
        <p><strong>Nuestro propósito</strong> es: “Llevar el evangelio a toda criatura, dar un mensaje de esperanza, mostrar el amor de Dios al mundo y ayudar al necesitado.”</p>
        <h3 style="margin-top:16px; font-size:1.1em; color:#0b1421;">Horarios de cultos y actividades</h3>
        <ul class="list">
          <li><strong>Lunes:</strong> Culto de oración en el templo — 7:00 p.m.</li>
          <li><strong>Martes y Miércoles:</strong> Cultos evangelísticos en Maunabo y lugares limítrofes — 7:00 p.m.</li>
          <li><strong>Jueves:</strong> Culto de la Sociedad de Niños, oración o estudio bíblico — 7:00 p.m.</li>
          <li><strong>Viernes:</strong> Culto de las Sociedades de Damas, Caballeros y Jóvenes — 7:00 p.m.</li>
          <li><strong>Sábado:</strong> Altar familiar. (Una vez al mes, ayuno congregacional) — 6:00 a.m.</li>
          <li><strong>Domingo:</strong>
            <ul>
              <li>Oración/Ayuno — desde las 6:00 a.m.</li>
              <li>Apertura de Escuela Bíblica — 8:45 a.m.</li>
              <li>Cierre de Escuela Bíblica — 10:45 a.m.</li>
              <li>Comienzo del culto de adoración — 11:15 a.m.</li>
            </ul>
          </li>
        </ul>
      </div>`;
  }
})();

/* ───────── ICS (martes/miércoles) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg=window.APP_CONFIG;
  const ICS_URL = cfg.ics?.url; if(!ICS_URL) return;
  const TZ = cfg.ics?.timeZone || 'America/Puerto_Rico';

  const toPR = d => new Date(d.toLocaleString('en-US',{timeZone:TZ}));
  const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);
  const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);
  const sameDayPR = (a,b)=>{a=toPR(a);b=toPR(b);return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};
  const unfold = txt => txt.replace(/(?:\r\n|\n)[ \t]/g,'');

  (async function load(){
    try{
      const res=await fetch(ICS_URL+'?t='+(Date.now()), {cache:'no-store'}); if(!res.ok) throw new Error('HTTP '+res.status);
      const txt = unfold(await res.text());
      const blocks = txt.split(/BEGIN:VEVENT/).slice(1).map(b=>'BEGIN:VEVENT'+b.split('END:VEVENT')[0]);

      const now=new Date(), pr=toPR(now), sunday=startOfDay(addDays(pr,-pr.getDay()));
      const tue=addDays(sunday,2), wed=addDays(sunday,3);

      function getLineVal(block, prop){ const m = block.match(new RegExp('^'+prop+'(?:;[^:\\n]*)?:(.*)$','mi')); return m?m[1].trim():null; }
      function parseDTSTART(block){
        const m = block.match(/^DTSTART([^:\n]*)?:([^\n]+)$/mi); if(!m) return null;
        const params=(m[1]||'').toUpperCase(); const val=m[2].trim();
        const dOnly=val.match(/^(\d{4})(\d{2})(\d{2})$/);
        if(/VALUE=DATE/.test(params) && dOnly){ const [_,Y,M,D]=dOnly; return new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
        const dt=val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
        if(dt){ const [_,Y,M,D,hh,mm,ss,Z]=dt; if(/TZID=AMERICA\/PUERTO_RICO/.test(params)) return new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss)); if(Z) return new Date(Date.UTC(+Y,+M-1,+D,+hh,+mm,+ss)); return new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss)); }
        if(dOnly){ const [_,Y,M,D]=dOnly; return new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
        return null;
      }

      let tueEv=null, wedEv=null;
      for(const ev of blocks){
        const dt=parseDTSTART(ev); if(!dt) continue;
        const obj={summary:getLineVal(ev,'SUMMARY'), location:getLineVal(ev,'LOCATION'), url:getLineVal(ev,'URL')};
        if(!tueEv && sameDayPR(dt,tue)) tueEv=obj;
        if(!wedEv && sameDayPR(dt,wed)) wedEv=obj;
        if(tueEv && wedEv) break;
      }

      const cultos = $('#ubicacion-cultos'); if(!cultos) return;
      cultos.innerHTML = `
        <h2>Ubicación de cultos evangelísticos</h2>
        <div class="card">
          <p>Algunos servicios se realizan en ubicaciones distintas:</p>
          <div class="grid cols-2">
            <div>
              <p class="subhead"><span id="lbl-martes">${(cfg.ics?.labels?.martesPrefix||'Martes')} ${tue.getDate()}</span></p>
              <p><strong id="title-martes">Culto evangelístico</strong><br><span id="addr-martes">(dirección)</span></p>
              <iframe height="260" loading="lazy" title="Culto martes"></iframe>
            </div>
            <div>
              <p class="subhead"><span id="lbl-miercoles">${(cfg.ics?.labels?.miercolesPrefix||'Miércoles')} ${wed.getDate()}</span></p>
              <p><strong id="title-miercoles">Culto evangelístico</strong><br><span id="addr-miercoles">(dirección)</span></p>
              <iframe height="260" loading="lazy" title="Culto miércoles"></iframe>
            </div>
          </div>
        </div>`;

      if($('#title-martes') && tueEv?.summary) $('#title-martes').textContent=tueEv.summary;
      if($('#title-miercoles') && wedEv?.summary) $('#title-miercoles').textContent=wedEv.summary;
      if($('#addr-martes') && tueEv?.location) $('#addr-martes').textContent=tueEv.location;
      if($('#addr-miercoles') && wedEv?.location) $('#addr-miercoles').textContent=wedEv.location;

      const tIframe = $('#ubicacion-cultos .grid.cols-2 > div:nth-child(1) iframe');
      const wIframe = $('#ubicacion-cultos .grid.cols-2 > div:nth-child(2) iframe');

      function normalizeLocation(raw){
        if(!raw) return 'Maunabo, Puerto Rico';
        let txt=String(raw).split(/[-–—/|]/).pop().trim();
        txt=txt.replace(/\s*\(.*?\)\s*/g,' ').replace(/\s{2,}/g,' ').trim();
        const municipios=['Maunabo','Emajagua','Yabucoa','Humacao','Las Piedras','Patillas','Guayama','San Lorenzo'];
        const has=municipios.some(m=>new RegExp(`\\b${m}\\b`,'i').test(txt));
        if(has){ if(!/puerto\s*rico/i.test(txt)) txt+=', Puerto Rico'; return txt; }
        return `${txt}, ${window.APP_CONFIG?.maps?.defaultTownFallback||'Maunabo, Puerto Rico'}`;
      }
      function setMap(iframeEl, locationText, pinUrl){
        if(!iframeEl) return;
        const q=normalizeLocation(locationText);
        iframeEl.src='https://www.google.com/maps?output=embed&q='+encodeURIComponent(q);
        iframeEl.title='Mapa: '+q;
        let overlay = iframeEl.parentElement.querySelector('.map-overlay');
        if(!overlay){
          overlay = el('a'); overlay.className='map-overlay'; overlay.target='_blank'; overlay.rel='noopener';
          overlay.style.cssText='position:absolute;inset:0;z-index:5;';
          const holder=iframeEl.parentElement; const cs=getComputedStyle(holder);
          if(cs.position==='static') holder.style.position='relative'; holder.appendChild(overlay);
        }
        overlay.href = pinUrl || ('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q));
      }
      setMap(tIframe, tueEv?.location, tueEv?.url||null);
      setMap(wIframe, wedEv?.location, wedEv?.url||null);
    }catch(e){ console.error('No se pudo cargar el ICS:', e); }
  })();
})();

/* ───────── YouTube live ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG;
  const sec = $('#redes'); if(!sec) return;

  const h2 = el('h2',{textContent:'Redes sociales'});
  const card = el('div'); card.className='card';
  const box  = el('div'); box.className='grid cols-1';

  const btn = el('a',{
    className:'btn btn-yt',
    href:`https://youtube.com/${(cfg.youtube?.handle||'@pipjm9752')}`,
    target:'_blank', rel:'noopener',
    textContent:'▶️ YouTube'
  });

  const liveWrap = el('div',{id:'live-wrap',className:'live-wrap'});
  liveWrap.innerHTML = `
    <div class="live-head"><span class="live-dot"></span> EN VIVO AHORA</div>
    <div class="live-player" id="live-player"></div>
    <a id="live-cta" class="live-cta" href="#" target="_blank" rel="noopener">Ver en YouTube</a>
  `;

  const mail = el('a',{
    className:'btn btn-d',
    href:'mailto:pipjm1@gmail.com',
    textContent:'✉️ pipjm1@gmail.com'
  });

  box.append(btn, liveWrap, mail);
  card.appendChild(box);
  sec.innerHTML='';
  sec.append(h2,card);

  const handle  = cfg.youtube?.handle || '@pipjm9752';
  const liveUrl = `https://www.youtube.com/${handle.replace(/^@/,'@')}/live`;
  $('#live-cta').href = liveUrl;

  if (cfg.youtube?.channelId) {
    liveWrap.style.display = 'block';
    const src = `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(cfg.youtube.channelId)}&autoplay=1&mute=1&rel=0&modestbranding=1`;
    $('#live-player').innerHTML = `
      <iframe src="${src}"
              title="YouTube live"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen></iframe>`;

    setTimeout(() => {
      const ifr = $('#live-player iframe');
      if (!ifr || !ifr.contentWindow) {
        liveWrap.style.display = 'block';
      }
    }, 4000);
  } else {
    liveWrap.style.display = 'block';
    $('#live-player').innerHTML = '';
  }
})();

/* ───────── Promos (JSON) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const url = window.APP_CONFIG?.promos?.manifestUrl; if(!url) return;
  const section = $('#promos'); const grid = el('div',{id:'promoGrid',className:'promo-grid'});
  section.innerHTML=''; section.appendChild(grid);
  const actions=el('div',{className:'promo-actions'});
  const btnAll=el('button',{id:'btn-descargar-todo',className:'promo-dl',textContent:(window.APP_CONFIG?.promos?.grid?.downloadAllLabel)||'⬆️DESCARGAR PROMOS⬆️'});
  actions.appendChild(btnAll);
  section.appendChild(actions);

  function computeMinWidthByCount(n){
    if(n===1) return '340px';
    if(n===2) return '280px';
    if(n<=4) return '240px';
    if(n<=6) return '200px';
    if(n<=9) return '180px';
    return '160px';
  }

  function render(promos){
    section.classList.toggle('one',promos.length===1);
    section.classList.toggle('two',promos.length===2);
    section.classList.toggle('many',promos.length>=3);

    const minW = computeMinWidthByCount(promos.length);
    grid.style.setProperty('--min', minW);
    grid.style.display='grid';
    grid.style.gridTemplateColumns='repeat(auto-fill, minmax(var(--min), 1fr))';
    grid.style.gap='12px';

    grid.innerHTML = promos.map((p,i)=>`
      <article class="promo-card" data-index="${i}" style="width:var(--min);max-width:100%;overflow:hidden">
        <a class="promo-link" href="${p.img}" data-filename="${p.filename || `promo-${i+1}.jpg`}" download style="display:block">
          <div class="promo-media">
            <img src="${p.img}" alt="${p.title?p.title:`Promoción ${i+1}`}"
                 loading="lazy" decoding="async"
                 style="display:block;width:100%;height:auto;border-radius:12px" />
          </div>
        </a>
        ${p.title?`<div class="promo-title" style="padding:6px 4px 0;font:600 14px system-ui;text-align:center">${p.title}</div>`:''}
      </article>`).join('');

    section.style.display = promos.length?'block':'none';

    btnAll.onclick = async ()=>{
      for(const p of promos){ await downloadImage(p.img, p.filename||'promocion.jpg'); }
    };
    grid.addEventListener('click', (e)=>{
      const a=e.target.closest('a.promo-link'); if(!a) return;
      e.preventDefault();
      downloadImage(a.href, a.dataset.filename||'promocion.jpg');
    });
  }

  async function downloadImage(url, filename){
    try{
      const res=await fetch(url,{cache:'no-store'}); if(!res.ok) throw new Error('HTTP '+res.status);
      const blob=await res.blob(); const o=URL.createObjectURL(blob);
      const a=el('a',{href:o,download:filename}); document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(o);
    }catch{
      const a=el('a',{href:url,download:filename}); document.body.appendChild(a); a.click(); a.remove();
    }
  }

  (async function load(){
    try{
      const res=await fetch(url+'?t='+Date.now(),{cache:'no-store'}); if(!res.ok) throw new Error('HTTP '+res.status);
      const data=await res.json();
      const activos=(data||[]).filter(p=>p.active).sort((a,b)=>(a.order||0)-(b.order||0));
      const promos=activos.map((p,i)=>({title:p.title||'',img:p.imageUrl||'',filename:p.filename||`promo-${(p.order||i)+1}.jpg`})).filter(p=>!!p.img);
      render(promos);
    }catch(e){ console.error('No se pudo cargar Promos.json:', e); }
  })();
})();

/* === PWA install — compacto, draggable, con minimizar (Android+iOS) === */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};
  const btn = document.getElementById((cfg.pwa?.install?.buttonId)||'btn-install');
  if(!btn) return;

  const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone===true);
  if (isStandalone){ btn.style.display='none'; return; }

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS     = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  let deferredPrompt = window.__deferredPrompt || null;
  window.addEventListener('beforeinstallprompt', (e)=>{
    try{ e.preventDefault(); }catch(_){}
    deferredPrompt = e;
    window.__deferredPrompt = e;
    btn.style.display = '';
    btn.disabled = false;
  });

  let widget = null;
  function ensureWidget(){
    if (widget) return widget;
    const w = document.createElement('div');
    w.id = 'pwa-mini-widget';
    w.style.cssText = `
      position:fixed; right:14px; bottom:14px; z-index:100000;
      width: 300px; max-width: 92vw;
      font: 400 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial;
      color:#111;
    `;
    w.innerHTML = `
      <div id="pwa-card" style="
        background:#fff; border:1px solid #e5e7eb; border-radius:12px;
        box-shadow:0 8px 22px rgba(0,0,0,.18);
      ">
        <div id="pwa-head" style="
          cursor:move; display:flex; align-items:center; gap:8px;
          padding:8px 10px; border-bottom:1px solid #eef0f2; background:#f9fafb; border-radius:12px 12px 0 0;
        ">
          <strong style="font:700 13px system-ui">Instalar app</strong>
          <span style="margin-left:auto"></span>
          <button id="pwa-min" title="Minimizar" style="border:0;background:#e5e7eb;border-radius:8px;padding:4px 8px">–</button>
          <button id="pwa-close" title="Cerrar" style="border:0;background:#e11d48;color:#fff;border-radius:8px;padding:4px 8px">×</button>
        </div>
        <div id="pwa-body" style="padding:10px 10px 8px 10px"></div>
        <div id="pwa-cta" style="display:flex;gap:8px;justify-content:flex-end;padding:8px 10px;border-top:1px solid #eef0f2">
          <button id="pwa-back"  style="display:none;border:0;background:#e5e7eb;border-radius:8px;padding:6px 10px">Atrás</button>
          <button id="pwa-next"  style="border:0;background:#111;color:#fff;border-radius:8px;padding:6px 10px">Siguiente</button>
        </div>
      </div>
      <button id="pwa-pill" style="
        display:none; position:absolute; right:0; bottom:0; transform:translate(0,0);
        border:1px solid #e5e7eb; background:#fff; border-radius:20px;
        padding:7px 10px; box-shadow:0 6px 16px rgba(0,0,0,.15); font-weight:600;
      ">Instalar app ⤴</button>
    `;
    document.body.appendChild(w);

    function makeDraggable(handle){
      let sx=0, sy=0, dragging=false;
      const onDown = (ev)=>{
        dragging=true;
        sx = (ev.touches?ev.touches[0].clientX:ev.clientX);
        sy = (ev.touches?ev.touches[0].clientY:ev.clientY);
        ev.preventDefault();
      };
      const onMove = (ev)=>{
        if(!dragging) return;
        const cx = (ev.touches?ev.touches[0].clientX:ev.clientX);
        const cy = (ev.touches?ev.touches[0].clientY:ev.clientY);
        const dx = cx - sx, dy = cy - sy;
        const nr = Math.max(6, 14 - dx);
        const nb = Math.max(6, 14 - dy);
        w.style.right  = nr + 'px';
        w.style.bottom = nb + 'px';
      };
      const onUp = ()=>{ dragging=false; };
      handle.addEventListener('mousedown',onDown,{passive:false});
      handle.addEventListener('touchstart',onDown,{passive:false});
      window.addEventListener('mousemove',onMove,{passive:false});
      window.addEventListener('touchmove',onMove,{passive:false});
      window.addEventListener('mouseup',onUp,{passive:true});
      window.addEventListener('touchend',onUp,{passive:true});
    }

    makeDraggable(w.querySelector('#pwa-head'));
    makeDraggable(w.querySelector('#pwa-pill'));

    const card = w.querySelector('#pwa-card');
    const pill = w.querySelector('#pwa-pill');
    w.querySelector('#pwa-min').onclick = ()=>{ card.style.display='none'; pill.style.display='inline-block'; };
    w.querySelector('#pwa-close').onclick= ()=>{ w.style.display='none'; };
    pill.onclick = ()=>{ pill.style.display='none'; card.style.display='block'; };

    widget = w;
    return w;
  }

  function getIOSMajorVersion(){
    const ua = navigator.userAgent || '';
    const m = ua.match(/OS (\d+)[._]\d+/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function stepsFor(platform){
    if (platform === 'ios') {
      const v = getIOSMajorVersion();
      if (v === 18) {
        return [
          'Paso 1: Presiona "compartir" <strong>Compartir</strong> (cuadrado con flecha hacia arriba).',
          'Paso 2: Desliza hacia abajo hasta encontrar "agregar a inicio" .',
          'Paso 3: Confirma el nombre "PIPJM" <strong>“Agregar a Inicio”</strong>.',
          'Paso 4: Arriba a la derecha presiona agregar <strong>“Agregar”</strong> (botón azul).'
        ];
      }
      if (v >= 26) {
        return [
          'Paso 1: Toca los tres puntos <strong>tres puntos</strong> (⋮).',
          'Paso 2: Presiona compartir <strong>Compartir</strong>.',
          'Paso 3: Desliza hacia abajo y presiona "agregar a inicio" <strong>“Agregar a Inicio”</strong>.',
          'Paso 4: Arriba a la derecha presiona "agregar" <strong>“Agregar”</strong> (botón azul).'
        ];
      }
      return [
        'Paso 1: Toca el botón <strong>Compartir</strong>.',
        'Paso 2: Desliza hacia abajo.',
        'Paso 3: Presiona <strong>“Agregar a Inicio”</strong>.',
        'Paso 4: Presiona <strong>Agregar</strong> arriba a la derecha.'
      ];
    }
    return [
      'Paso 1: Toca el menú ⋮ (arriba derecha).',
      'Paso 2: Presiona “Agregar a la pantalla de inicio”.',
      'Paso 3: Confirma en el diálogo.',
      'Listo: La app quedará en tu pantalla de inicio.'
    ];
  }

  function openGuide(platform){
    const w = ensureWidget();
    w.style.display = 'block';
    const body = w.querySelector('#pwa-body');
    const back = w.querySelector('#pwa-back');
    const next = w.querySelector('#pwa-next');

    const steps = stepsFor(platform);
    let idx = 0;
    const done = steps.map(()=>false);

    function paint(){
      body.innerHTML = `
        <ol style="margin:0;padding-left:18px">
          ${steps.map((s,i)=>{
            const ok = done[i], active = (i===idx);
            const color = ok ? '#059669' : active ? '#111' : '#6b7280';
            const icon = ok ? '✔︎ ' : '';
            return `<li style="margin:6px 0;color:${color};${active?'font-weight:700':''}">${icon}${s}</li>`;
          }).join('')}
        </ol>
        ${
          (platform!=='ios' && deferredPrompt)
          ? `<div style="margin-top:8px">
               <button id="pwa-try" style="border:0;background:#2563eb;color:#fff;border-radius:8px;padding:6px 10px">Probar instalar ahora</button>
             </div>`
          : ''
        }
        <div style="margin-top:6px;color:#6b7280;font-size:12px">Puedes arrastrar este recuadro donde te quede cómodo.</div>
      `;
      back.style.display = (idx>0)?'':'none';
      next.textContent   = (idx<steps.length-1)?'Siguiente':'Listo';

      const tryBtn = body.querySelector('#pwa-try');
      if (tryBtn){
        tryBtn.onclick = async ()=>{
          if (!deferredPrompt) return;
          try{ deferredPrompt.prompt(); await deferredPrompt.userChoice; }catch(_){}
          deferredPrompt = null; window.__deferredPrompt = null;
        };
      }
    }

    back.onclick = ()=>{ if(idx>0){ idx--; paint(); } };
    next.onclick = ()=>{
      done[idx] = true;
      if (idx < steps.length-1) { idx++; paint(); }
      else { w.style.display='none'; }
    };

    paint();
  }

  btn.addEventListener('click', async (e)=>{
    e.preventDefault();

    const isStandaloneNow = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone===true);
    if (isStandaloneNow) return;

    if (isAndroid && deferredPrompt){
      try{ deferredPrompt.prompt(); await deferredPrompt.userChoice; }catch(_){}
      deferredPrompt = null; window.__deferredPrompt = null;
      return;
    }

    openGuide(isIOS ? 'ios' : 'android');
  });

  window.addEventListener('appinstalled', ()=>{ btn.style.display='none'; });
})();

/* ───────── Logo giratorio ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg=window.APP_CONFIG;
  const logo=$('#floating-logo'); if(!logo) return;

  const src = cfg.floatingLogo?.src || cfg.assets?.logoRotating || '';
  if(src){
    logo.src = src;
    logo.onerror = ()=>{ logo.style.display='none'; };
  }else{
    logo.style.display='none';
  }
  const p=cfg.floatingLogo?.position||{};
  if(p.bottom) logo.style.bottom=p.bottom;
  if(p.left)   logo.style.left=p.left;
  if(p.width)  logo.style.width=p.width;
  if(cfg.floatingLogo?.spin?.speed) logo.style.animationDuration=cfg.floatingLogo.spin.speed;
})();

/* ───────── Banner flotante de anuncio (versión directa y estable, X centrada) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;

  const promoText = ``.trim();
  const promoImage = "https://raw.githubusercontent.com/dla-tech/Media-privada/main/IMG_8023.jpeg";
  if(!promoText) return;

  const overlay = document.createElement('div');
  overlay.id = 'promo-overlay';
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:100000;
    background:rgba(0,0,0,.75);
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:20px;
    animation:fadeIn .3s ease;
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    position:relative;
    background:#fff;
    max-width:600px; width:90%;
    border-radius:16px;
    box-shadow:0 10px 40px rgba(0,0,0,.45);
    overflow:hidden;
    font:500 18px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial;
    text-align:center;
    color:#111;
  `;

  if(promoImage){
    const bg = document.createElement('img');
    bg.src = promoImage;
    bg.alt = "";
    bg.loading = "lazy";
    bg.style.cssText = `
      position:absolute; inset:0;
      width:100%; height:100%;
      object-fit:cover;
      filter:brightness(0.45) blur(1px);
      z-index:0;
    `;
    card.appendChild(bg);
  }

  const textBox = document.createElement('div');
  textBox.innerHTML = promoText.replace(/\n/g,'<br>');
  textBox.style.cssText = `
    position:relative; z-index:1;
    padding:28px 16px 34px;
    color:#fff;
    font-weight:600;
    text-shadow:0 2px 4px rgba(0,0,0,.4);
  `;
  card.appendChild(textBox);

  const close = document.createElement('button');
  close.textContent = '✕';
  close.setAttribute('aria-label','Cerrar anuncio');
  close.style.cssText = `
    margin-top:18px;
    border:0;
    background:#e11d48;
    color:#fff;
    font-size:20px;
    font-weight:700;
    border-radius:50%;
    width:50px; height:50px;
    cursor:pointer;
    box-shadow:0 4px 12px rgba(0,0,0,.4);
  `;

  close.addEventListener('click',()=>{
    overlay.style.opacity='0';
    overlay.style.transition='opacity .3s ease';
    setTimeout(()=>overlay.remove(),300);
  });

  overlay.appendChild(card);
  overlay.appendChild(close);
  document.body.appendChild(overlay);
})();
