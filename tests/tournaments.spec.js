import * as tournaments from '../src/domain/tournaments.js';

describe('Dominio de Torneos', () => {
    it('debería cargar el módulo de torneos correctamente', () => {
        expect(tournaments).toBeDefined();
    });
});