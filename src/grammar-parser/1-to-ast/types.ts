export type GrammarAstNode =
  | {
      type: 'identifier';
      value: string;
    }
  | {
      type: 'object';
      fields: Record<string, string | number | GrammarAstNode>;
    };

export type GrammarRootNode = {
  fields: GrammarRootFieldNode[];
};
export type GrammarRootFieldNode = GrammarTokensNode | GrammarRulesNode;

export type GrammarTokensNode = {
  name: 'tokens';
  tokens: GrammarTokenNode[];
};
export type GrammarTokenNode = {
  name: string;
  options: Record<string, string | number | RegExp | boolean>;
};

export type GrammarRulesNode = {
  name: 'rules';
  rules: GrammarRuleNode[];
};

export type GrammarRuleNode = {
  name: string;
  body: GrammarRuleSeqNode[];
};
export type GrammarRuleBodyAnyNode = GrammarRuleSeqNode[] | GrammarRuleSeqNode;

export type GrammarRuleSeqNode = GrammarRuleElemNode | GrammarRuleOrNode;
export type GrammarRuleOrNode = {
  type: 'or';
  value: GrammarRuleSeqNode[][];
};

export type GrammarRuleElemModifier = 'optional' | 'many' | 'many1';

export type GrammarRuleElemNode = {
  modifier?: GrammarRuleElemModifier;
  name?: string;
  value: string | GrammarRuleRefElemNode | GrammarRuleNodeElemGroup;
};
export type GrammarRuleRefElemNode = {
  type: 'ref';
  value: string;
};
export type GrammarRuleNodeElemGroup = {
  type: 'pth';
  value: GrammarRuleSeqNode[];
};
