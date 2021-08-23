/**
 * Rules :
 * * We are not allowed to change/mutate datas : we can only create an output given an input
 * * We can't do stuff in a procedural way (while/for loops)
 * * Currification is bae
 * 
 * The base concept is to construct a complex parser by combining elementary parts
 */

const parseNum = s => {
    if ('0123456789'.includes(s[0]))
        return {result : s[0], type : 'NUM', remainder : s.slice(1)};
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

// combinators
// generates an 'universal' parser that accepts any token from any of the input parsers
const either = (parser1, parser2) => s => (parser1(s) || parser2(s));
const anyOf = (... parsers) => parsers.reduce(either);

// generates a parser that accepts a token of length n
// example : parseNum accepts '4', '2', '7', ...etc but we want to match '427' as a whole
const many = (parser, label) => s => {
    const consumeNext = ((s, accum, started) => {
        let res = parser(s);
        if (res == null)
            return started ? null : {result : accum, type : label || 'MANY', remainder : s};
        return consumeNext (s.slice(1), accum + res.result, false);
    });
    // we can't initalize variables because this means we need to mutate them somehow
    // so let's go with that, brillant right ?
    return consumeNext (s, '', true);
};


// the only non pure part in this project are console.logs
// at some point we need to output stuff on the screen
function parseUsing (parser, s) {
    const consume = s => {
        const res = parser (s);
        if (res == null) return;
        // inpure part //
        console.log(res);
        // inpure part //
        consume (res.remainder, s.input);
    };
    consume (s);
}

const badassParser = anyOf(parseOp, parseNum, parseSpace);
parseUsing (badassParser, '123+65* 10778 +687 woo 15');

console.log('--------');

// note : in our case many only accepts a parser that proceeds a single token at time
const trulyBadassParser = anyOf (
    many(parseNum, 'INTEGER'),
    many(parseSpace, 'SPACES'),
    parseOp
);
parseUsing (trulyBadassParser, '123+65  * 10778 +687');