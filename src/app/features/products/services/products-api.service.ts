import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  Product,
  ProductCreate,
  ProductMutationResponse,
  ProductUpdate,
  ProductsResponse,
} from '../models/product.model';

/**
 * Capa HTTP de productos. Responsabilidad única: hablar con el backend.
 * No mantiene estado ni aplica reglas de negocio; solo dispara peticiones y
 * desenvuelve la forma de cada respuesta. Las rutas son relativas (`/bp/...`):
 * el dev-server las reenvía al backend vía `proxy.conf.json`.
 */
@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/bp/products';

  /** `GET /bp/products` → desenvuelve `data`. */
  getAll(): Observable<Product[]> {
    return this.http.get<ProductsResponse>(this.baseUrl).pipe(map((response) => response.data));
  }

  /** `GET /bp/products/:id` → el backend devuelve el producto sin envolver. */
  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  /** `GET /bp/products/verification/:id` → boolean crudo (`true` si ya existe). */
  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${encodeURIComponent(id)}`);
  }

  /** `POST /bp/products` → desenvuelve `data`. */
  create(product: ProductCreate): Observable<Product> {
    return this.http
      .post<ProductMutationResponse>(this.baseUrl, product)
      .pipe(map((response) => response.data));
  }

  /**
   * `PUT /bp/products/:id` → desenvuelve `data`.
   *
   * El backend devuelve en `data` el body que recibió (sin `id`, que viaja en
   * la URL), así que reajuntamos el `id` conocido —y lo hacemos prevalecer— para
   * emitir un `Product` completo y honesto con su tipo.
   */
  update(id: string, product: ProductUpdate): Observable<Product> {
    return this.http
      .put<ProductMutationResponse>(`${this.baseUrl}/${encodeURIComponent(id)}`, product)
      .pipe(map((response) => ({ ...response.data, id })));
  }
}
