import { parseGrammarFileToAst } from "./1-to-ast";

export const parseGrammarFile = (fileText: string) => {
  const ast = parseGrammarFileToAst(fileText);
};
