window.CARTELERA_CONFIG = {
  icsUrl:  (location.origin + '/calendarios/calendario.ics'), 
  timeZone:'America/Puerto_Rico',

  // Ciclo
  slideMs: 12000,     // cambia de evento cada 12s
  pollMs:  5*60*1000, // re-lee el ICS cada 5 min
  qrSize:  240,       // tamaño QR

  // Pantalla inicial y final
  intro: {
    bannerUrl: '',              // URL opcional de imagen para portada inicial
    text: '📖 Dios les bendiga — Calendario de la semana'
  },
  outro: {
    bannerUrl: '',              // URL opcional de imagen para cierre
    text: ''                    // texto final (ej: "Felicidades al Pastor")
  },

  // 🎛️ Colores personalizables
  theme: {
    bg:    '#0b1421',
    card:  '#0f1b2c',
    text:  '#e6eefc',
    muted: '#93a4bf',
    accent:'#16a34a',
    warn:  '#ef4444'
  },

  // 💤 Horario de descanso
  rest: {
    enabled: true,       // true = activo
    start: "23:00",      // hora local PR
    end:   "06:00"       // hora local PR
  },

  // 📌 Palabras clave para no mostrar QR (ej: “Templo”)
  templeKeywords: ["templo", "iglesia"],

  // Campos opcionales a leer del DESCRIPTION
  fieldsFromDescription: {
    preacher: /(predicador|predica)\s*:\s*(.+)/i,
    manager:  /(encargad[oa])\s*:\s*(.+)/i
  },

  // Texto que aparece antes de los días en portada
  labels: {
    dayPrefix: "Semana del "
  },

  // Defaults por día (si no hay ICS)
  defaultsByWeekday: {
    0: [ // Domingo
      { start:"06:00", end:"08:45", title:"Oración congregacional", where:"Templo" },
      { start:"08:45", end:"10:45", title:"Escuela Bíblica", where:"Templo" },
      { start:"11:30", title:"Culto Dominical", where:"Templo", desc:"Predicador: Pastora Nélida Brito" }
    ],
    1: [ { title:"Culto de Oración", where:"Templo" } ], // Lunes
    4: [ { title:"Culto Sociedad de Niños", where:"Templo" } ], // Jueves
    5: [ { title:"Culto Sociedad de Damas y Caballeros", where:"Templo" } ], // Viernes
    6: [ { title:"Altar Familiar", where:"Hogar" } ] // Sábado
  }
};
