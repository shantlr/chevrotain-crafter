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
      export type Rule_Start_WithNodeType = {
        p1: 
          | string
          | string[];
        __type: 'start';
      }
      export type IParseOptions = {
        withNodeType?: boolean;
      };
      export type ParseTextOutput<ParseOptions extends IParseOptions> =
        ParseOptions extends { withNodeType: true } ? Rule_Start_WithNodeType
        : Rule_Start;
      export interface ParseText {
        (text: string): Rule_Start;
        <ParseOptions extends IParseOptions>(text: string, options: ParseOptions): ParseTextOutput<ParseOptions>;
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
        const tokens = lexer.tokenize(text);
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
          super(TOKENS);
          this.performSelfAnalysis();
        }
      }

      export const parseTextToCst = (tokens: IToken[]) => {
        const parser = new Parser();
        parser.input = tokens;
        const cst = parser.r_start();

        if (parser.errors.length) {
        }

        return cst as RuleCst_Start;
      }
      ## cst-to-ast.ts
      import type { RuleCst_Start, Rule_Start, Rule_Start_WithNodeType, IParseOptions } from './types';
      import { TOKENS } from './lexer'

      const mapRuleCst_Start = (cstNode: RuleCst_Start, options: IParseOptions | undefined): Rule_Start | Rule_Start_WithNodeType => {
        const res: Rule_Start | Rule_Start_WithNodeType = {
          p1: cstNode.children.p1.map(
            (node) => node.tokenType === TOKENS.hello ? node.image : node.image
          ),
        };
        if (options?.withNodeType) {
          (res as Rule_Start_WithNodeType).__type = 'start';
        }
        return res;
      };

      /**
       * Map chevrotain cst node into ast node based on grammar named sequences
       */
      export const cstToAst = (cst: RuleCst_Start, options?: IParseOptions): Rule_Start => {
        return mapRuleCst_Start(cst, options);
      };
      ## index.ts
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
      "
    `);
  });

  describe('types', () => {
    it('should type zero_or_more as optional chevotain type', () => {
      parseGrammarFile(
        `
  rules:
    start: "hello" "world"*`,
        {
          writer,
          generateCstToAst: false,
          generateLexer: false,
          generateParser: false,
          generateTypes: true,
        }
      );
      expect(res).toMatchInlineSnapshot(`
        "## types.ts
        import { IToken } from 'chevrotain';

        export type RuleCst_Start = {
          name: 'r_start';
          children: {
            hello: IToken[];
            world?: IToken[];
          };
        };

        export type Rule_Start = {
          hello: string;
          world: string[];
        };
        export type Rule_Start_WithNodeType = {
          hello: string;
          world: string[];
          __type: 'start';
        }
        export type IParseOptions = {
          withNodeType?: boolean;
        };
        export type ParseTextOutput<ParseOptions extends IParseOptions> =
          ParseOptions extends { withNodeType: true } ? Rule_Start_WithNodeType
          : Rule_Start;
        export interface ParseText {
          (text: string): Rule_Start;
          <ParseOptions extends IParseOptions>(text: string, options: ParseOptions): ParseTextOutput<ParseOptions>;
        };
        ## index.ts
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
        "
      `);
    });
    it('should type zero_or_one as optional chevotain type', () => {
      parseGrammarFile(
        `
      rules:
        start: "hello" "world"?`,
        {
          writer,
          generateCstToAst: false,
          generateLexer: false,
          generateParser: false,
          generateTypes: true,
        }
      );

      expect(res).toMatchInlineSnapshot(`
        "## types.ts
        import { IToken } from 'chevrotain';

        export type RuleCst_Start = {
          name: 'r_start';
          children: {
            hello: IToken[];
            world?: IToken[];
          };
        };

        export type Rule_Start = {
          hello: string;
          world?: string;
        };
        export type Rule_Start_WithNodeType = {
          hello: string;
          world?: string;
          __type: 'start';
        }
        export type IParseOptions = {
          withNodeType?: boolean;
        };
        export type ParseTextOutput<ParseOptions extends IParseOptions> =
          ParseOptions extends { withNodeType: true } ? Rule_Start_WithNodeType
          : Rule_Start;
        export interface ParseText {
          (text: string): Rule_Start;
          <ParseOptions extends IParseOptions>(text: string, options: ParseOptions): ParseTextOutput<ParseOptions>;
        };
        ## index.ts
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
        "
      `);
    });
  });
});
