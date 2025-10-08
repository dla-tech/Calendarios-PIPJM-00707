// Configuración completa del calendario rotatorio para pantalla grande
window.CARTELERA_CONFIG = {
  // ======== Fuente de datos ========
  icsUrl:  'calendarios/calendario.ics', // Ruta al archivo ICS
  timeZone:'America/Puerto_Rico',

  // ======== Tiempos (ms) ========
  slideMs: 12000,             // Duración de cada tarjeta (12 segundos)
  pollMs:  5 * 60 * 1000,     // Relee el ICS cada 5 minutos
  qrSize:  300,               // Tamaño del QR

  // ======== Cambio de semana ========
  weekRollover: { weekday: 0, hour: 0 }, // Domingo a medianoche

  // ======== Intro y cierre opcional ========
  intro: { 
    bannerUrl: '', 
    text: '📖 Dios les bendiga — Calendario de la semana' 
  },
  outro: { 
    bannerUrl: '', 
    text: '' 
  },

  // ======== Palabras clave para ocultar QR ========
  templeKeywords: ['templo','santuario','iglesia','auditorio'],

  // ======== Campos personalizados desde DESCRIPTION ========
  fieldsFromDescription: {
    preacher: /(predicador|predicadora|prédica|prédicador)\s*:\s*(.+)/i,
    manager:  /(encargad[oa])\s*:\s*(.+)/i
  },

  // ======== Tema visual (adaptado al templo con madera y luz cálida) ========
  theme: {
    bg:    '#0c141f',       // azul medianoche con leve tono cálido
    card:  '#142235',       // azul grisáceo más claro para contraste suave
    text:  '#f8faff',       // blanco suave, no tan brillante
    muted: '#b5c2da',       // gris cálido para subtítulos
    accent:'#22c45b',       // verde natural tipo “vid”
    warn:  '#ff6b6b',       // rojo coral suave
    h1: 48,                 // tamaño para títulos principales
    h2: 34,                 // tamaño para subtítulos
    fs: 26,                 // texto general más grande
    clock: 42,              // hora (más discreta y compacta)
    radius: 26,             // esquinas redondeadas
    shadow: '0 25px 80px rgba(0,0,0,.5)' // sombra suave para destacar
  }
};