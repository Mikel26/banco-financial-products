import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Product, ProductUpdate } from '../models/product.model';
import { ProductsStateService } from './products-state.service';

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

describe('ProductsStateService', () => {
  const url = '/bp/products';
  let service: ProductsStateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsStateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('arranca con estado vacío', () => {
    expect(service.products()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.totalResults()).toBe(0);
  });

  it('loadProducts puebla la lista y togglea loading', () => {
    service.loadProducts();
    expect(service.loading()).toBe(true);

    httpMock.expectOne(url).flush({ data: [makeProduct()] });

    expect(service.loading()).toBe(false);
    expect(service.products().length).toBe(1);
  });

  it('loadProducts setea error y apaga loading si falla', () => {
    service.loadProducts();
    httpMock.expectOne(url).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toBe('No se pudieron cargar los productos');
    expect(service.loading()).toBe(false);
  });

  it('filtra por nombre o descripción (case-insensitive)', () => {
    service.loadProducts();
    httpMock.expectOne(url).flush({
      data: [
        makeProduct({ id: 'a', name: 'Visa Gold' }),
        makeProduct({ id: 'b', name: 'Mastercard', description: 'plata' }),
      ],
    });

    service.setSearchTerm('VISA');
    expect(service.totalResults()).toBe(1);
    expect(service.visibleProducts()[0].id).toBe('a');

    service.setSearchTerm('plata');
    expect(service.visibleProducts()[0].id).toBe('b');
  });

  it('pagina según pageSize sin perder el total', () => {
    service.loadProducts();
    const many = Array.from({ length: 12 }, (_, i) => makeProduct({ id: `id-${i}` }));
    httpMock.expectOne(url).flush({ data: many });

    service.setPageSize(5);
    expect(service.visibleProducts().length).toBe(5);

    service.setPageSize(10);
    expect(service.visibleProducts().length).toBe(10);
    expect(service.totalResults()).toBe(12);
  });

  it('addProduct agrega el producto creado al estado', () => {
    const nuevo = makeProduct({ id: 'nuevo' });
    service.addProduct(nuevo).subscribe();
    httpMock.expectOne(url).flush({ message: 'ok', data: nuevo });

    expect(service.findById('nuevo')).toEqual(nuevo);
  });

  it('updateProduct reemplaza solo el producto objetivo y deja intactos los demás', () => {
    service.loadProducts();
    httpMock.expectOne(url).flush({
      data: [makeProduct({ id: 'x', name: 'Antes' }), makeProduct({ id: 'y', name: 'Otro' })],
    });

    const changes: ProductUpdate = {
      name: 'Después',
      description: 'Nueva descripción larga',
      logo: 'logo.png',
      date_release: '2026-07-01',
      date_revision: '2027-07-01',
    };
    let emitted: Product | undefined;
    service.updateProduct('x', changes).subscribe((p) => (emitted = p));
    // El backend devuelve el body SIN id (el id va en la URL): el servicio lo readjunta.
    httpMock.expectOne(`${url}/x`).flush({ message: 'ok', data: changes });

    expect(emitted?.id).toBe('x');
    expect(service.findById('x')?.name).toBe('Después');
    expect(service.findById('y')?.name).toBe('Otro'); // rama false del merge: intacto
    expect(service.products().length).toBe(2);
  });

  it('updateProduct con id inexistente no altera el estado', () => {
    service.loadProducts();
    httpMock.expectOne(url).flush({ data: [makeProduct({ id: 'x' })] });

    const changes: ProductUpdate = {
      name: 'Fantasma',
      description: 'No existe en la lista local',
      logo: 'logo.png',
      date_release: '2026-07-01',
      date_revision: '2027-07-01',
    };
    service.updateProduct('z', changes).subscribe();
    httpMock.expectOne(`${url}/z`).flush({ message: 'ok', data: changes });

    expect(service.products().length).toBe(1);
    expect(service.findById('z')).toBeUndefined();
  });

  it('addProduct fallido (400) deja el estado intacto y propaga el error', () => {
    let errored = false;
    service.addProduct(makeProduct({ id: 'dup' })).subscribe({ error: () => (errored = true) });
    httpMock.expectOne(url).flush('dup', { status: 400, statusText: 'Bad Request' });

    expect(errored).toBe(true);
    expect(service.products()).toEqual([]);
  });

  it('un término de solo espacios se trata como vacío y devuelve todo', () => {
    service.loadProducts();
    httpMock.expectOne(url).flush({ data: [makeProduct({ id: 'a' }), makeProduct({ id: 'b' })] });

    service.setSearchTerm('   ');
    expect(service.totalResults()).toBe(2);
    expect(service.visibleProducts().length).toBe(2);
  });

  it('con lista vacía el filtrado y los visibles son [] y el total 0', () => {
    service.loadProducts();
    httpMock.expectOne(url).flush({ data: [] });

    service.setSearchTerm('algo');
    expect(service.filteredProducts()).toEqual([]);
    expect(service.visibleProducts()).toEqual([]);
    expect(service.totalResults()).toBe(0);
  });

  it('pageSize 20 con lista más corta devuelve todos los elementos', () => {
    service.loadProducts();
    const many = Array.from({ length: 12 }, (_, i) => makeProduct({ id: `id-${i}` }));
    httpMock.expectOne(url).flush({ data: many });

    service.setPageSize(20);
    expect(service.visibleProducts().length).toBe(12);
    expect(service.totalResults()).toBe(12);
  });
});
