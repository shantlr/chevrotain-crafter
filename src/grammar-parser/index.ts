import { parseGrammarFileToAst } from './1-to-ast';
import { validateGrammarAst } from './2-validate-ast';
import { astToOutputParser } from './3-ast-to-parser';

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
  const validated = validateGrammarAst(ast);
  if (!validated) {
    return;
  }

  astToOutputParser({
    tokens: validated.tokens,
    rules: validated.rules,
    writer: {
      writeFile: (path, content) => {
        console.log(`//> ${path}`);
        console.log(content);
        console.log(`//< ${path}`);
      },
    },
  });
};
