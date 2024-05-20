import { parseGrammarFile } from '..';
import { type IWriter } from '../types';

let res: string = '';

const writer: IWriter = {
  writeFile: (path, content) => {
    res += `## ${path}\n${content}\n`;
  },
};

describe('grammar-parser', () => {
  beforeEach(() => {
    res = '';
  });

  it('should ', () => {
    parseGrammarFile(
      `
rules:
  start: p1:"hello" p1:"world"`,
      {
        writer,
      }
    );
    expect(res).toMatchInlineSnapshot(`
      "## types.ts
      import { IToken } from 'chevrotain';

      export type RuleCst_Start = {
        name: 'r_start';
        children: {
          p1: 
            | IToken
            | IToken[];
        };
      };

      export type Rule_Start = {
        p1: 
          | string
          | string[];
      };
      ## lexer.ts
      import { createToken, Lexer } from 'chevrotain';
      export const TOKENS = {
        ["hello"]: createToken({
          name: "hello",
          pattern: "hello",
        }),
        ["world"]: createToken({
          name: "world",
          pattern: "world",
        }),
      };

      const lexer = new Lexer([
        TOKENS["hello"],
        TOKENS["world"],
      ]);
      export const tokenizeText = (text: string) => {
        const tokens = grammarLexer.tokenize(preprocessedText.text);
        return tokens.tokens;
      };
      ## parser.ts
      import { CstParser, IToken } from 'chevrotain';
      import { TOKENS } from './lexer';
      import type { RuleCst_Start } from './types';

      class Parser extends CstParser {
        r_start = this.RULE('r_start', () => {
          this.CONSUME(TOKENS["hello"], { LABEL: 'hello' });
          this.CONSUME(TOKENS["world"], { LABEL: 'world' });
        });

        constructor() {
          super(GRAMMAR_TOKEN_LIST);
          this.performSelfAnalysis();
        }
      }

      export const parseTextToCst = (tokens: IToken) => {
        const parser = new Parser();
        parser.input = tokens;
        const cst = parser.r_start();

        if (parser.errors.length) {
        }

        return cst as RuleCst_Start;
      }
      ## cst-to-ast.ts
      import type { RuleCst_Start, Rule_Start } from './types';
      import { TOKENS } from './lexer'

      const mapRuleCst_Start = (cstNode: RuleCst_Start): Rule_Start => {
        return {
          p1: cstNode.children.p1.map(
            (node) => node.tokenType === TOKENS.hello ? node.image : node.image
          ),
        };
      };
      export const cstToAst = (cst: RuleCst_Start): Rule_Start => {
        return mapRuleCst_Start(cst);
      };
      ## index.ts
      import { tokenizeText } from './lexer
      import { parseTextToCst } from './parser';
      import { mapCstToAst } from './cst-to-ast';

      export const parse = (text: string) => {
        const tokens = tokenizeText(text);
        const cst = parseTextToCst(tokens);
        const ast = mapCstToAst(cst);
        return ast;
      };
      "
    `);
  });
});
