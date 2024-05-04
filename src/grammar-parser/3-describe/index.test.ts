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
                  "hello": "string",
                },
                "type": "object",
                "typeName": "",
              },
              "parseOutputType": {
                "fields": {
                  "hello": {
                    "type": "chevrotainToken",
                  },
                },
                "type": "object",
                "typeName": "",
              },
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
                  "hello": "string",
                  "world": "string",
                },
                "type": "object",
                "typeName": "",
              },
              "parseOutputType": {
                "fields": {
                  "hello": {
                    "type": "chevrotainToken",
                  },
                  "world": {
                    "type": "chevrotainToken",
                  },
                },
                "type": "object",
                "typeName": "",
              },
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
                  "param1": "string",
                },
                "type": "object",
                "typeName": "",
              },
              "cstOutputTypeDefault": {
                "fields": {
                  "hello": "string",
                  "world": "string",
                },
                "type": "object",
                "typeName": "",
              },
              "parseOutputType": {
                "fields": {
                  "hello": {
                    "type": "chevrotainToken",
                  },
                  "param1": {
                    "type": "chevrotainToken",
                  },
                },
                "type": "object",
                "typeName": "",
              },
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

  it.only('should handle multiple same name', () => {
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
                  "world": "string",
                },
                "type": "object",
                "typeName": "",
              },
              "parseOutputType": {
                "fields": {
                  "world": {
                    "type": "chevrotainToken",
                  },
                },
                "type": "object",
                "typeName": "",
              },
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
                      "string",
                      {
                        "ruleName": "rule_1",
                        "type": "ruleRef",
                      },
                    ],
                    "type": "or",
                    "typeName": "",
                  },
                },
                "type": "object",
                "typeName": "",
              },
              "cstOutputTypeDefault": {
                "fields": {
                  "hello": "string",
                  "r_rule_1": {
                    "ruleName": "rule_1",
                    "type": "ruleRef",
                  },
                },
                "type": "object",
                "typeName": "",
              },
              "parseOutputType": {
                "fields": {
                  "param1": {
                    "branch": [
                      {
                        "type": "chevrotainToken",
                      },
                      {
                        "ruleName": "rule_1",
                        "type": "ruleRef",
                      },
                    ],
                    "type": "or",
                    "typeName": "",
                  },
                },
                "type": "object",
                "typeName": "",
              },
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
});
