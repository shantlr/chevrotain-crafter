import { map } from 'lodash-es';
import { type GrammarToken } from '../2-validate-ast/types';
import { type IWriter } from '../types';

export const generateLexer = ({
  tokens,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  writer: IWriter;
}) => {
  const content: string[] = [
    `import { createToken, Lexer } from 'chevrotain';`,
    `export const TOKENS = {`,
    ...map(
      tokens,
      (t) => `  [${JSON.stringify(t.name)}]: createToken({
    name: ${JSON.stringify(t.name)},
    pattern: ${typeof t.pattern === 'string' ? JSON.stringify(t.pattern) : t.pattern},
  }),`
    ),
    `};`,
    '',
    `const lexer = new Lexer([`,
    ...map(tokens, (t) => `  TOKENS[${JSON.stringify(t.name)}],`),
    `]);`,
    `export const tokenizeText = (text: string) => {`,
    `  const tokens = grammarLexer.tokenize(preprocessedText.text);`,
    `  return tokens.tokens;`,
    `};`,
  ];
  writer.writeFile('lexer.ts', content.join('\n'));
};
