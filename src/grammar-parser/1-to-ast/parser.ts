import { CstParser } from "chevrotain";
import { GRAMMAR_TOKENS, GRAMMAR_TOKEN_LIST } from "./tokens";

export class GrammarParser extends CstParser {
  r_root = this.RULE("r_root", () => {
    this.OPTION(() => {
      this.SUBRULE(this.r_root_field, {
        LABEL: "fields",
      });
    });
  });

  r_root_field = this.RULE("r_root_field", () => {
    this.OR([
      // tokens field
      {
        GATE: () => {
          const next = this.LA(1);
          return (
            next.tokenType === GRAMMAR_TOKENS.identifier &&
            next.image === "tokens"
          );
        },
        ALT: () => {
          this.CONSUME(GRAMMAR_TOKENS.identifier, {
            LABEL: "name",
          });
          this.CONSUME(GRAMMAR_TOKENS.colon);

          this.OPTION1(() => {
            this.CONSUME(GRAMMAR_TOKENS.nl);

            this.OPTION2(() => {
              this.CONSUME(GRAMMAR_TOKENS.indent);
              this.MANY(() => {
                this.SUBRULE(this.r_token, {
                  LABEL: "tokens",
                });
              });
              this.OPTION3(() => {
                this.CONSUME(GRAMMAR_TOKENS.outdent);
              });
            });
          });
        },
      },
      // rules field
      {
        GATE: () => {
          const next = this.LA(1);
          return (
            next.tokenType === GRAMMAR_TOKENS.identifier &&
            next.image === "rules"
          );
        },
        ALT: () => {
          this.SUBRULE(this.r_rules, {
            LABEL: "rules",
          });
        },
      },
      // unknown field
      // {
      //   ALT: () => {
      //     this.CONSUME2(GRAMMAR_TOKENS.identifier, {
      //       LABEL: "unknown_name",
      //     });
      //     this.CONSUME2(GRAMMAR_TOKENS.colon);
      //   },
      // },
    ]);
  });

  r_token = this.RULE("r_token", () => {
    this.CONSUME(GRAMMAR_TOKENS.identifier, {
      LABEL: "name",
    });
    this.CONSUME(GRAMMAR_TOKENS.colon);
    this.OPTION1(() => {
      this.CONSUME(GRAMMAR_TOKENS.nl);
      this.OPTION2(() => {
        this.CONSUME(GRAMMAR_TOKENS.indent);
        this.MANY_SEP_WITHOUT_OUTDENT({
          SEP: () => this.CONSUME2(GRAMMAR_TOKENS.nl),
          DEF: (i) => {
            this.subrule(i, this.r_token_option, {
              LABEL: "options",
            });
          },
        });
        // this.SUBRULE1(this.r_token_option, {
        //   LABEL: "options",
        // });
        // this.MANY({
        //   GATE: () => this.LA(2).tokenType !== GRAMMAR_TOKENS.outdent,
        //   DEF: () => {
        //     this.CONSUME2(GRAMMAR_TOKENS.nl);
        //     this.SUBRULE2(this.r_token_option, {
        //       LABEL: "options",
        //     });
        //   },
        // });
        this.OPTION4(() => {
          this.CONSUME3(GRAMMAR_TOKENS.nl);
          this.OPTION5(() => {
            this.CONSUME(GRAMMAR_TOKENS.outdent);
          });
        });
      });
    });
  });

  r_token_option = this.RULE("r_token_option", () => {
    this.CONSUME(GRAMMAR_TOKENS.identifier, {
      LABEL: "name",
    });
    this.CONSUME(GRAMMAR_TOKENS.colon);
    this.SUBRULE(this.r_token_option_value, {
      LABEL: "value",
    });
  });

