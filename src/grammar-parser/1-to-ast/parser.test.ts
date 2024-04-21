import { parseGrammarFileToAst } from ".";

describe("1-to-ast/parser", () => {
  describe("tokens", () => {
    it("should parse root tokens field", () => {
      expect(parseGrammarFileToAst(`tokens:`)).toMatchInlineSnapshot(`
        [
          {
            "name": "tokens",
            "tokens": [],
          },
        ]
      `);
    });

    it("should parse empty tokens", () => {
      expect(
        parseGrammarFileToAst(`tokens:
  token_1:
  token_2:
  token_3:`),
      ).toMatchInlineSnapshot(`
        [
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
          },
        ]
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
        [
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
          },
        ]
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
        [
          {
            "name": "rules",
            "rules": [],
          },
        ]
      `);
    });
    it("should parse basic single rule", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1: "hello" "world"`),
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "rules",
            "rules": [
              {
                "body": [
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": ""hello"",
                  },
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": ""world"",
                  },
                ],
                "name": "rule_1",
              },
            ],
          },
        ]
      `);
    });
    it("should parse multiple empty rules", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1:
  rule_2:`),
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "rules",
            "rules": [
              {
                "body": [],
                "name": "rule_1",
              },
              {
                "body": [],
                "name": "rule_2",
              },
            ],
          },
        ]
      `);
    });
    it("should parse rule reference", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1: rule_2`),
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "rules",
            "rules": [
              {
                "body": [
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": {
                      "type": "ref",
                      "value": "rule_2",
                    },
                  },
                ],
                "name": "rule_1",
              },
            ],
          },
        ]
      `);
    });
    it("should parse rule multiple rules", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1: "hello" rule_2
  rule_2: "world" "."`),
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "rules",
            "rules": [
              {
                "body": [
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": ""hello"",
                  },
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": {
                      "type": "ref",
                      "value": "rule_2",
                    },
                  },
                ],
                "name": "rule_1",
              },
              {
                "body": [
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": ""world"",
                  },
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": ""."",
                  },
                ],
                "name": "rule_2",
              },
            ],
          },
        ]
      `);
    });

    it("should parse pth", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1: ("hello" "world")`),
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "rules",
            "rules": [
              {
                "body": [
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": {
                      "type": "pth",
                      "value": [
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""hello"",
                        },
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""world"",
                        },
                      ],
                    },
                  },
                ],
                "name": "rule_1",
              },
            ],
          },
        ]
      `);
    });
    it("should parse or", () => {
      expect(
        parseGrammarFileToAst(`rules:
  rule_1:
    | "hello"
    | "world"`),
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "rules",
            "rules": [
              {
                "body": [
                  {
                    "type": "or",
                    "value": [
                      [
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""hello"",
                        },
                      ],
                      [
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""world"",
                        },
                      ],
                    ],
                  },
                ],
                "name": "rule_1",
              },
            ],
          },
        ]
      `);
    });

    describe("modifier", () => {
      it("should parse string with modifiers", () => {
        expect(
          parseGrammarFileToAst(`rules:
  rule_1: "hello"? "hello"+ "hello"*`),
        ).toMatchInlineSnapshot(`
          [
            {
              "name": "rules",
              "rules": [
                {
                  "body": [
                    {
                      "modifier": "optional",
                      "name": undefined,
                      "value": ""hello"",
                    },
                    {
                      "modifier": "many1",
                      "name": undefined,
                      "value": ""hello"",
                    },
                    {
                      "modifier": "many",
                      "name": undefined,
                      "value": ""hello"",
                    },
                  ],
                  "name": "rule_1",
                },
              ],
            },
          ]
        `);
      });

      it("should parse identifier with modifiers", () => {
        expect(
          parseGrammarFileToAst(`rules:
  rule_1: rule_2? rule_3+ rule_4*`),
        ).toMatchInlineSnapshot(`
          [
            {
              "name": "rules",
              "rules": [
                {
                  "body": [
                    {
                      "modifier": "optional",
                      "name": undefined,
                      "value": {
                        "type": "ref",
                        "value": "rule_2",
                      },
                    },
                    {
                      "modifier": "many1",
                      "name": undefined,
                      "value": {
                        "type": "ref",
                        "value": "rule_3",
                      },
                    },
                    {
                      "modifier": "many",
                      "name": undefined,
                      "value": {
                        "type": "ref",
                        "value": "rule_4",
                      },
                    },
                  ],
                  "name": "rule_1",
                },
              ],
            },
          ]
        `);
      });
      it("should parse pth with modifiers", () => {
        expect(
          parseGrammarFileToAst(`rules:
  rule_1: ("hello")? (rule_3)+ (rule_4)*`),
        ).toMatchInlineSnapshot(`
          [
            {
              "name": "rules",
              "rules": [
                {
                  "body": [
                    {
                      "modifier": "optional",
                      "name": undefined,
                      "value": {
                        "type": "pth",
                        "value": [
                          {
                            "modifier": undefined,
                            "name": undefined,
                            "value": ""hello"",
                          },
                        ],
                      },
                    },
                    {
                      "modifier": "many1",
                      "name": undefined,
                      "value": {
                        "type": "pth",
                        "value": [
                          {
                            "modifier": undefined,
                            "name": undefined,
                            "value": {
                              "type": "ref",
                              "value": "rule_3",
                            },
                          },
                        ],
                      },
                    },
                    {
                      "modifier": "many",
                      "name": undefined,
                      "value": {
                        "type": "pth",
                        "value": [
                          {
                            "modifier": undefined,
                            "name": undefined,
                            "value": {
                              "type": "ref",
                              "value": "rule_4",
                            },
                          },
                        ],
                      },
                    },
                  ],
                  "name": "rule_1",
                },
              ],
            },
          ]
        `);
      });
      it("should parse named with modifiers", () => {
        expect(
          parseGrammarFileToAst(`rules:
  rule_1: param_1:("hello" )+`),
        ).toMatchInlineSnapshot(`
          [
            {
              "name": "rules",
              "rules": [
                {
                  "body": [
                    {
                      "modifier": "many1",
                      "name": "param_1",
                      "value": {
                        "type": "pth",
                        "value": [
                          {
                            "modifier": undefined,
                            "name": undefined,
                            "value": ""hello"",
                          },
                        ],
                      },
                    },
                  ],
                  "name": "rule_1",
                },
              ],
            },
          ]
        `);
      });
    });
    describe("named", () => {
      it("should parse named identifier", () => {
        expect(
          parseGrammarFileToAst(`rules:
  rule_1: name:rule_2`),
        ).toMatchInlineSnapshot(`
          [
            {
              "name": "rules",
              "rules": [
                {
                  "body": [
                    {
                      "modifier": undefined,
                      "name": "name",
                      "value": {
                        "type": "ref",
                        "value": "rule_2",
                      },
                    },
                  ],
                  "name": "rule_1",
                },
              ],
            },
          ]
        `);
      });
      it("should parse named string", () => {
        expect(
          parseGrammarFileToAst(`rules:
  rule_1: name:"hello"`),
        ).toMatchInlineSnapshot(`
          [
            {
              "name": "rules",
              "rules": [
                {
                  "body": [
                    {
                      "modifier": undefined,
                      "name": "name",
                      "value": ""hello"",
                    },
                  ],
                  "name": "rule_1",
                },
              ],
            },
          ]
        `);
      });
      it("should parse named pth", () => {
        expect(
          parseGrammarFileToAst(`rules:
  rule_1: name:("hello" "world")`),
        ).toMatchInlineSnapshot(`
          [
            {
              "name": "rules",
              "rules": [
                {
                  "body": [
                    {
                      "modifier": undefined,
                      "name": "name",
                      "value": {
                        "type": "pth",
                        "value": [
                          {
                            "modifier": undefined,
                            "name": undefined,
                            "value": ""hello"",
                          },
                          {
                            "modifier": undefined,
                            "name": undefined,
                            "value": ""world"",
                          },
                        ],
                      },
                    },
                  ],
                  "name": "rule_1",
                },
              ],
            },
          ]
        `);
      });
    });

    describe("binary operator", () => {
      it("should parse or binary", () => {
        expect(
          parseGrammarFileToAst(`rules:
  rule_1: "hello" | "world" | "fizbuzz"`),
        ).toMatchInlineSnapshot(`
          [
            {
              "name": "rules",
              "rules": [
                {
                  "body": [
                    {
                      "type": "or",
                      "value": [
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""hello"",
                        },
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""world"",
                        },
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""fizbuzz"",
                        },
                      ],
                    },
                  ],
                  "name": "rule_1",
                },
              ],
            },
          ]
        `);
      });

      it("should parse or combinaison", () => {
        expect(
          parseGrammarFileToAst(`rules:
  rule_1: "hello" | "world" "center" "after" | "after-2" "then" "end"`),
        ).toMatchInlineSnapshot(`
          [
            {
              "name": "rules",
              "rules": [
                {
                  "body": [
                    {
                      "type": "or",
                      "value": [
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""hello"",
                        },
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""world"",
                        },
                      ],
                    },
                    {
                      "modifier": undefined,
                      "name": undefined,
                      "value": ""center"",
                    },
                    {
                      "type": "or",
                      "value": [
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""after"",
                        },
                        {
                          "modifier": undefined,
                          "name": undefined,
                          "value": ""after-2"",
                        },
                      ],
                    },
                    {
                      "modifier": undefined,
                      "name": undefined,
                      "value": ""then"",
                    },
                    {
                      "modifier": undefined,
                      "name": undefined,
                      "value": ""end"",
                    },
                  ],
                  "name": "rule_1",
                },
              ],
            },
          ]
        `);
      });
    });
  });

  describe("both", () => {
    it("should parse both", () => {
      expect(
        parseGrammarFileToAst(
          `tokens:
  token_1:

rules:
  rule_1: "hello" "world"`,
          { debug: true },
        ),
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "tokens",
            "tokens": [
              {
                "name": "token_1",
                "options": {},
              },
            ],
          },
          {
            "name": "rules",
            "rules": [
              {
                "body": [
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": ""hello"",
                  },
                  {
                    "modifier": undefined,
                    "name": undefined,
                    "value": ""world"",
                  },
                ],
                "name": "rule_1",
              },
            ],
          },
        ]
      `);
    });
  });
});
