import { Command } from "commander";
import { readFile } from "fs/promises";
import { parseGrammarFile } from "../grammar-parser";

export const prog = new Command();

prog
  .command("parse <file>", {
    isDefault: true,
  })
  .action(async (filePath) => {
    const fileText = (await readFile(filePath as string)).toString();
    parseGrammarFile(fileText);
  });