  r_token_option_value = this.RULE("r_token_option_value", () => {
    this.OR([
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.singleQuoteString),
      },
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.doubleQuoteString),
      },
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.number),
      },
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.regex),
      },
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.identifier),
      },
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.true),
      },
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.false),
      },
    ]);
  });

  r_rules = this.RULE("r_rules", () => {
    this.CONSUME(GRAMMAR_TOKENS.identifier, {
      LABEL: "name",
    });
    this.CONSUME(GRAMMAR_TOKENS.colon);

    this.OPTION(() => {
      this.CONSUME(GRAMMAR_TOKENS.nl);
      this.OPTION1(() => {
        this.CONSUME(GRAMMAR_TOKENS.indent);
        this.MANY_SEP_WITHOUT_OUTDENT({
          SEP: () => this.CONSUME2(GRAMMAR_TOKENS.nl),
          DEF: (i) => {
            this.subrule(i, this.r_rule, {
              LABEL: "rules",
            });
          },
        });
        this.OPTION2(() => {
          this.CONSUME(GRAMMAR_TOKENS.outdent);
        });
      });
    });
  });

  r_rule = this.RULE("r_rule", () => {
    this.CONSUME(GRAMMAR_TOKENS.identifier, {
      LABEL: "name",
    });
    this.CONSUME(GRAMMAR_TOKENS.colon);
    this.SUBRULE(this.r_rule_body, {
      LABEL: "body",
    });
    this.OPTION({
      GATE: () => {
        return (
          this.LA(1).tokenType === GRAMMAR_TOKENS.nl &&
          this.LA(2).tokenType === GRAMMAR_TOKENS.indent
        );
      },
      DEF: () => {
        this.CONSUME(GRAMMAR_TOKENS.nl);
        this.SUBRULE(this.r_rule_body_or, {
          LABEL: "or",
        });
      },
    });
  });

  r_rule_body = this.RULE("r_rule_body", () => {
    this.OR([
      // {
      //   GATE: () => this.LA(2).tokenType === GRAMMAR_TOKENS.colon,
      //   ALT: () => {
      //     this.CONSUME(GRAMMAR_TOKENS.identifier, {
      //       LABEL: "name",
      //     });
      //   },
      // },
      {
        ALT: () => {
          this.MANY(() => {
            this.SUBRULE(this.r_rule_body_expr, {
              LABEL: "expr",
            });
          });
        },
      },
    ]);
  });

  r_rule_body_or = this.RULE("r_rule_body_or", () => {
    this.CONSUME(GRAMMAR_TOKENS.indent);
    this.MANY_SEP_WITHOUT_OUTDENT({
      SEP: () => this.CONSUME(GRAMMAR_TOKENS.nl),
      DEF: (index) => {
        this.consume(index, GRAMMAR_TOKENS.pipe);
        this.subrule(index, this.r_rule_body_or_branch, {
          LABEL: "branch",
        });
      },
    });
    this.OPTION(() => {
      this.CONSUME(GRAMMAR_TOKENS.outdent);
    });
  });

  r_rule_body_or_branch = this.RULE("r_rule_body_or_branch", () => {
    this.MANY(() => {
      this.SUBRULE(this.r_rule_body_expr, {
        LABEL: "value",
      });
    });
  });

  r_rule_body_expr = this.RULE("r_rule_body_expr", () => {
    this.OR([
      {
        ALT: () => {
          this.SUBRULE(this.r_rule_body_expr_scalar, {
            LABEL: "scalar",
          });
        },
      },
    ]);
  });

  r_rule_body_expr_scalar = this.RULE("r_rule_body_expr_scalar", () => {
    this.OR([
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.singleQuoteString),
      },
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.doubleQuoteString),
      },
      {
        ALT: () => this.CONSUME(GRAMMAR_TOKENS.identifier),
      },
      {
        ALT: () => {
          this.SUBRULE(this.r_rule_body_expr_pth);
        },
      },
    ]);
  });

  r_rule_body_expr_pth = this.RULE("r_rule_body_expr_pth", () => {
    this.CONSUME(GRAMMAR_TOKENS.pthOpen);
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.r_rule_body, {
        LABEL: "value",
      });
    });
    this.CONSUME(GRAMMAR_TOKENS.pthClose);
  });

  MANY_SEP_WITHOUT_OUTDENT = ({
    SEP,
    DEF,
  }: {
    DEF: (index: number) => void;
    SEP: () => void;
  }) => {
    DEF(0);
    this.MANY({
      GATE: () => this.LA(2).tokenType !== GRAMMAR_TOKENS.outdent,
      DEF: () => {
        SEP();
        DEF(1);
      },
    });
  };

  constructor() {
    super(GRAMMAR_TOKEN_LIST);

    this.performSelfAnalysis();
  }
}

export const grammarParser = new GrammarParser();
