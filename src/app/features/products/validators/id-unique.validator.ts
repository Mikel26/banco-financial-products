import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';

import { ProductsApiService } from '../services/products-api.service';

/**
 * Valida (async) que el `id` no exista ya en el backend, consultando
 * `verifyId` con un debounce de 400 ms. Solo corre para ids de longitud ≥ 3
 * (los más cortos ya los rechaza el validador síncrono de `minLength`).
 */
export const idUniqueValidator = (api: ProductsApiService): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value: string = control.value;
    if (!value || value.length < 3) {
      return of(null);
    }
    return timer(400).pipe(
      switchMap(() => api.verifyId(value)),
      map((exists) => (exists ? { idTaken: true } : null)),
      catchError(() => of(null)),
    );
  };
};
