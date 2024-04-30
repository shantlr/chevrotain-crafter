import { map } from 'lodash-es';
import { type GrammarRule, type GrammarToken } from '../2-validate-ast/types';
import { type IWriter } from '../types';
import { mapBodyToChevrotainCalls } from './map-rule-body-to-chev-calls';
import { type ChevrotainNode } from './types';

const indent = (n: number) => '  '.repeat(n);

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
      return `${indent(i)}this.${method}(TOKENS[${JSON.stringify(call.tokenName)}]);`;
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
      const signature = `SUBRULE:${call.ruleName}`;
      const method = formatCall('SUBRULE', signatureCount[signature] ?? 0);
      signatureCount[signature] = (signatureCount[signature] || 0) + 1;

      return `${indent(i)}this.${method}(this.${call.ruleName});`;
    }
    default:
  }
  return '';
};

export const generateParser = ({
  rules,
  tokens,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  rules: Record<string, GrammarRule>;
  writer: IWriter;
}) => {
  const content: string[] = [
    `import { CstParser, IToken } from 'chevrotain';`,
    `import { TOKENS } from './lexer';`,
    '',
    `class Parser extends CstParser {`,
    ...map(rules, (rule) => {
      const body = mapBodyToChevrotainCalls({
        body: rule.astBody,
        rules,
        tokens,
      });
      const ruleName = rule.methodName;
      return [
        `  ${ruleName} = this.RULE('${ruleName}', () => {`,
        serializeChevrotainCalls(body, 2),
        `  });`,
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
