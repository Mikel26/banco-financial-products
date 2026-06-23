import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { Product } from '../../models/product.model';
import { ProductListComponent } from './product-list.component';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'id-1',
    name: 'Producto Uno',
    description: 'Descripción larga de prueba',
    logo: 'logo.png',
    date_release: '2026-07-01',
    date_revision: '2027-07-01',
    ...overrides,
  };
}

describe('ProductListComponent', () => {
  const url = '/bp/products';
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => httpMock.verify());

  it('carga los productos al iniciar y muestra el skeleton mientras carga', () => {
    fixture.detectChanges(); // dispara ngOnInit -> loadProducts
    expect(fixture.nativeElement.querySelector('app-product-table-skeleton')).toBeTruthy();
    httpMock.expectOne(url).flush({ data: [] });
  });

  it('muestra el empty-state cuando no hay productos', () => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush({ data: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.products__empty')).toBeTruthy();
  });

  it('renderiza una fila por producto', () => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush({
      data: [makeProduct({ id: 'a' }), makeProduct({ id: 'b' })],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('muestra un banner de error si la carga falla', () => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.products__error')).toBeTruthy();
  });

  it('oculta el logo si la imagen no carga', () => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush({ data: [makeProduct()] });
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('.logo__img');
    img.dispatchEvent(new Event('error'));
    expect(img.style.display).toBe('none');
  });

  it('initials() deriva hasta dos iniciales del nombre', () => {
    expect(component.initials('Visa Gold Premium')).toBe('VG');
    expect(component.initials('Mastercard')).toBe('M');
  });

  it('filtra la lista al escribir en la búsqueda (con debounce)', fakeAsync(() => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush({
      data: [
        makeProduct({ id: 'a', name: 'Visa Gold' }),
        makeProduct({ id: 'b', name: 'Mastercard' }),
      ],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);

    component.searchControl.setValue('visa');
    tick(300);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Visa Gold');
  }));

  it('muestra el estado "sin resultados" cuando la búsqueda no coincide', fakeAsync(() => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush({ data: [makeProduct({ id: 'a', name: 'Visa' })] });
    fixture.detectChanges();

    component.searchControl.setValue('zzz');
    tick(300);
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.products__empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('Sin resultados');
  }));

  it('cambia la cantidad mostrada con el selector (F3)', () => {
    fixture.detectChanges();
    const many = Array.from({ length: 12 }, (_, i) => makeProduct({ id: `id-${i}` }));
    httpMock.expectOne(url).flush({ data: many });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(5);

    component.pageSizeControl.setValue(10);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(10);
  });

  it('muestra el contador con el total de resultados (F3)', () => {
    fixture.detectChanges();
    const many = Array.from({ length: 12 }, (_, i) => makeProduct({ id: `id-${i}` }));
    httpMock.expectOne(url).flush({ data: many });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.products__count').textContent).toContain(
      '12 Resultados',
    );
  });

  it('navega al formulario de alta al pulsar Agregar (F4)', () => {
    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    httpMock.expectOne(url).flush({ data: [] });
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    buttons.find((b) => b.textContent?.includes('Agregar'))?.click();

    expect(navSpy).toHaveBeenCalledWith(['/products/new']);
  });

  it('navega a editar al elegir Editar en el menú de la fila (F5)', () => {
    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    httpMock.expectOne(url).flush({ data: [makeProduct({ id: 'x' })] });
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.row-menu__trigger').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.row-menu__item').click();

    expect(navSpy).toHaveBeenCalledWith(['/products/edit', 'x']);
  });
});
