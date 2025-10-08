window.CARTELERA_CONFIG = {
  icsUrl:  'calendarios/calendario.ics',
  timeZone:'America/Puerto_Rico',
  pollMs: 5 * 60 * 1000,
  qrSize: 100,

  templeKeywords: ['templo','santuario','iglesia','auditorio'],
  fieldsFromDescription: {
    preacher: /(predicador|predica|predicadora)\s*:\s*(.+)/i,
    manager:  /(encargad[oa])\s*:\s*(.+)/i
  },

  theme: {
    bg: '#0b1421', card: '#111b2c', text: '#f1f5fb', muted: '#9fb3d4', accent:'#16a34a'
  }
};