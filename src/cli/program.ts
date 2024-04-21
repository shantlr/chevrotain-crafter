import { Command } from "commander";
import { readFile } from "fs/promises";
import { parseGrammarFile } from "../grammar-parser";

export const prog = new Command();

prog
  .command("parse <file>", {
    isDefault: true,
  })
  .option("-d, --debug", "output extra debugging")
  .action(async (filePath, options) => {
    const fileText = (await readFile(filePath as string)).toString();
    parseGrammarFile(fileText, {
      debug: options.debug,
    });
  });
