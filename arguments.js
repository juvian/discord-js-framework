class ValidArgument {
	static isValid(val, message) {
		return true;
	}

	static errorMessage(str) {
		return `Invalid argument, expected ${this.expected} but got ${str}`
	}
}

class WordArgument extends ValidArgument {
	static regex = /\w+/y
	static expected = 'a word';
}

class NumberArgument extends ValidArgument {
	static regex = /\d+/y
	static expected = 'a number';
}

class ChannelArgument extends WordArgument {
	static isValid(val, message) {
		return message.guild.channels.cache.has(val) || message.guild.channels.cache.find(c => c.name == val || (val.startsWith("<#") && val.endsWith(">") && c.name == val.substring(2, val.length - 1))) !== null;
	}
	static expected = 'a channel';
}

class UserArgument extends WordArgument {
	static isValid(val, message) {
		return message.guild.users.cache.has(val) || message.guild.users.cache.find(u => u.name == val || (val.startsWith("<@") && val.endsWith(">") && u.name == val.substring(2, val.length - 1))) !== null;
	}
	static expected = 'a user';
}

module.exports = {ValidArgument, WordArgument, NumberArgument, ChannelArgument, UserArgument};