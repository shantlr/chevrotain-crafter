import { type GrammarToken } from '../2-validate-ast/types';
import { type RuleDesc } from '../3-describe/types';
import { type IWriter } from '../types';
import { generateLexer } from './generate-lexer';
import { generateParser } from './generate-parser';

export const astToOutputParser = ({
  ruleDescs,
  tokens,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  ruleDescs: Record<string, RuleDesc>;
  writer: IWriter;
}) => {
  generateLexer({
    tokens,
    writer,
  });

  generateParser({
    tokens,
    ruleDescs,
    writer,
  });

  // generateAstTypes({
  //   tokens,
  //   rules,
  //   writer,
  // });

  writer.writeFile(
    'index.ts',
    [
      `import { tokenizeText } from './lexer`,
      `import { parseTextToCst } from './parser';`,
      `import { mapCstToAst } from './to-ast';`,
      '',
      'export const parse = (text: string) => {',
      '  const tokens = tokenizeText(text);',
      '  const cst = parseTextToCst(tokens);',
      '  const ast = mapCstToAst(cst);',
      '  return ast;',
      '};',
    ].join('\n')
  );
};
