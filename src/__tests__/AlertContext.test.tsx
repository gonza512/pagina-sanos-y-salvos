import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AlertProvider, useAlert } from '../context/AlertContext';

function TestAutoClose() {
  const { showAlert, alerts } = useAlert();
  return (
    <>
      <button onClick={() => showAlert('Alerta temporal', 'info', 1000)}>
        Mostrar Alerta
      </button>
      {alerts.map(a => <div key={a.id}>{a.message}</div>)}
    </>
  );
}

describe('AlertContext', () => {
  beforeEach(() => vi.useRealTimers());

  test('la alerta se cierra automáticamente después del tiempo especificado', async () => {
    vi.useFakeTimers();

    render(
      <AlertProvider>
        <TestAutoClose />
      </AlertProvider>
    );

    await act(async () => {
      screen.getByText('Mostrar Alerta').click();
    });

    expect(screen.getByText('Alerta temporal')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.queryByText('Alerta temporal')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
