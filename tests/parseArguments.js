const {Parser} = require('../discord/handlers/parseArguments');
const {StringArgument, NumberArgument, WordArgument, UserArgument} = require('../discord/arguments')
const {assertEquals, noop} = require('./tests');

class S extends Set {
    find(callback) {
        for (let num of this) {
            if (callback(num)) return num;
        }
    }

    get(v) {
        return this[v];
    }
}

function getContext(opts) {
    let context = {
        message: {
            content: opts.message,
            lastIndex: opts.lastIndex || 0,
            guild: {
                users: {
                    cache: new S(['1234'])
                }
            }
        },
    }
    
    return context;
}

let parser = new Parser({
    'name': new WordArgument(),
    'age': new NumberArgument()
});

let context = parser.run(getContext({message: "age 34"}));
assertEquals(context.args, {name: "age", age: 34});

parser = new Parser({
    'user': new UserArgument(),
    'reason': new StringArgument() 
});

context = parser.run(getContext({message: "!ban <@1234> too much spam", lastIndex: "!ban".length}))
assertEquals(context.args, {user: '1234', reason: 'too much spam'});
context = parser.run(getContext({message: "!ban 1234 too much spam", lastIndex: "!ban".length}))
assertEquals(context.args, {user: '1234', reason: 'too much spam'});
