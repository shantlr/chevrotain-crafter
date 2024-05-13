import { discriminateType } from './discriminate-type';

describe('4-ast-to-parser/discriminate-types', () => {
  it('should discriminate tokens', () => {
    expect(
      discriminateType({
        possibleTypes: [
          {
            type: 'chevrotainToken',
            tokenName: 'token_1',
          },
          {
            type: 'chevrotainToken',
            tokenName: 'token_2',
          },
          {
            type: 'chevrotainToken',
            tokenName: 'token_3',
          },
        ],
        ruleDescs: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "condition": {
          "tokenName": "token_1",
          "type": "isToken",
        },
        "else": {
          "condition": {
            "tokenName": "token_2",
            "type": "isToken",
          },
          "else": {
            "type": "resolve",
            "value": {
              "typeIndex": 2,
            },
          },
          "then": {
            "type": "resolve",
            "value": {
              "typeIndex": 1,
            },
          },
          "type": "ternary",
        },
        "then": {
          "type": "resolve",
          "value": {
            "typeIndex": 0,
          },
        },
        "type": "ternary",
      }
    `);
  });

  it('should discriminate two object with same field but different type', () => {
    expect(
      discriminateType({
        possibleTypes: [
          {
            type: 'object',
            fields: {
              field1: {
                type: 'chevrotainToken',
                tokenName: 'token_1',
              },
            },
          },
          {
            type: 'object',
            fields: {
              field1: {
                type: 'chevrotainToken',
                tokenName: 'token_2',
              },
            },
          },
        ],
        ruleDescs: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "condition": {
          "fieldName": "field1",
          "type": "fieldOfType",
          "value": {
            "tokenName": "token_1",
            "type": "chevrotainToken",
          },
        },
        "else": {
          "type": "resolve",
          "value": {
            "typeIndex": 1,
          },
        },
        "then": {
          "type": "resolve",
          "value": {
            "typeIndex": 0,
          },
        },
        "type": "ternary",
      }
    `);
  });

  it('should discriminate two object with uniq field', () => {
    expect(
      discriminateType({
        possibleTypes: [
          {
            type: 'object',
            fields: {
              field1: {
                type: 'chevrotainToken',
                tokenName: 'token_1',
              },
            },
          },
          {
            type: 'object',
            fields: {
              field2: {
                type: 'chevrotainToken',
                tokenName: 'token_2',
              },
            },
          },
        ],
        ruleDescs: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "condition": {
          "fieldName": "field1",
          "type": "hasField",
        },
        "else": {
          "type": "resolve",
          "value": {
            "typeIndex": 1,
          },
        },
        "then": {
          "type": "resolve",
          "value": {
            "typeIndex": 0,
          },
        },
        "type": "ternary",
      }
    `);
  });

  it('should discriminate objects with uniq fields', () => {
    expect(
      discriminateType({
        possibleTypes: [
          {
            type: 'object',
            fields: {
              field1: {
                type: 'chevrotainToken',
                tokenName: 'token_1',
              },
            },
          },
          {
            type: 'object',
            fields: {
              field2: {
                type: 'chevrotainToken',
                tokenName: 'token_2',
              },
            },
          },
          {
            type: 'object',
            fields: {
              field3: {
                type: 'chevrotainToken',
                tokenName: 'token_3',
              },
            },
          },
        ],
        ruleDescs: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "condition": {
          "fieldName": "field1",
          "type": "hasField",
        },
        "else": {
          "condition": {
            "fieldName": "field2",
            "type": "hasField",
          },
          "else": {
            "type": "resolve",
            "value": {
              "typeIndex": 2,
            },
          },
          "then": {
            "type": "resolve",
            "value": {
              "typeIndex": 1,
            },
          },
          "type": "ternary",
        },
        "then": {
          "type": "resolve",
          "value": {
            "typeIndex": 0,
          },
        },
        "type": "ternary",
      }
    `);
  });

  it('should discriminate two objects with common fields', () => {
    expect(
      discriminateType({
        possibleTypes: [
          {
            type: 'object',
            fields: {
              field1: {
                type: 'chevrotainToken',
                tokenName: 'token_1',
              },
              field2: {
                type: 'chevrotainToken',
                tokenName: 'token_2',
              },
            },
          },
          {
            type: 'object',
            fields: {
              field1: {
                type: 'chevrotainToken',
                tokenName: 'token_1',
              },
              field3: {
                type: 'chevrotainToken',
                tokenName: 'token_3',
              },
            },
          },
        ],
        ruleDescs: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "condition": {
          "fieldName": "field2",
          "type": "hasField",
        },
        "else": {
          "type": "resolve",
          "value": {
            "typeIndex": 1,
          },
        },
        "then": {
          "type": "resolve",
          "value": {
            "typeIndex": 0,
          },
        },
        "type": "ternary",
      }
    `);
  });

  it('should discriminate objects with multi common fields', () => {
    expect(
      discriminateType({
        possibleTypes: [
          {
            type: 'object',
            fields: {
              field_1: {
                type: 'string',
              },
              field_2: {
                type: 'string',
              },
            },
          },
          {
            type: 'object',
            fields: {
              field_1: {
                type: 'string',
              },
              field_3: {
                type: 'string',
              },
            },
          },
          {
            type: 'object',
            fields: {
              field_2: {
                type: 'string',
              },
              field_3: {
                type: 'string',
              },
            },
          },
        ],
        ruleDescs: {},
      })
    ).toMatchInlineSnapshot(`
      {
        "condition": {
          "fieldName": "field_1",
          "type": "hasField",
        },
        "else": {
          "type": "resolve",
          "value": {
            "typeIndex": 2,
          },
        },
        "then": {
          "condition": {
            "fieldName": "field_2",
            "type": "hasField",
          },
          "else": {
            "type": "resolve",
            "value": {
              "typeIndex": 1,
            },
          },
          "then": {
            "type": "resolve",
            "value": {
              "typeIndex": 0,
            },
          },
          "type": "ternary",
        },
        "type": "ternary",
      }
    `);
  });

  it('should throw error when all types are identiques', () => {
    expect(() =>
      discriminateType({
        possibleTypes: [
          {
            type: 'object',
            fields: {
              field_1: {
                type: 'string',
              },
              field_2: {
                type: 'string',
              },
            },
          },
          {
            type: 'object',
            fields: {
              field_1: {
                type: 'string',
              },
              field_2: {
                type: 'string',
              },
            },
          },
        ],
        ruleDescs: {},
      })
    ).toThrow('Types are identiques');
  });
  it('should throw error on some identiques types', () => {
    expect(() =>
      discriminateType({
        possibleTypes: [
          {
            type: 'chevrotainToken',
            tokenName: 'test',
          },
          {
            type: 'object',
            fields: {
              field_1: {
                type: 'string',
              },
              field_2: {
                type: 'string',
              },
            },
          },
          {
            type: 'object',
            fields: {
              field_1: {
                type: 'string',
              },
              field_2: {
                type: 'string',
              },
            },
          },
        ],
        ruleDescs: {},
      })
    ).throw('Types are identiques');
  });
});
