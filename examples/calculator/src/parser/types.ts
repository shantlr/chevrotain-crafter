import { IToken } from 'chevrotain';

export type RuleCst_Start = {
  name: 'r_start';
  children: {
    r_expr: RuleCst_Expr[];
  };
};
export type RuleCst_Expr = {
  name: 'r_expr';
  children: {
    r_addition_expr: RuleCst_AdditionExpr[];
  };
};
export type RuleCst_AdditionExpr = {
  name: 'r_addition_expr';
  children: {
    left: RuleCst_MultiplicationExpr[];
    "+"?: IToken[];
    right?: RuleCst_MultiplicationExpr[];
  };
};
export type RuleCst_MultiplicationExpr = {
  name: 'r_multiplication_expr';
  children: {
    left: RuleCst_PrimaryExpr[];
    "*"?: IToken[];
    right?: RuleCst_PrimaryExpr[];
  };
};
export type RuleCst_PrimaryExpr = {
  name: 'r_primary_expr';
  children: {
    "(": IToken[];
    value: 
      | RuleCst_Expr[]
      | IToken[];
    ")": IToken[];
  };
};

export type Rule_Start = {
  r_expr: Rule_Expr;
};
export type Rule_Start_WithNodeType = {
  r_expr: Rule_Expr_WithNodeType;
  __type: 'start';
}
export type Rule_Expr = {
  r_addition_expr: Rule_AdditionExpr;
};
export type Rule_Expr_WithNodeType = {
  r_addition_expr: Rule_AdditionExpr_WithNodeType;
  __type: 'expr';
}
export type Rule_AdditionExpr = {
  left: Rule_MultiplicationExpr;
  right: Rule_MultiplicationExpr[];
};
export type Rule_AdditionExpr_WithNodeType = {
  left: Rule_MultiplicationExpr_WithNodeType;
  right: Rule_MultiplicationExpr_WithNodeType[];
  __type: 'addition-expr';
}
export type Rule_MultiplicationExpr = {
  left: Rule_PrimaryExpr;
  right: Rule_PrimaryExpr[];
};
export type Rule_MultiplicationExpr_WithNodeType = {
  left: Rule_PrimaryExpr_WithNodeType;
  right: Rule_PrimaryExpr_WithNodeType[];
  __type: 'multiplication-expr';
}
export type Rule_PrimaryExpr = {
  value: 
    | Rule_Expr
    | string;
};
export type Rule_PrimaryExpr_WithNodeType = {
  value: 
    | Rule_Expr_WithNodeType
    | string;
  __type: 'primary-expr';
}
export type IParseOptions = {
  withNodeType?: boolean;
};
export interface ParseText {
  (text: string): Rule_Start;
  <ParseOptions extends IParseOptions>(text: string, options: ParseOptions): Rule_Start;
};