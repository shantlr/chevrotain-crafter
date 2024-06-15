import { map, mapValues } from 'lodash-es';
import { type GrammarToken } from '../2-validate-ast/types';
import { type TypeDesc, type RuleDesc } from '../3-describe/types';
import { type IWriter } from '../types';
import { formatFieldName, indent } from '../utils/indent';
import { TypeName } from './constant';

const serializeType = ({
  type,
  ruleTypeNames,
  indentLevel,
}: {
  type: TypeDesc;
  ruleTypeNames: Record<string, string>;
  indentLevel: number;

  asOptional?: boolean;
}): string => {
  switch (type.type) {
    case 'string': {
      return 'string';
    }
    case 'object': {
      const content = [
        '{',
        ...map(type.fields, (f, name) => {
          const isOptional = f.fieldOptional || f.type === 'optional';
          return `${indent(indentLevel)}${formatFieldName(name)}${isOptional ? `?` : ''}: ${serializeType({ type: f, ruleTypeNames, indentLevel: indentLevel + 1 })};`;
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
    case 'optional': {
      return `${serializeType({ type: type.value, ruleTypeNames, indentLevel })}`;
    }
    case 'literal': {
      return `'${type.value}'`;
    }
    default:
  }

  throw new Error(`Unhandled serialize type desc '${JSON.stringify(type)}'`);
};

export const mapTypeNameWithNodeType = (typeName: string) => {
  return `${typeName}_WithNodeType`;
};

export const generateTypes = ({
  tokens,
  ruleDescs,
  writer,
  rootRule,
}: {
  tokens: Record<string, GrammarToken>;
  ruleDescs: Record<string, RuleDesc>;
  writer: IWriter;
  rootRule: RuleDesc;
}) => {
  const content: string[] = [`import { IToken } from 'chevrotain';`, ''];

  const cstRuleNameToTypeName = mapValues(
    ruleDescs,
    (r) => r.body.parseOutputTypeName
  );

  // Generate cst types (output of chevrotain parser)
  for (const [, ruleDesc] of Object.entries(ruleDescs)) {
    const type = ruleDesc.body.parseOutputType;
    const typeName = ruleDesc.body.parseOutputTypeName;
    content.push(
      `export type ${typeName} = ${serializeType({
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
  const astRuleNameToWithNodeTypeTypeName = mapValues(ruleDescs, (r) =>
    mapTypeNameWithNodeType(r.body.cstOutputTypeName)
  );

  // Generate ast types (expected types given named params)
  for (const [, ruleDesc] of Object.entries(ruleDescs)) {
    const type =
      ruleDesc.body.cstOutputType ?? ruleDesc.body.cstOutputTypeDefault;
    const typeName = ruleDesc.body.cstOutputTypeName;
    content.push(
      `export type ${typeName} = ${serializeType({
        type,
        ruleTypeNames: astRuleNameToTypeName,
        indentLevel: 1,
      })};`
    );
    // Generate with node type types
    content.push(
      `export type ${mapTypeNameWithNodeType(typeName)} = ${serializeType({
        type: {
          ...type,
          fields: {
            ...type.fields,
            __type: {
              type: 'literal',
              fieldOptional: false,
              value: ruleDesc.rule.name,
            },
          },
        },
        ruleTypeNames: astRuleNameToWithNodeTypeTypeName,
        indentLevel: 1,
      })}`
    );
  }

  // Generate parse options
  content.push(
    `export type ${TypeName.IParseOptions} = {`,
    `  withNodeType?: boolean;`,
    `};`,
    `export interface ${TypeName.ParseText} {`,
    `  (text: string): ${rootRule.body.cstOutputTypeName};`,
    `  <ParseOptions extends IParseOptions>(text: string, options: ParseOptions): ${rootRule.body.cstOutputTypeName};`,
    '};'
  );

  writer.writeFile(`types.ts`, content.join('\n'));
};
