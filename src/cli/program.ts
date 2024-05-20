import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { parseGrammarFile } from '../grammar-parser';
import { type IWriter } from '../grammar-parser/types';

export const prog = new Command();

prog
  .command('parse <file>', {
    isDefault: true,
  })
  .option('-d, --debug', 'output extra debugging')
  .action(async (filePath, options) => {
    const fileText = (await readFile(filePath as string)).toString();

    let writer: IWriter;

    writer = {
      writeFile: (path, content) => {
        console.log(`## >> ${path}`);
        console.log(content);
        console.log(`## << ${path}`);
      },
    };

    parseGrammarFile(fileText, {
      debug: options.debug,
      writer,
    });
  });
