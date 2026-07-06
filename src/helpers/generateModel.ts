import type { DMMF } from "@prisma/generator-helper";
import ts from "typescript";

import { generateField } from "./generateField.ts";
import { generateFieldType } from "./generateFieldType.ts";
import { generateTypeOverrideFromDocumentation } from "./generateTypeOverrideFromDocumentation.ts";
import { normalizeCase } from "../utils/normalizeCase.ts";
import type { Config } from "../utils/validateConfig.ts";
import { capitalize } from "../utils/words.ts";

/**
 * Some of Prisma's default values are implemented in
 * JS. These should therefore not be annotated as Generated.
 * See https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#attribute-functions.
 */
const defaultTypesImplementedInJS = ["cuid", "uuid"];

export type ModelType = {
  typeName: string;
  tableName: string;
  definition: ts.TypeAliasDeclaration;
  referencedSchemas: string[];
  referencedSchemaTypes: { schema: string; typeName: string }[];
  schema?: string;
};

export type GenerateModelOptions = {
  schemaGrouping: "none" | "namespace" | "exports";
  defaultSchema: string;
  multiSchemaMap?: Map<string, string>;
};

/**
 * Generates a Kysely table type and records schema references needed by split-file output.
 */
export const generateModel = (
  model: DMMF.Model,
  config: Config,
  { defaultSchema, schemaGrouping, multiSchemaMap }: GenerateModelOptions
): ModelType => {
  const referencedSchemas = new Set<string>();
  const referencedSchemaTypes = new Map<
    string,
    { schema: string; typeName: string }
  >();
  const modelSchema = multiSchemaMap?.get(model.name) || defaultSchema;

  const properties = model.fields.flatMap((field) => {
    const isGenerated =
      field.hasDefaultValue &&
      !(
        typeof field.default === "object" &&
        "name" in field.default &&
        defaultTypesImplementedInJS.includes(field.default.name)
      );

    const typeOverride = field.documentation
      ? generateTypeOverrideFromDocumentation(field.documentation)
      : null;

    if (field.kind === "object" || field.kind === "unsupported") return [];

    const dbName = typeof field.dbName === "string" ? field.dbName : null;

    const fieldSchema = multiSchemaMap?.get(field.type);
    const schemaPrefix =
      schemaGrouping !== "none" && fieldSchema !== undefined
        ? fieldSchema || defaultSchema
        : false;

    if (field.kind === "enum") {
      // pg does not register parsers for user-defined enum array OIDs by default.
      // Keep `enumArrayType = "string"` available for raw array literals like `{FOO,BAR}`.
      // See https://github.com/valtyr/prisma-kysely/issues/107 and https://github.com/brianc/node-pg-types/issues/56.
      const isEnumArray = field.isList;
      const enumType = ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(
          schemaPrefix &&
            defaultSchema !== schemaPrefix &&
            (schemaGrouping === "namespace" || schemaPrefix !== modelSchema)
            ? `${capitalize(schemaPrefix)}.${field.type}`
            : field.type
        ),
        undefined
      );

      if ((!isEnumArray || config.enumArrayType === "array") && schemaPrefix) {
        if (defaultSchema !== schemaPrefix) {
          referencedSchemas.add(schemaPrefix);
        }

        referencedSchemaTypes.set(`${schemaPrefix}.${field.type}`, {
          schema: schemaPrefix,
          typeName: field.type,
        });
      }

      return generateField({
        isId: field.isId,
        name: normalizeCase(dbName || field.name, config),
        type: isEnumArray
          ? config.enumArrayType === "string"
            ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            : enumType
          : enumType,
        nullable: !field.isRequired,
        generated: isGenerated,
        list: isEnumArray && config.enumArrayType === "array",
        documentation: field.documentation,
        config,
      });
    }

    return generateField({
      name: normalizeCase(dbName || field.name, config),
      type: ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(
          generateFieldType(field.type, config, typeOverride)
        ),
        undefined
      ),
      nullable: !field.isRequired,
      generated: isGenerated,
      list: field.isList,
      documentation: field.documentation,
      isId: field.isId,
      config,
    });
  });

  return {
    typeName: model.name,
    tableName: model.dbName || model.name,
    referencedSchemas: [...referencedSchemas],
    referencedSchemaTypes: [...referencedSchemaTypes.values()],
    definition: ts.factory.createTypeAliasDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier(model.name),
      undefined,
      ts.factory.createTypeLiteralNode(properties)
    ),
  };
};
