import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { NotificationService } from '../services/notification.service';
import { errorInterceptor, resolveErrorMessage } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let notification: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    notification = TestBed.inject(NotificationService);
    jest.spyOn(notification, 'showError');
  });

  afterEach(() => httpMock.verify());

  it('deja pasar las respuestas exitosas sin notificar', () => {
    let body: unknown;
    http.get('/ok').subscribe((r) => (body = r));
    httpMock.expectOne('/ok').flush({ ok: true });

    expect(body).toEqual({ ok: true });
    expect(notification.showError).not.toHaveBeenCalled();
  });

  it('notifica y vuelve a propagar el error 400', () => {
    let errored = false;
    http.get('/bad').subscribe({ error: () => (errored = true) });
    httpMock.expectOne('/bad').flush('x', {
      status: 400,
      statusText: 'Bad Request',
    });

    expect(notification.showError).toHaveBeenCalledWith(
      'Datos inválidos. Revisa los campos del formulario',
    );
    expect(errored).toBe(true);
  });

  it('notifica falta de conexión cuando el status es 0', () => {
    http.get('/down').subscribe({ error: () => undefined });
    httpMock.expectOne('/down').error(new ProgressEvent('error'));

    expect(notification.showError).toHaveBeenCalledWith('No hay conexión con el servidor');
  });

  it('resolveErrorMessage mapea los estados conocidos', () => {
    expect(resolveErrorMessage(new HttpErrorResponse({ status: 404 }))).toBe(
      'Recurso no encontrado',
    );
    expect(resolveErrorMessage(new HttpErrorResponse({ status: 409 }))).toBe(
      'El recurso ya existe',
    );
    expect(resolveErrorMessage(new HttpErrorResponse({ status: 500 }))).toBe(
      'Error del servidor. Inténtalo más tarde',
    );
    expect(resolveErrorMessage(new HttpErrorResponse({ status: 503 }))).toBe(
      'Error del servidor. Inténtalo más tarde',
    );
    expect(resolveErrorMessage(new HttpErrorResponse({ status: 418 }))).toBe(
      'Ocurrió un error inesperado',
    );
  });
});
