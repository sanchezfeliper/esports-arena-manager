/* ==========================================================================
   eSports Arena Manager 
   ========================================================================== */

/* ---------- Juegos habilitados ---------- */
export const JUEGOS = [
  { id: 1, nombre: 'League of Legends', categoria: 'MOBA',     modalidad: '5v5',  minIntegrantes: 5, maxIntegrantes: 7, icono: '🛡️', color: '#C89B3C' },
  { id: 2, nombre: 'Valorant',          categoria: 'Shooter',  modalidad: '5v5',  minIntegrantes: 5, maxIntegrantes: 7, icono: '🎯', color: '#FF4655' },
  { id: 3, nombre: 'Rocket League',     categoria: 'Deportivo',modalidad: '3v3',  minIntegrantes: 3, maxIntegrantes: 5, icono: '⚽', color: '#F79B14' },
  { id: 4, nombre: 'Street Fighter VI', categoria: 'Pelea',    modalidad: '1v1',  minIntegrantes: 1, maxIntegrantes: 1, icono: '🥊', color: '#E63946' },
  { id: 5, nombre: 'Dota 2',            categoria: 'MOBA',     modalidad: '5v5',  minIntegrantes: 5, maxIntegrantes: 7, icono: '⚔️', color: '#9146FF' },
  { id: 6, nombre: 'Counter-Strike 2',  categoria: 'Shooter',  modalidad: '5v5',  minIntegrantes: 5, maxIntegrantes: 7, icono: '🔫', color: '#00A8E8' }
];

/* ---------- Jugadores ---------- */
export const JUGADORES = [
  { id: 1,  apodo: 'ShadowKnight',  nombre: 'María González',  correo: 'maria.g@example.com',  telefono: '+56 9 1234 5678', region: 'Metropolitana' },
  { id: 2,  apodo: 'NovaQueen',     nombre: 'Camila Rojas',    correo: 'camila.r@example.com', telefono: '+56 9 2345 6789', region: 'Valparaíso' },
  { id: 3,  apodo: 'BlazeFury',     nombre: 'Diego Martínez', correo: 'diego.m@example.com',  telefono: '+56 9 3456 7890', region: 'Metropolitana' },
  { id: 4,  apodo: 'IceWolf',       nombre: 'Sofía Vidal',     correo: 'sofia.v@example.com',  telefono: '+56 9 4567 8901', region: 'Biobío' },
  { id: 5,  apodo: 'PhantomEdge',   nombre: 'Lucas Reyes',    correo: 'lucas.r@example.com',  telefono: '+56 9 5678 9012', region: 'Metropolitana' },
  { id: 6,  apodo: 'StormRider',    nombre: 'Valentina Díaz', correo: 'valentina.d@example.com', telefono: '+56 9 6789 0123', region: 'Antofagasta' },
  { id: 7,  apodo: 'VenomStrike',   nombre: 'Matías Soto',    correo: 'matias.s@example.com', telefono: '+56 9 7890 1234', region: 'Metropolitana' },
  { id: 8,  apodo: 'CrystalAura',   nombre: 'Isabella Muñoz', correo: 'isabella.m@example.com', telefono: '+56 9 8901 2345', region: "O'Higgins" },
  { id: 9,  apodo: 'IronClad',      nombre: 'Sebastián Cox',  correo: 'sebastian.c@example.com', telefono: '+56 9 9012 3456', region: 'Metropolitana' },
  { id: 10, apodo: 'RogueAssassin', nombre: 'Antonia Pinto',  correo: 'antonia.p@example.com', telefono: '+56 9 1122 3344', region: 'Valparaíso' },
  { id: 11, apodo: 'TitanForce',    nombre: 'Bruno Salazar', correo: 'bruno.s@example.com',  telefono: '+56 9 2233 4455', region: 'Metropolitana' },
  { id: 12, apodo: 'LunarBlade',    nombre: 'Catalina Vera', correo: 'catalina.v@example.com', telefono: '+56 9 3344 5566', region: 'Maule' }
];

