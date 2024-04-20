import {
  type IRecognitionException,
  type CstNode,
  type ILexingError,
  type IToken,
} from "chevrotain";
import chalk from "chalk";
import { grammarParser } from "./parser";
import { grammarCstToAst } from "./cst-to-ast";
import { tokenizeGrammar } from "./tokens";

const logLexError = (text: string, err: ILexingError) => {
  console.log(err);
  console.log(`Fail to parse token at Ln ${err.line}, Col ${err.column}:`);

  const beforeSameLine = text.slice(
    text.lastIndexOf("\n", err.offset - 1) + 1,
    err.offset,
  );
  const afterSameLine = text.slice(err.offset, text.indexOf("\n", err.offset));
  console.log(
    `${beforeSameLine}${chalk.underline(text.slice(err.offset, err.offset))}${afterSameLine.slice(0, 10)}`,
  );
  console.log("~".repeat(beforeSameLine.length) + chalk.red("^"));
};

const logTokenError = (text: string, token: IToken) => {
  const line = text.slice(0, token.startOffset).split("\n").length;
  const col = token.startOffset - text.lastIndexOf("\n", token.startOffset - 1);

  const beforeSameLine = text.slice(
    text.lastIndexOf("\n", token.startOffset - 1) + 1,
    token.startOffset,
  );
  const afterSameLine = text.slice(
    token.endOffset,
    text.indexOf("\n", token.endOffset),
  );
  console.log(
    `Ln ${line}, Col ${col}: Token '${chalk.blue(token.tokenType.name)}' is not recognized.`,
  );
  console.log(
    `${beforeSameLine}${chalk.underline(text.slice(token.startOffset, token.endOffset))}${afterSameLine.slice(0, 80)}`,
  );
  console.log("~".repeat(beforeSameLine.length) + chalk.red("^"));
};

const logParseError = (text: string, err: IRecognitionException) => {
  console.log(":stack:", err.context.ruleStack.join(" > ") || "<root>");
  console.log(chalk.red(err.name), ":", err.message);
  logTokenError(text, err.token);
};

export const parseGrammarFileToAst = (
  fileText: string,
  {
    applyParser = (p) => p.r_root(),
  }: {
    /**
     * This is mainly for testing purposes
     */
    applyParser?: (p: typeof grammarParser) => CstNode;
  } = {},
) => {
  const tokens = tokenizeGrammar(fileText);

  console.log(tokens);

  if (tokens.errors.length) {
    tokens.errors.forEach((err) => {
      logLexError(fileText, err);
    });
    throw new Error("Fail to parse tokens");
  }

  grammarParser.input = tokens.tokens;
  const cst = applyParser(grammarParser);

  console.log(JSON.stringify(cst, null, 2));

  if (grammarParser.errors.length) {
    grammarParser.errors.forEach((err) => {
      logParseError(fileText, err);
    });
    throw new Error("Fail to parse grammar");
  }

  const ast = grammarCstToAst(cst);
  console.log(">>", JSON.stringify(ast, null, 2));
  return ast;
};
