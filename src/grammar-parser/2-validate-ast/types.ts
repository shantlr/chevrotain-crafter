import { type GrammarRuleNode } from '../1-to-ast/types';

export type GrammarToken = {
  name: string;
  pattern: string | RegExp;
  group?: string;
};

export type GrammarRule = {
  name: string;
  astBody: GrammarRuleNode['body'];
};
