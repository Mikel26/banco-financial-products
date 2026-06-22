/**
 * Modelo de dominio de un producto financiero.
 *
 * Las fechas se modelan como `string` ISO (`YYYY-MM-DD`): el backend las valida
 * con `@IsDateString()` y las envía/espera como texto. La conversión a `Date`
 * solo se hace en el frontend cuando hace falta comparar o formatear.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

/** Payload de alta (`POST`): el backend exige todos los campos, incluido `id`. */
export type ProductCreate = Product;

/** Payload de edición (`PUT`): el `id` viaja en la URL, no en el cuerpo. */
export type ProductUpdate = Omit<Product, 'id'>;

/** Respuesta de `GET /bp/products`: la lista viene envuelta en `data`. */
export interface ProductsResponse {
  data: Product[];
}

/** Respuesta de `POST` y `PUT`: `{ message, data }`. */
export interface ProductMutationResponse {
  message: string;
  data: Product;
}
