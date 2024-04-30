import { type GrammarRule, type GrammarToken } from '../2-validate-ast/types';
import { type IWriter } from '../types';

export const generateAstTypes = ({
  tokens,
  rules,
  writer,
}: {
  tokens: Record<string, GrammarToken>;
  rules: Record<string, GrammarRule>;
  writer: IWriter;
}) => {
  const content: string[] = [];

  //

  writer.writeFile(`types.ts`, content.join('\n'));
};
