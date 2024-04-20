// import { type TokenType, createToken } from "chevrotain";
// import { map } from "lodash";

// type ITokenDefinition = {
//   pattern: RegExp | string;
//   group?: string;
//   priority?: number;
// };

// type Token<Name extends string = string> = {
//   name: Name;
//   chevrotainToken: TokenType;
// };

// const createTokens = <T extends Record<string, ITokenDefinition>>(
//   tokens: T,
// ): Array<
//   {
//     [K in keyof T]: {
//       name: K;
//       chevrotainToken: TokenType;
//     };
//   }[keyof T]
// > => {
//   return map(tokens, (t, key) => {
//     return {
//       name: key as keyof T,
//       chevrotainToken: createToken(
//         t.group
//           ? {
//               name: key,
//               pattern: t.pattern,
//               group: t.group,
//             }
//           : {
//               name: key,
//               pattern: t.pattern,
//             },
//       ),
//     };
//   });
// };

// type ParserRuleBuilderContext<TokenList extends Token> = {
//   [K in TokenList["name"] as `t_${K}`]: Token<K>;
// } & {
//   or: () => void;
// };

// type IParserConfig<TokenList extends Token> = {
//   tokens: TokenList[];

//   rules: Record<string, (context: ParserRuleBuilderContext<TokenList>) => void>;
// };

// const createParser = <
//   TokenList extends Token<string>,
//   ParserConfig extends IParserConfig<TokenList>,
// >(
//   parserConfig: ParserConfig,
// ) => {
//   //
// };

// const tokens = createTokens({
//   multiline_comment: {
//     pattern: /\/\*([\s\S]*?)\*\//,
//     group: "SKIPPED",
//     priority: 1000,
//   },
//   comment: {
//     pattern: /\/\/.*/,
//     group: "SKIPPED",
//     priority: 900,
//   },
//   ws: {
//     pattern: /\s+/,
//     group: "SKIPPED",
//     priority: 800,
//   },
//   string: {
//     pattern: /"[^"]*"/,
//     priority: 700,
//   },
//   hexa: {
//     pattern: /0x[A-F0-9]+/,
//     priority: 600,
//   },
//   num: {
//     pattern: /\d+/,
//     priority: 500,
//   },
//   identifier: {
//     pattern: /[a-zA-Z0-9_]+/,
//     priority: -100,
//   },
// });

// createParser({
//   tokens: [...tokens],
//   rules: {
//     statements: (p, t) => p.r_statement["*"],
//     statement: (p) => {
//       p.or([]);
//     },
//     test: (p) => {
//       //
//       p.t_identifier;
//     },
//     // preprocess_statement: (p, f) => p.subRules({
//     //   define: ["#define", f.name(p.t_identifier), f.params['*']("(", f.name(p.t_identifier), ")")]
//     // }),
//   },
// });
// // rules:
// //   statements: statement[]
// //   statement:
// //     | preprocess-statement

// //   preprocess-statement:
// //     | define: "#define"
// //         name: identifier
// //         params*: "(" name:identifier ")"
// //         expr: value-expr
// //     | pragma: "#pragma" identifier
// //     | ifndef: "#ifndef" condition:value-expr pp-elseif* pp-else* :"#endif"
// //     | ifdef: "#ifdef" condition:value-expr pp-elseif* pp-else*
// //     | pp-elseif: "#elif" macro-name:identifier
// //     | pp-else: "#else" statements: statements*

// //   value-expr:

// // })
