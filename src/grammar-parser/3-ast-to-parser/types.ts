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
};
export type ChevrotainSubrule = {
  type: 'subrule';
  ruleName: string;
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

export type ChevrotainSeq = {
  type: 'seq';
  value: ChevrotainNode[];
};
