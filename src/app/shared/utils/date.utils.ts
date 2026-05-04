/**
 * Parses a date string in the application's internal format `dd.mm.yyyy`.
 * Returns a Date object at midnight local time.
 */
export function parseDdMmYyyy(value: string): Date {
  const [day, month, year] = value.split('.');
  return new Date(Number(year), Number(month) - 1, Number(day));
}
