window.CARTELERA_CONFIG = {
  // === Fuente de datos ===
  icsUrl:  (location.origin + '/calendarios/calendario.ics'),
  timeZone:'America/Puerto_Rico',

  // === Ciclo de cartelera ===
  slideMs: 12000,        // cambia de tarjeta/evento cada 12s
  pollMs:  5 * 60 * 1000,// re-lee el ICS cada 5 min
  qrSize:  240,          // tamaño del QR en px

  // === Portada y cierre ===
  intro: {
    bannerUrl: '', // URL opcional de imagen para portada inicial
    text: '📖 Dios les bendiga — Calendario de la semana' // texto inicial
  },
  outro: {
    bannerUrl: '', // URL opcional de imagen para cierre
    text: ''       // texto final (ej.: "Felicidades al Pastor")
  },

  // === Tema (colores) ===
  theme: {
    bg:    '#0b1421',
    card:  '#0f1b2c',
    text:  '#e6eefc',
    muted: '#93a4bf',
    accent:'#16a34a',
    warn:  '#ef4444'
  },

  // === Modo descanso (sleep) ===
  // Usa la zona horaria arriba (timeZone) para calcular horas locales.
  // Si tu ventana cruza medianoche (ej.: 22:30–06:30), se maneja automáticamente.
  rest: {
    enabled: true,        // encender/apagar
    start: "23:00",       // hora inicio (HH:mm, 24h) en la zona 'timeZone'
    end:   "06:00",       // hora fin   (HH:mm, 24h) en la zona 'timeZone'

    // Opcionales (puedes omitirlos si no los necesitas):
    days:  [0,1,2,3,4,5,6], // 0=Dom, 1=Lun, ... en qué días aplica
    overlayText: 'En modo descanso', // texto que muestra el overlay
    dim: 1.0,                // 1.0 = negro total; 0.0 = sin oscurecer
    pollMs: 60000,           // cada cuánto verifica si entra/sale del descanso
    timeZone: null           // null = usa el timeZone de arriba; o pon "America/Puerto_Rico"
  }
};
