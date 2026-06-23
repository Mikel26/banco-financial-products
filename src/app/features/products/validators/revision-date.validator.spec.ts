import { FormControl, FormGroup } from '@angular/forms';

import { revisionDateValidator } from './revision-date.validator';

function makeGroup(release: string, revision: string): FormGroup {
  const group = new FormGroup({
    release: new FormControl(release),
    revision: new FormControl(revision, revisionDateValidator('release')),
  });
  group.get('revision')?.updateValueAndValidity();
  return group;
}

describe('revisionDateValidator', () => {
  it('acepta exactamente un año después', () => {
    expect(makeGroup('2026-07-01', '2027-07-01').get('revision')?.errors).toBeNull();
  });

  it('rechaza menos de un año', () => {
    expect(makeGroup('2026-07-01', '2027-06-30').get('revision')?.errors).toEqual({
      revisionDateInvalid: true,
    });
  });

  it('rechaza más de un año', () => {
    expect(makeGroup('2026-07-01', '2027-07-02').get('revision')?.errors).toEqual({
      revisionDateInvalid: true,
    });
  });

  it('sin fecha de liberación devuelve null', () => {
    expect(makeGroup('', '2027-07-01').get('revision')?.errors).toBeNull();
  });
});
