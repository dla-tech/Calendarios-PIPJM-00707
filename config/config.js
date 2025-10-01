// config/config.js
(function(){
  // Construye bien la URL del ICS sin importar si está en GitHub Pages o local
  const icsUrl = new URL('./calendarios/calendario.ics', location.href).href;

  window.MONITOR_CONFIG = {
    icsUrl:  icsUrl,
    timeZone:'America/Puerto_Rico',

    // Ciclo
    slideMs: 12000,     // cambia de tarjeta cada 12s
    pollMs:  5*60*1000, // re-lee el ICS cada 5 min
    qrSize:  240,       // tamaño QR

    // Rollover de semana (domingo 00:00 hora local)
    weekRolloverDay: 0, // 0=domingo
    weekRolloverHour: 0,

    // Pantalla inicial y final
    intro: {
      bannerUrl: '', // URL opcional de imagen para portada inicial
      text: '📖 Dios les bendiga — Calendario de la semana'
    },
    outro: {
      bannerUrl: '', // URL opcional de imagen para cierre
      text: ''       // (ej: "Felicidades al Pastor")
    },

    // 🎛️ Tema personalizable
    theme: {
      background: '#0b1421',
      card:       '#0f1b2c',
      text:       '#e6eefc',
      muted:      '#93a4bf',
      accent:     '#16a34a',
      warn:       '#ef4444',
      shadow:     '0 20px 50px rgba(0,0,0,.35)',
      fontSize:   22,  // base
      bigClock:   64,  // reloj grande
      h1:         42,  // títulos
      h2:         28   // subtítulos
    },

    // Palabras clave que identifican "Templo" (para ocultar QR)
    templeKeywords: ['templo','iglesia','auditorio pipjm','pipjm'],

    // Parseo de campos en DESCRIPTION
    fieldsFromDescription: {
      preacher: /(predicador|predica)\s*:\s*(.+)/i,
      manager:  /(encargad[oa])\s*:\s*(.+)/i
    },

    // Defaults por día de la semana (0=dom, 1=lun, ... 6=sáb)
    defaultsByWeekday: {
      1: [ // Lunes
        { title:'Culto de oración', start:'19:00', end:'20:30', where:'Templo' }
      ],
      2: [], // Martes
      3: [], // Miércoles
      4: [ // Jueves
        { title:'Sociedad de Niños / Estudio', start:'19:00', end:'20:30', where:'Templo' }
      ],
      5: [ // Viernes
        { title:'Sociedad Damas / Caballeros / Jóvenes', start:'19:00', end:'21:00', where:'Templo' }
      ],
      6: [ // Sábado
        { title:'Altar familiar / (Ayuno congregacional si aplica)', start:'06:00', end:'08:00', where:'Templo' }
      ],
      0: [ // Domingo
        { title:'Oración / Ayuno',                 start:'06:00', end:'08:45', where:'Templo' },
        { title:'Apertura de Escuela Bíblica',     start:'08:45', end:'10:45', where:'Templo' },
        { title:'Receso',                           start:'10:45', end:'11:15', where:'Templo' },
        { title:'Cierre de Escuela Bíblica',       start:'10:45', end:'11:15', where:'Templo' },
        { title:'Receso',                           start:'11:15', end:'11:30', where:'Templo' },
        { title:'Comienzo del culto de adoración', start:'11:30', end:'13:30', where:'Templo' }
      ]
    },

    // 💤 Descanso automático
    // Durante este rango se muestra fondo negro (monitor "apagado").
    rest: {
      enabled: true,
      start: "23:00", // HH:mm en zona horaria local
      end:   "06:00"
    }
  };
})();
