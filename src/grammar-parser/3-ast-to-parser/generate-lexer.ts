import { map } from 'lodash-es';
import { type GrammarRule, type GrammarToken } from '../2-validate-ast/types';
import { type IWriter } from '../types';

export const generateLexer = ({
  rules,
  tokens,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  rules: Record<string, GrammarRule>;
  writer: IWriter;
}) => {
  const content: string[] = [
    `import { createToken, Lexer } from 'chevrotain';`,
    `export const TOKENS = {`,
    ...map(
      tokens,
      (t) => `  [${JSON.stringify(t.name)}]: createToken({
    name: ${JSON.stringify(t.name)},
    pattern: ${t.pattern},
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
