const {Parser} = require('../discord/handlers/parseArguments');
const {StringArgument, NumberArgument, WordArgument, UserArgument, UserNotFound, ChannelNotFound, ChannelArgument, PicklistArgument} = require('../discord/arguments')
const {assertEquals, noop} = require('./tests');
const { User } = require('discord.js');

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
        input: opts.message,
        message: {
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
    context = parser.run(getContext({message: userId + " too much spam"}))
    assertEquals(context.args, {"user":{"id":"1234","name":"1234name"},"reason":"too much spam"});
} 
assertError({message: " 123 too much spam", lastIndex: "!ban".length}, UserNotFound);

parser = new Parser({
    'channel': new ChannelArgument(),
    'action': new WordArgument() 
});

for (let channelId of ["<#channelId>", "channelId", "channelIdname"]) {
    context = parser.run(getContext({message: channelId + " delete"}))
    assertEquals(context.args, {"channel":{"id":"channelId","name":"channelIdname"},"action":"delete"});
} 

assertError({message: "invalidChannel delete"}, ChannelNotFound);

parser = new Parser({
    'prefix': new PicklistArgument(['!', "$"]),
    'command': new PicklistArgument([{options: ['ban user', "bu"], value: 'ban'}, {options: ["delete user", "du"], value: "del"}]),
    'user': new UserArgument()
})

for (let message of [{t: "!ban user 1234", v: "ban"}, {t: "$bu <@1234>", v: "ban"}, {t: "!delete USER 1234", v: "del"}, {t: "!du 1234name", v: "del"}]) {
    context = parser.run(getContext({message: message.t}))
    assertEquals(context.args.prefix, {"value": message.t[0], "match": message.t[0]});
    assertEquals(context.args.command.value, message.v);
    assertEquals(context.args.user, {"id":"1234","name":"1234name"});
}