/* ---------- Sanciones (referencian jugador y fechas) ---------- */
export const SANCIONES = [
  { id: 1, jugadorId: 3,  motivo: 'Comportamiento antideportivo en partida final', fechaInicio: '2026-06-01', fechaFin: '2026-07-01', estado: 'cumplida' },
  { id: 2, jugadorId: 7,  motivo: 'Lenguaje ofensivo en chat público',             fechaInicio: '2026-09-01', fechaFin: '2026-10-31', estado: 'vigente' },
  { id: 3, jugadorId: 10, motivo: 'Ausencia injustificada a partida programada',   fechaInicio: '2026-07-10', fechaFin: '2026-07-20', estado: 'cumplida' }
];

/* ---------- Equipos ---------- */
export const EQUIPOS = [
  {
    id: 1, nombre: 'Phoenix Esports',  juegoId: 1, capitanId: 1, activo: true,
    integrantes: [
      { jugadorId: 1,  rol: 'Capitán' },
      { jugadorId: 2,  rol: 'Soporte' },
      { jugadorId: 3,  rol: 'Mid' },
      { jugadorId: 4,  rol: 'ADC' },
      { jugadorId: 5,  rol: 'Top' }
    ]
  },
  {
    id: 2, nombre: 'Black Wolves',    juegoId: 2, capitanId: 6, activo: true,
    integrantes: [
      { jugadorId: 6,  rol: 'Capitán' },
      { jugadorId: 7,  rol: 'Duelista' },
      { jugadorId: 8,  rol: 'Iniciador' },
      { jugadorId: 9,  rol: 'Controlador' },
      { jugadorId: 10, rol: 'Centinela' }
    ]
  },
  {
    id: 3, nombre: 'Nitro Racers',      juegoId: 3, capitanId: 11, activo: true,
    integrantes: [
      { jugadorId: 11, rol: 'Capitán' },
      { jugadorId: 12, rol: 'Atacante' },
      { jugadorId: 4,  rol: 'Defensor' }
    ]
  },
  {
    id: 4, nombre: 'Dragon Force',     juegoId: 1, capitanId: 8, activo: true,
    integrantes: [
      { jugadorId: 8,  rol: 'Capitán' },
      { jugadorId: 9,  rol: 'Jungla' },
      { jugadorId: 10, rol: 'Mid' }
    ]
  },
  {
    id: 5, nombre: 'Silent Hawks',     juegoId: 5, capitanId: 2, activo: true,
    integrantes: [
      { jugadorId: 2,  rol: 'Capitán' },
      { jugadorId: 5,  rol: 'Carry' },
      { jugadorId: 6,  rol: 'Soporte' },
      { jugadorId: 11, rol: 'Mid' },
      { jugadorId: 12, rol: 'Off-lane' }
    ]
  },
  {
    id: 6, nombre: 'Old Veterans',     juegoId: 2, capitanId: 3, activo: false,
    integrantes: [
      { jugadorId: 3,  rol: 'Capitán' }
    ]
  }
];

