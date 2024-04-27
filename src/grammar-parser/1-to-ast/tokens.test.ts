import { type ILexingResult } from 'chevrotain';
import { tokenizeGrammar } from './tokens';

const serializeToken = ({ tokens }: ILexingResult) =>
  tokens.map((t) => `${t.tokenType.name}:${JSON.stringify(t.image)}`);

describe('1-to-ast/tokens', () => {
  it('should parse tokens', () => {
    const tokens = tokenizeGrammar(`tokens:
  token_1: 123
  token_2: "hello" 'world'`);
    expect(serializeToken(tokens)).toMatchInlineSnapshot(`
      [
        "identifier:"tokens"",
        "colon:":"",
        "nl:"\\n"",
        "indent:"  "",
        "identifier:"token_1"",
        "colon:":"",
        "number:"123"",
        "nl:"\\n"",
        "identifier:"token_2"",
        "colon:":"",
        "doubleQuoteString:"\\"hello\\""",
        "singleQuoteString:"'world'"",
      ]
    `);
  });

  it('should differentiate identifier from number', () => {
    const tokens = tokenizeGrammar(`id1 1 id2 123`);
    expect(serializeToken(tokens)).toMatchInlineSnapshot(`
      [
        "identifier:"id1"",
        "number:"1"",
        "identifier:"id2"",
        "number:"123"",
      ]
    `);
  });
  describe('indent', () => {
    it('should empty line', () => {
      const tokens = tokenizeGrammar('');
      expect(tokens.tokens).toEqual([]);
    });

    it('should parse only new line', () => {
      const tokens = tokenizeGrammar('\n\n\n');
      expect(serializeToken(tokens)).toMatchInlineSnapshot(`
        [
          "nl:"\\n"",
          "nl:"\\n"",
          "nl:"\\n"",
        ]
      `);
    });

    it('should parse indent', () => {
      const tokens = tokenizeGrammar(`  test`);
      expect(serializeToken(tokens)).toMatchInlineSnapshot(`
        [
          "indent:"  "",
          "identifier:"test"",
        ]
      `);
    });
    it('should parse double indent', () => {
      const tokens = tokenizeGrammar(`test
  level2
    level3`);
      expect(serializeToken(tokens)).toMatchInlineSnapshot(`
        [
          "identifier:"test"",
          "nl:"\\n"",
          "indent:"  "",
          "identifier:"level2"",
          "nl:"\\n"",
          "indent:"    "",
          "identifier:"level3"",
        ]
      `);
    });

    it('should parse outdent', () => {
      const tokens = tokenizeGrammar(`test
  level1
outdent`);
      expect(serializeToken(tokens)).toMatchInlineSnapshot(`
        [
          "identifier:"test"",
          "nl:"\\n"",
          "indent:"  "",
          "identifier:"level1"",
          "nl:"\\n"",
          "outdent:""",
          "identifier:"outdent"",
        ]
      `);
    });

    it('should parse multiple level outdent', () => {
      const tokens = tokenizeGrammar(`test
  level1
      level2
        level3
          level4
  outdent
`);
      expect(serializeToken(tokens)).toMatchInlineSnapshot(`
        [
          "identifier:"test"",
          "nl:"\\n"",
          "indent:"  "",
          "identifier:"level1"",
          "nl:"\\n"",
          "indent:"      "",
          "identifier:"level2"",
          "nl:"\\n"",
          "indent:"        "",
          "identifier:"level3"",
          "nl:"\\n"",
          "indent:"          "",
          "identifier:"level4"",
          "nl:"\\n"",
          "outdent:""",
          "outdent:""",
          "outdent:"  "",
          "identifier:"outdent"",
          "nl:"\\n"",
        ]
      `);
    });

    it('should parse indent after outdent', () => {
      const tokens = tokenizeGrammar(`test
  level1
    level2
      level3
        level4
      level3-bis
  level1-bis
root`);
      expect(serializeToken(tokens)).toMatchInlineSnapshot(`
        [
          "identifier:"test"",
          "nl:"\\n"",
          "indent:"  "",
          "identifier:"level1"",
          "nl:"\\n"",
          "indent:"    "",
          "identifier:"level2"",
          "nl:"\\n"",
          "indent:"      "",
          "identifier:"level3"",
          "nl:"\\n"",
          "indent:"        "",
          "identifier:"level4"",
          "nl:"\\n"",
          "outdent:"      "",
          "identifier:"level3-bis"",
          "nl:"\\n"",
          "outdent:""",
          "outdent:"  "",
          "identifier:"level1-bis"",
          "nl:"\\n"",
          "outdent:""",
          "identifier:"root"",
        ]
      `);
    });

    it('should parse multiple of same indent', () => {
      const tokens = tokenizeGrammar(`test
  level1
  level1
  level1`);
      expect(serializeToken(tokens)).toMatchInlineSnapshot(`
        [
          "identifier:"test"",
          "nl:"\\n"",
          "indent:"  "",
          "identifier:"level1"",
          "nl:"\\n"",
          "identifier:"level1"",
          "nl:"\\n"",
          "identifier:"level1"",
        ]
      `);
    });
  });
});
