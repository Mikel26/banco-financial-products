import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { NotificationService } from '../../services/notification.service';
import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NotificationsComponent] });
    service = TestBed.inject(NotificationService);
  });

  it('renderiza un toast por notificación', () => {
    service.showError('Algo falló');
    const fixture = TestBed.createComponent(NotificationsComponent);
    fixture.detectChanges();

    const toasts = fixture.nativeElement.querySelectorAll('.toast');
    expect(toasts.length).toBe(1);
    expect(toasts[0].textContent).toContain('Algo falló');
    expect(toasts[0].className).toContain('toast--error');
  });

  it('al cerrar un toast lo descarta del servicio', () => {
    service.showSuccess('Listo');
    const fixture = TestBed.createComponent(NotificationsComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.toast__close').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.toast').length).toBe(0);
    expect(service.notifications()).toEqual([]);
  });

  it('auto-descarta la notificación tras el timeout', fakeAsync(() => {
    service.showInfo('temporal');
    const fixture = TestBed.createComponent(NotificationsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.toast').length).toBe(1);

    tick(5000);
    fixture.detectChanges();

    expect(service.notifications()).toEqual([]);
  }));
});
