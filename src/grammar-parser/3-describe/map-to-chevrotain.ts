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
  node: RuleBodyDesc,
  modifier: 'optional' | 'many' | 'many1'
): RuleBodyDesc => {
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
        parseOutputType: applyMany(node.parseOutputType),
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
        parseOutputType: applyMany1(node.parseOutputType),
        cstOutputType: node.cstOutputType
          ? applyMany1(node.cstOutputType)
          : undefined,
        cstOutputTypeDefault: applyMany1(node.cstOutputTypeDefault),
      };
  }
};

const mergeObjectType = (
  typeName: string,
  objectTypes: TypeDescObj[]
): TypeDescObj => {
  const fields = objectTypes.reduce<Record<string, TypeDesc>>((acc, obj) => {
    for (const [key, value] of Object.entries(obj.fields)) {
      if (key in acc) {
        const existing = acc[key];
        if (isOrType(existing)) {
          existing.branch.push(value);
        } else {
          acc[key] = {
            type: 'or',
            typeName: ``,
            branch: [acc[key], value],
          };
        }
      } else {
        acc[key] = value;
      }
    }

    return acc;
  }, {});

  return {
    type: 'object',
    typeName,
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
}): RuleBodyDesc => {
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
        `RuleCst_${typeNamePrefix}`,
        tests.map((t) => t.parseOutputType)
      ),

      cstOutputType:
        cstOutputType.length > 0
          ? mergeObjectType(`Rule_${typeNamePrefix}`, cstOutputType)
          : undefined,
      cstOutputTypeDefault: mergeObjectType(
        `Rule_${typeNamePrefix}`,
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
      parseOutputType: mergeObjectType(
        '',
        tests.map((t) => t.parseOutputType)
      ),
      cstOutputType:
        cstOutputType.length > 0
          ? mergeObjectType('', cstOutputType)
          : undefined,
      cstOutputTypeDefault: mergeObjectType(
        '',
        tests.map((t) => t.cstOutputTypeDefault)
      ),
    };
  }

  let res: RuleBodyDesc;

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
        typeName: ``,
        fields: {
          [node.name ?? node.value]: {
            type: 'chevrotainToken',
          },
        },
      },
      cstOutputType: node.name
        ? {
            type: 'object',
            typeName: '',
            fields: {
              [node.name]: 'string',
            },
          }
        : undefined,
      cstOutputTypeDefault: {
        type: 'object',
        typeName: '',
        fields: {
          [node.value]: 'string',
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
          typeName: ``,
          fields: {
            [node.name ?? token.name]: {
              type: 'chevrotainToken',
            },
          },
        },
        cstOutputType: node.name
          ? {
              type: 'object',
              typeName: '',
              fields: {
                [node.name]: 'string',
              },
            }
          : undefined,
        cstOutputTypeDefault: {
          type: 'object',
          typeName: '',
          fields: {
            [token.name]: 'string',
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
          typeName: '',
          fields: {
            [node.name ?? rule.methodName]: {
              type: 'ruleRef',
              ruleName: rule.name,
            },
          },
        },
        cstOutputType: node.name
          ? {
              type: 'object',
              typeName: '',
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
          typeName: '',
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
      parseOutputType: mergeObjectType('', [tests.parseOutputType]),
      cstOutputType: tests.cstOutputType
        ? mergeObjectType('', [tests.cstOutputType])
        : undefined,
      cstOutputTypeDefault: mergeObjectType('', [tests.cstOutputTypeDefault]),
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
  return node;
};
