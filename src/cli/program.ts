import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { parseGrammarFile } from '../grammar-parser';
import { type IWriter } from '../grammar-parser/types';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { tokenizeGrammar } from '../grammar-parser/1-to-ast/tokens';
import { orderBy } from 'lodash-es';
import chalk from 'chalk';
import { createOffsetToPosition } from '../lib/utils/offset-to-position';

export const prog = new Command();

prog
  .command('gen <grammar-file> [codegen-destination-folder]')
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
          console.log(`Written ${path.relative(process.cwd(), target)}.`);
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
    console.log('Parser generated!');
  });

prog
  .command('debug-lexer <grammar-file>')
  .description('Debug the lexing of the grammar file.')
  .action(async (filePath: string) => {
    const fileText = (await readFile(filePath)).toString();
    const offsetToPosition = createOffsetToPosition(fileText);
    const tokens = tokenizeGrammar(fileText);

    const items = orderBy(
      [
        ...tokens.tokens.map((t) => ({
          type: 'parsed' as const,
          offset: t.startOffset,
          value: t,
        })),
        ...tokens.errors.map((e) => ({
          type: 'error' as const,
          offset: e.offset,
          value: e,
        })),
      ],
      [(t) => t.offset],
      ['asc']
    );

    const formatImage = (image: string) => {
      return chalk.green(
        image
          .replace(/\n/g, chalk.magenta('\\n'))
          .replace(/\r/g, chalk.magenta('\\r'))
          .replace(/\t/g, chalk.magenta('\\t'))
      );
    };

    items.forEach((item) => {
      if (item.type === 'parsed') {
        const { line, column } = offsetToPosition(item.value.startOffset);
        console.log(
          `Parsed token ${line}:${column} ${chalk.blue(item.value.tokenType.name)}: "${formatImage(item.value.image)}"`
        );
      } else {
        const { line, column } = offsetToPosition(item.value.offset);
        console.log(
          `${chalk.red(`Error: ${line}:${column}`)} ${item.value.message}`
        );
      }
    });

    if (!tokens.errors.length) {
      console.log(chalk.greenBright('Lexer passed successfully!'));
    } else {
      console.log(chalk.redBright('Lexer failed!'));
    }
  });
