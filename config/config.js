// Config SOLO para estética y textos. Todo el contenido sale del ICS.
window.CARTELERA_CONFIG = {
  icsUrl:  'calendarios/calendario.ics',
  timeZone:'America/Puerto_Rico',

  // Tiempos (ms)
  slideMs: 12000,             // cada 12s avanza una tarjeta
  pollMs:  5 * 60 * 1000,     // re-lee ICS cada 5 min
  qrSize:  260,               // tamaño del QR

  // Rollover semanal (domingo 00:00)
  weekRollover: { weekday: 0, hour: 0 }, // 0=domingo, 0h

  // Pantalla de inicio y de salida
  intro: { bannerUrl: '', text: '📖 Dios les bendiga — Calendario de la semana' },
  outro: { bannerUrl: '', text: '' },

  // Palabras que significan “templo” (no mostrar QR)
  templeKeywords: ['templo','santuario','iglesia','auditorio'],

  // De DESCRIPTION extrae opcionalmente estos campos
  fieldsFromDescription: {
    preacher: /(predicador|predica|prédica)\s*:\s*(.+)/i,
    manager:  /(encargad[oa])\s*:\s*(.+)/i
  },

  // Apariencia / tamaños
  theme: {
    bg:    '#0b1421',
    card:  '#0f1b2c',
    text:  '#e6eefc',
    muted: '#93a4bf',
    accent:'#16a34a',
    warn:  '#ef4444',
    h1: 40,
    h2: 26,
    fs: 20,
    clock: 54,
    radius: 18,
    shadow: '0 20px 60px rgba(0,0,0,.35)'
  }
};