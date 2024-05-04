import {
  type GrammarRuleNodeElemGroup,
  type GrammarRuleElemNode,
  type GrammarRuleOrNode,
  type GrammarRuleRefElemNode,
  type GrammarRuleSeqNode,
} from '../1-to-ast/types';

export const isOrNode = (
  node: GrammarRuleSeqNode
): node is GrammarRuleOrNode => {
  return 'type' in node && node.type === 'or';
};

export const isRefNode = (
  node: GrammarRuleSeqNode
): node is GrammarRuleElemNode & {
  value: GrammarRuleRefElemNode;
} => {
  return (
    typeof node.value === 'object' &&
    'type' in node.value &&
    node.value.type === 'ref'
  );
};
export const isLiteralNode = (
  node: GrammarRuleSeqNode
): node is GrammarRuleElemNode & { value: string } => {
  return typeof node.value === 'string';
};
export const isGroupNode = (
  node: GrammarRuleSeqNode
): node is GrammarRuleElemNode & {
  value: GrammarRuleNodeElemGroup;
} => {
  return (
    typeof node.value === 'object' &&
    'type' in node.value &&
    node.value.type === 'pth'
  );
};
