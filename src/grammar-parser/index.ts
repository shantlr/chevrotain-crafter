import { parseGrammarFileToAst } from './1-to-ast';

export const parseGrammarFile = (
  fileText: string,
  {
    debug,
  }: {
    debug: boolean;
  }
) => {
  const ast = parseGrammarFileToAst(fileText, {
    debug,
  });
  console.log('ast', ast);
};
