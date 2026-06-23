# 🏦 Banco — Gestión de Productos Financieros

> Frontend Angular para la gestión de productos financieros del Banco.
> Reto técnico **NTT Data** — Posición **Angular SSR** (Semi-Senior).

![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-29.x-C21325?logo=jest&logoColor=white)
![Coverage](https://img.shields.io/badge/coverage-94%25-success)

> **Estado:** Fases 0–3 completadas — listado (F1), búsqueda (F2) y selector de
> cantidad + contador (F3) funcionando contra el backend real, sobre el design
> system y la capa de datos. **En curso:** Fase 4 (formulario: agregar/editar).
> Ver [Estado del proyecto](#-estado-del-proyecto).

---

## ⚡ Quick start

> El backend (`repo-interview-main`, provisto por NTT) vive **al lado** de este
> proyecto, como carpeta hermana. El proxy de Angular redirige `/bp` →
> `http://localhost:3002` sin tocar el backend.

```bash
# 1. Levantar el backend (carpeta hermana provista por NTT)
cd ../repo-interview-main
npm install
npm run start:dev          # http://localhost:3002

# 2. Instalar dependencias del frontend
cd ../banco-financial-products
pnpm install

# 3. Iniciar el dev server (proxy automático al backend vía proxy.conf.json)
pnpm start                 # http://localhost:4200

# 4. Tests
pnpm test
pnpm test:coverage
```

---

## 🎯 Funcionalidades (Path SSR + deseables habituales)

| #   | Funcionalidad                                          | Estado                             |
| --- | ------------------------------------------------------ | ---------------------------------- |
| F1  | Listado de productos financieros                       | ✅ Implementado                    |
| F2  | Búsqueda por texto (nombre / descripción)              | ✅ Implementado                    |
| F3  | Selector de cantidad (5, 10, 20) + total de resultados | ✅ Implementado                    |
| F4  | Agregar producto con validaciones                      | ⏳ En curso (Fase 4)               |
| F5  | Editar producto (id deshabilitado)                     | ⏳ Pendiente (Fase 4)              |
| F6  | Eliminar producto                                      | ❌ Alcance Senior — fuera de scope |

**Calidad transversal aplicada como estándar habitual (no como features extra):**

- ⚡ **Rendimiento** — `OnPush`, `track` en `@for`, signals + `computed`, lazy loading de imágenes, debounce en búsqueda
- 💀 **Skeleton loaders** — feedback visual durante la carga (custom, sin librerías)
- 📱 **Responsive** — mobile-first; la tabla colapsa a cards en mobile
- ♿ **Accesibilidad** — labels, `aria-busy`, focus visible, `prefers-reduced-motion`

---

## 🏗️ Arquitectura

```
src/app/
├── core/        ← singleton app-wide: interceptors, guards, services
├── shared/      ← UI reutilizable: button, text-input, select, date-input, header
└── features/
    └── products/← feature con lazy loading: models, services, validators, pages
src/styles/      ← design system SCSS (variables, mixins, reset, typography)
```

### Decisiones clave

- **Standalone components** (Angular 17, sin NgModules)
- **Signals** para state management (sin NgRx — overkill para el scope)
- **Sin frameworks de estilos** (requisito explícito del cliente bancario)
- **Jest** como test runner (preferido por NTT, reemplaza Karma/Jasmine)
- **Lazy loading** por feature (`loadChildren` + `loadComponent`)
- **HTTP Interceptor** para manejo centralizado de errores
- **Custom validators** síncronos y asíncronos
- **CanDeactivate guard** para formulario con cambios sin guardar
- **proxy.conf.json** para resolver CORS sin modificar el backend

Ver [`DECISIONS.md`](./DECISIONS.md) para los ADRs detallados.

---

## 🧪 Testing

- Framework: **Jest** + `jest-preset-angular`
- Cobertura objetivo: **≥ 70 %** (threshold configurado en `jest.config.js`)
- Mock de `HttpClient` con `HttpTestingController`
- Unit tests (services, validators, interceptor, guard) + component tests

```bash
pnpm test            # corre la suite
pnpm test:coverage   # reporte de cobertura
```

> Cobertura actual: **~95.3 % statements / 97.3 % branches**, 87 tests.

---

## 🔍 Observaciones encontradas en el backend

Durante el desarrollo se identificaron observaciones del backend provisto.
**No fueron modificadas** (se respeta la separación de responsabilidades), pero
se documentan como feedback para el equipo backend:

1. **CORS deshabilitado** — `// cors: true` comentado en `main.ts`. Resuelto en el frontend vía `proxy.conf.json` (`/bp` → `:3002`). _(Verificado.)_
2. **Validación de `name`** — el DTO usa `@MinLength(6)` mientras el PDF indica 5. El frontend se alinea al backend (6) para evitar errores 400. _(Verificado.)_
3. **DTO sin reglas de negocio** — `id` solo tiene `@IsNotEmpty()` (sin min/max); no valida `date_release ≥ hoy` ni `date_revision = date_release + 1 año`. Implementadas en el frontend con custom validators. _(Verificado.)_
4. **`verification/:id`** retorna un boolean primitivo (`products.some(...)`), no un objeto. El frontend lo tipa acordemente. _(Verificado.)_
5. **Sin persistencia** — los productos viven en memoria (`products: ProductInterface[] = []`); cada reinicio pierde datos. _(Verificado.)_
6. **`PUT /products/:id` sin validación** — a diferencia de `POST` (`@Body({ validate: true })`), el update usa `@Body()` sin validación: las reglas del DTO **no** se aplican al editar. El frontend es la única garantía en F5. _(Hallazgo nuevo.)_
7. **Backend sin datos semilla** — el listado arranca vacío; para ver F1/F2/F3 hay que crear productos primero con F4. El frontend contempla un _empty state_ además del skeleton. _(Hallazgo nuevo.)_
8. **`GET /products/:id` sin envolver** — devuelve el producto directo (no `{ data }`) y responde 404 si no existe. Como F5 prefiltra desde el estado en memoria, un refresh directo en `/products/edit/:id` requiere recargar productos antes de poblar el formulario. _(Nota de implementación.)_

---

## 📦 Stack técnico

- Angular 17 (standalone components)
- TypeScript 5.x (strict mode)
- RxJS 7.x · Reactive Forms · HttpClient
- Jest 29.x + jest-preset-angular
- ESLint + Prettier
- Husky + lint-staged + commitlint (conventional commits)
- PNPM 9.x
- SCSS modular (sin frameworks)

---

## 🗺️ Estado del proyecto

- [x] **Fase 0** — Scaffold + bootstrap (estructura, config, la app arranca con proxy)
- [x] **Fase 1** — Models + ProductsApiService + ProductsStateService (signals) + NotificationService + error interceptor
- [x] **Fase 2** — Design system SCSS + componentes shared (button, text-input, select, date-input, header)
- [x] **Fase 3** — F1 listado + skeleton (responsive) · F2 búsqueda (debounce) · F3 cantidad + contador
- [ ] **Fase 4** — Custom validators (id async, release, revision) + F4 agregar + F5 editar + unsaved-changes guard + rutas `new`/`edit/:id`
- [ ] **Fase 5** — Responsive del formulario + a11y polish final
- [ ] **Fase 6** — Cobertura consolidada + cierre de documentación

---

## 👤 Autor

Mikel Ortega Ortiz · [GitHub](https://github.com/Mikel26) · [LinkedIn](https://www.linkedin.com/in/mikelortega2693)
