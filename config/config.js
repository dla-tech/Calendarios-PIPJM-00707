window.CARTELERA_CONFIG = {
  /* === Fuente de datos === */
  icsUrl:  (location.origin + '/calendarios/calendario.ics'),
  timeZone:'America/Puerto_Rico',

  /* === Ciclo / refrescos === */
  slideMs: 12000,        // cambia tarjeta o evento cada 12s
  pollMs:  5*60*1000,    // re-lee el ICS cada 5 min
  qrSize:  220,          // tamaño del QR en px

  /* === Intro/Outro personalizables === */
  intro: {
    bannerUrl: '',       // URL opcional de banner inicial
    text: '📖 Dios les bendiga — Calendario de la semana'
  },
  outro: {
    bannerUrl: '',       // URL opcional de banner final
    text: ''             // ej: "Felicidades a los pastores"
  },

  /* === Etiquetas === */
  labels: {
    headerTitle: 'Calendario de la semana'
  },

  /* === Tema / estética === */
  theme: {
    bg:       '#0b1421',
    card:     '#0f1b2c',
    text:     '#e6eefc',
    muted:    '#93a4bf',
    accent:   '#16a34a',
    warn:     '#ef4444',
    shadow:   '0 20px 50px rgba(0,0,0,.35)',
    fontSize: 22,   // px base
    bigClock: 64,   // px reloj
    h1:       40,   // px título principal
    h2:       22    // px título evento
  },

  /* === Reglas para detectar “templo” (no mostrar QR si es templo) === */
  templeKeywords: ['templo','iglesia','santuario','auditorio'],

  /* === Extraer predicador/encargado desde DESCRIPTION del ICS === */
  fieldsFromDescription: {
    preacher: /(predicador|predica)\s*:\s*(.+)/i,
    manager:  /(encargad[oa])\s*:\s*(.+)/i
  },

  /* === Defaults por día si el ICS no trae eventos ===
     0=Dom,1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb */
  defaultsByWeekday: {
    1: [ // Lunes
      { start:'19:00', end:'20:30', title:'Culto de oración', where:'Templo', desc:'' }
    ],
    2: [], // Martes (normalmente ICS evangelístico con pin)
    3: [], // Miércoles (normalmente ICS evangelístico con pin)
    4: [ // Jueves
      { start:'19:00', end:'20:30', title:'Sociedad de Niños / Oración / Estudio bíblico', where:'Templo', desc:'' }
    ],
    5: [ // Viernes
      { start:'19:00', end:'20:30', title:'Culto de Damas, Caballeros y Jóvenes', where:'Templo', desc:'' }
    ],
    6: [ // Sábado
      // { start:'06:00', end:'08:00', title:'Ayuno congregacional', where:'Templo', desc:'' }
    ],
    0: [ // Domingo
      { start:'06:00', end:'08:45', title:'Oración / Ayuno', where:'Templo', desc:'' },
      { start:'08:45', end:'10:45', title:'Escuela Bíblica', where:'Templo', desc:'' },
      { start:'11:15', end:'',     title:'Culto de adoración', where:'Templo', desc:'Predica: (indicar en ICS o aquí)' }
    ]
  },

  /* === Horario de descanso (overlay negro) === */
  rest: {
    enabled: true,
    start: "23:00",   // hora local inicio
    end:   "06:00"    // hora local fin
  }
};
