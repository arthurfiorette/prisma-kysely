import { expect, test } from "bun:test";

import { normalizeCase } from "./normalizeCase.ts";

test("converts names to camel case when config value is set", () => {
  const originalName = "user_id";
  const newName = normalizeCase(originalName, {
    camelCase: true,
    databaseProvider: "postgresql",
    fileName: "",
    enumFileName: "",
    readOnlyIds: false,
    groupBySchema: false,
    schemaGrouping: "none",
    enumArrayType: "array",
    defaultSchema: "public",
    dbTypeName: "DB",
    importExtension: "",
    exportWrappedTypes: false,
  });

  expect(newName).toEqual("userId");
});

test("converts all-uppercase mapped names to camel case when config value is set", () => {
  const config = {
    camelCase: true,
    databaseProvider: "postgresql" as const,
    fileName: "",
    enumFileName: "",
    readOnlyIds: false,
    groupBySchema: false,
    schemaGrouping: "none" as const,
    enumArrayType: "array" as const,
    defaultSchema: "public",
    dbTypeName: "DB",
    importExtension: "",
    exportWrappedTypes: false,
  };

  expect(normalizeCase("UPDATED_AT", config)).toEqual("updatedAt");
  expect(normalizeCase("ID", config)).toEqual("id");
  expect(normalizeCase("TEST_CUSTOMERS", config)).toEqual("testCustomers");
});

test("doesn't convert names to camel case when config value isn't set", () => {
  const originalName = "user_id";
  const newName = normalizeCase(originalName, {
    camelCase: false,
    databaseProvider: "postgresql",
    fileName: "",
    enumFileName: "",
    readOnlyIds: false,
    groupBySchema: false,
    schemaGrouping: "none",
    enumArrayType: "array",
    defaultSchema: "public",
    dbTypeName: "DB",
    importExtension: "",
    exportWrappedTypes: false,
  });

  expect(newName).toEqual("user_id");
});
