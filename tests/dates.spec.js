import {
  diasRestantes,
  fechaLocalISO,
  formatearFecha,
  formatearFechaHora,
} from '../src/domain/dates.js';

describe('Dominio de fechas', () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 19, 15, 30));
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('usa el texto predeterminado para fechas ausentes', () => {
    expect(formatearFecha(null)).toBe('Por definir');
    expect(formatearFechaHora('')).toBe('Por definir');
    expect(diasRestantes(undefined)).toBeNull();
  });

  it('formatea una fecha ISO en español', () => {
    expect(formatearFecha('2026-06-15')).toBe('15 jun 2026');
  });

  it('formatea fecha y hora sin alterar la hora', () => {
    expect(formatearFechaHora('2026-10-02T09:30')).toBe('2 oct 2026 · 09:30');
  });

  it('calcula días pasados, el día actual y el día siguiente', () => {
    expect(diasRestantes('2026-10-18')).toBe(-1);
    expect(diasRestantes('2026-10-19')).toBe(0);
    expect(diasRestantes('2026-10-20')).toBe(1);
  });

  it('formatea la fecha local usando el reloj controlado', () => {
    expect(fechaLocalISO()).toBe('2026-10-19');
  });
});
