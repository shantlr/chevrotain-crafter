import { camelCase, mapValues, upperFirst } from 'lodash-es';
import {
  type GrammarRuleElemModifier,
  type GrammarRuleSeqNode,
} from '../1-to-ast/types';
import { type GrammarToken, type GrammarRule } from '../2-validate-ast/types';
import {
  isGroupNode,
  isLiteralNode,
  isOrNode,
  isRefNode,
} from '../2-validate-ast/utils';
import {
  type TypeDescArray,
  type RuleBodyDesc,
  type TypeDesc,
  type TypeDescObj,
  type TypeDescOr,
} from './types';

const isOrType = (type: TypeDesc | undefined): type is TypeDescOr => {
  return (
    !!type && typeof type === 'object' && 'type' in type && type.type === 'or'
  );
};
const isArrayType = (type: TypeDesc | undefined): type is TypeDescArray => {
  return (
    !!type &&
    typeof type === 'object' &&
    'type' in type &&
    type.type === 'array'
  );
};

const applyZeroOrOnce = (type: TypeDescObj): TypeDescObj => {
  return {
    ...type,
    fields: mapValues(type.fields, (f): TypeDescObj['fields'][string] => ({
      type: 'optional',
      value: f,
      fieldOptional: f.fieldOptional,
    })),
  };
};
const applyZeroOrMore = (type: TypeDescObj): TypeDescObj => {
  return {
    ...type,
    fields: mapValues(type.fields, (f): TypeDescObj['fields'][string] => ({
      type: 'array',
      elementType: f,
      fieldOptional: f.fieldOptional,
    })),
  };
};
const applyOnceOrMore = (type: TypeDescObj): TypeDescObj => {
  return {
    ...type,
    fields: mapValues(type.fields, (f): TypeDescObj['fields'][string] => ({
      type: 'array',
      elementType: f,
      fieldOptional: f.fieldOptional,
    })),
  };
};

const makeObjectFieldOptional = (obj: TypeDescObj): TypeDescObj => {
  return {
    ...obj,
    fields: mapValues(obj.fields, (f, key) => ({
      ...f,
      fieldOptional: true,
    })),
  };
};

const applyModifier = (
  node: Omit<RuleBodyDesc, 'parseOutputTypeName' | 'cstOutputTypeName'>,
  modifier: GrammarRuleElemModifier
): Omit<RuleBodyDesc, 'parseOutputTypeName' | 'cstOutputTypeName'> => {
  switch (modifier) {
    case 'optional':
      return {
        chevrotain: {
          type: 'zero-or-once',
          value: node.chevrotain,
        },
        parseOutputType: makeObjectFieldOptional(node.parseOutputType),
        cstOutputType: node.cstOutputType
          ? applyZeroOrOnce(node.cstOutputType)
          : undefined,
        cstOutputTypeDefault: applyZeroOrOnce(node.cstOutputTypeDefault),
      };
    case 'many':
      return {
        chevrotain: {
          type: 'zero-or-more',
          value: node.chevrotain,
        },
        parseOutputType: makeObjectFieldOptional(node.parseOutputType),
        cstOutputType: node.cstOutputType
          ? applyZeroOrMore(node.cstOutputType)
          : undefined,
        cstOutputTypeDefault: applyZeroOrMore(node.cstOutputTypeDefault),
      };
    case 'many1':
      return {
        chevrotain: {
          type: 'one-or-more',
          value: node.chevrotain,
        },
        parseOutputType: node.parseOutputType,
        cstOutputType: node.cstOutputType
          ? applyOnceOrMore(node.cstOutputType)
          : undefined,
        cstOutputTypeDefault: applyOnceOrMore(node.cstOutputTypeDefault),
      };
  }
};

