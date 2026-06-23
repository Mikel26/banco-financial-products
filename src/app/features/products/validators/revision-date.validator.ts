import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { parseLocalDate } from './parse-local-date';

/**
 * Exige que la fecha de revisión sea **exactamente un año posterior** a la de
 * liberación. Lee la fecha de liberación del control hermano `releaseControlName`.
 */
export const revisionDateValidator = (releaseControlName: string): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const release = parseLocalDate(control.parent?.get(releaseControlName)?.value);
    const revision = parseLocalDate(control.value);
    if (!release || !revision) {
      return null;
    }

    const expected = new Date(release);
    expected.setFullYear(expected.getFullYear() + 1);
    return revision.getTime() === expected.getTime() ? null : { revisionDateInvalid: true };
  };
};
