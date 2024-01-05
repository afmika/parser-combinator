import {
  either,
  many,
  parseCharValue,
  parseDigit,
  then,
} from "./parser-combinator.mjs";

const plusMin = either(parseCharValue("+"), parseCharValue("-"));
const multDiv = either(parseCharValue("*"), parseCharValue("/"));
const int = many(parseDigit);
const parenth = then(parseCharValue("("), expr, parseCharValue(")"));

function factor(s) {
  return either(parenth, int)(s);
}

function expr(s) {
  return either(
    then(term, plusMin, expr),
    term,
  )(s);
}

function term(s) {
  return either(
    then(factor, multDiv, term),
    factor,
  )(s);
}

// OK
// { result: '1+2*(4-1*(9+8))+8', type: 'THEN', remainder: '' }
console.log(expr("1+2*(4-1*(9+8))+8"));

// FAIL
// { result: '1+2*(4-1*(9+8)))+8', type: 'THEN', remainder: ')+8' }
console.log(expr("1+2*(4-1*(9+8)))+8"));
