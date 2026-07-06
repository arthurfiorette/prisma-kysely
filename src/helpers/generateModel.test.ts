import { expect, test } from "bun:test";

import { generateModel } from "./generateModel.ts";
import { stringifyTsNode } from "../utils/testUtils.ts";

test("it generates a model!", () => {
  const model = generateModel(
    {
      name: "User",
      fields: [
        {
          name: "id",
          isId: true,
          isGenerated: true,
          default: { name: "uuid", args: [] },
          kind: "scalar",
          type: "String",
          hasDefaultValue: true,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
        {
          name: "id2",
          isId: false,
          isGenerated: false,
          default: { name: "dbgenerated", args: ["uuid()"] },
          kind: "scalar",
          type: "String",
          hasDefaultValue: true,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
        {
          name: "name",
          isId: false,
          isGenerated: false,
          kind: "scalar",
          type: "String",
          hasDefaultValue: false,
          isList: false,
          isReadOnly: false,
          isRequired: false,
          isUnique: false,
        },
        {
          name: "unsupportedField",
          isId: false,
          isGenerated: false,
          kind: "unsupported",
          type: "String",
          hasDefaultValue: false,
          isList: false,
          isReadOnly: false,
          isRequired: false,
          isUnique: false,
        },
        {
          name: "objectField",
          isId: false,
          isGenerated: false,
          kind: "object",
          type: "SomeOtherObject",
          hasDefaultValue: false,
          isList: false,
          isReadOnly: false,
          isRequired: false,
          isUnique: false,
        },
        {
          name: "enumField",
          isId: false,
          isGenerated: false,
          kind: "enum",
          type: "CoolEnum",
          hasDefaultValue: false,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
      ],
      schema: null,
      primaryKey: null,
      dbName: null,
      uniqueFields: [],
      uniqueIndexes: [],
    },
    {
      databaseProvider: "sqlite",
      fileName: "",
      enumFileName: "",
      camelCase: false,
      readOnlyIds: false,
      groupBySchema: false,
      schemaGrouping: "none",
      enumArrayType: "array",
      defaultSchema: "public",
      dbTypeName: "DB",
      importExtension: "",
      exportWrappedTypes: false,
    },
    {
      schemaGrouping: "none",
      defaultSchema: "public",
    }
  );

  expect(model.tableName).toEqual("User");
  expect(model.typeName).toEqual("User");

  const source = stringifyTsNode(model.definition);

  expect(source).toEqual(`export type User = {
    id: string;
    id2: Generated<string>;
    name: string | null;
    enumField: CoolEnum;
};`);
});

test("it respects camelCase option", () => {
  const model = generateModel(
    {
      name: "User",
      fields: [
        {
          name: "id",
          isId: true,
          isGenerated: true,
          default: { name: "uuid", args: [] },
          kind: "scalar",
          type: "String",
          hasDefaultValue: true,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
        {
          name: "user_name",
          isId: false,
          isGenerated: false,
          kind: "scalar",
          type: "String",
          hasDefaultValue: false,
          isList: false,
          isReadOnly: false,
          isRequired: false,
          isUnique: false,
        },
        {
          name: "updatedAt",
          dbName: "UPDATED_AT",
          isId: false,
          isGenerated: false,
          kind: "scalar",
          type: "DateTime",
          hasDefaultValue: false,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
      ],
      schema: null,
      primaryKey: null,
      dbName: null,
      uniqueFields: [],
      uniqueIndexes: [],
    },
    {
      databaseProvider: "sqlite",
      fileName: "",
      enumFileName: "",
      camelCase: true,
      readOnlyIds: false,
      groupBySchema: false,
      schemaGrouping: "none",
      enumArrayType: "array",
      defaultSchema: "public",
      dbTypeName: "DB",
      importExtension: "",
      exportWrappedTypes: false,
    },
    {
      schemaGrouping: "none",
      defaultSchema: "public",
    }
  );

  expect(model.tableName).toEqual("User");
  expect(model.typeName).toEqual("User");

  const source = stringifyTsNode(model.definition);

  expect(source).toEqual(`export type User = {
    id: string;
    userName: string | null;
    updatedAt: string;
};`);
});

test("it types enum arrays as enum arrays by default", () => {
  const model = generateModel(
    {
      name: "User",
      fields: [
        {
          name: "id",
          isId: true,
          isGenerated: false,
          kind: "scalar",
          type: "String",
          hasDefaultValue: false,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
        {
          name: "role",
          isId: false,
          isGenerated: false,
          kind: "enum",
          type: "Role",
          hasDefaultValue: false,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
        {
          name: "permissions",
          isId: false,
          isGenerated: false,
          kind: "enum",
          type: "Permission",
          hasDefaultValue: false,
          isList: true,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
      ],
      schema: null,
      primaryKey: null,
      dbName: null,
      uniqueFields: [],
      uniqueIndexes: [],
    },
    {
      databaseProvider: "postgresql",
      fileName: "",
      enumFileName: "",
      camelCase: false,
      readOnlyIds: false,
      groupBySchema: false,
      schemaGrouping: "none",
      enumArrayType: "array",
      defaultSchema: "public",
      dbTypeName: "DB",
      importExtension: "",
      exportWrappedTypes: false,
    },
    {
      schemaGrouping: "none",
      defaultSchema: "public",
    }
  );

  const source = stringifyTsNode(model.definition);

  expect(source).toEqual(`export type User = {
    id: string;
    role: Role;
    permissions: Permission[];
};`);
});

test("it can type enum arrays as strings for raw pg enum arrays (#107)", () => {
  const model = generateModel(
    {
      name: "User",
      fields: [
        {
          name: "permissions",
          isId: false,
          isGenerated: false,
          kind: "enum",
          type: "Permission",
          hasDefaultValue: false,
          isList: true,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
      ],
      schema: null,
      primaryKey: null,
      dbName: null,
      uniqueFields: [],
      uniqueIndexes: [],
    },
    {
      databaseProvider: "postgresql",
      fileName: "",
      enumFileName: "",
      camelCase: false,
      readOnlyIds: false,
      groupBySchema: false,
      schemaGrouping: "none",
      enumArrayType: "string",
      defaultSchema: "public",
      dbTypeName: "DB",
      importExtension: "",
      exportWrappedTypes: false,
    },
    {
      schemaGrouping: "none",
      defaultSchema: "public",
    }
  );

  const source = stringifyTsNode(model.definition);

  expect(source).toEqual(`export type User = {
    permissions: string;
};`);
});

test("it records missing-schema enum references as default schema references", () => {
  const model = generateModel(
    {
      name: "User",
      fields: [
        {
          name: "mood",
          isId: false,
          isGenerated: false,
          kind: "enum",
          type: "Mood",
          hasDefaultValue: false,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
      ],
      schema: null,
      primaryKey: null,
      dbName: null,
      uniqueFields: [],
      uniqueIndexes: [],
    },
    {
      databaseProvider: "postgresql",
      fileName: "",
      enumFileName: "",
      camelCase: false,
      readOnlyIds: false,
      groupBySchema: false,
      schemaGrouping: "exports",
      enumArrayType: "array",
      defaultSchema: "public",
      dbTypeName: "DB",
      importExtension: "",
      exportWrappedTypes: false,
    },
    {
      schemaGrouping: "exports",
      defaultSchema: "public",
      multiSchemaMap: new Map([
        ["User", "animals"],
        ["Mood", ""],
      ]),
    }
  );

  expect(model.referencedSchemaTypes).toEqual([
    { schema: "public", typeName: "Mood" },
  ]);
});

test("it records enum array schema references when enumArrayType is array", () => {
  const model = generateModel(
    {
      name: "User",
      fields: [
        {
          name: "permissions",
          isId: false,
          isGenerated: false,
          kind: "enum",
          type: "Permission",
          hasDefaultValue: false,
          isList: true,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
        },
      ],
      schema: null,
      primaryKey: null,
      dbName: null,
      uniqueFields: [],
      uniqueIndexes: [],
    },
    {
      databaseProvider: "postgresql",
      fileName: "",
      enumFileName: "",
      camelCase: false,
      readOnlyIds: false,
      groupBySchema: false,
      schemaGrouping: "exports",
      enumArrayType: "array",
      defaultSchema: "public",
      dbTypeName: "DB",
      importExtension: "",
      exportWrappedTypes: false,
    },
    {
      schemaGrouping: "exports",
      defaultSchema: "public",
      multiSchemaMap: new Map([
        ["User", "users"],
        ["Permission", "auth"],
      ]),
    }
  );

  const source = stringifyTsNode(model.definition);

  expect(source).toContain("permissions: Auth.Permission[];");
  expect(model.referencedSchemaTypes).toEqual([
    { schema: "auth", typeName: "Permission" },
  ]);
});
