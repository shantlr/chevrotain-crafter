import { type GrammarRuleSeqNode } from '../1-to-ast/types';
import { type GrammarToken, type GrammarRule } from '../2-validate-ast/types';
import { type ChevrotainNode } from './types';

const withModifier = (
  node: ChevrotainNode,
  modifier: 'optional' | 'many' | 'many1'
): ChevrotainNode => {
  switch (modifier) {
    case 'optional':
      return {
        type: 'optional',
        value: node,
      };
    case 'many':
      return {
        type: 'many',
        value: node,
      };
    case 'many1':
      return {
        type: 'many1',
        value: node,
      };
  }
};

const mapNodeToChevrotainCalls = ({
  node,
  tokens,
  rules,
}: {
  node: GrammarRuleSeqNode | GrammarRuleSeqNode[];
  tokens: Record<string, GrammarToken>;
  rules: Record<string, GrammarRule>;
}): ChevrotainNode => {
  if (Array.isArray(node)) {
    return {
      type: 'seq',
      value: node.map((n) =>
        mapNodeToChevrotainCalls({ node: n, tokens, rules })
      ),
    };
  }

  if ('type' in node) {
    return {
      type: 'or',
      value: node.value.map((n) =>
        mapNodeToChevrotainCalls({ node: n, tokens, rules })
      ),
    };
  } else {
    const value = node.value;
    let call: ChevrotainNode;

    if (typeof value === 'string') {
      const token = tokens[value];
      call = { type: 'consume', tokenName: token.name };
    } else if (value.type === 'ref') {
      if (value.value in tokens) {
        call = { type: 'consume', tokenName: tokens[value.value].name };
      } else {
        call = {
          type: 'subrule',
          ruleName: rules[value.value].methodName,
        };
      }
    } else {
      call = mapNodeToChevrotainCalls({ node: value.value, tokens, rules });
    }

    if (call && node.modifier) {
      return withModifier(call, node.modifier);
    }
    return call;
  }
};

export const mapBodyToChevrotainCalls = ({
  body,
  rules,
  tokens,
}: {
  body: GrammarRule['astBody'];
  rules: Record<string, GrammarRule>;
  tokens: Record<string, GrammarToken>;
}): ChevrotainNode => {
  const node = mapNodeToChevrotainCalls({ node: body, tokens, rules });
  return node;
};
