import {
  anyOf,
  many,
  parseDigit,
  parseLiteral,
  parseOp,
  parseSpace,
} from "./parser-combinator.mjs";

function evaluate(parser, s) {
  const consume = (s) => {
    const res = parser(s);
    if (res == null) return;
    console.log(res);
    consume(res.remainder, s.input);
  };
  consume(s);
}

const badassParser = anyOf(
  parseOp,
  parseLiteral("woo"),
  many(parseDigit, "NUM"),
  parseSpace,
);
evaluate(badassParser, "123+65* 10778 +687 woo 15");
