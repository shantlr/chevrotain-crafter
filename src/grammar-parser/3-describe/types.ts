import { type GrammarRule } from '../2-validate-ast/types';

export type TypeDesc =
  | TypeDescObj
  | TypeDescOr
  | TypeDescChevrotainToken
  | TypeDescOptional
  | TypeDescRuleRef
  | TypeDescArray
  | TypeDescLiteral
  | TypeDescString;

export type TypeDescString = {
  type: 'string';
};

export type TypeDescRuleRef = {
  type: 'ruleRef';
  ruleName: string;
};

export type TypeDescLiteral = {
  type: 'literal';
  value: string;
};

export type TypeDescChevrotainToken = {
  type: 'chevrotainToken';
  tokenName: string;
};
export type TypeDescObj = {
  type: 'object';
  fields: Record<string, TypeDesc>;
};
export type TypeDescOr = {
  type: 'or';
  branch: TypeDesc[];
};

export type TypeDescArray = {
  type: 'array';
  elementType: TypeDesc;
};
export type TypeDescOptional = {
  type: 'optional';
  value: TypeDesc;
};

export type ChevrotainNode =
  | ChevrotainConsume
  | ChevrotainSubrule
  | ChevrotainOptional
  | ChevrotainMany
  | ChevrotainAtLeastOne
  | ChevrotainSeq
  | ChevrotainOr;

export type ChevrotainConsume = {
  type: 'consume';
  tokenName: string;
  label: string | undefined;
  outputName: string;
};
export type ChevrotainSubrule = {
  type: 'subrule';
  ruleMethodName: string;
  label: string | undefined;
  outputName: string;
};

export type ChevrotainOptional = {
  type: 'optional';
  value: ChevrotainNode;
};

export type ChevrotainMany = {
  type: 'many';
  value: ChevrotainNode;
};

export type ChevrotainAtLeastOne = {
  type: 'many1';
  value: ChevrotainNode;
};

export type ChevrotainOr = {
  type: 'or';
  value: ChevrotainNode[];
};

/**
 * Sequence of chevrotain nodes
 */
export type ChevrotainSeq = {
  type: 'seq';
  value: ChevrotainNode[];
};

export type RuleBodyDesc = {
  /**
   * Chevrotain rule definition ast
   */
  chevrotain: ChevrotainNode;

  parseOutputTypeName: string;
  /**
   * Chevrotain rule parse output type
   */
  parseOutputType: TypeDescObj;

  cstOutputTypeName: string;
  /**
   * cst output type if there are named elements
   */
  cstOutputType?: TypeDescObj;
  /**
   * cst output type if there are no named elements
   */
  cstOutputTypeDefault: TypeDescObj;
};

export type RuleDesc = {
  rule: GrammarRule;
  body: RuleBodyDesc;
};
