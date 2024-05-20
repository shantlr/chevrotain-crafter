import { camelCase, mapValues, upperFirst } from 'lodash-es';
import { type GrammarRuleSeqNode } from '../1-to-ast/types';
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

const applyOptional = (type: TypeDescObj): TypeDescObj => {
  return {
    ...type,
    fields: mapValues(
      type.fields,
      (f): TypeDesc => ({
        type: 'optional',
        value: f,
      })
    ),
  };
};
const applyMany = (type: TypeDescObj): TypeDescObj => {
  return {
    ...type,
    fields: mapValues(
      type.fields,
      (f): TypeDesc => ({
        type: 'array',
        elementType: f,
      })
    ),
  };
};
const applyMany1 = (type: TypeDescObj): TypeDescObj => {
  return {
    ...type,
    fields: mapValues(
      type.fields,
      (f): TypeDesc => ({
        type: 'array',
        elementType: f,
      })
    ),
  };
};

const applyModifier = (
  node: Omit<RuleBodyDesc, 'parseOutputTypeName' | 'cstOutputTypeName'>,
  modifier: 'optional' | 'many' | 'many1'
): Omit<RuleBodyDesc, 'parseOutputTypeName' | 'cstOutputTypeName'> => {
  switch (modifier) {
    case 'optional':
      return {
        chevrotain: {
          type: 'optional',
          value: node.chevrotain,
        },
        parseOutputType: applyOptional(node.parseOutputType),
        cstOutputType: node.cstOutputType
          ? applyOptional(node.cstOutputType)
          : undefined,
        cstOutputTypeDefault: applyOptional(node.cstOutputTypeDefault),
      };
    case 'many':
      return {
        chevrotain: {
          type: 'many',
          value: node.chevrotain,
        },
        parseOutputType: node.parseOutputType,
        cstOutputType: node.cstOutputType
          ? applyMany(node.cstOutputType)
          : undefined,
        cstOutputTypeDefault: applyMany(node.cstOutputTypeDefault),
      };
    case 'many1':
      return {
        chevrotain: {
          type: 'many1',
          value: node.chevrotain,
        },
        parseOutputType: node.parseOutputType,
        cstOutputType: node.cstOutputType
          ? applyMany1(node.cstOutputType)
          : undefined,
        cstOutputTypeDefault: applyMany1(node.cstOutputTypeDefault),
      };
  }
};

const mergeObjectType = (
  objectTypes: TypeDescObj[],
  opt?: {
    /**
     * TODO: implem
     * Map A[] | B[] => (A | B)[]
     * instead of default A[] | B[]
     */
    unionOrArray?: boolean;
  }
): TypeDescObj => {
  const fields = objectTypes.reduce<Record<string, TypeDesc>>((acc, obj) => {
    for (const [key, value] of Object.entries(obj.fields)) {
      if (key in acc) {
        const existing = acc[key];

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
            };
          } else {
            // A + B => (A | B)[]
            acc[key] = {
              type: 'array',
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
          };
        }
        continue;
      }

      acc[key] = value;
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
        { unionOrArray: true }
      ),
      cstOutputType:
        cstOutputType.length > 0
          ? mergeObjectType(cstOutputType, {
              unionOrArray: true,
            })
          : undefined,
      cstOutputTypeDefault: mergeObjectType(
        tests.map((t) => t.cstOutputTypeDefault)
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
      parseOutputType: {
        type: 'object',
        fields: {
          // NOTE: chevrotain output are always array
          [node.name ?? node.value]: {
            type: 'array',
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
              [node.name]: { type: 'string' },
            },
          }
        : undefined,
      cstOutputTypeDefault: {
        type: 'object',
        fields: {
          [node.value]: { type: 'string' },
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
                [node.name]: { type: 'string' },
              },
            }
          : undefined,
        cstOutputTypeDefault: {
          type: 'object',
          fields: {
            [token.name]: { type: 'string' },
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

const mapRuleNameToType = (ruleName: string): string => {
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
    typeNamePrefix: mapRuleNameToType(rule.name),
    node: rule.astBody,
    tokens,
    rules,
  });

  return {
    ...node,
    cstOutputTypeName: `Rule_${mapRuleNameToType(rule.name)}`,
    parseOutputTypeName: `RuleCst_${mapRuleNameToType(rule.name)}`,
    parseOutputType: {
      type: 'object',

      // NOTE:chevrotain rule cst output look like { name: 'rule-name', children: { ... } }
      fields: {
        name: {
          type: 'literal',
          value: rule.methodName,
        },
        children: {
          type: 'object',
          fields: {
            ...node.parseOutputType.fields,
          },
        },
      },
    },
  };
};
