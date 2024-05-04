import { map } from 'lodash-es';
import { type GrammarToken } from '../2-validate-ast/types';
import { type IWriter } from '../types';
import { indent } from '../utils/indent';
import { type ChevrotainNode, type RuleDesc } from '../3-describe/types';

type SignatureCount = Record<string, number>;

const formatCall = (methodName: string, count = 0) =>
  count === 0 ? methodName : `${methodName}${count}`;

const serializeChevrotainCalls = (
  call: ChevrotainNode,
  i: number,
  signatureCount: SignatureCount = {}
): string => {
  switch (call.type) {
    case 'consume': {
      const signature = `CONSUME:${call.tokenName}`;
      const method = formatCall('CONSUME', signatureCount[signature] ?? 0);
      signatureCount[signature] = (signatureCount[signature] || 0) + 1;

      const option = call.label ? `, { LABEL: '${call.label}' }` : '';

      return `${indent(i)}this.${method}(TOKENS[${JSON.stringify(call.tokenName)}]${option});`;
    }
    case 'seq':
      return call.value
        .map((v) => serializeChevrotainCalls(v, i, signatureCount))
        .join('\n');
    case 'or': {
      const signature = `OR`;
      const method = formatCall('OR', signatureCount[signature] ?? 0);
      signatureCount[signature] = (signatureCount[signature] || 0) + 1;

      return [
        `${indent(i)}this.${method}([`,
        ...call.value.map((v) =>
          serializeChevrotainCalls(v, i + 1, signatureCount)
        ),
        `${indent(i)}]);`,
      ].join('\n');
    }
    case 'optional': {
      const signature = `OPTION`;
      const method = formatCall('OPTION', signatureCount[signature] ?? 0);
      signatureCount[signature] = (signatureCount[signature] || 0) + 1;
      return [
        `${indent(i)}this.${method}(() => {`,
        serializeChevrotainCalls(call.value, i + 1, signatureCount),
        `${indent(i)}});`,
      ].join('\n');
    }
    case 'many': {
      const signature = `MANY`;
      const method = formatCall('MANY', signatureCount[signature] ?? 0);
      signatureCount[signature] = (signatureCount[signature] || 0) + 1;

      return [
        `${indent(i)}this.${method}(() => {`,
        serializeChevrotainCalls(call.value, i + 1, signatureCount),
        `${indent(i)}});`,
      ].join('\n');
    }
    case 'many1': {
      const signature = `AT_LEAST_ONE`;
      const method = formatCall('AT_LEAST_ONE', signatureCount[signature] ?? 0);
      signatureCount[signature] = (signatureCount[signature] || 0) + 1;
      return [
        `${indent(i)}this.${method}(() => {`,
        serializeChevrotainCalls(call.value, i + 1, signatureCount),
        `${indent(i)}});`,
      ].join('\n');
    }
    case 'subrule': {
      const signature = `SUBRULE:${call.ruleMethodName}`;
      const method = formatCall('SUBRULE', signatureCount[signature] ?? 0);
      signatureCount[signature] = (signatureCount[signature] || 0) + 1;

      const option = call.label ? `, { LABEL: '${call.label}' }` : '';

      return `${indent(i)}this.${method}(this.${call.ruleMethodName}${option});`;
    }
    default:
  }
  return '';
};

export const generateParser = ({
  ruleDescs,
  tokens,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  ruleDescs: Record<string, RuleDesc>;
  writer: IWriter;
}) => {
  const content: string[] = [
    `import { CstParser, IToken } from 'chevrotain';`,
    `import { TOKENS } from './lexer';`,
    '',
    `class Parser extends CstParser {`,
    ...map(ruleDescs, ({ rule, body }) => {
      const name = rule.methodName;
      return [
        ` ${name} = this.RULE('${name}', () => {`,
        serializeChevrotainCalls(body.chevrotain, 2),
        ` });`,
      ].join('\n');
    }),
    '',
    `  constructor() {`,
    `    super(GRAMMAR_TOKEN_LIST);`,
    `    this.performSelfAnalysis();`,
    `  }`,
    `}`,
    '',
    `export const parseTextToCst = (tokens: IToken) => {`,
    `  const parser = new Parser();`,
    `  parser.input = tokens;`,
    `  const cst = parser.r_start();`,
    '',
    `  if (parser.errors.length) {`,
    `  }`,
    '',
    `  return cst;`,
    `}`,
  ];

  writer.writeFile('parser.ts', content.join('\n'));
};
