# prisma-kysely

## 3.2.0

### Minor Changes

- c4af420: Add `enumArrayType` to control how Prisma enum-array fields are generated.

  The new default is `enumArrayType = "array"`, which emits enum arrays as the corresponding TypeScript enum union array, for example `Permission[]`. This is the most useful type when the application registers PostgreSQL enum-array parsers with `pg`, because query results then contain real JavaScript arrays instead of raw PostgreSQL array literal strings.

  For applications that rely on the default `pg` behavior for user-defined enum arrays, `enumArrayType = "string"` preserves the previous safer output. In that mode an enum-array column is typed as `string`, matching raw values such as `{FOO,BAR}` or `{}` returned by `pg` when no parser is registered for the enum array OID.

  This makes the behavior explicit instead of forcing one runtime assumption on every project. Projects with enum-array parser registration can use precise array types, while projects without parser registration can keep the raw-string typing introduced for the PostgreSQL enum-array parsing limitation described in `node-pg-types` issue 56.

  The generator also tracks schema references for enum arrays when `enumArrayType = "array"`, so split schema output can import cross-schema enum-array types correctly in `schemaGrouping = "exports"` mode.

- c4af420: Add `schemaGrouping` as the new schema grouping control, with `"none"`, `"namespace"`, and `"exports"` modes.

  `schemaGrouping = "namespace"` keeps the existing single-file namespace output, where non-default schemas are emitted as TypeScript namespaces and database table references use names such as `Animals.Dog`. Existing users of `groupBySchema = true` continue to get this behavior because `groupBySchema` is now treated as a legacy alias for `schemaGrouping = "namespace"`.

  `schemaGrouping = "exports"` adds a split-file output mode for multi-schema projects. When `fileName = "types.ts"`, the generator now writes `types/index.ts` plus one file per non-default schema, such as `types/animals.ts`. The index file still exports the main `DB` type and exposes each schema through namespace-style module exports, for example `export * as Animals from "./animals"`. This preserves the ergonomic `Animals.Dog` type shape while avoiding TypeScript namespace declarations in generated code.

  The split-file mode keeps default-schema declarations in the index file and writes non-default schema declarations as normal exported types in their schema file. Cross-schema enum references are imported between schema files, and schema files import shared generated helpers such as `Generated` and `Timestamp` from the index instead of redefining those helpers in every file.

  Grouped modes now own enum placement, so `enumFileName` is ignored when `schemaGrouping` is `"namespace"` or `"exports"`. This avoids splitting schema-owned declarations into incompatible files and keeps grouped output self-contained.

### Patch Changes

- b05aea3: Fix `camelCase = true` for all-uppercase mapped table and column names.

  Previously names such as `UPDATED_AT`, `ID`, or `TEST_CUSTOMERS` could be emitted as `UPDATEDAT`, `ID`, and `TESTCUSTOMERS` because the camel-case mapper preserved uppercase segments instead of normalizing all-uppercase snake-case identifiers first. This affected schemas that map database names with uppercase conventions through Prisma `@map` and `@@map`.

  The generator now treats all-uppercase snake-case names as database identifiers that should be lowercased before camel-case conversion. With `camelCase = true`, `UPDATED_AT` becomes `updatedAt`, `ID` becomes `id`, and `TEST_CUSTOMERS` becomes `testCustomers`, matching the behavior users expect from Kysely's camel case plugin.

## 3.1.1

### Patch Changes

- f41a74e: Emit enum arrays as `string` under PostgreSQL and CockroachDB, matching how Kysely represents enum array columns. Fixes #107.

## 3.1.0

### Minor Changes

- 71a8e10: Add `banner` configuration option to allow users to prepend custom content (imports, pragmas, comments) to generated files.

## 3.0.0

### Major Changes

