let counter = 0;

class ValidArgument {
	constructor() {
		this.order = counter++;
	}

	isValid(val, message) {
		return true;
	}

	parse(message) {
		return message;
	}

	errorMessage(str) {
		return `Invalid argument, expected ${this.constructor.expected} but got ${str}`;
	}

	regex() {
		return this.constructor.regex;
	}
}

class RegexArgument extends ValidArgument {
	parse(message) {
		return this.constructor.regex.match(message);
	}
}

class WordArgument extends RegexArgument {
	static regex = /\w+/y
	static expected = 'a word';
}

class StringArgument extends RegexArgument {
	static regex = /.+/y
	static expected = 'a string'
}

class NumberArgument extends RegexArgument {
	static regex = /\d+/y
	static expected = 'a number';
}

class ChannelArgument extends WordArgument {
	isValid(val, message) {
		return message.guild.channels.cache.has(val) || message.guild.channels.cache.find(c => c.name == val || (val.startsWith("<#") && val.endsWith(">") && c.name == val.substring(2, val.length - 1))) !== null;
	}
	static expected = 'a channel';
}

class UserArgument extends WordArgument {
	isValid(val, message) {
		return message.guild.users.cache.has(val) || message.guild.users.cache.find(u => u.name == val || (val.startsWith("<@") && val.endsWith(">") && u.name == val.substring(2, val.length - 1))) !== null;
	}
	static expected = 'a user';
}

module.exports = {ValidArgument, WordArgument, NumberArgument, ChannelArgument, UserArgument};