# Drizzle Encryption Demo

A complete example demonstrating how to implement automatic field-level encryption and decryption with Drizzle ORM using AES-256-GCM encryption.

## Overview

This project showcases a robust encryption system that automatically encrypts data before storing it in the database and decrypts it when retrieving, all seamlessly integrated with Drizzle ORM's type system.

## Features

- 🔐 **Automatic Encryption/Decryption**: Data is automatically encrypted when stored and decrypted when retrieved
- 🛡️ **AES-256-GCM Security**: Industry-standard encryption with authentication
- 📊 **Multiple Data Types**: Support for integers, booleans, text, JSON, dates, and more
- 🎯 **Type-Safe**: Full TypeScript support with proper type inference
- ⚡ **Performance Optimized**: Efficient encryption using Node.js crypto module
- 🔧 **Easy Integration**: Simple API that works seamlessly with existing Drizzle schemas

## Key Architecture Files

### `src/server/db/encrypt/functions.ts`

Core encryption/decryption functions using AES-256-GCM:

```typescript
import crypto from "crypto";

export function encryptSync(plaintext: string): string;
export function decryptSync(encryptedData: string): string;
```

**Key Features:**

- Uses AES-256-GCM for authenticated encryption
- Generates random IV for each encryption operation
- Includes authentication tag to prevent tampering
- Base64 encoding for database storage

### `src/server/db/encrypt/columns.ts`

Custom Drizzle column type that provides automatic encryption:

```typescript
export function encrypted<T extends ColumnType>(
  columnName: string,
  columnType: T,
): DrizzleColumn<ColumnTypeMap[T], string>;
```

**Supported Column Types:**

- `"integer"` - Numbers (integers)
- `"number"` - Numbers (floats)
- `"boolean"` - Boolean values
- `"text"` - Text strings
- `"varchar"` - Variable character strings
- `"json"` - Complex JSON objects (uses superjson)
- `"date"` - Date objects

### `src/server/db/schema.ts`

Example schema showing how to use encrypted columns:

```typescript
import { integer, pgTable } from "drizzle-orm/pg-core";
import { encrypted } from "./encrypt";

export const data = pgTable("data", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: encrypted("name", "varchar"),
  createdAt: encrypted("createdAt", "date"),
  isEncrypted: encrypted("isEncrypted", "boolean"),
});
```

## Getting Started

### 1. Environment Setup

Create a `.env.local` file with your encryption key:

```bash
ENCRYPTION_KEY=your-super-secret-encryption-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/database
```

> ⚠️ **Security Note**: Use a strong, random encryption key in production. The same key must be used to decrypt data that was encrypted with it.

### 2. Installation

```bash
pnpm install
```

### 3. Database Setup

```bash
# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate

# Or push schema directly (development)
pnpm db:push
```

### 4. Start Development Server

```bash
pnpm dev
```

## Usage Examples

### Basic Schema Definition

```typescript
import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { encrypted } from "./encrypt";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),

  // These fields will be automatically encrypted
  email: encrypted("email", "varchar"),
  personalInfo: encrypted("personal_info", "json"),
  isActive: encrypted("is_active", "boolean"),
  salary: encrypted("salary", "number"),
  birthDate: encrypted("birth_date", "date"),

  // This field remains unencrypted
  createdAt: timestamp().defaultNow(),
});
```

### Querying Encrypted Data

```typescript
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

// Insert - encryption happens automatically
await db.insert(users).values({
  email: "user@example.com",
  personalInfo: { address: "123 Main St", phone: "555-0123" },
  isActive: true,
  salary: 75000,
  birthDate: new Date("1990-01-01"),
});

// Select - decryption happens automatically
const allUsers = await db.select().from(users);
// allUsers[0].email === "user@example.com" (decrypted automatically)

// Filtering works normally
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.isActive, true));
```

### Custom Encryption Implementation

If you need to implement your own encryption logic:

```typescript
import { encryptSync, decryptSync } from "~/server/db/encrypt/functions";

// Manual encryption
const sensitiveData = "secret information";
const encrypted = encryptSync(sensitiveData);

// Manual decryption
const decrypted = decryptSync(encrypted);
console.log(decrypted); // "secret information"
```

## How It Works

1. **Data Transformation**: When you insert data, the `encrypted()` column type automatically:

   - Converts your data to a string representation
   - Encrypts the string using AES-256-GCM
   - Stores the encrypted value in the database

2. **Automatic Decryption**: When you query data, the column type automatically:

   - Retrieves the encrypted string from the database
   - Decrypts it using the same key
   - Converts it back to the original data type

3. **Type Safety**: TypeScript ensures you work with the correct data types, even though the underlying storage is encrypted strings.

## Security Considerations

- **Key Management**: Store encryption keys securely (environment variables, key management systems)
- **Key Rotation**: Implement a strategy for rotating encryption keys if needed
- **Backup Security**: Ensure database backups are also secured
- **Performance**: Encryption adds computational overhead - benchmark for your use case

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: React + Tailwind CSS + shadcn/ui
- **API**: tRPC for type-safe API calls
- **Encryption**: Node.js crypto module (AES-256-GCM)

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema changes (development)
pnpm db:studio    # Open Drizzle Studio
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is provided as an educational example. Use the encryption patterns in your own projects as needed.
