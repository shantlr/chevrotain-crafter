import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { parseGrammarFile } from '../grammar-parser';
import { type IWriter } from '../grammar-parser/types';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

export const prog = new Command();

prog
  .command('parse <file> [destination-folder]', {
    isDefault: true,
  })
  .option('-d, --debug', 'output extra debugging')
  .action(async (filePath: string, dest: string | undefined, options) => {
    const fileText = (await readFile(filePath)).toString();

    let writer: IWriter;

    if (dest) {
      writer = {
        writeFile: (p, content) => {
          const target = path.resolve(dest, p);
          mkdirSync(path.parse(target).dir, { recursive: true });
          writeFileSync(target, content);
        },
      };
    } else {
      writer = {
        writeFile: (path, content) => {
          console.log(`## >> ${path}`);
          console.log(content);
          console.log(`## << ${path}`);
        },
      };
    }

    parseGrammarFile(fileText, {
      debug: options.debug,
      writer,
    });
  });
