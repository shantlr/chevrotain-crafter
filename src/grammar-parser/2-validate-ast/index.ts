import {
  type GrammarRootNode,
  type GrammarRuleSeqNode,
} from '../1-to-ast/types';
import { type GrammarRule, type GrammarToken } from './types';
import { isGroupNode, isLiteralNode, isOrNode, isRefNode } from './utils';

const KNOWN_TOKEN_OPTION = ['pattern', 'group'];

const validateTokens = (ast: GrammarRootNode) => {
  const mergedTokens: Record<string, GrammarToken> = {};

  const errors: string[] = [];
  const warnings: string[] = [];

  ast.fields.forEach((field) => {
    if (field.name !== 'tokens') {
      return;
    }

    field.tokens.forEach((token) => {
      // duplicate tokens
      if (token.name in mergedTokens) {
        errors.push(`Token ${token.name} is already defined`);
      }
      const keys = Object.keys(token.options);
      keys.forEach((key) => {
        if (!KNOWN_TOKEN_OPTION.includes(key)) {
          warnings.push(`Unknown token option ${key} in token ${token.name}`);
        }
      });

      if (token.options.group && typeof token.options.group !== 'string') {
        errors.push(`Token ${token.name} group must be a string`);
        return;
      }
      if (
        token.options.pattern &&
        typeof token.options.pattern !== 'string' &&
        !(token.options.pattern instanceof RegExp)
      ) {
        errors.push(`Token ${token.name} pattern must be a string or RegExp`);
        return;
      }

      mergedTokens[token.name] = {
        name: token.name,
        pattern: token.options.pattern as string | RegExp,
        group: token.options.group as string,
      };
    });
  });

  return {
    errors,
    warnings,
    tokens: mergedTokens,
  };
};

const validateInlineTokens = (
  elem: GrammarRuleSeqNode,
  allRules: Record<string, GrammarRule>
): Record<string, GrammarToken> => {
  if (isOrNode(elem)) {
    const res: Record<string, GrammarToken> = {};
    for (const branch of elem.value) {
      for (const e of branch) {
        const tokens = validateInlineTokens(e, allRules);
        Object.assign(res, tokens);
      }
    }
    return res;
  }

  if (isLiteralNode(elem)) {
    const name = `${elem.value}`;
    return {
      [name]: {
        name,
        pattern: elem.value,
      },
    };
  }

  if (isGroupNode(elem)) {
    const res: Record<string, GrammarToken> = {};
    for (const e of elem.value.value) {
      Object.assign(res, validateInlineTokens(e, allRules));
    }
    return res;
  }
  return {};
};

/**
 * Check that references exists
 */
const validateRuleBody = (
  rule: GrammarRule,
  elem: GrammarRuleSeqNode,
  allRules: Record<string, GrammarRule>,
  tokens: Record<string, GrammarToken>
) => {
  const errors: string[] = [];

  if (isOrNode(elem)) {
    for (const branch of elem.value) {
      for (const e of branch) {
        validateRuleBody(rule, e, allRules, tokens);
      }
    }
  }

  if (isRefNode(elem)) {
    const refName = elem.value.value;
    if (!allRules[refName] && tokens[refName]) {
      errors.push(
        `Rule ${rule.name} references unknown rule or token '${refName}'`
      );
    }
  }
  if (isGroupNode(elem)) {
    for (const e of elem.value.value) {
      validateRuleBody(rule, e, allRules, tokens);
    }
  }
};

const validateRules = (
  ast: GrammarRootNode,
  tokens: Record<string, GrammarToken>
) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const mergedRules: Record<string, GrammarRule> = {};
  const mergedTokens = {
    ...tokens,
  };

  for (const field of ast.fields) {
    if (field.name !== 'rules') {
      continue;
    }
    for (const rule of field.rules) {
      if (rule.name in mergedRules) {
        errors.push(`Rule ${rule.name} is already defined`);
      }
      if (rule.name in tokens) {
        errors.push(`Rule ${rule.name} is already defined as a token`);
      }

      if (rule.body.length === 0) {
        errors.push(`Rule ${rule.name} is empty`);
      }

      mergedRules[rule.name] = {
        name: rule.name,
        methodName: `r_${rule.name.replace(/-/g, '_')}`,
        astBody: rule.body,
      };
    }
  }

  // Load inlined tokens
  for (const [, rule] of Object.entries(mergedRules)) {
    for (const elem of rule.astBody) {
      const additionalTokens = validateInlineTokens(elem, mergedRules);
      Object.assign(mergedTokens, additionalTokens);
    }
  }

  // assert references exists
  for (const [, rule] of Object.entries(mergedRules)) {
    for (const elem of rule.astBody) {
      validateRuleBody(rule, elem, mergedRules, tokens);
    }
  }
  // TODO: check for left recursion

  return {
    errors,
    warnings,
    rules: mergedRules,
    tokens: mergedTokens,
  };
};

/**
 * Validate tokens and rules are valid
 * Load inlined tokens into tokens record
 */
export const validateGrammarAst = (ast: GrammarRootNode) => {
  const parsedTokens = validateTokens(ast);
  parsedTokens.warnings.forEach((warning) => {
    console.warn(`[WARN]`, warning);
  });
  if (parsedTokens.errors?.length) {
    console.error('Some tokens are invalid:');
    console.error(parsedTokens.errors.join('\n'));
    return;
  }

  const parsedRules = validateRules(ast, parsedTokens.tokens);

  return {
    tokens: parsedRules.tokens,
    rules: parsedRules.rules,
  };
};
