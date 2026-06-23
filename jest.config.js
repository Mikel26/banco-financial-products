/**
 * Configuración de Jest para el proyecto Angular 17 (sin Karma/Jasmine).
 *
 * Nota: la spec original usaba `setupFilesAfterEach`, que NO es una clave válida
 * de Jest. La clave correcta es `setupFilesAfterEnv` (se ejecuta después de
 * instalar el entorno del framework de test). Corregido aquí.
 */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/index.ts',
    '!src/app/**/*.routes.ts',
    '!src/app/app.config.ts',
    '!src/main.ts'
  ],
  coverageReporters: ['html', 'text', 'text-summary', 'lcov']
};
