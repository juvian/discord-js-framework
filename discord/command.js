const discord = require('discord.js');
const {skipSpaces} = require('../utils/utils');
const EVENTS = require('./events');
const config = require('./config');

class CommandException extends Error {};

const errorHandlers = {
	[EVENTS.COMMANDS.INVALID_TYPE]: (command) => `This command is not allowed on ${command.message.type}`,
	[EVENTS.COMMANDS.INVALID_ARGUMENT]: (command, message) => message,
	[EVENTS.COMMANDS.MISSING_ARGUMENTS]: (command) => `This command requires at least ${command.minArgs} arguments`
}

class Command {

	clientPermissions = ["SEND_MESSAGES"];
	userPermissions = [];
	triggers = new Set();
	minArgs = 0;
	path = __dirname;

	constructor(arguments, opts) {
		Object.assign(this, opts);
		this.args = Object.entries(arguments || {}).sort((a, b) => a[1].order - b[1].order);
	}

	shouldRun(message) {
		return true;
	}

	missingUserPermissionError(permission) {
		throw new CommandException('Missing user permission: ' + permission, EVENTS.COMMANDS.MISSING_PERMISSION);
	}

	checkPermissions(message) {
		if (message.type != "dm") {
			let missingPerm = this.userPermissions.find(p => !message.member.hasPermission(p));
			if (missingPerm) this.missingUserPermissionError(missingPerm));
		}
	}

	missingArguments() {
		throw new CommandException(`This command requires at least ${this.minArgs} arguments`, EVENTS.COMMANDS.MISSING_ARGUMENTS);
	}

	invalidArgument(name, arg, str) {
		throw new CommandException(`Error on ${name} argument, ` + arg.errorMessage(str.substring(j, re.lastIndex)), EVENTS.COMMANDS.INVALID_ARGUMENT);
	}

	parse(str, message) {
		let j = 0;
		let args = {};
		let errors = [];
		
		for (let [name, arg] of this.args) {
			let re = arg.constructor.regex();
			while (j < str.length && str[j] == ' ') j++;
			re.lastIndex = j;
			let match = arg.parse(str);

			if (!match || !arg.isValid(match, message)) {
				this.invalidArgument(name, arg, str.substring(j, re.lastIndex));
			}
			args[name] = match.length > 1 ? match.slice(1) : match[0];
			j = re.lastIndex;
		}

		if (this.minArgs > Object.keys(args).length) this.missingArguments();

		return args;
	}

	reload() {
		delete require.cache[require.resolve(this.path)];
		return require(require.resolve(this.path));
	}

	run(args, message) {
		throw new CommandException("Command not implemented");
	}

	handleUnhandledError(e) {
		this.logger && this.logger.logUnhandledError(e);
	}

	handle(currentText, message, context) {
		for (let [qty, str] of currentText) {
			if (this.triggers.has(str)) {
				currentText.forward(qty);
				
				currentText.backward(qty);
			}
		}
	}
}

module.exports = {command: Command, CommandException}