const mergeObjectType = (
  objectTypes: TypeDescObj[],
  opt?: {
    /**
     * Map A[] | B[] => (A | B)[]
     * instead of default A[] | B[]
     */
    unionOrArray?: boolean;

    nonCommonFieldShouldBeOptional?: boolean;
  }
): TypeDescObj => {
  if (objectTypes.length === 1) {
    return objectTypes[0];
  }

  const fields = objectTypes.reduce<TypeDescObj['fields']>((acc, obj) => {
    for (const [key, value] of Object.entries(obj.fields)) {
      const isCommonField = opt?.nonCommonFieldShouldBeOptional
        ? objectTypes.every((t) => key in t.fields)
        : true;

      if (key in acc) {
        const existing = acc[key];

        const fieldOptional = existing.fieldOptional || !isCommonField;
        if (opt?.unionOrArray) {
          // (A | B)[] + C => (A | B | C)[]
          if (isArrayType(existing) && isOrType(existing.elementType)) {
            // (A | B)[] + (C | D)[] => (A | B | C | D)[]
            if (isArrayType(value) && isOrType(value.elementType)) {
              existing.elementType.branch.push(...value.elementType.branch);
            }
            // (A | B)[] + (C | D) => (A | B | C | D)[]
            else if (isOrType(value)) {
              existing.elementType.branch.push(...value.branch);
            } else {
              existing.elementType.branch.push(value);
            }
          } else if (isArrayType(existing) && isArrayType(value)) {
            // A[] + B[] => (A | B)[]
            acc[key] = {
              type: 'array',
              elementType: {
                type: 'or',
                branch: [existing.elementType, value.elementType],
              },
              fieldOptional,
            };
          } else {
            // A + B => (A | B)[]
            acc[key] = {
              type: 'array',
              fieldOptional,
              elementType: {
                type: 'or',
                branch: [existing, value],
              },
            };
          }
          continue;
        }

        if (isOrType(existing)) {
          existing.branch.push(value);
        } else {
          acc[key] = {
            type: 'or',
            branch: [acc[key], value],
            fieldOptional,
          };
        }

        continue;
      }

      acc[key] = {
        ...value,
      };
    }

    return acc;
  }, {});

  return {
    type: 'object',
    fields,
  };
};

