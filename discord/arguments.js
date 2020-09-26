let counter = 0;

let index = (idx) => (v) => v[idx];

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

	get postProcess() {
		return this.constructor.postProcess || ((v) => v);
	}

	get preProcess() {
		return this.constructor.preProcess || ((v) => v);
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
	isValid(val, message) {
		return message.guild.channels.cache.has(val) || message.guild.channels.cache.find(c => c.name == val || (val.startsWith("<#") && val.endsWith(">") && c.name == val.substring(2, val.length - 1))) !== null;
	}
	static expected = 'a channel';
}

class UserArgument extends WordArgument {
	static regex = /\s*<@?(\d+)>?|([^\s]+)/
	static processors = [index(1)]
	static expected = 'a user';

	process(userId, context) {
		userId = super.process(userId);
		let user = context.message.guild.users.cache.get(userId) || context.message.guild.users.cache.find(u => u.name == userId);
		if (!user) throw Error(`User ${userId} not found`);
	}

}

module.exports = {ValidArgument, WordArgument, NumberArgument, ChannelArgument, UserArgument, StringArgument};