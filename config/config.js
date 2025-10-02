window.CARTELERA_CONFIG = {
  // Fuente de datos
  icsUrl: 'calendarios/calendario.ics',
  timeZone: 'America/Puerto_Rico',

  // Tiempos
  slideMs: 12000,            // cambia de tarjeta cada 12s
  pollMs: 5 * 60 * 1000,     // re-lee el ICS cada 5 min
  qrSize: 180,

  // Portadas
  intro: {
    bannerUrl: "",           // si pones URL, la portada usa imagen
    text: "📖 Dios les bendiga — Calendario de la semana"
  },
  outro: {
    bannerUrl: "",           // banner final (opcional)
    text: ""                 // texto final (opcional)
  },

  // Tema / tamaños
  theme: {
    bg:    '#0b1421',
    card:  '#0f1b2c',
    text:  '#e6eefc',
    muted: '#93a4bf',
    accent:'#16a34a',
    warn:  '#ef4444',
    base:  22,   // px
    h1:    42,   // px
    h2:    28,   // px
    clock: 64    // px
  },

  // Detectar “templo” (no mostrar QR si el evento es en el templo)
  templeKeywords: ['Templo','Iglesia','Santuario','Auditorio'],

  // Extraer “Predicador/Encargado” desde DESCRIPTION si viene en líneas tipo:
  // Predicador: Nombre
  // Encargado: Nombre
  fieldsFromDescription: {
    preacher: /(predicador|predica)\s*:\s*(.+)$/i,
    manager: /(encargad[oa])\s*:\s*(.+)$/i
  }
};
