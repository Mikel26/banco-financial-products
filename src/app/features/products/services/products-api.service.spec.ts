import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  Product,
  ProductMutationResponse,
  ProductUpdate,
  ProductsResponse,
} from '../models/product.model';
import { ProductsApiService } from './products-api.service';

describe('ProductsApiService', () => {
  const baseUrl = '/bp/products';
  let service: ProductsApiService;
  let httpMock: HttpTestingController;

  const product: Product = {
    id: 'tarjeta-01',
    name: 'Tarjeta Crédito',
    description: 'Una tarjeta de crédito de prueba',
    logo: 'logo.png',
    date_release: '2026-07-01',
    date_revision: '2027-07-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll hace GET y desenvuelve la propiedad data', () => {
    let result: Product[] | undefined;
    service.getAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [product] } as ProductsResponse);

    expect(result).toEqual([product]);
  });

  it('getById pide el producto por id sin envolver', () => {
    let result: Product | undefined;
    service.getById('tarjeta-01').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${baseUrl}/tarjeta-01`);
    expect(req.request.method).toBe('GET');
    req.flush(product);

    expect(result).toEqual(product);
  });

  it('verifyId consulta el endpoint de verificación', () => {
    let exists: boolean | undefined;
    service.verifyId('tarjeta-01').subscribe((r) => (exists = r));

    const req = httpMock.expectOne(`${baseUrl}/verification/tarjeta-01`);
    expect(req.request.method).toBe('GET');
    req.flush(true);

    expect(exists).toBe(true);
  });

  it('create hace POST con el body y desenvuelve data', () => {
    let created: Product | undefined;
    service.create(product).subscribe((r) => (created = r));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(product);
    req.flush({ message: 'ok', data: product } as ProductMutationResponse);

    expect(created).toEqual(product);
  });

  it('update hace PUT al id con los cambios y desenvuelve data', () => {
    const changes: ProductUpdate = {
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.date_release,
      date_revision: product.date_revision,
    };
    let updated: Product | undefined;
    service.update('tarjeta-01', changes).subscribe((r) => (updated = r));

    const req = httpMock.expectOne(`${baseUrl}/tarjeta-01`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(changes);
    req.flush({ message: 'ok', data: product } as ProductMutationResponse);

    expect(updated).toEqual(product);
  });
});