/* ---------- Partidas (por torneo y ronda) ---------- */
export const PARTIDAS = [
  // Torneo 1 (Copa Arena LoL) - finalizado, bracket completo
  { id: 101, torneoId: 1, ronda: 'Cuartos',  fecha: '2026-06-12T18:00', estado: 'validada', equipoAId: 1, equipoBId: 4, puntajeA: 2, puntajeB: 0, ganadorId: 1 },
  { id: 102, torneoId: 1, ronda: 'Cuartos',  fecha: '2026-06-12T20:00', estado: 'validada', equipoAId: 2, equipoBId: null, puntajeA: null, puntajeB: null, ganadorId: 2 },
  { id: 103, torneoId: 1, ronda: 'Semifinal',fecha: '2026-06-14T18:00', estado: 'validada', equipoAId: 1, equipoBId: 2, puntajeA: 2, puntajeB: 1, ganadorId: 1 },
  { id: 104, torneoId: 1, ronda: 'Final',   fecha: '2026-06-15T20:00', estado: 'validada', equipoAId: 1, equipoBId: null, puntajeA: null, puntajeB: null, ganadorId: 1 },

  // Torneo 2 (Valorant Clash) - en curso
  { id: 201, torneoId: 2, ronda: 'Semifinal',fecha: '2026-09-04T19:00', estado: 'validada', equipoAId: 2, equipoBId: 6, puntajeA: 2, puntajeB: 0, ganadorId: 2 },
  { id: 202, torneoId: 2, ronda: 'Semifinal',fecha: '2026-09-04T21:00', estado: 'programada', equipoAId: null, equipoBId: null, puntajeA: null, puntajeB: null, ganadorId: null },
  { id: 203, torneoId: 2, ronda: 'Final',   fecha: '2026-09-08T20:00', estado: 'programada', equipoAId: 2, equipoBId: null, puntajeA: null, puntajeB: null, ganadorId: null }
];