- c25e269: Support Prisma 7.0.0+

  To upgrade:
  - Ensure you are using Bun, or Node.js >=22.x
  - Update your Prisma dependency to 7.0.0 or later
  - Review the [Prisma 7.0.0 upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
  - Move your database url to the prisma.config.ts file

## 2.3.0

### Minor Changes

- c038a9e: support prisma >=6.2 <7.0

## 2.2.1

### Patch Changes

- 649f4b7: Bump Prisma to 6.16

## 2.2.0

### Minor Changes

- f3d93bc: Introduce the `exportWrappedTypes` option for exporting types wrapped in Kysely's Selectable, Insertable and Updatable helpers

## 2.1.0

### Minor Changes

- 37bcf6d: Support the `Json` type with SQLite

## 2.0.0

### Major Changes

- 8fab339: Support for prisma 6.10.1

### Minor Changes

- 8fab339: Add `groupBySchema` to group types and enums under a namespace
- 8fab339: Move from Node 16 to Node 24
- 8fab339: Add dbTypeName

### Patch Changes

- 8fab339: Use node:sqlite inside tests
- 8fab339: Handle enum primary keys on many-to-many relationships

## 1.8.0

### Minor Changes

- 4526321: Added support for the Kysely SQL Server dialect Awesome work from @dylel 🎊

### Patch Changes

- 04de4dc: Fixed automatic relation code generation bug. Thanks @Bayezid1989 🥳

## 1.7.1

### Patch Changes

- 22a1e5c: Fixes array types (Thanks Karrui! 🥳🇸🇬)
- 21980b2: Updates dependencies that were throwing deprectaion warnings. (Thank you @delight! 🍺)

## 1.7.0

### Minor Changes

- bf0ccf6: Implicit many to many relations are finally fixed thanks to @dextertanyj 🇸🇬🎉🥂. Huge thanks to him!

## 1.6.0

### Minor Changes

- defb3fa: Update typescript to 5 and migrate from ttypescript to ts-patch (Thank you @alandotcom! 🎉)

## 1.5.0

### Minor Changes

- 3ec4465: Support `multiSchema` preview feature. (Thanks to @duniul 🇸🇪🪅)

### Patch Changes

- 7923981: Adds per field type overrides
- 6a50fe8: Respect mapped names for fields with enum types. (Thank you @fehnomenal 🇩🇪🎉)
- 3ec4465: Sort DB properties by table name instead of type name. (Thank you @duniul 🇸🇪🪅)

## 1.4.2

### Patch Changes

- 744b666: Uses the value of fileName when no enumFileName provided. Previously now if you used a different fileName and you didn't provide enumFileName it put the database in the fileName and enums in types.ts.

  Now imports GeneratedAlways only when needed. Previously it was always added, even if not needed which caused problems with the linter.

## 1.4.1

### Patch Changes

- 36393b6: Bugfix: revert to own generated type, that supports ColumnType

## 1.4.0

### Minor Changes

- 3288b72: Support @map statement for enum values (Thank you @jvandenaardweg 🔥🇳🇱)
- 299de40: Adds support for Kysely's `GeneratedAlways` through a new config parameter `readOnlyIds`. The generated type file no longer includes and exports the `Generated` generic.
- 66019e8: Brings back support for implicit many to many models after DMMF changes introduced in new version of Prisma

### Patch Changes

- 2659cc3: Now using narrower types for enum objects bringing `prisma-kysely`'s enums in line with `prisma-client-js` (Thank you @jvandenaardweg 🎉)

## 1.3.0

### Minor Changes

- a96f2d7: Add option to output runtime enums to a separate file (Thank you @juliusmarminge! 🇸🇪🎉)

## 1.2.1

### Patch Changes

- ff5bc59: Add object declarations for enums, that can be used (among other things) for runtime validation. Thanks @jvandenaardweg for the idea! 😎👍

## 1.2.0

### Minor Changes

- 533e41e: Pass Prisma comments on Prisma fields to the generated TypeScript types
- 8892135: Add support for field level @map and update core dependencies

## 1.1.0

### Minor Changes

- 7ab12d5: The first minor version bump 😮. Turns out some of the type maps were wrong. This update corrects `BigInt` and `Decimal` types for all dialects, and corrects the `DateTime` type for SQLite.

## 1.0.11

### Patch Changes

- 1cb96de: Update README

## 1.0.10

### Patch Changes

- Add support for CockroachDB (thanks to @yevhenii-horbenko 🥳)

## 1.0.9

### Patch Changes

- 3bb5d89: Add support for Kysely's camel case plugin

## 1.0.8

### Patch Changes

- e7ecabe: Adds Typescript as a primary dependency in order to fix issue #8

## 1.0.7

### Patch Changes

- 0a50f6f: Add support for @@map("...") statements (mapping models to different table names) and table names with spaces
