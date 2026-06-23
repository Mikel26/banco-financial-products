/**
 * Parsea una fecha `YYYY-MM-DD` como fecha **local** (medianoche local), evitando
 * el desfase de zona horaria de `new Date(string)`, que la interpreta como UTC.
 * Devuelve `null` si el valor está vacío o no tiene el formato esperado.
 */
export function parseLocalDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
