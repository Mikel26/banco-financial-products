import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

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
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
});
