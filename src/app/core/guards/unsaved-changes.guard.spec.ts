import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { CanComponentDeactivate, unsavedChangesGuard } from './unsaved-changes.guard';

const route = {} as unknown as ActivatedRouteSnapshot;
const state = {} as unknown as RouterStateSnapshot;

function invoke(component: CanComponentDeactivate): boolean {
  return unsavedChangesGuard(component, route, state, state) as boolean;
}

describe('unsavedChangesGuard', () => {
  it('permite salir si el componente no tiene cambios', () => {
    expect(invoke({ canDeactivate: () => true })).toBe(true);
  });

  it('con cambios, permite salir si se confirma', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    expect(invoke({ canDeactivate: () => false })).toBe(true);
  });

  it('con cambios, bloquea la salida si se cancela', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    expect(invoke({ canDeactivate: () => false })).toBe(false);
  });
});
