/**
 * Rules :
 * * We are not allowed to change/mutate datas : we can only create an output given an input
 * * We can't do stuff in a procedural way (no while/for loops)
 * * Curryfication is bae
 * * No exception handling, just functions, if and else, constructors : a linear behavior
 * The base concept is to construct a complex parser by combining elementary parts
 */

const parseNum = s => {
    if ('0123456789'.includes(s[0]))
        return {result : s[0], type : 'NUM', remainder : s.slice(1)};
    return null;
}

const parseLetter = s => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const symbols = '_?';
    const it = letters + letters.toLowerCase() + symbols;
    if (it.includes(s[0]))
        return {result : s[0], type : 'LETTER', remainder : s.slice(1)};
    return null;
}

const parseLiteral = lit => {
    return s => {
        if (s.startsWith(lit))
            return {result : lit, type : 'LITERAL', remainder : s.slice(lit.length)};
        return null;
    }
}

const parseOp = s => {
    if ('+-/*'.includes(s[0]))
        return {result : s[0], type : 'OP', remainder : s.slice(1)};
    return null;
}

const parseSpace = s => {
    if (' '.includes(s[0]))
        return {result : s[0], type : 'SPACE', remainder : s.slice(1)};
    return null;
}

// a string is something that begins with a " and ends with a "
const parseString = s => {
    if (s[0] !== '"') return null;
    const consumeNext = ((s, accum, started) => {
        const res = s[0];
        if (res === '"' || res == undefined)
            return started ? null : {result : accum, type : 'STRING', remainder : s.slice(1)};
        return consumeNext (s.slice(1), accum + res[0], false);
    });
    return consumeNext (s.slice(1), '', true);
}


// combinators
// generates an 'universal' parser that accepts any token from any of the input parsers
const either = (parser1, parser2) => s => (parser1(s) || parser2(s));
const anyOf = (... parsers) => parsers.reduce(either);

// generates a parser that accepts a token of length n for a given elementary parser
// example : parseNum accepts '4', '2', '7', ...etc but we want to match '427' as a whole
const many = (parser, label) => s => {
    const consumeNext = ((s, accum, started) => {
        const res = parser(s);
        if (res == null)
            return started ? null : {result : accum, type : label || 'MANY', remainder : s};
        return consumeNext (s.slice(1), accum + res.result, false);
    });
    // we can't initalize variables because we do not want to mutate them
    // so let's go with that, brillant right ?
    return consumeNext (s, '', true);
};


// the only non pure part in this project are console.logs
// at some point we need a way to output stuff on the screen (the outside world)
function parseUsing (parser, s) {
    const consume = s => {
        const res = parser (s);
        if (res == null) return;
        // impure part //
        console.log(res);
        // impure part //
        consume (res.remainder, s.input);
    };
    consume (s);
}

const badassParser = anyOf(parseOp, parseNum, parseSpace);
parseUsing (badassParser, '123+65* 10778 +687 woo 15');

console.log('--------');

// note : in our case many(p : Parser) only accepts a parser that proceeds a single token at a time
const trulyBadassParser = anyOf (
    many(parseNum, 'INTEGER'),
    many(parseNum, 'INTEGER'),
    many(parseSpace, 'SPACES'),
    many(parseLetter, 'WORDS'),
    parseString,
    parseOp
);
parseUsing (trulyBadassParser, '8018 *28/6 "a string" + "another" and_a_word');