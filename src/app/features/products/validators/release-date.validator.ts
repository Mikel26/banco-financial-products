import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { parseLocalDate } from './parse-local-date';

/** Exige que la fecha de liberación sea hoy o una fecha posterior. */
export const releaseDateValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const date = parseLocalDate(control.value);
  if (!date) {
    return null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() >= today.getTime() ? null : { releaseDateInvalid: true };
};
