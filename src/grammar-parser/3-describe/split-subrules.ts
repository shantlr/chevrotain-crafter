import { type GrammarRuleSeqNode } from '../1-to-ast/types';
import { type GrammarRule } from '../2-validate-ast/types';
import { isGroupNode, isOrNode } from '../2-validate-ast/utils';

const splitElemArray = (
  elem: GrammarRuleSeqNode[],
  {
    subRulePrefix,
    rules,
  }: {
    subRulePrefix: string;
    rules: Record<string, GrammarRule>;
  }
): {
  /**
   * replacement node
   */
  node: GrammarRuleSeqNode[];
  /**
   * additional rules
   */
  rules: Record<string, GrammarRule>;
} => {
  const additionalRules: Record<string, GrammarRule> = {};
  const res: typeof elem = [];
  for (let i = 0; i < elem.length; i += 1) {
    const split = splitElem(elem[i], {
      subRulePrefix,
      rules: {
        ...rules,
        ...additionalRules,
      },
    });

    if (!split) {
      res.push(elem[i]);
      continue;
    }

    res.push(split.node);
    Object.assign(additionalRules, split.rules);
  }

  return {
    node: res,
    rules: additionalRules,
  };
};

const getUnusedName = (name: string, rules: Record<string, GrammarRule>) => {
  if (!(name in rules)) {
    return name;
  }

  for (let i = 1; ; i += 1) {
    const newName = `${name}$${i}`;
    if (!(newName in rules)) {
      return newName;
    }
  }
};

const splitElem = (
  elem: GrammarRuleSeqNode,
  {
    subRulePrefix,
    rules,
  }: {
    subRulePrefix: string;
    rules: Record<string, GrammarRule>;
  }
): {
  /**
   * replacement node
   */
  node: GrammarRuleSeqNode;
  /**
   * additional rules
   */
  rules: Record<string, GrammarRule>;
} | null => {
  if (isGroupNode(elem)) {
    // named group
    if (elem.name) {
      const subRuleName = getUnusedName(`${subRulePrefix}_${elem.name}`, rules);

      return {
        node: {
          name: elem.name,
          value: {
            type: 'ref',
            value: subRuleName,
          },
          modifier: elem.modifier,
        },
        rules: {
          [subRuleName]: {
            name: subRuleName,
            methodName: `_r_${subRuleName}`,
            astBody: elem.value.value,
          },
        },
      };
    }

    const split = splitElemArray(elem.value.value, {
      subRulePrefix,
      rules,
    });
    if (split) {
      return {
        node: {
          name: elem.name,
          value: {
            type: 'pth',
            value: split.node,
          },
          modifier: elem.modifier,
        },
        rules: split.rules,
      };
    }
  }

  if (isOrNode(elem)) {
    let hasSplit = false;
    const additionalRules: Record<string, GrammarRule> = {};
    const branches = [];
    for (let i = 0; i < elem.value.length; i += 1) {
      const branch = elem.value[i];
      const split = splitElemArray(branch, {
        subRulePrefix,
        rules: {
          ...rules,
          ...additionalRules,
        },
      });

      if (split) {
        hasSplit = true;
        branches.push(split.node);
        Object.assign(additionalRules, split.rules);
      } else {
        branches.push(branch);
      }
    }

    if (hasSplit) {
      return {
        node: {
          type: 'or',
          value: branches,
        },
        rules: additionalRules,
      };
    }
  }

  return null;
};

// TODO: handle name duplicates

/**
 * Split rule into subrules as required given named groups
 */
export const splitIntoSubRules = (
  rule: GrammarRule,
  allRules: Record<string, GrammarRule>
) => {
  const split = splitElemArray(rule.astBody, {
    subRulePrefix: rule.name,
    rules: allRules,
  });
  if (split) {
    // apply split recursively to additional rules
    for (const [name, rule] of Object.entries(split.rules)) {
      const nestedSplit = splitIntoSubRules(rule, allRules);
      if (nestedSplit) {
        split.rules[name] = nestedSplit.rule;
        Object.assign(split.rules, nestedSplit.additionalRules);
      }
    }

    return {
      rule: {
        ...rule,
        astBody: split.node,
      },
      additionalRules: split.rules,
    };
  }

  return {
    rule,
    additionalRules: {},
  };
};
