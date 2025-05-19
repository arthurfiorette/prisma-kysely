import ts from "typescript";
import { describe, expect, test } from "vitest";

describe("The TypeScript internals that we declare and use should actually exist", () => {
  test("ts.isIdentifierText", () => {
    expect(ts.isIdentifierText).toBeDefined();
    expect(ts.isIdentifierText).toBeInstanceOf(Function);
    expect(ts.isIdentifierText.length).toBe(3); // name, languageVersion, identifierVariant
  });
});
