/**
 * Converts a TypeScript enum to a PostgreSQL enum-compatible array.
 * 
 * @template T - The type of the enum.
 * @param myEnum - The enum to convert.
 * @returns An array of strings representing the enum values, formatted for PostgreSQL.
 */
export function enumToPgEnum<T extends Record<string, any>>(myEnum: T): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any;
}
