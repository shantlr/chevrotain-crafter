import { parse } from "../parser"

describe('parser', () => {
  it('should parse basic addition', () => {
    expect(parse('1 + 1')).toMatchInlineSnapshot(`
      {
        "r_expr": {
          "r_addition_expr": {
            "left": {
              "left": {
                "value": "1",
              },
              "right": [],
            },
            "right": [
              {
                "left": {
                  "value": "1",
                },
                "right": [],
              },
            ],
          },
        },
      }
    `)
  });
  it('should parse basic multiplication', () => {
    expect(parse('1 * 2')).toMatchInlineSnapshot(`
      {
        "r_expr": {
          "r_addition_expr": {
            "left": {
              "left": {
                "value": "1",
              },
              "right": [
                {
                  "value": "2",
                },
              ],
            },
            "right": [],
          },
        },
      }
    `);
  });
  it('should parse basic addition and multiplication', () => {
    expect(parse('1 + 2 * 3 + 5', { withNodeType: true })).toMatchInlineSnapshot(`
      {
        "__type": "start",
        "r_expr": {
          "__type": "expr",
          "r_addition_expr": {
            "__type": "addition-expr",
            "left": {
              "__type": "multiplication-expr",
              "left": {
                "__type": "primary-expr",
                "value": "1",
              },
              "right": [],
            },
            "right": [
              {
                "__type": "multiplication-expr",
                "left": {
                  "__type": "primary-expr",
                  "value": "2",
                },
                "right": [
                  {
                    "__type": "primary-expr",
                    "value": "3",
                  },
                ],
              },
              {
                "__type": "multiplication-expr",
                "left": {
                  "__type": "primary-expr",
                  "value": "5",
                },
                "right": [],
              },
            ],
          },
        },
      }
    `);
  });
})