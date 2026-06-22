import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('arranca sin notificaciones', () => {
    expect(service.notifications()).toEqual([]);
  });

  it('showError agrega una notificación de tipo error', () => {
    service.showError('Boom');
    expect(service.notifications()).toEqual([{ id: 0, type: 'error', message: 'Boom' }]);
  });

  it('showSuccess y showInfo agregan con su tipo', () => {
    service.showSuccess('ok');
    service.showInfo('info');
    expect(service.notifications().map((n) => n.type)).toEqual(['success', 'info']);
  });

  it('dismiss elimina por id y clear vacía todo', () => {
    service.showError('a');
    service.showError('b');

    const [first] = service.notifications();
    service.dismiss(first.id);
    expect(service.notifications().length).toBe(1);

    service.clear();
    expect(service.notifications()).toEqual([]);
  });
});
