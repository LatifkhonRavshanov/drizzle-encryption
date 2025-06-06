# Drizzle ORM Encryption Addon

This encryption addon provides type-safe column encryption for Drizzle ORM using AES-256-GCM encryption.

## Features

- **Type-safe**: Full TypeScript support with proper type inference
- **Multiple data types**: Support for integers, numbers, booleans, text, JSON, and dates
- **Secure encryption**: AES-256-GCM with random IVs and authentication tags
- **Easy to use**: Simple API that integrates seamlessly with Drizzle ORM

## Setup

1. Set your encryption key in environment variables:

```bash
ENCRYPTION_KEY=your-secret-encryption-key-here
```

2. Import the encryption utilities:

```typescript
import { encrypted, encryptData, decryptData } from "./server/db/encrypt";
```

## Usage

### 1. Define encrypted columns in your schema

```typescript
import { encrypted } from "./server/db/encrypt";

export const users = createTable("user", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  email: d.varchar({ length: 256 }).notNull(),

  // Encrypted columns - specify column name and type
  encryptedSsn: encrypted("encrypted_ssn", "text"),
  encryptedAge: encrypted("encrypted_age", "integer"),
  encryptedIsVip: encrypted("encrypted_is_vip", "boolean"),
  encryptedSalary: encrypted("encrypted_salary", "number"),
  encryptedProfile: encrypted("encrypted_profile", "json"),
  encryptedBirthdate: encrypted("encrypted_birthdate", "date"),
}));
```

### 2. Encrypt data before inserting

```typescript
import { encryptData } from "./server/db/encrypt";

const userData = {
  email: "user@example.com",
  ssn: "123-45-6789",
  age: 30,
  isVip: true,
  salary: 75000.5,
  profile: { preferences: { theme: "dark" } },
  birthdate: new Date("1993-05-15"),
};

// Encrypt sensitive data
const encryptedData = {
  email: userData.email,
  encryptedSsn: await encryptData(userData.ssn, "text"),
  encryptedAge: await encryptData(userData.age, "integer"),
  encryptedIsVip: await encryptData(userData.isVip, "boolean"),
  encryptedSalary: await encryptData(userData.salary, "number"),
  encryptedProfile: await encryptData(userData.profile, "json"),
  encryptedBirthdate: await encryptData(userData.birthdate, "date"),
};

// Insert into database
const result = await db.insert(users).values(encryptedData).returning();
```

### 3. Decrypt data after selecting

```typescript
import { decryptData } from "./server/db/encrypt";

// Select from database
const encryptedUser = await db.select().from(users).where(eq(users.id, 1));

// Decrypt the data
const decryptedUser = {
  ...encryptedUser,
  ssn: await decryptData(encryptedUser.encryptedSsn, "text"),
  age: await decryptData(encryptedUser.encryptedAge, "integer"),
  isVip: await decryptData(encryptedUser.encryptedIsVip, "boolean"),
  salary: await decryptData(encryptedUser.encryptedSalary, "number"),
  profile: await decryptData(encryptedUser.encryptedProfile, "json"),
  birthdate: await decryptData(encryptedUser.encryptedBirthdate, "date"),
};
```

## Supported Column Types

| Type      | TypeScript Type | Description                |
| --------- | --------------- | -------------------------- |
| `integer` | `number`        | Integer numbers            |
| `number`  | `number`        | Floating-point numbers     |
| `boolean` | `boolean`       | Boolean values             |
| `text`    | `string`        | Text strings               |
| `varchar` | `string`        | Variable character strings |
| `json`    | `unknown`       | JSON objects               |
| `date`    | `Date`          | Date objects               |

## API Reference

### `encrypted(columnName: string, columnType: ColumnType)`

Creates an encrypted column definition for Drizzle schema.

- `columnName`: The database column name
- `columnType`: The type of data being encrypted

### `encryptData<T>(data: T, columnType: ColumnType): Promise<string>`

Encrypts data for storage in the database.

- `data`: The data to encrypt
- `columnType`: The type of the data
- Returns: Encrypted string for database storage

### `decryptData<T>(encryptedValue: string, columnType: ColumnType): Promise<T>`

Decrypts data retrieved from the database.

- `encryptedValue`: The encrypted string from the database
- `columnType`: The original type of the data
- Returns: Decrypted data in its original type

## Security Notes

- All encrypted data is stored as TEXT in the database
- Uses AES-256-GCM with random IVs for each encryption
- Authentication tags prevent tampering
- Ensure your `ENCRYPTION_KEY` is properly secured and backed up
- Consider key rotation strategies for production use

## Example

See `example.ts` for a complete working example with types and usage patterns.
