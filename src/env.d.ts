declare module "typescript" {
  // https://github.com/microsoft/TypeScript/blob/81c951894e93bdc37c6916f18adcd80de76679bc/src/compiler/scanner.ts#L985
  export function isIdentifierText(
    name: string,
    languageVersion?: ScriptTarget | undefined,
    identifierVariant?: LanguageVariant
  ): boolean;
}

export {};
