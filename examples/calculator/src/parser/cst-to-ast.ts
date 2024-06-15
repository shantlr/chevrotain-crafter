import type { RuleCst_Start, Rule_Start, Rule_Start_WithNodeType, RuleCst_Expr, Rule_Expr, Rule_Expr_WithNodeType, RuleCst_AdditionExpr, Rule_AdditionExpr, Rule_AdditionExpr_WithNodeType, RuleCst_MultiplicationExpr, Rule_MultiplicationExpr, Rule_MultiplicationExpr_WithNodeType, RuleCst_PrimaryExpr, Rule_PrimaryExpr, Rule_PrimaryExpr_WithNodeType, IParseOptions } from './types';
import { TOKENS } from './lexer'

const mapRuleCst_Start = (cstNode: RuleCst_Start, options: IParseOptions | undefined): Rule_Start | Rule_Start_WithNodeType => {
  const res: Rule_Start | Rule_Start_WithNodeType = {
    r_expr: mapRuleCst_Expr(cstNode.children.r_expr[0], options),
  };
  if (options?.withNodeType) {
    (res as Rule_Start_WithNodeType).__type = 'start';
  }
  return res;
};
const mapRuleCst_Expr = (cstNode: RuleCst_Expr, options: IParseOptions | undefined): Rule_Expr | Rule_Expr_WithNodeType => {
  const res: Rule_Expr | Rule_Expr_WithNodeType = {
    r_addition_expr: mapRuleCst_AdditionExpr(cstNode.children.r_addition_expr[0], options),
  };
  if (options?.withNodeType) {
    (res as Rule_Expr_WithNodeType).__type = 'expr';
  }
  return res;
};
const mapRuleCst_AdditionExpr = (cstNode: RuleCst_AdditionExpr, options: IParseOptions | undefined): Rule_AdditionExpr | Rule_AdditionExpr_WithNodeType => {
  const res: Rule_AdditionExpr | Rule_AdditionExpr_WithNodeType = {
    left: mapRuleCst_MultiplicationExpr(cstNode.children.left[0], options),
    right: cstNode.children.right?.map(
      (node) => mapRuleCst_MultiplicationExpr(node, options)
    ) ?? [],
  };
  if (options?.withNodeType) {
    (res as Rule_AdditionExpr_WithNodeType).__type = 'addition-expr';
  }
  return res;
};
const mapRuleCst_MultiplicationExpr = (cstNode: RuleCst_MultiplicationExpr, options: IParseOptions | undefined): Rule_MultiplicationExpr | Rule_MultiplicationExpr_WithNodeType => {
  const res: Rule_MultiplicationExpr | Rule_MultiplicationExpr_WithNodeType = {
    left: mapRuleCst_PrimaryExpr(cstNode.children.left[0], options),
    right: cstNode.children.right?.map(
      (node) => mapRuleCst_PrimaryExpr(node, options)
    ) ?? [],
  };
  if (options?.withNodeType) {
    (res as Rule_MultiplicationExpr_WithNodeType).__type = 'multiplication-expr';
  }
  return res;
};
const mapRuleCst_PrimaryExpr = (cstNode: RuleCst_PrimaryExpr, options: IParseOptions | undefined): Rule_PrimaryExpr | Rule_PrimaryExpr_WithNodeType => {
  const res: Rule_PrimaryExpr | Rule_PrimaryExpr_WithNodeType = {
    value: 'name' in cstNode.children.value[0] ? mapRuleCst_Expr(cstNode.children.value[0], options) : cstNode.children.value[0].image,
  };
  if (options?.withNodeType) {
    (res as Rule_PrimaryExpr_WithNodeType).__type = 'primary-expr';
  }
  return res;
};

/**
 * Map chevrotain cst node into ast node based on grammar named sequences
 */
export const cstToAst = (cst: RuleCst_Start, options?: IParseOptions): Rule_Start => {
  return mapRuleCst_Start(cst, options);
};