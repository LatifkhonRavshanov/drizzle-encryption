import superjson from "superjson";
import { customType } from "drizzle-orm/pg-core";
import { sql, type SQL } from "drizzle-orm";
import { encryptSync, decryptSync } from "./functions";

export type ColumnType =
  | "integer"
  | "number"
  | "boolean"
  | "text"
  | "varchar"
  | "json"
  | "date";

type ColumnTypeMap = {
  integer: number;
  number: number;
  boolean: boolean;
  text: string;
  varchar: string;
  json: unknown;
  date: Date;
};

function dataToString<T extends ColumnType>(
  data: ColumnTypeMap[T],
  columnType: T,
): string {
  switch (columnType) {
    case "integer":
    case "number":
      return (data as number).toString();
    case "boolean":
      return (data as boolean).toString();
    case "text":
    case "varchar":
      return data as string;
    case "json":
      const { json, meta } = superjson.serialize(data);
      return `${superjson.stringify(json)}:::::${superjson.stringify(meta)}`;
    case "date":
      return (data as Date).toISOString();
    default:
      return String(data);
  }
}

function stringToData<T extends ColumnType>(
  str: string,
  columnType: T,
): ColumnTypeMap[T] {
  switch (columnType) {
    case "integer":
      return parseInt(str, 10) as ColumnTypeMap[T];
    case "number":
      return parseFloat(str) as ColumnTypeMap[T];
    case "boolean":
      return (str === "true") as ColumnTypeMap[T];
    case "text":
    case "varchar":
      return str as ColumnTypeMap[T];
    case "json":
      const [json, meta] = str.split(":::::");
      if (!json || !meta) {
        throw new Error("Invalid JSON string");
      }
      const parsedJson = superjson.parse(json);
      const parsedMeta = superjson.parse(meta);
      return superjson.deserialize({
        // @ts-expect-error - superjson types are not exported from the package
        json: parsedJson,
        // @ts-expect-error - superjson types are not exported from the package
        meta: parsedMeta,
      });
    case "date":
      return new Date(str) as ColumnTypeMap[T];
    default:
      return str as ColumnTypeMap[T];
  }
}

// The encrypted column type with automatic encryption/decryption
export function encrypted<T extends ColumnType>(
  columnName: string,
  columnType: T,
) {
  return customType<{ data: ColumnTypeMap[T]; driverData: string }>({
    dataType() {
      return "text";
    },

    fromDriver(encryptedValue: string): ColumnTypeMap[T] {
      try {
        const decryptedString = decryptSync(encryptedValue);
        return stringToData(decryptedString, columnType);
      } catch (error) {
        throw new Error(
          `Failed to decrypt column '${columnName}': ${(error as Error).message}`,
        );
      }
    },

    toDriver(data: ColumnTypeMap[T]): SQL<unknown> {
      try {
        const stringData = dataToString(data, columnType);
        const encryptedValue = encryptSync(stringData);
        return sql`${encryptedValue}`;
      } catch (error) {
        throw new Error(
          `Failed to encrypt column '${columnName}': ${(error as Error).message}`,
        );
      }
    },
  })(columnName);
}

export type DecryptedType<T extends ColumnType> = ColumnTypeMap[T];
