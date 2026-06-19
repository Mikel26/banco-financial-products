/**
 * Conventional Commits — valida el formato de los mensajes de commit.
 * Ej: feat(products): add product form
 *     fix(core): handle 0 status in error interceptor
 *     chore: initial project scaffold
 */
module.exports = {
  extends: ['@commitlint/config-conventional']
};
