import { type GrammarToken, type GrammarRule } from '../2-validate-ast/types';
import { splitIntoSubRules } from './split-subrules';
import { mapRuleToChevrotain } from './map-to-chevrotain';
import { type RuleDesc } from './types';

// 1. Compute cst to ast mapping
// 2. Generate ast types
// 3. Generate sub rules required by named group

export const describeRules = ({
  rules: inputRules,
  tokens,
}: {
  rules: Record<string, GrammarRule>;
  tokens: Record<string, GrammarToken>;
}) => {
  const rules = { ...inputRules };

  // split named groups into subrules
  for (const rule of Object.values(inputRules)) {
    const split = splitIntoSubRules(rule, rules);
    if (split) {
      rules[rule.name] = split.rule;
      Object.assign(rules, split.additionalRules);
    }
  }

  const ruleDescs: Record<string, RuleDesc> = {};
  for (const rule of Object.values(rules)) {
    const bodyDesc = mapRuleToChevrotain({
      rule,
      rules,
      tokens,
    });
    ruleDescs[rule.name] = {
      rule,
      body: bodyDesc,
    };
  }

  return {
    ruleDescs,
  };
};
