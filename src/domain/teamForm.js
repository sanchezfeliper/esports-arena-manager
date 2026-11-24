export function buildTeamPayload({ nombre, juegoId, capitanId, activo = true }) {
  const captainId = Number(capitanId);
  return {
    nombre: String(nombre || '').trim(),
    juegoId: Number(juegoId),
    capitanId: captainId,
    activo: Boolean(activo),
    integrantes: [{ jugadorId: captainId, rol: 'Capitán' }]
  };
}
