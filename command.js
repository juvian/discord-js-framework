const discord = require('discord.js');


class CommandException extends Error {};
class QuietCommandException extends Error {}


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
		return message.guild.channels.has(val) || message.guild.channels.find(c => c.name == val || (val.startsWith("<#") && val.endsWith(">") && c.name == val.substring(2, val.length - 1))) !== null;
	}
	static expected = 'a channel';
}

class UserArgument extends WordArgument {
	static isValid(val, message) {
		return message.guild.users.has(val) || message.guild.users.find(u => u.name == val || (val.startsWith("<@") && val.endsWith(">") && u.name == val.substring(2, val.length - 1))) !== null;
	}
	static expected = 'a user';
}

class TestArgument extends ValidArgument {
	static regex = /(\w+) (\w+)/y
}

const EVENTS = {
	COMMANDS: {
		BOT_NOT_ALLOWED: 'BotDenied',
		INVALID_TYPE: 'TypeDenied',
		MISSING_PERMISSION: 'MissingPermission'
	}
}

class Command {

	clientPermissions = ["SEND_MESSAGES"];
	userPermissions = [];
	accept = ["guild"];
	ownerBypass = true;
	ignoreBots = true;
	triggers = [];
	args = [];

	eventHandlers = {
		[EVENTS.COMMANDS.BOT_NOT_ALLOWED]: (command) => command.handleException(new CommandException('A bot can\'t trigger command')),
		[EVENTS.COMMANDS.INVALID_TYPE]: (command) => command.handleException(new CommandException(`This command is not allowed on ${command.message.type}`)),
		[EVENTS.COMMANDS.MISSING_PERMISSION]: (command, permission) => command.handleException(new CommandException(`User ${command.message.author.name} is missing ${permission} permission`)),
		[EVENTS.COMMANDS.INVALID_ARGUMENT]: (command, message) => command.handleException(new CommandException(message))  
	}

	checkBasicPermissions() {
		if (this.ignoreBots && this.message.author.bot) return this.emit(EVENTS.COMMANDS.BOT_NOT_ALLOWED); 
		if (!this.accept.contains(this.message.type)) return this.emit(EVENTS.COMMANDS.INVALID_TYPE);
		return true;
	}

	checkGuildPermissions() {
		if (this.isDm() || (this.ownerBypass && this.bot.owners.has(this.message.author.id))) return true;
		let missingPerm = this.userPermissions.find(p => !this.message.member.hasPermission(p))
		if (missingPerm) return this.emit(EVENTS.COMMANDS.MISSING_PERMISSION, missingPerm);
		return true;
	}

	emit(event, ...args) {
		if (this.eventHandlers[event]) this.eventHandlers[event](this, ...args);
	}

	checkPermissions() {
		return this.checkBasicPermissions() && this.checkGuildPermissions();
	}

	parse(str) {
		let j = 0;
		let args = [];
		
		for (let arg of this.args) {
			let re = arg.regex;
			re.lastIndex = j;
			let match = str.match(re);
			if (!match || !arg.isValid(match, str)) {
				re.lastIndex = j;
				match = this.skipSpaces(re, str)
			}
			if (!match) return this.emit(EVENTS.COMMANDS.INVALID_ARGUMENT, arg.errorMessage(str.substring(j)));
			args.push(match.length > 1 ? match.slice(1) : match[0]);
			j = re.lastIndex;
		}

		return args;
	}

	skipSpaces(re, str) {
		let r = / +/y;
		r.lastIndex = re.lastIndex;
		let m = str.match(r);
		console.log(re.lastIndex, r.lastIndex, str)
		re.lastIndex = m ? r.lastIndex : re.lastIndex;
		console.log(re.lastIndex, r.lastIndex, str)
		return str.match(re);
	}

	run() {
		throw new CommandException("Command not implemented");
	}

	handleException(e) {
		this.message && this.message.reply(e.message);
		!this.message && console.log(e);
	}

	handleUnhandledError(e) {
		this.logger && this.logger.logUnhandledError(e);
	}

	isDm() {
		return this.message.type == "dm";
	}

}

let c = new Command();
c.args = [WordArgument, WordArgument]
console.log(c.parse('a  little fox'))