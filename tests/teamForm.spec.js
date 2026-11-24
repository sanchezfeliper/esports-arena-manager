import { buildTeamPayload } from '../src/domain/teamForm.js';

describe('Formulario de equipo conectado a la API', () => {
  it('construye un equipo con IDs de la API y el capitán dentro de integrantes', () => {
    expect(buildTeamPayload({ nombre: '  Los Arena  ', juegoId: '3', capitanId: '42', activo: true })).toEqual({
      nombre: 'Los Arena', juegoId: 3, capitanId: 42, activo: true,
      integrantes: [{ jugadorId: 42, rol: 'Capitán' }]
    });
  });
});
