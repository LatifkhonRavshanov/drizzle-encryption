// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { integer, pgTable } from "drizzle-orm/pg-core";
import { encrypted } from "./encrypt";

export const data = pgTable("data", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: encrypted("name", "varchar"),
  createdAt: encrypted("createdAt", "date"),
  isEncrypted: encrypted("isEncrypted", "boolean"),
});
