# Drivel

WIP

Typescript Parser generator based on [chevrotain](https://github.com/Chevrotain/chevrotain)

## Installation

```bash
npm install -g drivel
```

## Usage

```bash
drivel gen ./grammar ./src/parser
```

## Grammar synthax

Grammar can be defined using a yaml like synthax

### Rules

The rules sections define the differents rules to follow during parsing. Currently as drivel is using generating a parser using chevrotain, the rules are expected to be left recursive.

You can directly inline string literal token
A `start` rule is required as a parsing starting point

```yaml
rules:
  start: "hello" "world"
```

#### Modifier suffix

The following suffix can be added after a token:

- `?`: Pattern can either be matched 0 or 1 time
- `*`: Pattern can be matched 0 or more times
- `+`: Pattern can be matched 1 or more times

```yaml
rules:
  start: "hello"? "world"*
```

#### Parenthesis

You can define a sub sequence by wrapping mulitple instructions inside parenthesis

```yaml
rules:
  start: ("hello" "world")+
```

### Tokens

You can define tokens that follow custom pattern using either regex a string literals

```yaml
tokens:
  singleQuoteString:
    pattern: /'(?:[^'\\]|\\.)*'/
  doubleQuoteString:
    pattern: /"(?:[^"\\]|\\.)*"/
  trueLiteral:
    pattern: true
  falseLiteral:
    pattern: false
  integer:
    pattern: /[\d]+/
```

Tokens are then usable inside rules

```yaml
rules:
  start: value
  value: singleQuoteString | doubleQuoteString | trueLiteral | falseLiteral | integer
```

### Output

#### Default rule output

#### Named element

```yaml
rules:
  start: value:"hello" "world"
```

## Grammar examples

[calculator](/examples/calculator/calculator.grammar)
