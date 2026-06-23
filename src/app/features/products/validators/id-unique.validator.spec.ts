import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';

import { ProductsApiService } from '../services/products-api.service';
import { idUniqueValidator } from './id-unique.validator';

function apiMock(verifyId: jest.Mock): ProductsApiService {
  return { verifyId } as unknown as ProductsApiService;
}

describe('idUniqueValidator', () => {
  it('no consulta y devuelve null si la longitud es menor a 3', (done) => {
    const verifyId = jest.fn();
    const validator = idUniqueValidator(apiMock(verifyId));

    (validator(new FormControl('ab')) as Observable<unknown>).subscribe((r) => {
      expect(r).toBeNull();
      expect(verifyId).not.toHaveBeenCalled();
      done();
    });
  });

  it('devuelve { idTaken: true } si el id ya existe', fakeAsync(() => {
    const verifyId = jest.fn().mockReturnValue(of(true));
    const validator = idUniqueValidator(apiMock(verifyId));

    let result: unknown;
    (validator(new FormControl('abc')) as Observable<unknown>).subscribe((r) => (result = r));
    tick(400);

    expect(verifyId).toHaveBeenCalledWith('abc');
    expect(result).toEqual({ idTaken: true });
  }));

  it('devuelve null si el id no existe', fakeAsync(() => {
    const verifyId = jest.fn().mockReturnValue(of(false));
    const validator = idUniqueValidator(apiMock(verifyId));

    let result: unknown = 'sin-asignar';
    (validator(new FormControl('abc')) as Observable<unknown>).subscribe((r) => (result = r));
    tick(400);

    expect(result).toBeNull();
  }));

  it('ante un error de red devuelve null (no bloquea el formulario)', fakeAsync(() => {
    const verifyId = jest.fn().mockReturnValue(throwError(() => new Error('net')));
    const validator = idUniqueValidator(apiMock(verifyId));

    let result: unknown = 'sin-asignar';
    (validator(new FormControl('abc')) as Observable<unknown>).subscribe((r) => (result = r));
    tick(400);

    expect(result).toBeNull();
  }));
});
