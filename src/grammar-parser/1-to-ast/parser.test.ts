import { parseGrammarFileToAst } from ".";

describe("1-to-ast/parser", () => {
  describe("tokens", () => {
    it("should parse root tokens field", () => {
      expect(parseGrammarFileToAst(`tokens:`)).toMatchInlineSnapshot(`
        {
          "name": "tokens",
          "tokens": [],
        }
      `);
    });

    it("should parse empty tokens", () => {
      expect(
        parseGrammarFileToAst(`tokens:
  token_1:
  token_2:
  token_3:`),
      ).toMatchInlineSnapshot(`
        {
          "name": "tokens",
          "tokens": [
            {
              "name": "token_1",
              "options": {},
            },
            {
              "name": "token_2",
              "options": {},
            },
            {
              "name": "token_3",
              "options": {},
            },
          ],
        }
      `);
    });

    it("should parse tokens with options", () => {
      expect(
        parseGrammarFileToAst(`tokens:
  token_1:
    opt1: 1
    dstring: "world"
    sstring: 'hello'
    regex: /fuzzy/
  token_2:
    bool: true
    `),
      ).toMatchInlineSnapshot(`
        {
          "name": "tokens",
          "tokens": [
            {
              "name": "token_1",
              "options": {
                "dstring": ""world"",
                "opt1": 1,
                "regex": /fuzzy/,
                "sstring": "'hello'",
              },
            },
            {
              "name": "token_2",
              "options": {
                "bool": true,
              },
            },
          ],
        }
      `);
    });

    describe("errors", () => {
      it("should not parse options without newlines", () => {
        expect(() =>
          parseGrammarFileToAst(`tokens:
  token_1:
    opt1: 1 opt2: 2 opt3: 3`),
        ).toThrowError();
      });
    });
  });

  describe("rules", () => {
    it("should parse root rules field", () => {
      expect(parseGrammarFileToAst("rules:")).toMatchInlineSnapshot(`
        {
          "name": "rules",
          "rules": [],
        }
      `);
    });
    it("should parse basic single rule", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1: "hello" "world"`),
      ).toMatchInlineSnapshot(`
        {
          "name": "rules",
          "rules": [
            {
              "body": [
                ""hello"",
                ""world"",
              ],
              "name": "rule_1",
            },
          ],
        }
      `);
    });
    it("should parse multiple empty rules", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1:
  rule_2:`),
      ).toMatchInlineSnapshot(`
        {
          "name": "rules",
          "rules": [
            {
              "body": null,
              "name": "rule_1",
            },
            {
              "body": null,
              "name": "rule_2",
            },
          ],
        }
      `);
    });
    it("should parse rule reference", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1: rule_2`),
      ).toMatchInlineSnapshot(`
        {
          "name": "rules",
          "rules": [
            {
              "body": [
                {
                  "type": "ref",
                  "value": "rule_2",
                },
              ],
              "name": "rule_1",
            },
          ],
        }
      `);
    });
    it("should parse rule multiple rules", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1: "hello" rule_2
  rule_2: "world" "."`),
      ).toMatchInlineSnapshot(`
        {
          "name": "rules",
          "rules": [
            {
              "body": [
                ""hello"",
                {
                  "type": "ref",
                  "value": "rule_2",
                },
              ],
              "name": "rule_1",
            },
            {
              "body": [
                ""world"",
                ""."",
              ],
              "name": "rule_2",
            },
          ],
        }
      `);
    });
  });
});
