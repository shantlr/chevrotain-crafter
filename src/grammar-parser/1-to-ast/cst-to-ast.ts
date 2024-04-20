import { type CstNode, type CstParser, type ParserMethod } from "chevrotain";

import { grammarParser } from "./parser";

type ParserRuleKeys<P, Key = keyof P> = Key extends keyof P
  ? P[Key] extends ParserMethod<any, any>
    ? Key extends `r_${string}`
      ? Key
      : never
    : never
  : never;

export const createVisitor = <
  P extends CstParser,
  Visitors extends {
    [key in ParserRuleKeys<P>]?: (
      children: CstNode["children"],
      visit: (cst: CstNode) => any,
    ) => any;
  },
>(
  parser: P,
  visitors: {
    [key in ParserRuleKeys<P>]?: Visitors[key];
  },
  opt?: {
    default?: (children: CstNode, visit: (cst: any) => any) => any;
  },
) => {
  const visit = (node: CstNode) => {
    if (node.name in visitors) {
      return visitors[node.name as ParserRuleKeys<P>]!(node.children, visit);
    }
    if (opt?.default) {
      return opt.default(node, visit);
    }
    return node;
  };
  return visit;
};

// const visitSubRule = (
//   cst: any,
//   visitor: (cst: any) => any,
//   opt?: { name?: string; omit?: string[]; error?: string },
// ) => {
//   let c = cst;
//   if (opt?.omit) {
//     c = omit(c, opt.omit);
//   }

//   const keys = Object.keys(c);
//   if (keys.length === 1 && c[keys[0]]?.length === 1) {
//     return visitor(c[keys[0]][0]);
//   }

//   console.log(cst);
//   throw new Error(
//     opt?.error ?? `COULD NOT MAP '${opt?.name}' ${JSON.stringify(cst)}`,
//   );
// };

export const grammarCstToAst = createVisitor(grammarParser, {
  r_root: (children, visit) => {
    return visit(children.fields[0]);
  },
  r_root_field: (children, visit) => {
    if (children.rules) {
      return visit(children.rules[0]);
    }
    const name = children.name[0].image;
    if (name === "tokens") {
      return {
        name,
        tokens: children.tokens?.map(visit) ?? [],
      };
    }

    return {
      name: children.name[0].image,
    };
  },
  r_token: (children, visit) => {
    return {
      name: children.name[0].image,
      options:
        children.options?.map(visit).reduce((acc, val) => {
          acc[val.name] = val.value;
          return acc;
        }, {}) ?? {},
    };
  },
  r_token_option: (children, visit) => {
    return {
      name: children.name[0].image,
      value: visit(children.value[0]),
    };
  },
  r_token_option_value: (children, visit) => {
    if (children.number) {
      return Number(children.number[0].image);
    }
    if (children.regex) {
      return new RegExp((children.regex[0].image as string).slice(1, -1));
    }
    if (children.doubleQuoteString) {
      return children.doubleQuoteString[0].image;
    }
    if (children.singleQuoteString) {
      return children.singleQuoteString[0].image;
    }
    if (children.identifier) {
      return {
        type: "identifier",
        value: children.identifier[0].image,
      };
    }
    if (children.true) {
      return true;
    }
    if (children.false) {
      return false;
    }
    throw new Error(`Failed to map value: ${JSON.stringify(children)}`);
  },

  r_rules: (children, visit) => {
    return {
      name: "rules",
      rules: children.rules?.map(visit) ?? [],
    };
  },
  r_rule: (children, visit) => {
    return {
      name: children.name[0].image,
      body: children.body ? visit(children.body[0]) : null,
    };
  },
  r_rule_body: (children, visit) => {
    if (children.expr) {
      return children.expr.map(visit);
    }
    return null;
  },
  r_rule_body_expr: (children, visit) => {
    if (children.scalar) {
      return visit(children.scalar[0]);
    }
    throw new Error(`Unhandled rule body expr ${JSON.stringify(children)}`);
  },
  r_rule_body_expr_scalar: (children, visit) => {
    if (children.singleQuoteString) {
      return children.singleQuoteString[0].image;
    }
    if (children.doubleQuoteString) {
      return children.doubleQuoteString[0].image;
    }
    if (children.identifier) {
      return {
        type: "ref",
        value: children.identifier[0].image,
      };
    }
  },
});
