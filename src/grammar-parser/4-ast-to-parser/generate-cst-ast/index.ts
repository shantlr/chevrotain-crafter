import { flatMap } from 'lodash-es';
import { type GrammarToken } from '../../2-validate-ast/types';
import {
  type TypeDesc,
  type TypeDescObj,
  type RuleDesc,
} from '../../3-describe/types';
import { type IWriter } from '../../types';
import { formatFieldAccess, indent } from '../../utils/indent';
import { discriminateType } from './discriminate-type';

const formatDiscriminationExpr = ({
  discriminationExpr,
  cstNodeVarName,
  indentLevel,
  astTypes,
  cstTypes,
  ruleDescs,
}: {
  discriminationExpr: ReturnType<typeof discriminateType> | null;
  cstNodeVarName: string;
  indentLevel: number;
  cstTypes: TypeDesc[];
  astTypes: TypeDesc[];
  ruleDescs: Record<string, RuleDesc>;
}): string => {
  if (!discriminationExpr) {
    return '';
  }
  switch (discriminationExpr.type) {
    case 'resolve': {
      const typeIndex = discriminationExpr.value.typeIndex;
      return formatCstFieldToAst({
        cstType: cstTypes[typeIndex],
        astType: astTypes[typeIndex],
        cstNodeVarName,
        indentLevel,
        ruleDescs,
      });
    }
    case 'ternary': {
      let formattedCondition: string = '';
      const condition = discriminationExpr.condition;
      switch (condition.type) {
        case 'isToken': {
          formattedCondition = `${cstNodeVarName}.tokenType === TOKENS${formatFieldAccess(condition.tokenName)}`;
          break;
        }
        case 'hasField': {
          formattedCondition = `'${condition.fieldName}' in ${cstNodeVarName}[0]`;
        }
        // case 'fieldOfType': {
        //   // condition = `cstNode.children${formatFieldAccess(discriminationExpr.condition.fieldName)}.length > 0`;
        // }
      }
      return `${formattedCondition} ? ${formatDiscriminationExpr({
        discriminationExpr: discriminationExpr.then,
        astTypes,
        cstTypes,
        cstNodeVarName,
        indentLevel,
        ruleDescs,
      })} : ${formatDiscriminationExpr({
        discriminationExpr: discriminationExpr.else,
        astTypes,
        cstTypes,
        cstNodeVarName,
        indentLevel,
        ruleDescs,
      })}`;
    }
    default:
  }
  throw new Error(
    `Unhandled discrimination expr ${JSON.stringify(discriminationExpr)}`
  );
};

const formatCstFieldToAst = ({
  cstType,
  astType,
  ruleDescs,

  cstNodeVarName,
  indentLevel,
}: {
  cstType: TypeDesc;
  astType: TypeDesc;
  ruleDescs: Record<string, RuleDesc>;

  cstNodeVarName: string;

  indentLevel: number;
}) => {
  switch (astType.type) {
    case 'string': {
      if (
        cstType.type === 'array' &&
        cstType.elementType.type === 'chevrotainToken'
      ) {
        return `${cstNodeVarName}[0].image`;
      }
      if (cstType.type === 'chevrotainToken') {
        return `${cstNodeVarName}.image`;
      }

      throw new Error(
        `Unhandled map to string from cst ${JSON.stringify(cstType)}`
      );
    }
    case 'ruleRef': {
      const ruleDesc = ruleDescs[astType.ruleName];
      if (!ruleDesc) {
        throw new Error(`Rule '${astType.ruleName}' not found`);
      }

      const arg =
        cstType.type === 'array' ? `${cstNodeVarName}[0]` : cstNodeVarName;

      return `map${ruleDesc.body.parseOutputTypeName}(${arg})`;
    }
    case 'array': {
      const itemType = astType.elementType;
      if (cstType.type !== 'array') {
        throw new Error(
          `Ast ${JSON.stringify(astType)} expected a cst array but got ${cstType.type}`
        );
      }

      const content: string[] = [
        `${cstNodeVarName}.map(`,
        `${indent(indentLevel)}(node) => ${formatCstFieldToAst({
          astType: itemType,
          cstNodeVarName: 'node',
          cstType: cstType.elementType as TypeDescObj,
          ruleDescs,
          indentLevel: indentLevel + 1,
        })}`,
        `${indent(indentLevel - 1)})`,
      ];

      return content.join('\n');
    }
    case 'or': {
      if (cstType.type === 'or') {
        if (cstType.branch.length !== astType.branch.length) {
          throw new Error(
            `Unhandled or branch length mismatch between cst=${JSON.stringify(cstType)} and ast=${JSON.stringify(astType)}`
          );
        }

        const discriminationExpr = discriminateType({
          possibleTypes: cstType.branch.map((b) => {
            if (b.type === 'array') {
              return b.elementType;
            }
            return b;
          }),
          ruleDescs,
        });

        return formatDiscriminationExpr({
          discriminationExpr,
          cstNodeVarName,
          indentLevel,
          cstTypes: cstType.branch,
          astTypes: astType.branch,
          ruleDescs,
        });
      }
      break;
    }
    default:
  }

  throw new Error(
    `Unhandled map cst field to ast field ast=${JSON.stringify(astType)} cst=${JSON.stringify(cstType)}`
  );
};

export const generateCstToAst = ({
  rootRule,
  ruleDescs,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  ruleDescs: Record<string, RuleDesc>;
  rootRule: RuleDesc;
  writer: IWriter;
}) => {
  const allTypes = flatMap(ruleDescs, (r) => [
    r.body.parseOutputTypeName,
    r.body.cstOutputTypeName,
  ]);
  const content: string[] = [
    `import type { ${allTypes.join(', ')} } from './types';`,
    `import { TOKENS } from './lexer'`,
    '',
  ];

  for (const [, ruleDesc] of Object.entries(ruleDescs)) {
    const cstType = ruleDesc.body.parseOutputTypeName;

    const cstNodeVarName = 'cstNode';

    content.push(
      `const map${cstType} = (${cstNodeVarName}: ${cstType}): ${ruleDesc.body.cstOutputTypeName} => {`
    );
    content.push(`${indent(1)}return {`);

    const astType =
      ruleDesc.body.cstOutputType ?? ruleDesc.body.cstOutputTypeDefault;

    const ruleCstType = ruleDesc.body.parseOutputType;
    const ruleCstChildren = ruleCstType.fields.children as TypeDescObj;

    for (const [fieldName, fieldType] of Object.entries(astType.fields)) {
      const cstField = `${cstNodeVarName}.children${formatFieldAccess(fieldName)}`;

      content.push(
        `${indent(2)}${fieldName}: ${formatCstFieldToAst({
          astType: fieldType,
          cstNodeVarName: cstField,
          cstType: ruleCstChildren.fields[fieldName] as TypeDescObj,
          ruleDescs,
          indentLevel: 3,
        })},`
      );
    }
    content.push(`${indent(1)}};`);

    content.push('};');
  }

  content.push(
    `export const cstToAst = (cst: ${rootRule.body.parseOutputTypeName}): ${rootRule.body.cstOutputTypeName} => {`
  );
  content.push(
    `${indent(1)}return map${rootRule.body.parseOutputTypeName}(cst);`
  );
  content.push('};');

  writer.writeFile('cst-to-ast.ts', content.join('\n'));
};
