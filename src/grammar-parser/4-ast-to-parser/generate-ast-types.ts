import { type GrammarRuleSeqNode } from '../1-to-ast/types';
import { type GrammarRule, type GrammarToken } from '../2-validate-ast/types';
import { type TypeDescObj, type TypeDesc } from '../3-describe';
import { type IWriter } from '../types';
import { indent } from '../utils/indent';

const mapAstToType = (
  elem: GrammarRuleSeqNode | GrammarRuleSeqNode[],
  context: {
    named: Record<string, string>;
    unnamed: Record<string, string>;
    path: string[];
  } = {
    named: {},
    unnamed: {},
    path: [],
  }
): {
  named: Record<string, string>;
  unnamed: Record<string, string>;
} => {
  if (Array.isArray(elem)) {
    const type = elem.reduce<{
      named: Record<string, string>;
      unnamed: Record<string, string>;
    }>((acc, e) => {
      const t = mapAstToType(e, {
        ...acc,
        path: context.path,
      });

      console.log(t);

      return {
        named: {
          ...acc.named,
          ...t.named,
        },
        unnamed: {
          ...acc.unnamed,
          ...t.unnamed,
        },
      };
    }, context);

    if (type.named && Object.keys(type.named).length > 0) {
      return {
        named: type.named,
        unnamed: {},
      };
    }

    return type;
  }

  if ('type' in elem) {
    const types = elem.value.map((e) => mapAstToType(e, context));
    return {
      type: 'or',
      named: {},
      unnamed: {},
    };
  }

  const value = elem.value;
  if (typeof value === 'string') {
    if (elem.name) {
      return {
        named: {
          ...context.named,
          [elem.name]: '',
        },
        unnamed: {},
      };
    }
    return {
      named: {},
      unnamed: {
        ...context.unnamed,
        [value]: '',
      },
    };
  } else if (value.type === 'ref') {
    return {
      named: elem.name ? { [elem.name]: '' } : {},
      unnamed: elem.name ? {} : { [value.value]: '' },
    };
  }

  const children = mapAstToType(value, context);
  if (elem.name) {
    return {
      named: {
        ...children.named,
        // ...context.named,
        [elem.name]: '',
      },
      unnamed: {},
    };
  }

  return {
    named: children.named,
    unnamed: children.unnamed,
  };
};

const formatRuleTypes = (rule: GrammarRule) => {
  const type = mapAstToType(rule.astBody);
  console.log(rule.name, '>>', type);
  console.log();
  // rule.astBody.forEach((elem) => {
  //   const type = mapAstToType(elem);
  //   console.log(elem, '>>', type);
  // });
  // rule.astBody.forEach((elem) => {
  //   // if (elem.)
  // });
  // rule.astBody.forEach((elem) => {
  //   //
  // });
};

const formatType = ({
  type,
  indentLevel = 0,
}: {
  type: TypeDesc;
  indentLevel?: number;
}) => {
  if (typeof type === 'string') {
    return 'string';
  }
  if (type.type === 'object') {
    const res: string[] = ['{'];
    for (const [key, value] of Object.entries(type.fields)) {
      res.push(
        `${indent(indentLevel)}${key}: ${formatType({ type: value, indentLevel: indentLevel + 1 })};`
      );
    }
    res.push('}');
    return res.join('\n');
  }
  if (type.type === 'ref') {
    //
  }
};

export const generateAstTypes = ({
  tokens,
  rules,
  writer,
  meta,
}: {
  tokens: Record<string, GrammarToken>;
  rules: Record<string, GrammarRule>;
  writer: IWriter;

  meta: {
    rules: Record<string, TypeDescObj>;
    astNode: Record<string, TypeDesc>;
    types: TypeDescObj[];
  };
}) => {
  const content: string[] = [];

  for (const [ruleName, rule] of Object.entries(rules)) {
    const ruleType = meta.rules[ruleName];
    content.push(
      `export type ${ruleType.typeName} = ${formatType({ type: ruleType })}`
    );
  }

  writer.writeFile(`types.ts`, content.join('\n'));
};
