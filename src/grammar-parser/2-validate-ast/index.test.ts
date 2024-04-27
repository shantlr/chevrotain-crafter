import { validateGrammarAst } from '.';

describe('2-validate-ast', () => {
  it('should validate simple token', () => {
    expect(
      validateGrammarAst({
        fields: [
          {
            name: 'tokens',
            tokens: [
              {
                name: 'token1',
                options: {
                  pattern: 'hello',
                },
              },
            ],
          },
        ],
      })
    ).toMatchInlineSnapshot(`
      {
        "rules": {},
        "tokens": {
          "token1": {
            "group": undefined,
            "name": "token1",
            "pattern": "hello",
          },
        },
      }
    `);
  });
  it('should validate inline token', () => {
    expect(
      validateGrammarAst({
        fields: [
          {
            name: 'rules',
            rules: [
              {
                name: 'rule1',
                body: [
                  {
                    value: 'hello',
                  },
                ],
              },
            ],
          },
        ],
      })
    ).toMatchInlineSnapshot(`
      {
        "rules": {
          "rule1": {
            "astBody": [
              {
                "value": "hello",
              },
            ],
            "name": "rule1",
          },
        },
        "tokens": {
          "inline:hello": {
            "name": "inline:hello",
            "pattern": "hello",
          },
        },
      }
    `);
  });
  describe('reference', () => {
    it('should validate existing token reference', () => {
      expect(
        validateGrammarAst({
          fields: [
            {
              name: 'tokens',
              tokens: [
                {
                  name: 'token1',
                  options: {
                    pattern: 'hello',
                  },
                },
              ],
            },
            {
              name: 'rules',
              rules: [
                {
                  name: 'rule1',
                  body: [
                    {
                      value: {
                        type: 'ref',
                        value: 'token1',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        })
      ).toMatchInlineSnapshot(`
        {
          "rules": {
            "rule1": {
              "astBody": [
                {
                  "value": {
                    "type": "ref",
                    "value": "token1",
                  },
                },
              ],
              "name": "rule1",
            },
          },
          "tokens": {
            "token1": {
              "group": undefined,
              "name": "token1",
              "pattern": "hello",
            },
          },
        }
      `);
    });
    it('should validate existing rule reference', () => {
      expect(
        validateGrammarAst({
          fields: [
            {
              name: 'rules',
              rules: [
                {
                  name: 'rule1',
                  body: [
                    {
                      value: {
                        type: 'ref',
                        value: 'rule2',
                      },
                    },
                  ],
                },
                {
                  name: 'rule2',
                  body: [
                    {
                      value: 'hello',
                    },
                  ],
                },
              ],
            },
          ],
        })
      ).toMatchInlineSnapshot(`
        {
          "rules": {
            "rule1": {
              "astBody": [
                {
                  "value": {
                    "type": "ref",
                    "value": "rule2",
                  },
                },
              ],
              "name": "rule1",
            },
            "rule2": {
              "astBody": [
                {
                  "value": "hello",
                },
              ],
              "name": "rule2",
            },
          },
          "tokens": {
            "inline:hello": {
              "name": "inline:hello",
              "pattern": "hello",
            },
          },
        }
      `);
    });
  });
});
