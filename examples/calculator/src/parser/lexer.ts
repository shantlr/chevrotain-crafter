import { createToken, Lexer } from 'chevrotain';
export const TOKENS = {
  ["number"]: createToken({
    name: "number",
    pattern: /[-+]?\d+/,
  }),
  ["+"]: createToken({
    name: "+",
    pattern: "+",
  }),
  ["*"]: createToken({
    name: "*",
    pattern: "*",
  }),
  ["("]: createToken({
    name: "(",
    pattern: "(",
  }),
  [")"]: createToken({
    name: ")",
    pattern: ")",
  }),
};

const lexer = new Lexer([
  TOKENS["number"],
  TOKENS["+"],
  TOKENS["*"],
  TOKENS["("],
  TOKENS[")"],
]);
export const tokenizeText = (text: string) => {
  const tokens = lexer.tokenize(text);
  return tokens.tokens;
};