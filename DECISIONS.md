# Architecture Decision Records (ADRs)

> Decisiones de arquitectura del reto técnico NTT Data — Frontend Angular SSR.
> Formato: **Context → Decision → Consequences**.

| ADR | Decisión | Estado |
|---|---|---|
| [001](#adr-001-standalone-components-en-lugar-de-ngmodules) | Standalone components | Aceptada |
| [002](#adr-002-signals-para-state-management) | Signals para state management | Aceptada |
| [003](#adr-003-sin-frameworks-de-estilos) | Sin frameworks de estilos | Aceptada |
| [004](#adr-004-proxyconf-en-lugar-de-modificar-el-backend) | Proxy.conf en lugar de modificar backend | Aceptada |
| [005](#adr-005-validación-de-name-con-minlength6) | `name` con MinLength(6) en frontend | Aceptada |
| [006](#adr-006-jest-sobre-karma) | Jest sobre Karma | Aceptada |
| [007](#adr-007-scope-funcional-ssr-f1f5-sin-f6) | Scope funcional SSR (F1–F5, sin F6) | Aceptada |
| [008](#adr-008-skeleton-loader-custom-sin-librerías) | Skeleton loader custom | Aceptada |
| [009](#adr-009-onpush--signals-en-toda-la-app) | OnPush + Signals en toda la app | Aceptada |

---

## ADR-001: Standalone components en lugar de NgModules

**Context:** Angular 17 ofrece ambos paradigmas (NgModules y standalone).

**Decision:** Usar **standalone components** en toda la aplicación, sin NgModules.

**Consequences:** Mejor tree-shaking, menos boilerplate y alineación con la
dirección oficial de Angular. Requiere declarar `imports` a nivel de componente.

---

## ADR-002: Signals para state management

**Context:** Opciones para manejar estado: NgRx, `BehaviorSubject`s, o signals.

**Decision:** **Signals + Services** (`ProductsStateService`), exponiendo signals
de solo lectura y `computed` para data derivada.

**Consequences:** Simplicidad y buen rendimiento sin la ceremonia de NgRx. Posible
deuda si la app creciera a múltiples features acopladas — aceptable para este scope.

---

## ADR-003: Sin frameworks de estilos

**Context:** El PDF prohíbe explícitamente frameworks de estilos/componentes
prefabricados; el correo deja la opción abierta. El cliente final (banco) no los usa.

**Decision:** Construir el design system desde cero con **SCSS modular**
(variables, mixins, reset propio, naming BEM-like).

**Consequences:** Mayor tiempo de desarrollo a cambio de control total, bundle
más pequeño y cero dependencias de UI. La consigna del documento técnico se toma
como fuente de verdad por encima del correo.

---

## ADR-004: Proxy.conf en lugar de modificar el backend

**Context:** El backend tiene CORS deshabilitado (`cors: true` comentado). Aplico
como **Frontend Developer**: modificar el backend rompería la separación de
responsabilidades organizacionales.

**Decision:** Resolver CORS con el **proxy del dev server de Angular**
(`proxy.conf.json`: `/bp` → `http://localhost:3002`). El servicio HTTP usa rutas
relativas (`/bp/products`).

**Consequences:** Cero cambios en el backend, transparente en desarrollo. Requiere
configuración equivalente de proxy/CORS en un eventual despliegue. La observación
se documenta como feedback al equipo backend.

---

## ADR-005: Validación de `name` con MinLength(6)

**Context:** El PDF especifica `name` con mínimo 5 caracteres, pero el DTO del
backend usa `@MinLength(6)`.

**Decision:** Alinear el validador del frontend al **backend real (6)** para evitar
errores 400, en lugar de seguir el PDF.

**Consequences:** Comportamiento consistente con la API. Documentado en el README
como observación. Si el equipo backend alinea a 5, el frontend se ajusta en un solo
punto (el validador del formulario).

---

## ADR-006: Jest sobre Karma

**Context:** El default de Angular es Karma + Jasmine; el PDF prefiere Jest.

**Decision:** **Jest 29 + `jest-preset-angular`** (enfoque puro con `jest.config.js`
+ `setup-jest.ts`), sustituyendo Karma/Jasmine.

**Consequences:** Tests más rápidos y mejor DX, a cambio de configuración inicial.
Notas de implementación:
- Se usa la API moderna `setupZoneTestEnv` de `jest-preset-angular` v14+.
- **Corrección sobre la spec original:** la clave de Jest es `setupFilesAfterEnv`,
  no `setupFilesAfterEach` (esta última no existe en Jest).

---

## ADR-007: Scope funcional SSR (F1–F5, sin F6)

**Context:** Aplico a la posición **SSR (Semi-Senior)**, no Senior. Los deseables
del path Senior (rendimiento, skeleton, responsive) son prácticas habituales de mi
flujo de trabajo diario.

**Decision:** Implementar **F1–F5** (path SSR completo + el deseable F5) más
rendimiento, skeleton loaders y responsive design. **F6 (eliminar)** queda fuera de
scope como única limitación funcional, por ser lógica de negocio exclusiva de Senior.

**Consequences:** Se respeta el scope funcional asignado al nivel SSR. La calidad
transversal (performance, UX, a11y) se aplica como mínimo profesional, no como
features añadidas.

---

## ADR-008: Skeleton loader custom (sin librerías)

**Context:** Se necesita feedback visual durante la carga. Opciones: spinner
genérico, librería (`ngx-skeleton-loader`), o componente propio.

**Decision:** `ProductTableSkeletonComponent` standalone con animación **shimmer**
en SCSS, que imita la estructura de la tabla.

**Consequences:** Sin dependencias externas, control total de la UX, respeto de
`prefers-reduced-motion` y mejora del CLS (Cumulative Layout Shift).

---

## ADR-009: OnPush + Signals en toda la app

**Context:** Angular 17 ofrece signals nativos; `OnPush` requiere disciplina pero
mejora el rendimiento.

**Decision:** `ChangeDetectionStrategy.OnPush` en **todos** los componentes
(páginas y shared) + signals para el estado.

**Consequences:** Detección de cambios óptima y menos re-renders. Requiere usar
signals/inmutabilidad en lugar de mutación directa de propiedades.
