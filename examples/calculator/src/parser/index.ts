import { tokenizeText } from './lexer';
import { parseTextToCst } from './parser';
import { cstToAst } from './cst-to-ast';
import { IParseOptions, ParseText } from './types';

export const parse: ParseText = <ParseOptions extends IParseOptions>(text: string, options?: ParseOptions) => {
  const tokens = tokenizeText(text);
  const cst = parseTextToCst(tokens);
  const ast = cstToAst(cst, options);
  return ast;
};