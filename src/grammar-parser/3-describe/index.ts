// import { capitalize } from 'lodash-es';
import {
  type GrammarRuleBodyAnyNode,
  // type GrammarRuleSeqNode,
} from '../1-to-ast/types';
import { type GrammarToken, type GrammarRule } from '../2-validate-ast/types';
// import {
//   isGroupNode,
//   isLiteralNode,
//   isOrNode,
//   isRefNode,
// } from '../2-validate-ast/utils';
import { splitIntoSubRules } from './split-subrules';
import { mapRuleToChevrotain } from './map-to-chevrotain';
import { type RuleDesc, type TypeDesc } from './types';

// 1. Compute cst to ast mapping
// 2. Generate ast types
// 3. Generate sub rules required by named group

// const hasNamedElem = (
//   elem: GrammarRuleSeqNode | GrammarRuleSeqNode[]
// ): boolean => {
//   if (Array.isArray(elem)) {
//     return elem.some((e) => hasNamedElem(e));
//   }
//   if (isOrNode(elem)) {
//     return elem.value.some((e) => hasNamedElem(e));
//   }
//   if (isGroupNode(elem)) {
//     return !!elem.name || hasNamedElem(elem.value.value);
//   }

//   return !!elem.name;
// };

// const mergeMaps = (maps: ResMap[]) => {
//   return maps.reduce<ResMap>((acc, t) => {
//     for (const [k, v] of t) {
//       acc.set(k, v);
//     }
//     return acc;
//   }, new Map());
// };

// const isOrType = (type: TypeDesc | undefined): type is TypeDescOr => {
//   return !!type && typeof type !== 'string' && type.type === 'or';
// };
// const isObjectType = (type: TypeDesc | undefined): type is TypeDescObj => {
//   return !!type && typeof type !== 'string' && type.type === 'object';
// };

// type ResMap = Map<
//   GrammarRuleBodyAnyNode,
//   {
//     label: string | undefined;
//     defaultLabel: string | undefined;
//     type: TypeDesc;
//   }
// >;

// const mergeOrToObjectType = (type: TypeDescOr) => {
//   console.log('or', type);

//   const res: TypeDescObj = {
//     type: 'object',
//     typeName: '',
//     fields: {},
//   };

//   type.branch.forEach((branch) => {
//     if (isObjectType(branch)) {
//       for (const [fieldName, fieldType] of Object.entries(branch.fields)) {
//         res.fields[fieldName] = fieldType;
//       }
//     }
//   });

//   return res;
// };

// const mapAstToType = (
//   elem: GrammarRuleSeqNode | GrammarRuleSeqNode[],
//   context: {
//     prefix: string;
//   } = {
//     prefix: '',
//   }
// ): {
//   map: ResMap;
//   type: TypeDesc;
// } => {
//   if (Array.isArray(elem)) {
//     const hasNamed = hasNamedElem(elem);

//     const types = elem.map((e) => {
//       const elem = mapAstToType(e, context);
//       return {
//         node: e,
//         type: elem.type,
//         map: elem.map,
//       };
//     });

//     // merge maps
//     const map = mergeMaps(types.map((t) => t.map));

//     if (types.length === 1) {
//       const type = types[0].type;
//       if (isOrType(type)) {
//         const mergedOr = mergeOrToObjectType(type);
//         // mergedOr.typeName = `${context.prefix}`;
//         console.log(mergedOr);

//         return {
//           map,
//           type: mergedOr,
//         };
//       }
//     }

//     const type: TypeDesc = {
//       type: 'object',
//       typeName: context.prefix,
//       fields: types.reduce<Record<string, TypeDesc>>((acc, { node }) => {
//         const t = map.get(node);
//         if (isOrType(t?.type)) {
//           const mergedOr = mergeOrToObjectType(t.type);
//           // mergedOr.typeName = `${context.prefix}`;
//           console.log(mergedOr);
//         } else if (!hasNamed) {
//           if (t?.defaultLabel) {
//             acc[t?.defaultLabel] = t.type;
//           }
//         } else if (t?.label) {
//           acc[t.label] = t.type;
//         }
//         return acc;
//       }, {}),
//     };

//     return {
//       map,
//       type,
//     };
//   }

//   if (isOrNode(elem)) {
//     const types = elem.value.map((branch, idx) => {
//       const res = mapAstToType(branch, {
//         ...context,
//         prefix: `${context.prefix}_Branch${idx + 1}`,
//       });

//       return {
//         node: branch,
//         type: res.type,
//         map: res.map,
//       };
//     });

//     const mergedMap = mergeMaps(types.map((t) => t.map));

//     const type: TypeDesc = {
//       type: 'or',
//       typeName: `${context.prefix}`,
//       branch: types.map((t) => t.type),
//     };

//     return {
//       map: mergedMap.set(elem, {
//         label: undefined,
//         defaultLabel: undefined,
//         type,
//       }),
//       type,
//     };
//   }

//   if (isLiteralNode(elem)) {
//     const type: TypeDesc = 'string';
//     return {
//       map: (new Map() as ResMap).set(elem, {
//         label: elem.name,
//         defaultLabel: elem.value,
//         type,
//       }),
//       type,
//     };
//   }

//   if (isRefNode(elem)) {
//     const type: TypeDesc = {
//       type: 'ref',
//       identifier: elem.value.value,
//     };
//     return {
//       map: (new Map() as ResMap).set(elem, {
//         label: elem.name,
//         defaultLabel: elem.value.value,
//         type,
//       }),
//       type,
//     };
//   }
//   if (isGroupNode(elem)) {
//     const children = mapAstToType(elem.value.value, {
//       ...context,
//       prefix: `${context.prefix}_${elem.name}`,
//     });

//     return {
//       map: children.map,
//     };
//   }

//   throw new Error(`Unhandled elem type mappping ${JSON.stringify(elem)}`);
// };

// const inferRuleType = (rule: GrammarRule) => {
//   const prefix = `Ast_${capitalize(rule.name)}`;

//   const res = mapAstToType(rule.astBody, {
//     prefix,
//   });
//   console.log(rule.name, '==>', res);
//   return res;
// };

export const describeRules = ({
  rules: inputRules,
  tokens,
}: {
  rules: Record<string, GrammarRule>;
  tokens: Record<string, GrammarToken>;
}) => {
  const rules = { ...inputRules };
  // const rules = inputRules;

  // split into subrules (named groups)
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
