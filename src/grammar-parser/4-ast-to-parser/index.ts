import { type GrammarToken } from '../2-validate-ast/types';
import { type RuleDesc } from '../3-describe/types';
import { type IWriter } from '../types';
import { generateTypes } from './generate-types';
import { generateLexer } from './generate-lexer';
import { generateParser } from './generate-parser';
import { generateCstToAst } from './generate-cst-ast';

export const astToOutputParser = ({
  ruleDescs,
  tokens,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  ruleDescs: Record<string, RuleDesc>;
  writer: IWriter;
}) => {
  const rootRule = ruleDescs.start;

  if (!rootRule) {
    throw new Error(`Root rule "start" not found`);
  }

  const rootCstTypeName = rootRule.body.parseOutputTypeName;

  generateTypes({
    tokens,
    ruleDescs,
    writer,
  });

  generateLexer({
    tokens,
    writer,
  });

  generateParser({
    tokens,
    ruleDescs,
    writer,

    rootCstTypeName,
  });

  generateCstToAst({
    tokens,
    rootRule,
    ruleDescs,
    writer,
  });

  writer.writeFile(
    'index.ts',
    [
      `import { tokenizeText } from './lexer';`,
      `import { parseTextToCst } from './parser';`,
      `import { cstToAst } from './cst-to-ast';`,
      '',
      'export const parse = (text: string) => {',
      '  const tokens = tokenizeText(text);',
      '  const cst = parseTextToCst(tokens);',
      '  const ast = cstToAst(cst);',
      '  return ast;',
      '};',
    ].join('\n')
  );
};
