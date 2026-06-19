/**
 * Setup global de Jest para Angular.
 *
 * Usa la API moderna de jest-preset-angular (v14+): `setupZoneTestEnv`
 * inicializa el TestBed con zone.js. Reemplaza al antiguo
 * `import 'jest-preset-angular/setup-jest';` (deprecado).
 */
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();