/* ---------- Torneos ---------- */
export const TORNEOS = [
  {
    id: 1,
    nombre: 'Copa Arena LoL 2026',
    juegoId: 1,
    modalidad: 'Eliminación directa',
    formato: '5v5',
    cupoMaximo: 8,
    fechaInicio: '2026-06-10',
    fechaCierreInscripcion: '2026-06-08',
    estado: 'finalizado',
    descripcion: 'Torneo de cierre de temporada con premio en efectivo para los tres primeros lugares.',
    reglas: 'Formato eliminación directa. Mapa único por serie hasta cuartos, mejor de tres desde semifinales.',
    inscritos: [1, 2, 4],
    premios: [
      { posicion: 1, descripcion: '$500.000 CLP + Trofeo de oro',  icono: '🥇' },
      { posicion: 2, descripcion: '$250.000 CLP + Medalla de plata', icono: '🥈' },
      { posicion: 3, descripcion: '$100.000 CLP + Medalla de bronce', icono: '🥉' }
    ],
    ranking: [
      { equipoId: 1, victorias: 3, derrotas: 0, puntos: 300, diferenciaPuntaje: 6 },
      { equipoId: 2, victorias: 1, derrotas: 1, puntos: 150, diferenciaPuntaje: 1 },
      { equipoId: 4, victorias: 0, derrotas: 1, puntos: 50,  diferenciaPuntaje: -2 }
    ]
  },
  {
    id: 2,
    nombre: 'Valorant Winter Clash',
    juegoId: 2,
    modalidad: 'Eliminación directa',
    formato: '5v5',
    cupoMaximo: 16,
    fechaInicio: '2026-09-04',
    fechaCierreInscripcion: '2026-09-02',
    estado: 'en curso',
    descripcion: 'Clash invernal de Valorant con la escena nacional. Mejor de tres en todas las fases.',
    reglas: 'Eliminación directa. Mejor de tres mapas. Servidor oficial Santiago. Baneo de mapas por veto alternado.',
    inscritos: [2, 6],
    premios: [
      { posicion: 1, descripcion: '$600.000 CLP + Trofeo + skins exclusivas', icono: '🥇' },
      { posicion: 2, descripcion: '$300.000 CLP + Medalla',                    icono: '🥈' },
      { posicion: 3, descripcion: '$150.000 CLP + Medalla',                    icono: '🥉' }
    ],
    ranking: [
      { equipoId: 2, victorias: 1, derrotas: 0, puntos: 100, diferenciaPuntaje: 2 },
      { equipoId: 6, victorias: 0, derrotas: 1, puntos: 0,   diferenciaPuntaje: -2 }
    ]
  },
  {
    id: 3,
    nombre: 'Rocket League Spring Cup',
    juegoId: 3,
    modalidad: 'Fase de grupos + eliminatoria',
    formato: '3v3',
    cupoMaximo: 12,
    fechaInicio: '2026-11-15',
    fechaCierreInscripcion: '2026-11-10',
    estado: 'abierto',
    descripcion: 'Copa de primavera para equipos de Rocket League. Fase de grupos y playoffs.',
    reglas: 'Fase de grupos a partido único. Playoffs a mejor de cinco. Mínimo 3 integrantes por equipo.',
    inscritos: [3],
    premios: [
      { posicion: 1, descripcion: '$400.000 CLP + Trofeo',  icono: '🥇' },
      { posicion: 2, descripcion: '$200.000 CLP + Medalla', icono: '🥈' },
      { posicion: 3, descripcion: '$100.000 CLP + Medalla', icono: '🥉' }
    ],
    ranking: []
  },
  {
    id: 4,
    nombre: 'Street Fighter Showdown',
    juegoId: 4,
    modalidad: 'Eliminación directa',
    formato: '1v1',
    cupoMaximo: 32,
    fechaInicio: '2027-01-10',
    fechaCierreInscripcion: '2027-01-05',
    estado: 'abierto',
    descripcion: 'Torneo individual de pelea. Bracket de 32 jugadores a mejor de tres.',
    reglas: 'Eliminación directa a mejor de tres. Semifinal y final a mejor de cinco. Personajes sin repetición en series.',
    inscritos: [],
    premios: [
      { posicion: 1, descripcion: '$250.000 CLP + Arcade stick premium', icono: '🥇' },
      { posicion: 2, descripcion: '$120.000 CLP + Medalla',                icono: '🥈' },
      { posicion: 3, descripcion: '$60.000 CLP + Medalla',                  icono: '🥉' }
    ],
    ranking: []
  },
  {
    id: 5,
    nombre: 'Dota 2 Masters League',
    juegoId: 5,
    modalidad: 'Round robin',
    formato: '5v5',
    cupoMaximo: 8,
    fechaInicio: '2026-10-25',
    fechaCierreInscripcion: '2026-10-20',
    estado: 'abierto',
    descripcion: 'Liga round-robin para equipos de Dota 2. Todos contra todos y final a partido único.',
    reglas: 'Round robin a partido único. Los dos primeros disputan la final. Baneo de héroes por veto.',
    inscritos: [5],
    premios: [
      { posicion: 1, descripcion: '$700.000 CLP + Trofeo', icono: '🥇' },
      { posicion: 2, descripcion: '$350.000 CLP + Medalla', icono: '🥈' },
      { posicion: 3, descripcion: '$175.000 CLP + Medalla', icono: '🥉' }
    ],
    ranking: []
  },
  {
    id: 6,
    nombre: 'CS2 Pro Series',
    juegoId: 6,
    modalidad: 'Eliminación directa',
    formato: '5v5',
    cupoMaximo: 16,
    fechaInicio: '2026-09-01',
    fechaCierreInscripcion: '2026-08-30',
    estado: 'en curso',
    descripcion: 'Serie profesional de Counter-Strike 2 con los equipos top del país.',
    reglas: 'Eliminación directa. Mapas elegidos por veto. MR12 con overtime en empate.',
    inscritos: [2],
    premios: [
      { posicion: 1, descripcion: '$800.000 CLP + Trofeo', icono: '🥇' },
      { posicion: 2, descripcion: '$400.000 CLP + Medalla', icono: '🥈' },
      { posicion: 3, descripcion: '$200.000 CLP + Medalla', icono: '🥉' }
    ],
    ranking: []
  }
];

/* ---------- Funciones de acceso a datos (lookup por id) ---------- */
export function obtenerJuego(id) {
  return JUEGOS.find(j => j.id === Number(id)) || null;
}

export function obtenerJugador(id) {
  return JUGADORES.find(j => j.id === Number(id)) || null;
}

export function obtenerEquipo(id) {
  return EQUIPOS.find(e => e.id === Number(id)) || null;
}

export function obtenerTorneo(id) {
  return TORNEOS.find(t => t.id === Number(id)) || null;
}
