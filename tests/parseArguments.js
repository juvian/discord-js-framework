const {Parser} = require('../discord/handlers/parseArguments');
const {StringArgument, NumberArgument, WordArgument, UserArgument, UserNotFound, ChannelNotFound, ChannelArgument} = require('../discord/arguments')
const {assertEquals, noop} = require('./tests');

Set.prototype.find = function(callback) {
    for (let num of this) {
        if (callback({id: num, name: num+"name"})) return {id: num, name: num+"name"};
    }
} 

Set.prototype.get = function(v) {
   return this.has(v) ? {id: v, name: v+"name"} : null;
}

function getContext(opts) {
    let context = {
        _lastIndex: opts.lastIndex || 0,
        message: {
            content: opts.message,
            guild: {
                users: {
                    cache: new Set(['1234'])
                },
                channels: {
                    cache: new Set(["channelId"])
                }
            }
        }
    }
    
    return context;
}


function assertError(context, error) {
    try {
        context = parser.run(getContext(context))
        throw new Error("should give user not found")
    } catch (e) {
        if (!e instanceof error) throw e;
    }    
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

for (let userId of ["<@1234>", "1234", "1234name"]) {
    context = parser.run(getContext({message: "!ban " + userId + " too much spam", lastIndex: "!ban".length}))
    assertEquals(context.args, {"user":{"id":"1234","name":"1234name"},"reason":"too much spam"});
} 
assertError({message: "!ban 123 too much spam", lastIndex: "!ban".length}, UserNotFound);

parser = new Parser({
    'channel': new ChannelArgument(),
    'action': new WordArgument() 
});

for (let channelId of ["<#channelId>", "channelId", "channelIdname"]) {
    context = parser.run(getContext({message: channelId + " delete"}))
    assertEquals(context.args, {"channel":{"id":"channelId","name":"channelIdname"},"action":"delete"});
} 

assertError({message: "invalidChannel delete"}, ChannelNotFound);
