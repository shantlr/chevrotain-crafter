import { splitIntoSubRules } from './split-subrules';

describe('3-types/split-subrules', () => {
  it('should move named group to additional rule', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              name: 'group1',
              value: {
                type: 'pth',
                value: [{ value: 'hello' }, { value: 'world' }],
              },
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {
          "start_group1": {
            "astBody": [
              {
                "value": "hello",
              },
              {
                "value": "world",
              },
            ],
            "methodName": "_r_start_group1",
            "name": "start_group1",
          },
        },
        "rule": {
          "astBody": [
            {
              "modifier": undefined,
              "name": "group1",
              "value": {
                "type": "ref",
                "value": "start_group1",
              },
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
  });

  it('should keep modifier', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              name: 'group1',
              value: {
                type: 'pth',
                value: [{ value: 'hello' }, { value: 'world' }],
              },
              modifier: 'many',
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {
          "start_group1": {
            "astBody": [
              {
                "value": "hello",
              },
              {
                "value": "world",
              },
            ],
            "methodName": "_r_start_group1",
            "name": "start_group1",
          },
        },
        "rule": {
          "astBody": [
            {
              "modifier": "many",
              "name": "group1",
              "value": {
                "type": "ref",
                "value": "start_group1",
              },
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
  });

  it('should move multiple named group', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              name: 'group1',
              value: {
                type: 'pth',
                value: [{ value: 'hello' }, { value: 'world' }],
              },
            },
            {
              name: 'group2',
              value: {
                type: 'pth',
                value: [{ value: 'foo' }, { value: 'bar' }],
              },
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {
          "start_group1": {
            "astBody": [
              {
                "value": "hello",
              },
              {
                "value": "world",
              },
            ],
            "methodName": "_r_start_group1",
            "name": "start_group1",
          },
          "start_group2": {
            "astBody": [
              {
                "value": "foo",
              },
              {
                "value": "bar",
              },
            ],
            "methodName": "_r_start_group2",
            "name": "start_group2",
          },
        },
        "rule": {
          "astBody": [
            {
              "modifier": undefined,
              "name": "group1",
              "value": {
                "type": "ref",
                "value": "start_group1",
              },
            },
            {
              "modifier": undefined,
              "name": "group2",
              "value": {
                "type": "ref",
                "value": "start_group2",
              },
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
  });

  it('should not move unnamed group', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              value: {
                type: 'pth',
                value: [{ value: 'hello' }, { value: 'world' }],
              },
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {},
        "rule": {
          "astBody": [
            {
              "modifier": undefined,
              "name": undefined,
              "value": {
                "type": "pth",
                "value": [
                  {
                    "value": "hello",
                  },
                  {
                    "value": "world",
                  },
                ],
              },
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
  });

  it('should handle nested named group', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              name: 'group1',
              value: {
                type: 'pth',
                value: [
                  {
                    name: 'group2',
                    value: {
                      type: 'pth',
                      value: [{ value: 'hello' }, { value: 'world' }],
                    },
                  },
                ],
              },
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {
          "start_group1": {
            "astBody": [
              {
                "modifier": undefined,
                "name": "group2",
                "value": {
                  "type": "ref",
                  "value": "start_group1_group2",
                },
              },
            ],
            "methodName": "_r_start_group1",
            "name": "start_group1",
          },
          "start_group1_group2": {
            "astBody": [
              {
                "value": "hello",
              },
              {
                "value": "world",
              },
            ],
            "methodName": "_r_start_group1_group2",
            "name": "start_group1_group2",
          },
        },
        "rule": {
          "astBody": [
            {
              "modifier": undefined,
              "name": "group1",
              "value": {
                "type": "ref",
                "value": "start_group1",
              },
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
  });

  it('should handle named group inside unamed group', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              value: {
                type: 'pth',
                value: [
                  {
                    value: 'prefix',
                  },
                  {
                    name: 'group1',
                    value: {
                      type: 'pth',
                      value: [{ value: 'hello' }, { value: 'world' }],
                    },
                  },
                ],
              },
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {
          "start_group1": {
            "astBody": [
              {
                "value": "hello",
              },
              {
                "value": "world",
              },
            ],
            "methodName": "_r_start_group1",
            "name": "start_group1",
          },
        },
        "rule": {
          "astBody": [
            {
              "modifier": undefined,
              "name": undefined,
              "value": {
                "type": "pth",
                "value": [
                  {
                    "value": "prefix",
                  },
                  {
                    "modifier": undefined,
                    "name": "group1",
                    "value": {
                      "type": "ref",
                      "value": "start_group1",
                    },
                  },
                ],
              },
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
  });

  it('should handle multiple group with same name', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              name: 'group1',
              value: {
                type: 'pth',
                value: [{ value: 'hello' }, { value: 'world' }],
              },
            },
            {
              name: 'group1',
              value: {
                type: 'pth',
                value: [{ value: 'foo' }, { value: 'bar' }],
              },
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {
          "start_group1": {
            "astBody": [
              {
                "value": "hello",
              },
              {
                "value": "world",
              },
            ],
            "methodName": "_r_start_group1",
            "name": "start_group1",
          },
          "start_group1$1": {
            "astBody": [
              {
                "value": "foo",
              },
              {
                "value": "bar",
              },
            ],
            "methodName": "_r_start_group1$1",
            "name": "start_group1$1",
          },
        },
        "rule": {
          "astBody": [
            {
              "modifier": undefined,
              "name": "group1",
              "value": {
                "type": "ref",
                "value": "start_group1",
              },
            },
            {
              "modifier": undefined,
              "name": "group1",
              "value": {
                "type": "ref",
                "value": "start_group1$1",
              },
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
  });

  it('should handle group inside or', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              type: 'or',
              value: [
                [
                  {
                    name: 'group1',
                    value: {
                      type: 'pth',
                      value: [{ value: 'hello' }, { value: 'world' }],
                    },
                  },
                ],
              ],
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {
          "start_group1": {
            "astBody": [
              {
                "value": "hello",
              },
              {
                "value": "world",
              },
            ],
            "methodName": "_r_start_group1",
            "name": "start_group1",
          },
        },
        "rule": {
          "astBody": [
            {
              "type": "or",
              "value": [
                [
                  {
                    "modifier": undefined,
                    "name": "group1",
                    "value": {
                      "type": "ref",
                      "value": "start_group1",
                    },
                  },
                ],
              ],
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
    //
  });

  it('should handle multiple group inside or', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              type: 'or',
              value: [
                [
                  {
                    name: 'group1',
                    value: {
                      type: 'pth',
                      value: [{ value: 'hello' }, { value: 'world' }],
                    },
                  },
                ],
                [
                  {
                    name: 'group2',
                    value: {
                      type: 'pth',
                      value: [{ value: 'foo' }, { value: 'bar' }],
                    },
                  },
                ],
              ],
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {
          "start_group1": {
            "astBody": [
              {
                "value": "hello",
              },
              {
                "value": "world",
              },
            ],
            "methodName": "_r_start_group1",
            "name": "start_group1",
          },
          "start_group2": {
            "astBody": [
              {
                "value": "foo",
              },
              {
                "value": "bar",
              },
            ],
            "methodName": "_r_start_group2",
            "name": "start_group2",
          },
        },
        "rule": {
          "astBody": [
            {
              "type": "or",
              "value": [
                [
                  {
                    "modifier": undefined,
                    "name": "group1",
                    "value": {
                      "type": "ref",
                      "value": "start_group1",
                    },
                  },
                ],
                [
                  {
                    "modifier": undefined,
                    "name": "group2",
                    "value": {
                      "type": "ref",
                      "value": "start_group2",
                    },
                  },
                ],
              ],
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
  });
  it('should handle mulitple group inside or with same name', () => {
    expect(
      splitIntoSubRules(
        {
          name: 'start',
          methodName: 'r_start',
          astBody: [
            {
              type: 'or',
              value: [
                [
                  {
                    name: 'group1',
                    value: {
                      type: 'pth',
                      value: [{ value: 'hello' }, { value: 'world' }],
                    },
                  },
                ],
                [
                  {
                    name: 'group1',
                    value: {
                      type: 'pth',
                      value: [{ value: 'foo' }, { value: 'bar' }],
                    },
                  },
                ],
              ],
            },
          ],
        },
        {}
      )
    ).toMatchInlineSnapshot(`
      {
        "additionalRules": {
          "start_group1": {
            "astBody": [
              {
                "value": "hello",
              },
              {
                "value": "world",
              },
            ],
            "methodName": "_r_start_group1",
            "name": "start_group1",
          },
          "start_group1$1": {
            "astBody": [
              {
                "value": "foo",
              },
              {
                "value": "bar",
              },
            ],
            "methodName": "_r_start_group1$1",
            "name": "start_group1$1",
          },
        },
        "rule": {
          "astBody": [
            {
              "type": "or",
              "value": [
                [
                  {
                    "modifier": undefined,
                    "name": "group1",
                    "value": {
                      "type": "ref",
                      "value": "start_group1",
                    },
                  },
                ],
                [
                  {
                    "modifier": undefined,
                    "name": "group1",
                    "value": {
                      "type": "ref",
                      "value": "start_group1$1",
                    },
                  },
                ],
              ],
            },
          ],
          "methodName": "r_start",
          "name": "start",
        },
      }
    `);
  });
});
