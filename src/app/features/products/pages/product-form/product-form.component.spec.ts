import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ProductsApiService } from '../../services/products-api.service';
import { ProductFormComponent } from './product-form.component';

describe('ProductFormComponent', () => {
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
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('arranca inválido', () => {
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

  it('errorFor devuelve el mensaje de requerido cuando el campo está tocado', () => {
    component.form.controls.name.markAsTouched();
    expect(component.errorFor('name')).toBe('Este campo es requerido');
  });

  it('Reiniciar limpia el formulario', () => {
    component.form.controls.name.setValue('algo');
    component.onReset();
    expect(component.form.controls.name.value).toBe('');
  });

  it('con datos válidos crea el producto y navega al listado', fakeAsync(() => {
    jest.spyOn(TestBed.inject(ProductsApiService), 'verifyId').mockReturnValue(of(false));

    component.form.controls.id.setValue('nuevo-1');
    component.form.controls.name.setValue('Cuenta Ahorro');
    component.form.controls.description.setValue('Descripción válida y larga');
    component.form.controls.logo.setValue('logo.png');
    component.form.controls.date_release.setValue('2026-07-01');
    component.form.controls.id.updateValueAndValidity();
    tick(400); // resuelve el debounce del validador async de id

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

    component.form.controls.id.setValue('nuevo-1');
    component.form.controls.name.setValue('Cuenta Ahorro');
    component.form.controls.description.setValue('Descripción válida y larga');
    component.form.controls.logo.setValue('logo.png');
    component.form.controls.date_release.setValue('2026-07-01');
    component.form.controls.id.updateValueAndValidity();
    tick(400);

    component.onSubmit();
    httpMock.expectOne('/bp/products').flush('err', { status: 400, statusText: 'Bad Request' });

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.submitting()).toBe(false);
  }));

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

  it('errorFor devuelve null para un campo sin tocar o inexistente', () => {
    expect(component.errorFor('logo')).toBeNull();
    expect(component.errorFor('inexistente')).toBeNull();
  });
});