const mapNodeToChevrotainCalls = ({
  typeNamePrefix,
  node,
  tokens,
  rules,
}: {
  typeNamePrefix: string;
  node: GrammarRuleSeqNode | GrammarRuleSeqNode[];
  tokens: Record<string, GrammarToken>;
  rules: Record<string, GrammarRule>;
}): Omit<RuleBodyDesc, 'parseOutputTypeName' | 'cstOutputTypeName'> => {
  if (Array.isArray(node)) {
    const tests = node.map((n) =>
      mapNodeToChevrotainCalls({
        typeNamePrefix,
        node: n,
        tokens,
        rules,
      })
    );

    const cstOutputType = tests
      .map((t) => t.cstOutputType)
      .filter(Boolean) as TypeDescObj[];

    return {
      chevrotain: {
        type: 'seq',
        value: tests.map((t) => t.chevrotain),
      },
      parseOutputType: mergeObjectType(
        tests.map((t) => t.parseOutputType),
        { unionOrArray: true, nonCommonFieldShouldBeOptional: false }
      ),
      cstOutputType:
        cstOutputType.length > 0
          ? mergeObjectType(cstOutputType, {
              unionOrArray: true,
              nonCommonFieldShouldBeOptional: false,
            })
          : undefined,
      cstOutputTypeDefault: mergeObjectType(
        tests.map((t) => t.cstOutputTypeDefault),
        {
          unionOrArray: true,
          nonCommonFieldShouldBeOptional: false,
        }
      ),
    };
  }

  if (isOrNode(node)) {
    const tests = node.value.map((n) =>
      mapNodeToChevrotainCalls({ typeNamePrefix, node: n, tokens, rules })
    );
    const cstOutputType = tests
      .map((t) => t.cstOutputType)
      .filter(Boolean) as TypeDescObj[];
    return {
      chevrotain: {
        type: 'or',
        value: tests.map((t) => t.chevrotain),
      },
      parseOutputType: mergeObjectType(tests.map((t) => t.parseOutputType)),
      cstOutputType:
        cstOutputType.length > 0 ? mergeObjectType(cstOutputType) : undefined,
      cstOutputTypeDefault: mergeObjectType(
        tests.map((t) => t.cstOutputTypeDefault)
      ),
    };
  }

  let res: Omit<RuleBodyDesc, 'parseOutputTypeName' | 'cstOutputTypeName'>;

  if (isLiteralNode(node)) {
    res = {
      chevrotain: {
        type: 'consume',
        tokenName: node.value,
        label: node.value,
        outputName: node.name ?? node.value,
      },
      // { value: 'literal-string' } => { ['literal-string']: [Token] }
      parseOutputType: {
        type: 'object',
        fields: {
          // NOTE: chevrotain output are always array
          [node.name ?? node.value]: {
            type: 'array',
            fieldOptional: false,
            elementType: {
              type: 'chevrotainToken',
              tokenName: node.value,
            },
          },
        },
      },
      cstOutputType: node.name
        ? {
            type: 'object',
            fields: {
              [node.name]: {
                fieldOptional: false,
                type: 'string',
              },
            },
          }
        : undefined,
      cstOutputTypeDefault: {
        type: 'object',
        fields: {
          [node.value]: {
            fieldOptional: false,
            type: 'string',
          },
        },
      },
    };
  } else if (isRefNode(node)) {
    if (node.value.value in tokens) {
      const token = tokens[node.value.value];
      res = {
        chevrotain: {
          type: 'consume',
          tokenName: token.name,
          label: node.name,
          outputName: node.name ?? token.name,
        },
        parseOutputType: {
          type: 'object',
          fields: {
            [node.name ?? token.name]: {
              type: 'array',
              fieldOptional: false,
              elementType: {
                type: 'chevrotainToken',
                tokenName: token.name,
              },
            },
          },
        },
        cstOutputType: node.name
          ? {
              type: 'object',
              fields: {
                [node.name]: {
                  fieldOptional: false,
                  type: 'string',
                },
              },
            }
          : undefined,
        cstOutputTypeDefault: {
          type: 'object',
          fields: {
            [token.name]: {
              fieldOptional: false,
              type: 'string',
            },
          },
        },
      };
    } else {
      const rule = rules[node.value.value];
      if (!rule) {
        throw new Error(`Missing rule or token '${node.value.value}'`);
      }
      res = {
        chevrotain: {
          type: 'subrule',
          ruleMethodName: rule.methodName,
          label: node.name,
          outputName: node.name ?? rule.methodName,
        },
        parseOutputType: {
          type: 'object',
          fields: {
            [node.name ?? rule.methodName]: {
              type: 'array',
              fieldOptional: false,
              elementType: {
                type: 'ruleRef',
                ruleName: rule.name,
              },
            },
          },
        },
        cstOutputType: node.name
          ? {
              type: 'object',
              fields: {
                [node.name ?? rule.methodName]: {
                  type: 'ruleRef',
                  ruleName: rule.name,
                  fieldOptional: false,
                },
              },
            }
          : undefined,
        cstOutputTypeDefault: {
          type: 'object',
          fields: {
            [rule.methodName]: {
              type: 'ruleRef',
              ruleName: rule.name,
              fieldOptional: false,
            },
          },
        },
      };
    }
  } else if (isGroupNode(node)) {
    const tests = mapNodeToChevrotainCalls({
      typeNamePrefix,
      node: node.value.value,
      tokens,
      rules,
    });

    res = {
      chevrotain: {
        type: 'seq',
        value: [tests.chevrotain],
      },
      parseOutputType: mergeObjectType([tests.parseOutputType]),
      cstOutputType: tests.cstOutputType
        ? mergeObjectType([tests.cstOutputType])
        : undefined,
      cstOutputTypeDefault: mergeObjectType([tests.cstOutputTypeDefault]),
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (!res) {
    throw new Error(
      `Failed to map node to chevrotain: ${JSON.stringify(node)}`
    );
  }

  if (res && node.modifier) {
    return applyModifier(res, node.modifier);
  }

  return res;
};

const mapRuleNameToTypeName = (ruleName: string): string => {
  return upperFirst(camelCase(ruleName));
};

export const mapRuleToChevrotain = ({
  rule,
  rules,
  tokens,
}: {
  rule: GrammarRule;
  rules: Record<string, GrammarRule>;
  tokens: Record<string, GrammarToken>;
}): RuleBodyDesc => {
  const node = mapNodeToChevrotainCalls({
    typeNamePrefix: mapRuleNameToTypeName(rule.name),
    node: rule.astBody,
    tokens,
    rules,
  });

  return {
    ...node,
    cstOutputTypeName: `Rule_${mapRuleNameToTypeName(rule.name)}`,
    parseOutputTypeName: `RuleCst_${mapRuleNameToTypeName(rule.name)}`,
    parseOutputType: {
      type: 'object',
      // NOTE: chevrotain rule cst output look like { name: 'rule-name', children: { ... } }
      fields: {
        name: {
          type: 'literal',
          value: rule.methodName,
          fieldOptional: false,
        },
        children: {
          type: 'object',
          fieldOptional: false,
          fields: {
            ...node.parseOutputType.fields,
          },
        },
      },
    },
  };
};
