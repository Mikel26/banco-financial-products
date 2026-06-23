import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { ProductsApiService } from '../../services/products-api.service';
import { ProductsStateService } from '../../services/products-state.service';
import { ProductFormComponent } from './product-form.component';

function routeWithId(id: string | null) {
  return { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } };
}

function fillValid(component: ProductFormComponent): void {
  component.form.controls.id.setValue('nuevo-1');
  component.form.controls.name.setValue('Cuenta Ahorro');
  component.form.controls.description.setValue('Descripción válida y larga');
  component.form.controls.logo.setValue('logo.png');
  component.form.controls.date_release.setValue('2026-07-01');
  component.form.controls.id.updateValueAndValidity();
}

describe('ProductFormComponent · alta', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: routeWithId(null) },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('arranca inválido y en modo alta', () => {
    expect(component.isEdit).toBe(false);
    expect(component.form.invalid).toBe(true);
  });

  it('autocompleta la revisión a un año después de la liberación', () => {
    component.form.controls.date_release.setValue('2026-07-01');
    expect(component.form.getRawValue().date_revision).toBe('2027-07-01');
  });

  it('un envío inválido no llama a la API ni navega', () => {
    component.onSubmit();
    httpMock.expectNone('/bp/products');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('errorFor mapea cada tipo de error a su mensaje', () => {
    const control = component.form.controls.id;
    control.markAsTouched();

    control.setErrors({ idTaken: true });
    expect(component.errorFor('id')).toBe('El ID ya existe');

    control.setErrors({ minlength: { requiredLength: 3, actualLength: 1 } });
    expect(component.errorFor('id')).toBe('Mínimo 3 caracteres');

    control.setErrors({ maxlength: { requiredLength: 10, actualLength: 11 } });
    expect(component.errorFor('id')).toBe('Máximo 10 caracteres');

    control.setErrors({ releaseDateInvalid: true });
    expect(component.errorFor('id')).toBe('La fecha debe ser hoy o posterior');

    control.setErrors({ revisionDateInvalid: true });
    expect(component.errorFor('id')).toBe('Debe ser un año posterior a la liberación');

    control.setErrors({ otro: true });
    expect(component.errorFor('id')).toBe('Campo inválido');
  });

  it('errorFor: null sin tocar/inexistente, requerido al tocar', () => {
    expect(component.errorFor('logo')).toBeNull();
    expect(component.errorFor('inexistente')).toBeNull();
    component.form.controls.name.markAsTouched();
    expect(component.errorFor('name')).toBe('Este campo es requerido');
  });

  it('Reiniciar limpia el formulario', () => {
    component.form.controls.name.setValue('algo');
    component.onReset();
    expect(component.form.controls.name.value).toBe('');
  });

  it('canDeactivate: true sin cambios, false si está sucio', () => {
    expect(component.canDeactivate()).toBe(true);
    component.form.controls.name.markAsDirty();
    expect(component.canDeactivate()).toBe(false);
  });

  it('con datos válidos crea (POST) y navega al listado', fakeAsync(() => {
    jest.spyOn(TestBed.inject(ProductsApiService), 'verifyId').mockReturnValue(of(false));
    fillValid(component);
    tick(400);

    expect(component.form.valid).toBe(true);

    component.onSubmit();
    const req = httpMock.expectOne('/bp/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.date_revision).toBe('2027-07-01');
    req.flush({ message: 'ok', data: req.request.body });

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('si la creación falla, no navega y rehabilita el envío', fakeAsync(() => {
    jest.spyOn(TestBed.inject(ProductsApiService), 'verifyId').mockReturnValue(of(false));
    fillValid(component);
    tick(400);

    component.onSubmit();
    httpMock.expectOne('/bp/products').flush('err', { status: 400, statusText: 'Bad Request' });

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.submitting()).toBe(false);
  }));
});

describe('ProductFormComponent · edición', () => {
  const existing = {
    id: 'x',
    name: 'Cuenta Ahorro',
    description: 'Descripción larga de prueba',
    logo: 'logo.png',
    date_release: '2026-07-01',
    date_revision: '2027-07-01',
  };

  let httpMock: HttpTestingController;
  let router: Router;
  let state: ProductsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: routeWithId('x') },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    state = TestBed.inject(ProductsStateService);
  });

  afterEach(() => httpMock.verify());

  function create(): ProductFormComponent {
    const fixture = TestBed.createComponent(ProductFormComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('carga del estado en memoria (sin pedir al backend) y deshabilita el id', () => {
    jest.spyOn(state, 'findById').mockReturnValue(existing);
    const component = create();

    expect(component.isEdit).toBe(true);
    expect(component.form.getRawValue().id).toBe('x');
    expect(component.form.controls.id.disabled).toBe(true);
  });

  it('carga por GET cuando el producto no está en el estado', () => {
    jest.spyOn(state, 'findById').mockReturnValue(undefined);
    const component = create();

    httpMock.expectOne('/bp/products/x').flush(existing);
    expect(component.form.getRawValue().name).toBe('Cuenta Ahorro');
  });

  it('si el producto no existe, notifica y vuelve al listado', () => {
    jest.spyOn(state, 'findById').mockReturnValue(undefined);
    const errorSpy = jest.spyOn(TestBed.inject(NotificationService), 'showError');
    create();

    httpMock
      .expectOne('/bp/products/x')
      .flush('not found', { status: 404, statusText: 'Not Found' });

    expect(errorSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('al enviar actualiza vía PUT (sin id en el body) y navega', () => {
    jest.spyOn(state, 'findById').mockReturnValue(existing);
    const component = create();

    component.form.controls.name.setValue('Cuenta Renombrada');
    component.onSubmit();

    const req = httpMock.expectOne('/bp/products/x');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.id).toBeUndefined();
    req.flush({ message: 'ok', data: req.request.body });

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('Reiniciar restaura el producto cargado y conserva el id', () => {
    jest.spyOn(state, 'findById').mockReturnValue(existing);
    const component = create();

    component.form.controls.name.setValue('Otro nombre');
    component.onReset();

    expect(component.form.getRawValue().id).toBe('x');
    expect(component.form.controls.name.value).toBe('Cuenta Ahorro');
    expect(component.form.controls.id.disabled).toBe(true);
    expect(component.form.dirty).toBe(false);
  });
});
