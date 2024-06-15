import { CstParser, IToken } from 'chevrotain';
import { TOKENS } from './lexer';
import type { RuleCst_Start } from './types';

class Parser extends CstParser {
  r_start = this.RULE('r_start', () => {
    this.SUBRULE(this.r_expr);
  });
  r_expr = this.RULE('r_expr', () => {
    this.SUBRULE(this.r_addition_expr);
  });
  r_addition_expr = this.RULE('r_addition_expr', () => {
    this.SUBRULE(this.r_multiplication_expr, { LABEL: 'left' });
    this.MANY(() => {
      this.CONSUME(TOKENS["+"], { LABEL: '+' });
      this.SUBRULE1(this.r_multiplication_expr, { LABEL: 'right' });
    });
  });
  r_multiplication_expr = this.RULE('r_multiplication_expr', () => {
    this.SUBRULE(this.r_primary_expr, { LABEL: 'left' });
    this.MANY(() => {
      this.CONSUME(TOKENS["*"], { LABEL: '*' });
      this.SUBRULE1(this.r_primary_expr, { LABEL: 'right' });
    });
  });
  r_primary_expr = this.RULE('r_primary_expr', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(TOKENS["("], { LABEL: '(' });
          this.SUBRULE(this.r_expr, { LABEL: 'value' });
          this.CONSUME(TOKENS[")"], { LABEL: ')' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(TOKENS["number"], { LABEL: 'value' });
        },
      },
    ]);
  });

  constructor() {
    super(TOKENS);
    this.performSelfAnalysis();
  }
}

export const parseTextToCst = (tokens: IToken[]) => {
  const parser = new Parser();
  parser.input = tokens;
  const cst = parser.r_start();

  if (parser.errors.length) {
  }

  return cst as RuleCst_Start;
}