import { safeReturnTo } from '../src/domain/routes.js';

describe('Rutas de retorno después del acceso', () => {
  it('conserva rutas internas con query y fragmento', () => {
    expect(safeReturnTo('/torneos/4?origen=tarjeta#detalle')).toBe('/torneos/4?origen=tarjeta#detalle');
  });

  it('rechaza destinos externos, rutas relativas y rutas vacías', () => {
    expect(safeReturnTo('https://sitio-malicioso.example')).toBe('/');
    expect(safeReturnTo('//sitio-malicioso.example')).toBe('/');
    expect(safeReturnTo('\\\\sitio-malicioso.example')).toBe('/');
    expect(safeReturnTo('')).toBe('/');
  });
});
