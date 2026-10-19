import {
  cargarEquiposLocales,
  equipoCompleto,
  guardarEquiposLocales,
  obtenerTodosLosEquipos,
  siguienteIdEquipo,
} from '../src/domain/teams.js';
import { EQUIPO_COMPLETO_FIXTURE } from './helpers.js';

describe('Dominio de equipos', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('comprueba el mínimo de integrantes y admite exactamente el mínimo', () => {
    const juego = { minIntegrantes: 3 };
    expect(equipoCompleto(EQUIPO_COMPLETO_FIXTURE, juego)).toBeTrue();
    expect(equipoCompleto({ integrantes: EQUIPO_COMPLETO_FIXTURE.integrantes.slice(0, 2) }, juego)).toBeFalse();
    expect(equipoCompleto(null, juego)).toBeFalse();
    expect(equipoCompleto(EQUIPO_COMPLETO_FIXTURE, null)).toBeFalse();
  });

  it('genera IDs posteriores a los equipos existentes sin mutar la lista local', () => {
    const locales = [{ id: 20 }, { id: 24 }];
    const original = [...locales];
    expect(siguienteIdEquipo(locales)).toBe(25);
    expect(siguienteIdEquipo([])).toBe(7);
    expect(locales).toEqual(original);
  });

  it('combina equipos de catálogo con los equipos locales', () => {
    const locales = [{ id: 900, nombre: 'Local' }];
    const todos = obtenerTodosLosEquipos(locales);
    expect(todos.length).toBe(7);
    expect(todos.at(-1)).toEqual(locales[0]);
  });

  it('devuelve una lista vacía si sessionStorage no contiene equipos válidos', () => {
    expect(cargarEquiposLocales()).toEqual([]);
    window.sessionStorage.setItem('eam_equipos_creados', '{esto no es JSON');
    expect(cargarEquiposLocales()).toEqual([]);

    window.sessionStorage.setItem('eam_equipos_creados', JSON.stringify({ nombre: 'No es una lista' }));
    expect(cargarEquiposLocales()).toEqual([]);
  });

  it('descarta equipos e integrantes inválidos y reasigna IDs locales consecutivos', () => {
    window.sessionStorage.setItem('eam_equipos_creados', JSON.stringify([
      { nombre: 'Inválido', juegoId: 'x', capitanId: 200, integrantes: [] },
      {
        nombre: 'Guardado', juegoId: '3', capitanId: '101', activo: 1,
        integrantes: [{ jugadorId: '101', rol: 'Capitán' }, { jugadorId: 'x' }, null],
      },
    ]));

    expect(cargarEquiposLocales()).toEqual([{
      id: 7,
      nombre: 'Guardado',
      juegoId: 3,
      capitanId: 101,
      activo: true,
      integrantes: [{ jugadorId: 101, rol: 'Capitán' }],
    }]);
  });

  it('persiste los campos de equipo sin guardar el ID generado en sesión', () => {
    guardarEquiposLocales([EQUIPO_COMPLETO_FIXTURE]);
    const stored = JSON.parse(window.sessionStorage.getItem('eam_equipos_creados'));
    expect(stored[0].nombre).toBe('Equipo de prueba');
    expect(stored[0].id).toBeUndefined();
  });
});
