import { parseGrammarFileToAst } from './1-to-ast';
import { validateGrammarAst } from './2-validate-ast';
import { describeRules } from './3-describe';
import { astToOutputParser } from './4-ast-to-parser';

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

  const describes = describeRules({
    rules: validated.rules,
    tokens: validated.tokens,
  });

  astToOutputParser({
    tokens: validated.tokens,
    ruleDescs: describes.ruleDescs,
    writer: {
      writeFile: (path, content) => {
        console.log(`//> ${path}`);
        console.log(content);
        console.log(`//< ${path}`);
      },
    },
  });
};
