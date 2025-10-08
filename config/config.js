// Config SOLO para estética y textos. Todo el contenido sale del ICS.
window.CARTELERA_CONFIG = {
  icsUrl:  'calendarios/calendario.ics',
  timeZone:'America/Puerto_Rico',

  slideMs: 12000,   // cada 12s avanza
  pollMs:  5 * 60 * 1000,
  qrSize:  240,

  weekRollover: { weekday: 0, hour: 0 },

  intro: { text: '📖 Dios les bendiga — Calendario de la semana' },
  outro: { text: '' },

  templeKeywords: ['templo','santuario','iglesia','auditorio'],

  fieldsFromDescription: {
    preacher: /(predicador|predica)\s*:\s*(.+)/i,
    manager:  /(encargad[oa])\s*:\s*(.+)/i
  },

  theme: {
    bg: '#0b1421',
    card: '#0f1b2c',
    text: '#e6eefc',
    muted: '#93a4bf',
    accent:'#16a34a',
    warn:'#ef4444',
    h1:40, h2:26, fs:20, clock:54, radius:18,
    shadow: '0 20px 60px rgba(0,0,0,.35)'
  }
};
