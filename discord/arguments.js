let counter = 0;

let index = (idx) => (v) => v[idx];

class UserNotFound extends Error {}
class ChannelNotFound extends Error {}

class ValidArgument {
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

	parse(message, name) {
		return message;
	}

	errorMessage(str, name) {
		return `Invalid ${name} argument, expected ${this.constructor.expected} but got ${str}`;
	}

	get regex() {
		return this.constructor.regex;
	}
}

class RegexArgument extends ValidArgument {
	static processors = [index(0)]
	parse(message, name) {
		let m = message.match(this.regex);
		this.match = m;
		if (!m) throw new Error(this.errorMessage(message, name));
		return m;
	}
}


class StringArgument extends RegexArgument {
	static regex = /.+/y
	static expected = 'a string'
}

class WordArgument extends RegexArgument {
	static regex = /[^\s]+/y
	static expected = 'a word';
}

class NumberArgument extends RegexArgument {
	static regex = /\d+/y
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

module.exports = {ValidArgument, WordArgument, NumberArgument, ChannelArgument, UserArgument, StringArgument, UserNotFound, ChannelNotFound};