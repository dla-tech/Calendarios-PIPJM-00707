// config/config.js
(function(){
  // Construye una URL absoluta correcta incluso en subpaths (GitHub Pages)
  const ICS_URL = new URL('./calendarios/calendario.ics', location.href).href;

  const CFG = {
    // === Fuente de datos ===
    icsUrl: ICS_URL,
    timeZone: 'America/Puerto_Rico',

    // === Ciclo y polling ===
    slideMs: 12000,        // cambia de tarjeta/evento cada 12s
    pollMs:  5*60*1000,    // re-lee el ICS cada 5 min
    qrSize:  240,          // tamaño del QR

    // === Cambio de semana automático (domingo 00:00) ===
    weekRolloverDay: 0,    // 0=domingo
    weekRolloverHour: 0,   // 00:00

    // === Pantallas de intro/outro ===
    intro: {
      bannerUrl: '', // ej. 'https://…/portada.jpg'
      text: '📖 Dios les bendiga — Calendario de la semana'
    },
    outro: {
      bannerUrl: '', // ej. 'https://…/despedida.jpg'
      text: ''       // ej. 'Felicidades a nuestros pastores'
    },

    // === Apariencia (puedes cambiar en caliente) ===
    theme: {
      background: '#0b1421',
      card:       '#0f1b2c',
      text:       '#e6eefc',
      muted:      '#93a4bf',
      accent:     '#16a34a',
      warn:       '#ef4444',
      shadow:     '0 20px 50px rgba(0,0,0,.35)',
      fontSize:   22,   // base
      bigClock:   64,   // reloj grande
      h1:         42,
      h2:         28
    },

    // === Etiquetas varias ===
    labels: {
      dayPrefix: '' // se usa en la pantalla de rango de semana
    },

    // === Reglas para detectar “Templo” (no mostrar QR) ===
    templeKeywords: ['templo', 'iglesia', 'santuario'],

    // === Si usas Predicador/Encargado en DESCRIPTION, extrae así ===
    fieldsFromDescription: {
      // Predicador: Juan Pérez
      preacher: /(predicador|predica)\s*:?\s*(.+)/i,
      // Encargado: Hno. Luis
      manager: /(encargad[oa])\s*:?\s*(.+)/i
    },

    // === Defaults por día cuando no viene nada en el ICS ===
    // Índices: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
    defaultsByWeekday: {
      0: [ // Domingo
        { title:'Oración/Ayuno', start:'06:00', end:'08:45', where:'Templo' },
        { title:'Apertura de Escuela Bíblica', start:'08:45', end:'10:45', where:'Templo' },
        { title:'Receso', start:'10:45', end:'11:15', where:'Templo' },
        { title:'Comienzo del culto de adoración', start:'11:30', where:'Templo', desc:'' }
      ],
      1: [ // Lunes
        { title:'Culto de oración', start:'19:00', where:'Templo' }
      ],
      2: [ // Martes
        // Se llenará desde ICS; si no hay, puedes poner un default ejemplo:
        // { title:'Culto evangelístico — Sección II', start:'19:00', where:'(pin por ICS)', desc:'' }
      ],
      3: [ // Miércoles
        // Igual que martes
      ],
      4: [ // Jueves
        { title:'Sociedad de Niños / Estudio bíblico / Oración', start:'19:00', where:'Templo' }
      ],
      5: [ // Viernes
        { title:'Sociedad Damas / Caballeros / Jóvenes', start:'19:00', where:'Templo' }
      ],
      6: [ // Sábado
        // { title:'Ayuno congregacional', start:'06:00', where:'Templo' }
        { title:'Altar familiar', where:'Todo el día' }
      ]
    },

    // === Descanso programado (sleep) — la lógica ya está en main.js ===
    rest: {
      enabled: true,
      start: '23:00', // hora local PR, HH:mm
      end:   '06:00'  // hora local PR, HH:mm
    }
  };

  // Export: usa el nombre que espera tu HTML/main.js
  window.MONITOR_CONFIG  = CFG;
  // (Opcional) alias por si en algún momento tu HTML usó otro nombre:
  window.CARTELERA_CONFIG = window.CARTELERA_CONFIG || CFG;
})();
