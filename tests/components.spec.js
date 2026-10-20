import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Button from '@components/Button';
import FormField from '@components/FormField';
import TournamentsPage from '@pages/TournamentsPage';
import { TORNEOS } from '@data/mockData';

describe('Componentes React', () => {
  afterEach(cleanup);

  it('renderiza una tarjeta por cada torneo recibido en la lista', () => {
    const { container } = render(
      <MemoryRouter>
        <TournamentsPage />
      </MemoryRouter>,
    );

    expect(container.querySelectorAll('.tarjeta-torneo').length).toBe(TORNEOS.length);
    for (const torneo of TORNEOS) {
      expect(screen.getByRole('link', { name: torneo.nombre })).toBeTruthy();
    }
  });

  it('muestra el error de un campo y lo oculta cuando no hay error', () => {
    const { rerender } = render(
      <FormField label="Correo" id="correo" error="Correo inválido">
        <input id="correo" />
      </FormField>,
    );

    expect(screen.getByRole('alert').textContent).toBe('Correo inválido');
    rerender(
      <FormField label="Correo" id="correo">
        <input id="correo" />
      </FormField>,
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('muestra la etiqueta recibida y ejecuta onClick al presionarlo', () => {
    const onClick = jasmine.createSpy('onClick');
    render(<Button label="Guardar cambios" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('actualiza el resumen de resultados al escribir en el buscador', () => {
    render(
      <MemoryRouter>
        <TournamentsPage />
      </MemoryRouter>,
    );
    const buscador = screen.getByRole('searchbox', { name: 'Buscar por nombre' });

    fireEvent.change(buscador, { target: { value: 'valorant' } });

    const esperados = TORNEOS.filter((torneo) => torneo.nombre.toLowerCase().includes('valorant'));
    expect(screen.getByText(new RegExp(`${esperados.length} torneo`))).toBeTruthy();
    expect(document.querySelectorAll('.tarjeta-torneo').length).toBe(esperados.length);
  });

  it('aplica filtros y muestra un error si la fecha inicial supera la final', () => {
    render(
      <MemoryRouter>
        <TournamentsPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'finalizado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    const finalizados = TORNEOS.filter((torneo) => torneo.estado === 'finalizado');
    expect(document.querySelectorAll('.tarjeta-torneo').length).toBe(finalizados.length);

    fireEvent.change(screen.getByLabelText(/Fecha inicial/), { target: { value: '2026-12-20' } });
    fireEvent.change(screen.getByLabelText(/Fecha final/), { target: { value: '2026-12-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(screen.getByRole('alert').textContent).toContain('La fecha inicial no puede ser posterior');
  });
});
