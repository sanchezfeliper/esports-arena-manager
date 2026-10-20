import {
  getJSON,
  getJSONSession,
  isAvailable,
  setJSON,
  setJSONSession,
} from '../src/services/localStorage.js';

describe('Servicio de almacenamiento JSON', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('está disponible en el navegador de pruebas', () => {
    expect(isAvailable).toBeTrue();
  });

  it('serializa y lee valores JSON de localStorage', () => {
    const value = { jugador: 'Fixture', puntos: [10, 25] };
    setJSON('fixture', value);
    expect(getJSON('fixture')).toEqual(value);
  });

  it('devuelve null para claves ausentes y contenido JSON inválido', () => {
    expect(getJSON('ausente')).toBeNull();
    window.localStorage.setItem('malformado', '{json');
    expect(getJSON('malformado')).toBeNull();
  });

  it('ignora errores de lectura y escritura de localStorage', () => {
    spyOn(window.localStorage, 'getItem').and.throwError('storage bloqueado');
    expect(getJSON('bloqueado')).toBeNull();

    spyOn(window.localStorage, 'setItem').and.throwError('cuota excedida');
    expect(() => setJSON('bloqueado', { valor: 1 })).not.toThrow();
  });

  it('serializa y lee JSON de sessionStorage', () => {
    const value = [{ id: 9, nombre: 'Equipo de sesión' }];
    setJSONSession('equipos', value);
    expect(getJSONSession('equipos')).toEqual(value);
  });

  it('devuelve null ante claves ausentes, JSON inválido o errores de sessionStorage', () => {
    expect(getJSONSession('ausente')).toBeNull();
    window.sessionStorage.setItem('malformado', '{json');
    expect(getJSONSession('malformado')).toBeNull();

    spyOn(window.sessionStorage, 'getItem').and.throwError('storage bloqueado');
    expect(getJSONSession('bloqueado')).toBeNull();
  });

  it('ignora errores al escribir en sessionStorage', () => {
    spyOn(window.sessionStorage, 'setItem').and.throwError('cuota excedida');
    expect(() => setJSONSession('bloqueado', { valor: 1 })).not.toThrow();
  });
});
