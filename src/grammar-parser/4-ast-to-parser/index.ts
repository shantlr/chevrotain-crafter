import { type GrammarToken } from '../2-validate-ast/types';
import { type RuleDesc } from '../3-describe/types';
import { type IWriter } from '../types';
import { generateTypes } from './generate-types';
import { generateLexer } from './generate-lexer';
import { generateParser } from './generate-parser';
import { generateCstToAst } from './generate-cst-ast';
import { TypeName } from './constant';

export const astToOutputParser = ({
  ruleDescs,
  tokens,
  writer,

  ...options
}: {
  tokens: Record<string, GrammarToken>;
  ruleDescs: Record<string, RuleDesc>;
  writer: IWriter;

  generateTypes?: boolean;
  generateLexer?: boolean;
  generateParser?: boolean;
  generateCstToAst?: boolean;
}) => {
  const rootRule = ruleDescs.start;

  if (!rootRule) {
    throw new Error(`Root rule "start" not found`);
  }

  const rootCstTypeName = rootRule.body.parseOutputTypeName;

  if (options?.generateTypes !== false) {
    generateTypes({
      tokens,
      ruleDescs,
      writer,
      rootRule,
    });
  }

  if (options?.generateLexer !== false) {
    generateLexer({
      tokens,
      writer,
    });
  }

  if (options?.generateParser !== false) {
    generateParser({
      tokens,
      ruleDescs,
      writer,

      rootCstTypeName,
    });
  }

  if (options?.generateCstToAst !== false) {
    generateCstToAst({
      tokens,
      rootRule,
      ruleDescs,
      writer,
    });
  }

  writer.writeFile(
    'index.ts',
    [
      `import { tokenizeText } from './lexer';`,
      `import { parseTextToCst } from './parser';`,
      `import { cstToAst } from './cst-to-ast';`,
      `import { ${TypeName.IParseOptions}, ${TypeName.ParseText} } from './types';`,
      '',
      `export const parse: ${TypeName.ParseText} = <ParseOptions extends ${TypeName.IParseOptions}>(text: string, options?: ParseOptions) => {`,
      '  const tokens = tokenizeText(text);',
      '  const cst = parseTextToCst(tokens);',
      '  const ast = cstToAst(cst, options);',
      '  return ast;',
      '};',
    ].join('\n')
  );
};
