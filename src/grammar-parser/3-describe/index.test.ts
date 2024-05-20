import { describeRules } from '.';

describe('3-types', () => {
  it('should map single literal', () => {
    expect(
      describeRules({
        rules: {
          start: {
            name: 'start',
            methodName: 'start',
            astBody: [
              {
                value: 'hello',
              },
            ],
          },
        },
        tokens: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "ruleDescs": {
          "start": {
            "body": {
              "chevrotain": {
                "type": "seq",
                "value": [
                  {
                    "label": "hello",
                    "outputName": "hello",
                    "tokenName": "hello",
                    "type": "consume",
                  },
                ],
              },
              "cstOutputType": undefined,
              "cstOutputTypeDefault": {
                "fields": {
                  "hello": {
                    "type": "string",
                  },
                },
                "type": "object",
              },
              "cstOutputTypeName": "Rule_Start",
              "parseOutputType": {
                "fields": {
                  "children": {
                    "fields": {
                      "hello": {
                        "elementType": {
                          "tokenName": "hello",
                          "type": "chevrotainToken",
                        },
                        "type": "array",
                      },
                    },
                    "type": "object",
                  },
                  "name": {
                    "type": "literal",
                    "value": "start",
                  },
                },
                "type": "object",
              },
              "parseOutputTypeName": "RuleCst_Start",
            },
            "rule": {
              "astBody": [
                {
                  "value": "hello",
                },
              ],
              "methodName": "start",
              "name": "start",
            },
          },
        },
      }
    `);
  });
  it('should map or', () => {
    expect(
      describeRules({
        rules: {
          start: {
            name: 'start',
            methodName: 'start',
            astBody: [
              {
                type: 'or',
                value: [[{ value: 'hello' }], [{ value: 'world' }]],
              },
            ],
          },
        },
        tokens: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "ruleDescs": {
          "start": {
            "body": {
              "chevrotain": {
                "type": "seq",
                "value": [
                  {
                    "type": "or",
                    "value": [
                      {
                        "type": "seq",
                        "value": [
                          {
                            "label": "hello",
                            "outputName": "hello",
                            "tokenName": "hello",
                            "type": "consume",
                          },
                        ],
                      },
                      {
                        "type": "seq",
                        "value": [
                          {
                            "label": "world",
                            "outputName": "world",
                            "tokenName": "world",
                            "type": "consume",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              "cstOutputType": undefined,
              "cstOutputTypeDefault": {
                "fields": {
                  "hello": {
                    "type": "string",
                  },
                  "world": {
                    "type": "string",
                  },
                },
                "type": "object",
              },
              "cstOutputTypeName": "Rule_Start",
              "parseOutputType": {
                "fields": {
                  "children": {
                    "fields": {
                      "hello": {
                        "elementType": {
                          "tokenName": "hello",
                          "type": "chevrotainToken",
                        },
                        "type": "array",
                      },
                      "world": {
                        "elementType": {
                          "tokenName": "world",
                          "type": "chevrotainToken",
                        },
                        "type": "array",
                      },
                    },
                    "type": "object",
                  },
                  "name": {
                    "type": "literal",
                    "value": "start",
                  },
                },
                "type": "object",
              },
              "parseOutputTypeName": "RuleCst_Start",
            },
            "rule": {
              "astBody": [
                {
                  "type": "or",
                  "value": [
                    [
                      {
                        "value": "hello",
                      },
                    ],
                    [
                      {
                        "value": "world",
                      },
                    ],
                  ],
                },
              ],
              "methodName": "start",
              "name": "start",
            },
          },
        },
      }
    `);
  });
  it('should map or with named', () => {
    expect(
      describeRules({
        rules: {
          start: {
            name: 'start',
            methodName: 'start',
            astBody: [
              {
                type: 'or',
                value: [
                  [{ value: 'hello' }],
                  [{ value: 'world', name: 'param1' }],
                ],
              },
            ],
          },
        },
        tokens: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "ruleDescs": {
          "start": {
            "body": {
              "chevrotain": {
                "type": "seq",
                "value": [
                  {
                    "type": "or",
                    "value": [
                      {
                        "type": "seq",
                        "value": [
                          {
                            "label": "hello",
                            "outputName": "hello",
                            "tokenName": "hello",
                            "type": "consume",
                          },
                        ],
                      },
                      {
                        "type": "seq",
                        "value": [
                          {
                            "label": "world",
                            "outputName": "param1",
                            "tokenName": "world",
                            "type": "consume",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              "cstOutputType": {
                "fields": {
                  "param1": {
                    "type": "string",
                  },
                },
                "type": "object",
              },
              "cstOutputTypeDefault": {
                "fields": {
                  "hello": {
                    "type": "string",
                  },
                  "world": {
                    "type": "string",
                  },
                },
                "type": "object",
              },
              "cstOutputTypeName": "Rule_Start",
              "parseOutputType": {
                "fields": {
                  "children": {
                    "fields": {
                      "hello": {
                        "elementType": {
                          "tokenName": "hello",
                          "type": "chevrotainToken",
                        },
                        "type": "array",
                      },
                      "param1": {
                        "elementType": {
                          "tokenName": "world",
                          "type": "chevrotainToken",
                        },
                        "type": "array",
                      },
                    },
                    "type": "object",
                  },
                  "name": {
                    "type": "literal",
                    "value": "start",
                  },
                },
                "type": "object",
              },
              "parseOutputTypeName": "RuleCst_Start",
            },
            "rule": {
              "astBody": [
                {
                  "type": "or",
                  "value": [
                    [
                      {
                        "value": "hello",
                      },
                    ],
                    [
                      {
                        "name": "param1",
                        "value": "world",
                      },
                    ],
                  ],
                },
              ],
              "methodName": "start",
              "name": "start",
            },
          },
        },
      }
    `);
  });

  it('should handle or with same name', () => {
    expect(
      describeRules({
        rules: {
          start: {
            name: 'start',
            methodName: 'r_start',
            astBody: [
              {
                type: 'or',
                value: [
                  [{ value: 'hello', name: 'param1' }],
                  [
                    {
                      name: 'param1',
                      value: { type: 'ref', value: 'rule_1' },
                    },
                  ],
                ],
              },
            ],
          },
          rule_1: {
            name: 'rule_1',
            methodName: 'r_rule_1',
            astBody: [
              {
                value: 'world',
              },
            ],
          },
        },
        tokens: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "ruleDescs": {
          "rule_1": {
            "body": {
              "chevrotain": {
                "type": "seq",
                "value": [
                  {
                    "label": "world",
                    "outputName": "world",
                    "tokenName": "world",
                    "type": "consume",
                  },
                ],
              },
              "cstOutputType": undefined,
              "cstOutputTypeDefault": {
                "fields": {
                  "world": {
                    "type": "string",
                  },
                },
                "type": "object",
              },
              "cstOutputTypeName": "Rule_Rule1",
              "parseOutputType": {
                "fields": {
                  "children": {
                    "fields": {
                      "world": {
                        "elementType": {
                          "tokenName": "world",
                          "type": "chevrotainToken",
                        },
                        "type": "array",
                      },
                    },
                    "type": "object",
                  },
                  "name": {
                    "type": "literal",
                    "value": "r_rule_1",
                  },
                },
                "type": "object",
              },
              "parseOutputTypeName": "RuleCst_Rule1",
            },
            "rule": {
              "astBody": [
                {
                  "value": "world",
                },
              ],
              "methodName": "r_rule_1",
              "name": "rule_1",
            },
          },
          "start": {
            "body": {
              "chevrotain": {
                "type": "seq",
                "value": [
                  {
                    "type": "or",
                    "value": [
                      {
                        "type": "seq",
                        "value": [
                          {
                            "label": "hello",
                            "outputName": "param1",
                            "tokenName": "hello",
                            "type": "consume",
                          },
                        ],
                      },
                      {
                        "type": "seq",
                        "value": [
                          {
                            "label": "param1",
                            "outputName": "param1",
                            "ruleMethodName": "r_rule_1",
                            "type": "subrule",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              "cstOutputType": {
                "fields": {
                  "param1": {
                    "branch": [
                      {
                        "type": "string",
                      },
                      {
                        "ruleName": "rule_1",
                        "type": "ruleRef",
                      },
                    ],
                    "type": "or",
                  },
                },
                "type": "object",
              },
              "cstOutputTypeDefault": {
                "fields": {
                  "hello": {
                    "type": "string",
                  },
                  "r_rule_1": {
                    "ruleName": "rule_1",
                    "type": "ruleRef",
                  },
                },
                "type": "object",
              },
              "cstOutputTypeName": "Rule_Start",
              "parseOutputType": {
                "fields": {
                  "children": {
                    "fields": {
                      "param1": {
                        "branch": [
                          {
                            "elementType": {
                              "tokenName": "hello",
                              "type": "chevrotainToken",
                            },
                            "type": "array",
                          },
                          {
                            "elementType": {
                              "ruleName": "rule_1",
                              "type": "ruleRef",
                            },
                            "type": "array",
                          },
                        ],
                        "type": "or",
                      },
                    },
                    "type": "object",
                  },
                  "name": {
                    "type": "literal",
                    "value": "r_start",
                  },
                },
                "type": "object",
              },
              "parseOutputTypeName": "RuleCst_Start",
            },
            "rule": {
              "astBody": [
                {
                  "type": "or",
                  "value": [
                    [
                      {
                        "name": "param1",
                        "value": "hello",
                      },
                    ],
                    [
                      {
                        "name": "param1",
                        "value": {
                          "type": "ref",
                          "value": "rule_1",
                        },
                      },
                    ],
                  ],
                },
              ],
              "methodName": "r_start",
              "name": "start",
            },
          },
        },
      }
    `);
  });

  it('should handle multiple same name', () => {
    expect(
      describeRules({
        rules: {
          start: {
            name: 'start',
            methodName: 'r_start',
            astBody: [
              {
                name: 'param1',
                value: 'hello',
              },
              {
                name: 'param1',
                value: 'world',
              },
            ],
          },
        },
        tokens: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "ruleDescs": {
          "start": {
            "body": {
              "chevrotain": {
                "type": "seq",
                "value": [
                  {
                    "label": "hello",
                    "outputName": "param1",
                    "tokenName": "hello",
                    "type": "consume",
                  },
                  {
                    "label": "world",
                    "outputName": "param1",
                    "tokenName": "world",
                    "type": "consume",
                  },
                ],
              },
              "cstOutputType": {
                "fields": {
                  "param1": {
                    "elementType": {
                      "branch": [
                        {
                          "type": "string",
                        },
                        {
                          "type": "string",
                        },
                      ],
                      "type": "or",
                    },
                    "type": "array",
                  },
                },
                "type": "object",
              },
              "cstOutputTypeDefault": {
                "fields": {
                  "hello": {
                    "type": "string",
                  },
                  "world": {
                    "type": "string",
                  },
                },
                "type": "object",
              },
              "cstOutputTypeName": "Rule_Start",
              "parseOutputType": {
                "fields": {
                  "children": {
                    "fields": {
                      "param1": {
                        "elementType": {
                          "branch": [
                            {
                              "tokenName": "hello",
                              "type": "chevrotainToken",
                            },
                            {
                              "tokenName": "world",
                              "type": "chevrotainToken",
                            },
                          ],
                          "type": "or",
                        },
                        "type": "array",
                      },
                    },
                    "type": "object",
                  },
                  "name": {
                    "type": "literal",
                    "value": "r_start",
                  },
                },
                "type": "object",
              },
              "parseOutputTypeName": "RuleCst_Start",
            },
            "rule": {
              "astBody": [
                {
                  "name": "param1",
                  "value": "hello",
                },
                {
                  "name": "param1",
                  "value": "world",
                },
              ],
              "methodName": "r_start",
              "name": "start",
            },
          },
        },
      }
    `);
  });
});
