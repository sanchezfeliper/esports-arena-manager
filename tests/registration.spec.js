import {
  esCorreoValido,
  esDuplicado,
  noContieneEspacios,
  tieneSancionActiva,
  validarInscripcion,
} from '../src/domain/registration.js';
import { EQUIPO_COMPLETO_FIXTURE, TORNEO_FIXTURE, crearEstadoInscripcion } from './helpers.js';

describe('Dominio de inscripción', () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 19, 12));
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('acepta correos con formato válido y rechaza los malformados', () => {
    expect(esCorreoValido('jugador@example.com')).toBeTrue();
    expect(esCorreoValido('nombre.apellido+1@dominio.cl')).toBeTrue();
    expect(esCorreoValido('sin-arroba.example.com')).toBeFalse();
    expect(esCorreoValido('usuario@dominio')).toBeFalse();
    expect(esCorreoValido('usuario @dominio.com')).toBeFalse();
  });

  it('asigna el error de campo cuando el correo tiene formato inválido', () => {
    const resultado = validarInscripcion(crearEstadoInscripcion({ correo: 'correo-inválido' }));
    expect(resultado.erroresCampo.correo).toContain('El correo no tiene un formato válido');
  });

  it('valida el rango de edad entre 13 y 99 años inclusive', () => {
    for (const edad of [13, 99]) {
      expect(validarInscripcion(crearEstadoInscripcion({ edad })).valido).withContext(`edad ${edad}`).toBeTrue();
    }
    for (const edad of [12, 100]) {
      expect(validarInscripcion(crearEstadoInscripcion({ edad })).erroresCampo.edad).toBeDefined();
    }
  });

  it('requiere torneo, jugador, correo, edad, tipo y aceptación de reglas', () => {
    const resultado = validarInscripcion(crearEstadoInscripcion({
      torneo: null,
      jugador: null,
      correo: '',
      edad: '',
      tipo: '',
      acepto: false,
    }));

    expect(resultado.valido).toBeFalse();
    expect(resultado.errores).toContain('Selecciona un torneo.');
    expect(resultado.errores).toContain('Selecciona el tipo de participante.');
    expect(resultado.erroresCampo.jugador).toBeDefined();
    expect(resultado.erroresCampo.correo).toBeDefined();
    expect(resultado.erroresCampo.edad).toBeDefined();
  });

  it('impide continuar si no se aceptan las reglas aunque los demás campos sean válidos', () => {
    const resultado = validarInscripcion(crearEstadoInscripcion({ acepto: false }));
    expect(resultado.valido).toBeFalse();
    expect(resultado.errores).toEqual([]);
    expect(resultado.erroresCampo).toEqual({});
  });

  it('requiere elegir un equipo cuando el tipo es por equipos', () => {
    const resultado = validarInscripcion(crearEstadoInscripcion({ tipo: 'equipo', equipo: null }));
    expect(resultado.valido).toBeFalse();
    expect(resultado.erroresCampo.equipo).toBe('Selecciona el equipo con el que vas a competir.');
  });

  it('rechaza inscripciones cuando el cupo está completo, incluso con registros de sesión', () => {
    const torneoLleno = { ...TORNEO_FIXTURE, cupoMaximo: 1, inscritos: [777] };
    const lleno = validarInscripcion(crearEstadoInscripcion({ torneo: torneoLleno }));
    expect(lleno.errores).toContain('Cupo máximo alcanzado.');

    const conReserva = { ...TORNEO_FIXTURE, cupoMaximo: 2, inscritos: [777] };
    const reservado = validarInscripcion(crearEstadoInscripcion({ torneo: conReserva }), [
      { torneoId: conReserva.id, tipo: 'individual', participanteId: 888 },
    ]);
    expect(reservado.errores).toContain('Cupo máximo alcanzado.');
  });

  it('cierra inscripciones después de la fecha límite y las mantiene abiertas ese día', () => {
    const enPlazo = validarInscripcion(crearEstadoInscripcion({
      torneo: { ...TORNEO_FIXTURE, fechaCierreInscripcion: '2026-10-19' },
    }));
    expect(enPlazo.valido).toBeTrue();

    const cerrado = validarInscripcion(crearEstadoInscripcion({
      torneo: { ...TORNEO_FIXTURE, fechaCierreInscripcion: '2026-10-18' },
    }));
    expect(cerrado.valido).toBeFalse();
    expect(cerrado.errores).toContain('El plazo de inscripción está cerrado.');
  });

  it('aplica una sanción vigente durante su intervalo de fechas', () => {
    expect(tieneSancionActiva(7)).toBeTrue();
    expect(tieneSancionActiva(7, '2026-09-01')).toBeTrue();
    expect(tieneSancionActiva(7, '2026-10-31')).toBeTrue();
    expect(tieneSancionActiva(7, '2026-11-01')).toBeFalse();
    expect(tieneSancionActiva(3)).toBeFalse();

    const resultado = validarInscripcion(crearEstadoInscripcion({ jugador: { id: 7, apodo: 'Sancionado' } }));
    expect(resultado.valido).toBeFalse();
    expect(resultado.errores.join(' ')).toContain('Sanción vigente hasta');
  });

  it('rechaza equipos incompletos e inactivos', () => {
    const incompleto = {
      ...EQUIPO_COMPLETO_FIXTURE,
      integrantes: EQUIPO_COMPLETO_FIXTURE.integrantes.slice(0, 2),
    };
    const resultadoIncompleto = validarInscripcion(crearEstadoInscripcion({ tipo: 'equipo', equipo: incompleto }));
    expect(resultadoIncompleto.valido).toBeFalse();
    expect(resultadoIncompleto.erroresCampo.equipo).toContain('exige mínimo 3');

    const inactivo = { ...EQUIPO_COMPLETO_FIXTURE, activo: false };
    const resultadoInactivo = validarInscripcion(crearEstadoInscripcion({ tipo: 'equipo', equipo: inactivo }));
    expect(resultadoInactivo.valido).toBeFalse();
    expect(resultadoInactivo.erroresCampo.equipo).toBe('El equipo está inactivo y no puede inscribirse.');
  });

  it('detecta participantes duplicados en el torneo y en inscripciones de sesión', () => {
    const torneoConJugador = { ...TORNEO_FIXTURE, inscritos: [1] };
    const resultado = validarInscripcion(crearEstadoInscripcion({ torneo: torneoConJugador }));
    expect(resultado.valido).toBeFalse();
    expect(resultado.erroresCampo.jugador).toBe('Ya estás inscrito en este torneo.');

    const registroSession = [{ torneoId: 900, tipo: 'individual', participanteId: 1 }];
    expect(esDuplicado(TORNEO_FIXTURE, 'individual', 1, registroSession)).toBeTrue();
    expect(esDuplicado(TORNEO_FIXTURE, 'individual', null, registroSession)).toBeFalse();

    const torneoConEquipo = { ...TORNEO_FIXTURE, inscritos: [EQUIPO_COMPLETO_FIXTURE.id] };
    const resultadoEquipo = validarInscripcion(crearEstadoInscripcion({
      torneo: torneoConEquipo,
      tipo: 'equipo',
      equipo: EQUIPO_COMPLETO_FIXTURE,
    }));
    expect(resultadoEquipo.erroresCampo.equipo).toBe('El equipo ya está inscrito en este torneo.');
  });

  it('comprueba que los nombres de usuario no contengan espacios', () => {
    expect(noContieneEspacios('JugadorFixture')).toBeTrue();
    expect(noContieneEspacios('Jugador Fixture')).toBeFalse();
  });
});
