/*
 * Rules :
 * * No side effects
 * * No procedural code
 * * No exception handling, just functions, if and else, constructor: a linear behavior
 */

export const parseDigit = (s) => {
  if ("0123456789".includes(s[0])) {
    return { result: s[0], type: "DIGIT", remainder: s.slice(1) };
  }
  return null;
};

export const parseChar = (s) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (letters.includes(s[0].toUpperCase())) {
    return { result: s[0], type: "CHAR", remainder: s.slice(1) };
  }
  return null;
};

export const parseCharValue = (value) => (s) => {
  if (value == s[0]) {
    return { result: s[0], type: "CHAR::" + value, remainder: s.slice(1) };
  }
  return null;
};

export const parseLiteral = (lit) => {
  return (s) => {
    if (s.startsWith(lit)) {
      return { result: lit, type: "LITERAL", remainder: s.slice(lit.length) };
    }
    return null;
  };
};

export const parseOp = (s) => {
  if ("+-/*".includes(s[0])) {
    return { result: s[0], type: "OP", remainder: s.slice(1) };
  }
  return null;
};

export const parseSpace = (s) => {
  if (" ".includes(s[0])) {
    return { result: s[0], type: "SPACE", remainder: s.slice(1) };
  }
  return null;
};

// a string is something that begins with a " and ends with a "
export const parseString = (s) => {
  if (s[0] !== '"') return null;
  const consumeNext = (s, accum, started) => {
    const res = s[0];
    if (res === '"' || res == undefined) {
      return started
        ? null
        : { result: accum, type: "STRING", remainder: s.slice(1) };
    }
    return consumeNext(s.slice(1), accum + res[0], false);
  };
  return consumeNext(s.slice(1), "", true);
};

/*
 * COMBINATORS
 */

export const either = (parser1, parser2) => (s) => (parser1(s) || parser2(s));
export const anyOf = (...parsers) => parsers.reduce(either);

/**
 * Generates a parser that accepts a token of length n for a given elementary parser
 * Example : parseDigit accepts '4', '2', '7', ...etc but we want to match '427' as a whole
 */
export const many = (parser, label) => (s) => {
  const consumeNext = (s, accum, started) => {
    const res = parser(s);
    if (res == null) {
      return started
        ? null
        : { result: accum, type: label || "MANY", remainder: s };
    }
    return consumeNext(s.slice(1), accum + res.result, false);
  };
  // We are not allowed to initalize variables, we do not want to mutate them!
  return consumeNext(s, "", true);
};

/** Emulate bind operator */
export const then = (...parsers) => (s) => {
  const chain = parsers.reduce((acc, parser) => {
    if (acc == null) return null;
    const seqn = parser(acc.remainder);
    return seqn == null
      ? null
      : { result: acc.result + seqn.result, remainder: seqn.remainder };
  }, { result: "", remainder: s });

  return chain == null
    ? null
    : { result: chain.result, type: "THEN", remainder: chain.remainder };
};
