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
  if (type === 'string') {
    return 'string';
  }

  if (type.type === 'object') {
    const content = [
      '{',
      ...map(type.fields, (f, name) => {
        return `${indent(indentLevel)}${formatFieldName(name)}: ${serializeType({ type: f, ruleTypeNames, indentLevel: indentLevel + 1 })};`;
      }),
      `${indent(indentLevel - 1)}}`,
    ];
    return content.join('\n');
  }
  if (type.type === 'array') {
    return `${serializeType({ type: type.elementType, ruleTypeNames, indentLevel })}[]`;
  }
  if (type.type === 'chevrotainToken') {
    return `IToken`;
  }

  if (type.type === 'or') {
    return map(type.branch, (o) => {
      const formattedType = serializeType({
        type: o,
        ruleTypeNames,
        indentLevel,
      });
      return `\n${indent(indentLevel)}| ${formattedType}`;
    }).join('');
  }

  if (type.type === 'ruleRef') {
    if (!ruleTypeNames[type.ruleName]) {
      throw new Error(`Rule '${type.ruleName}' not found`);
    }

    return ruleTypeNames[type.ruleName];
  }

  return '';
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

  for (const [, ruleDesc] of Object.entries(ruleDescs)) {
    const type = ruleDesc.body.parseOutputType;
    content.push(
      `export type ${type.typeName} = ${serializeType({
        type,
        ruleTypeNames: mapValues(
          ruleDescs,
          (r) => r.body.parseOutputType.typeName
        ),
        indentLevel: 1,
      })};`
    );
  }

  content.push('');

  for (const [, ruleDesc] of Object.entries(ruleDescs)) {
    const type =
      ruleDesc.body.cstOutputType ?? ruleDesc.body.cstOutputTypeDefault;
    content.push(
      `export type ${type.typeName} = ${serializeType({
        type,
        ruleTypeNames: mapValues(
          ruleDescs,
          (r) => (r.body.cstOutputType ?? r.body.cstOutputTypeDefault).typeName
        ),
        indentLevel: 1,
      })};`
    );
  }

  writer.writeFile(`types.ts`, content.join('\n'));
};
