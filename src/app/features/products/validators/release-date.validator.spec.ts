import { FormControl } from '@angular/forms';

import { releaseDateValidator } from './release-date.validator';

/** Devuelve una fecha `YYYY-MM-DD` (local) desplazada `days` días respecto a hoy. */
function isoOffsetDays(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

describe('releaseDateValidator', () => {
  it('acepta hoy', () => {
    expect(releaseDateValidator(new FormControl(isoOffsetDays(0)))).toBeNull();
  });

  it('acepta una fecha futura', () => {
    expect(releaseDateValidator(new FormControl(isoOffsetDays(1)))).toBeNull();
  });

  it('rechaza una fecha pasada', () => {
    expect(releaseDateValidator(new FormControl(isoOffsetDays(-1)))).toEqual({
      releaseDateInvalid: true,
    });
  });

  it('sin valor devuelve null', () => {
    expect(releaseDateValidator(new FormControl(''))).toBeNull();
  });

  it('con un formato inválido devuelve null', () => {
    expect(releaseDateValidator(new FormControl('no-es-fecha'))).toBeNull();
  });
});
