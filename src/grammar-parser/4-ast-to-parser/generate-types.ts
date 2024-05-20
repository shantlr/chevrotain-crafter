import { map, mapValues } from 'lodash-es';
import { type GrammarToken } from '../2-validate-ast/types';
import { type TypeDesc, type RuleDesc } from '../3-describe/types';
import { type IWriter } from '../types';
import { formatFieldName, indent } from '../utils/indent';

const serializeType = ({
  type,
  ruleTypeNames,
  indentLevel,
}: {
  type: TypeDesc;
  ruleTypeNames: Record<string, string>;
  indentLevel: number;
}): string => {
  switch (type.type) {
    case 'string': {
      return 'string';
    }
    case 'object': {
      const content = [
        '{',
        ...map(type.fields, (f, name) => {
          return `${indent(indentLevel)}${formatFieldName(name)}: ${serializeType({ type: f, ruleTypeNames, indentLevel: indentLevel + 1 })};`;
        }),
        `${indent(indentLevel - 1)}}`,
      ];
      return content.join('\n');
    }
    case 'array': {
      return `${serializeType({ type: type.elementType, ruleTypeNames, indentLevel })}[]`;
    }
    case 'or': {
      return map(type.branch, (o) => {
        const formattedType = serializeType({
          type: o,
          ruleTypeNames,
          indentLevel,
        });
        return `\n${indent(indentLevel)}| ${formattedType}`;
      }).join('');
    }
    case 'chevrotainToken': {
      return `IToken`;
    }
    case 'ruleRef': {
      if (!ruleTypeNames[type.ruleName]) {
        throw new Error(`Rule '${type.ruleName}' not found`);
      }

      return ruleTypeNames[type.ruleName];
    }
    case 'literal': {
      return `'${type.value}'`;
    }
    default:
  }

  throw new Error(`Unhandled serialize type desc '${JSON.stringify(type)}'`);
};

export const generateTypes = ({
  tokens,
  ruleDescs,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  ruleDescs: Record<string, RuleDesc>;
  writer: IWriter;
}) => {
  const content: string[] = [`import { IToken } from 'chevrotain';`, ''];

  const cstRuleNameToTypeName = mapValues(
    ruleDescs,
    (r) => r.body.parseOutputTypeName
  );

  // Generate cst types (output of chevrotain parser)
  for (const [, ruleDesc] of Object.entries(ruleDescs)) {
    const type = ruleDesc.body.parseOutputType;
    content.push(
      `export type ${ruleDesc.body.parseOutputTypeName} = ${serializeType({
        type,
        ruleTypeNames: cstRuleNameToTypeName,
        indentLevel: 1,
      })};`
    );
  }

  content.push('');

  const astRuleNameToTypeName = mapValues(
    ruleDescs,
    (r) => r.body.cstOutputTypeName
  );

  // Generate ast types (expected types given named params)
  for (const [, ruleDesc] of Object.entries(ruleDescs)) {
    const type =
      ruleDesc.body.cstOutputType ?? ruleDesc.body.cstOutputTypeDefault;
    content.push(
      `export type ${ruleDesc.body.cstOutputTypeName} = ${serializeType({
        type,
        ruleTypeNames: astRuleNameToTypeName,
        indentLevel: 1,
      })};`
    );
  }

  writer.writeFile(`types.ts`, content.join('\n'));
};
