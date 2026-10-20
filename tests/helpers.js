export const TORNEO_FIXTURE = {
  id: 900,
  nombre: 'Torneo de prueba',
  juegoId: 3,
  fechaCierreInscripcion: '2026-11-10',
  cupoMaximo: 5,
  inscritos: [],
};

export const EQUIPO_COMPLETO_FIXTURE = {
  id: 901,
  nombre: 'Equipo de prueba',
  juegoId: 3,
  activo: true,
  integrantes: [
    { jugadorId: 101, rol: 'Capitán' },
    { jugadorId: 102, rol: 'Atacante' },
    { jugadorId: 103, rol: 'Defensor' },
  ],
};

export function crearEstadoInscripcion(overrides = {}) {
  return {
    torneo: { ...TORNEO_FIXTURE, inscritos: [...TORNEO_FIXTURE.inscritos] },
    jugador: { id: 1, apodo: 'JugadorFixture' },
    correo: 'jugador@example.com',
    edad: 20,
    tipo: 'individual',
    equipo: null,
    acepto: true,
    ...overrides,
  };
}
