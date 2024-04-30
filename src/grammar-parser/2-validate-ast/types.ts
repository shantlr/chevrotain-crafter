import { type GrammarRuleNode } from '../1-to-ast/types';

export type GrammarToken = {
  name: string;
  pattern: string | RegExp;
  group?: string;
};

export type GrammarRule = {
  name: string;

  /**
   * name to use as generated method
   */
  methodName: string;

  astBody: GrammarRuleNode['body'];
};
