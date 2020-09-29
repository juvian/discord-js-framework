let counter = 0;

let index = (idx) => (v) => v[idx];

class UserNotFound extends Error {}
class ChannelNotFound extends Error {}

class Argument {
	static processors = [];

	constructor() {
		this.order = counter++;
	}

	validate(val, message) {
		return;
	}

	process(val) {
		for (let processor of this.constructor.processors) {
			val = processor(val);
		}
		return val;
	}

	parse(context) {
		return context.input;
	}

	errorMessage(context, name) {
		return `Invalid ${name} argument, expected ${this.expected} but got ${context.input}`;
	}

	get regex() {
		return this.constructor.regex;
	}

	get expected() {
		return this.constructor.expected;
	}
}

class RegexArgument extends Argument {
	static processors = [index(0)]
	parse(context, name) {
		let m = context.input.match(this.regex);
		if (!m) throw new Error(this.errorMessage(context, name));
		context.input = context.input.substring(m[0].length);
		return m;
	}
}


class StringArgument extends RegexArgument {
	static regex = /^.+/
	static expected = 'a string'
}

class WordArgument extends RegexArgument {
	static regex = /^[^\s]+/
	static expected = 'a word';
}

class NumberArgument extends RegexArgument {
	static regex = /^\d+/
	static expected = 'a number';
	static processors = [index(0), Number];
}

class ChannelArgument extends WordArgument {
	static expected = 'a channel';

	process(channelId, context) {
		channelId = super.process(channelId);
		if (channelId.startsWith("<#") && channelId.endsWith(">")) channelId = channelId.substring(2, channelId.length - 1);
		let channel = context.message.guild.channels.cache.get(channelId) || context.message.guild.channels.cache.find(u => u.name == channelId);
		if (!channel) throw new ChannelNotFound(`Channel ${channelId} not found`);
		return channel;
	}
}

class UserArgument extends WordArgument {
	static expected = 'a user';

	process(userId, context) {
		userId = super.process(userId);
		if (userId.startsWith("<@") && userId.endsWith(">")) userId = userId.substring(2, userId.length - 1);
		let user = context.message.guild.users.cache.get(userId) || context.message.guild.users.cache.find(u => u.name == userId);
		if (!user) throw new UserNotFound(`User ${userId} not found`);
		return user;
	}
}

class PicklistArgument extends Argument {
	constructor(values) {
		super();
		this.values = values.map(v => {
			v = typeof v === "object" ? v : {options: v, value: v};
			v.options = Array.isArray(v.options) ? v.options : [v.options];
			return v;
		});
	}

	parse(context, name) {
		let match; 
		for (let value of this.values) {
			match = value.options.find(o => context.input.toLowerCase().startsWith(o));
			if (match) {
				context.input = context.input.substring(match.length);
				return {value: value.value, match}
			}
		}
		throw new Error(this.errorMessage(context, name));
	}

	get expected() {
		return 'a value from [' + this.values.join(v => v.options.join(', ')) + ']';
	}
}

module.exports = {Argument, WordArgument, NumberArgument, ChannelArgument, UserArgument, StringArgument, UserNotFound, ChannelNotFound, PicklistArgument};