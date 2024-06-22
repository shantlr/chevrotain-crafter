import {
  type CustomPatternMatcherFunc,
  Lexer,
  type TokenPattern,
  createToken,
  createTokenInstance,
  type TokenType,
} from 'chevrotain';
import { last, map, mapValues, orderBy } from 'lodash-es';
import { trimTextLines } from './utils/trim-text';

const createTokens = <TokenMap>(tokens: {
  [key in keyof TokenMap]: {
    pattern: TokenPattern;
    group?: string;

    /**
     * Higher value mean higher priority
     */
    priority?: number;
    line_breaks?: boolean;
  };
}) => {
  const tokenMap: {
    [key in keyof TokenMap]: TokenType;
  } = mapValues(tokens, (v, k) =>
    createToken(
      v.group
        ? {
            name: k,
            pattern: v.pattern,
            group: v.group,
            line_breaks: v.line_breaks,
          }
        : {
            name: k,
            pattern: v.pattern,
            line_breaks: v.line_breaks,
          }
    )
  );

  return {
    tokenMap,
    tokenList: orderBy<TokenType>(
      map(tokenMap),
      [
        (t) => tokens[t.name as keyof TokenMap]?.priority ?? 0,
        (t) => {
          return t.PATTERN?.toString().length;
        },
      ],
      ['desc', 'desc']
    ),
  };
};

let indentStack = [0];
const resetIndentStack = () => {
  indentStack = [0];
};

/**
 * This custom Token matcher uses Lexer context ("matchedTokens" and "groups" arguments)
 * combined with state via closure ("indentStack" and "lastTextMatched") to match indentation.
 */
const matchIndentBase =
  (type: string): CustomPatternMatcherFunc =>
  (text, offset, matchedTokens, groups) => {
    const isStartOfLine = !offset || text[offset - 1] === '\n';
    if (!isStartOfLine) {
      return null;
    }

    const wsRegExp = / +/y;
    wsRegExp.lastIndex = offset;
    const wsMatch = wsRegExp.exec(text);

    const currentLevel = wsMatch?.[0].length ?? 0;

    const prevLevel = last(indentStack)!;

    if (prevLevel === currentLevel) {
      return null;
    }

    // indent
    if (currentLevel > prevLevel) {
      if (type === 'indent') {
        indentStack.push(currentLevel);
        return wsMatch;
      }
      return null;
    }

    // outdent
    if (type === 'outdent') {
      const stackLastMatchedLevel = indentStack.lastIndexOf(currentLevel);
      const numberOfDedents =
        stackLastMatchedLevel >= 0
          ? indentStack.length - stackLastMatchedLevel - 1
          : indentStack.length;

      // This is a little tricky
      // 1. If there is no match (0 level indent) than this custom token
      //    matcher would return "null" and so we need to add all the required outdents ourselves.
      // 2. If there was match (> 0 level indent) than we need to add minus one number of outsents
      //    because the lexer would create one due to returning a none null result.
      const iStart = wsMatch !== null ? 1 : 0;
      for (let i = iStart; i < numberOfDedents; i++) {
        indentStack.pop();
        matchedTokens.push(
          createTokenInstance(
            GRAMMAR_TOKENS.outdent,
            '',
            NaN,
            NaN,
            NaN,
            NaN,
            NaN,
            NaN
          )
        );
      }
      if (iStart === 1) {
        // also pop indent that match outdent that will be added by the lexer
        indentStack.pop();
      }
      return wsMatch;
    }

    return null;
  };

export const { tokenList: GRAMMAR_TOKEN_LIST, tokenMap: GRAMMAR_TOKENS } =
  createTokens({
    nl: {
      pattern: /\n|\r\n?/,
      // group: "nl",
      priority: 1000,
    },
    // indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
    // Outdent must appear before Indent for handling zero spaces outdents.
    outdent: {
      pattern: matchIndentBase('outdent'),
      line_breaks: false,
      priority: 951,
    },
    indent: {
      pattern: matchIndentBase('indent'),
      line_breaks: false,
      priority: 950,
    },
    ws: {
      pattern: /[ \t]+/,
      priority: 900,
      group: Lexer.SKIPPED,
    },

    singleQuoteString: {
      pattern: /'(?:[^'\\]|\\.)*'/,
      priority: 300,
    },
    doubleQuoteString: {
      pattern: /"(?:[^"\\]|\\.)*"/,
      priority: 300,
    },
    regex: {
      pattern: /\/(?:[^/\\]|\\.)*\//,
      priority: 300,
    },

    true: {
      pattern: 'true',
      priority: 250,
    },
    false: {
      pattern: 'false',
      priority: 250,
    },

    pthOpen: {
      pattern: '(',
      priority: 200,
    },
    pthClose: {
      pattern: ')',
      priority: 200,
    },
    colon: {
      pattern: ':',
      priority: 200,
    },
    asterisk: {
      pattern: '*',
      priority: 200,
    },
    questionMark: {
      pattern: '?',
      priority: 200,
    },
    pipe: {
      pattern: '|',
      priority: 200,
    },
    plus: {
      pattern: '+',
      priority: 200,
    },

    identifier: {
      pattern: /[a-zA-Z_][a-zA-Z0-9-_]*/,
      priority: 1,
    },
    number: {
      pattern: /-?\d+/,
      priority: 0,
    },
  });

const grammarLexer = new Lexer(GRAMMAR_TOKEN_LIST, {
  positionTracking: 'onlyOffset',
});

export const tokenizeGrammar = (text: string) => {
  resetIndentStack();
  /**
   * We are trimming trailing spaces and newlines + consecutive empty lines
   */
  const preprocessedText = trimTextLines(text);
  const tokens = grammarLexer.tokenize(preprocessedText.text);

  return tokens;
};
