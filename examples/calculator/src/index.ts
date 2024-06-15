import { parse } from "./parser"

export const parseCalculationExpr = (expr: string) => {
  const node = parse(expr);

  console.log('RES', node);

  // return parse(expr, {
  //   mapNode: {
  //     RuleCst_AdditionExpr: ({ left, right }) => {
  //       return left + right.reduce(acc, val => acc + val, 0)
  //     },
  //   },
  // });
}
