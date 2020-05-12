import { Client, Message } from 'discord.js'


class CommandException extends Error {};
class QuietCommandException extends Error {}

function staticDecorator<T>() {
    return (constructor: T) => {};
}

interface Argument {
	regex: RegExp;
	isValid(val:any, message: Message): Boolean;
}

interface CommandArgument {
	type: Argument,
	optional: Boolean,
	name: String
}

class ValidArgument {
	static isValid(val:any, message: Message) {
		return true;
	}
}

@staticDecorator<Argument>()
class WordArgument extends ValidArgument {
	static regex = /\w+/
}

@staticDecorator<Argument>()
class NumberArgument extends ValidArgument {
	static regex = /\d+/
}

@staticDecorator<Argument>()
class ChannelArgument extends WordArgument {
	static isValid(val, message: Message) {
		return message.guild.channels.has(val) || message.guild.channels.find(c => c.name == val || (val.startsWith("<#") && val.endsWith(">") && c.name == val.substring(2, val.length - 1))) !== null;
	}
}

@staticDecorator<Argument>()
class UserArgument extends WordArgument {
	static isValid(val, message: Message) {
		return message.guild.users.has(val) || message.guild.users.find(u => u.name == val || (val.startsWith("<@") && val.endsWith(">") && u.name == val.substring(2, val.length - 1))) !== null;
	}
}

class Command {

	clientPermissions = ["SEND_MESSAGES"];
	userPermissions = [];
	accept = ["guild"];
	ownerBypass = true;
	requiredRoles = [];
	ignoreBots = true;
	triggers = [];
	args = [];

	checkBasicPermissions() {
		if (this.ignoreBots && this.message.author.bot) throw new QuietCommandException();
		if (!this.accept.contains(this.message.type)) throw new CommandException(`This command does not accept ${this.message.type} messages`);
		let missingPerm = this.isDm() ? null : clientPermissions.find(p => !this.message.guild.me.hasPermission(p));
		if (missingPerm) throw new CommandException("Bot missing required " + missingPerm + " permission");
	}

	checkGuildPermissions() {
		if (this.isDm()) return;
		let missingPerm = this.userPermissions.find(p => !this.message.member.hasPermission(p))
		if (missingPerm) throw CommandException("You do not have ${missingPerm} permission");
		if (this.requiredRoles.length) {
			let roles = new Set(this.message.member.roles.map(r => r.name));
			if (this.requiredRoles.every(r => !roles.has(r))) throw new CommandException("User does not have any of the required roles");
		}
	}

	checkPermissions() {
		this.checkBasicPermissions();
		if (this.ownerBypass && this.config.owners.has(this.message.author.id)) return;
		this.checkGuildPermissions();
	}

	parse() {

	}

	run() {
		throw new CommandException("Command not implemented");
	}

	handleQuietException() {}

	handleException(e) {
		this.message.reply(e.message);
	}

	handleUnhandledError(e) {
		this.logger.logUnhandledError(e);
	}

	isDm() {
		return this.message.type == "dm";
	}

}