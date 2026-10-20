import {
  calcularPuntos,
  cuposDisponibles,
  estadoBadgeClase,
  estadoTorneoTexto,
  idTorneoValido,
  inscripcionFueraDePlazo,
  ordenarRanking,
} from '../src/domain/tournaments.js';

describe('Dominio de torneos', () => {
  it('muestra etiquetas y clases para estados conocidos y conserva estados desconocidos', () => {
    expect(estadoTorneoTexto('abierto')).toBe('Inscripción abierta');
    expect(estadoTorneoTexto('en curso')).toBe('En curso');
    expect(estadoTorneoTexto('finalizado')).toBe('Finalizado');
    expect(estadoTorneoTexto('cancelado')).toBe('Cancelado');
    expect(estadoTorneoTexto('pausado')).toBe('pausado');

    expect(estadoBadgeClase('abierto')).toBe('abierto');
    expect(estadoBadgeClase('en curso')).toBe('encurso');
    expect(estadoBadgeClase('cancelado')).toBe('cancelado');
    expect(estadoBadgeClase('finalizado')).toBe('finalizado');
  });

  it('calcula cupos disponibles y nunca devuelve un número negativo', () => {
    const torneo = { cupoMaximo: 4, inscritos: [1, 2] };
    expect(cuposDisponibles(torneo)).toBe(2);
    expect(cuposDisponibles(torneo, 2)).toBe(0);
    expect(cuposDisponibles({ cupoMaximo: 1, inscritos: [1, 2] })).toBe(0);
    expect(cuposDisponibles(null)).toBe(0);
  });

  it('considera abierta la inscripción hasta el día de cierre inclusive', () => {
    const torneo = { fechaCierreInscripcion: '2026-10-19' };
    expect(inscripcionFueraDePlazo(torneo, '2026-10-18')).toBeFalse();
    expect(inscripcionFueraDePlazo(torneo, '2026-10-19')).toBeFalse();
    expect(inscripcionFueraDePlazo(torneo, '2026-10-20')).toBeTrue();
  });

  it('ordena por puntos y desempata por diferencia sin mutar el ranking recibido', () => {
    const ranking = [
      { equipoId: 1, puntos: 100, diferenciaPuntaje: 3 },
      { equipoId: 2, puntos: 200, diferenciaPuntaje: 0 },
      { equipoId: 3, puntos: 100, diferenciaPuntaje: 8 },
    ];
    const original = [...ranking];

    expect(ordenarRanking(ranking).map((fila) => fila.equipoId)).toEqual([2, 3, 1]);
    expect(ranking).toEqual(original);
  });

  it('suma 100 puntos por victoria y 25 por derrota', () => {
    const resultados = [
      { equipoAId: 1, equipoBId: 2, ganadorId: 1 },
      { equipoAId: 1, equipoBId: 3, ganadorId: 3 },
      { equipoAId: 2, equipoBId: 3, ganadorId: null },
    ];
    expect(calcularPuntos(resultados)).toBe(125);
  });

  it('valida IDs existentes y rechaza valores vacíos, desconocidos o no numéricos', () => {
    expect(idTorneoValido(1)).toBeTrue();
    expect(idTorneoValido('3')).toBeTrue();
    expect(idTorneoValido(999)).toBeFalse();
    expect(idTorneoValido('no-es-id')).toBeFalse();
    expect(idTorneoValido('')).toBeFalse();
    expect(idTorneoValido(null)).toBeFalse();
  });
});