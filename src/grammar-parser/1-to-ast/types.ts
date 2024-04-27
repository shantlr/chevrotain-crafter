export type GrammarAstNode =
  | {
      type: 'identifier';
      value: string;
    }
  | {
      type: 'object';
      fields: Record<string, string | number | GrammarAstNode>;
    };
