import { type GrammarRule, type GrammarToken } from '../2-validate-ast/types';
import { type IWriter } from '../types';
import { generateLexer } from './generate-lexer';
import { generateParser } from './generate-parser';

export const astToOutputParser = ({
  rules,
  tokens,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  rules: Record<string, GrammarRule>;
  writer: IWriter;
}) => {
  generateLexer({
    tokens,
    rules,
    writer,
  });

  generateParser({
    tokens,
    rules,
    writer,
  });

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
