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
	accept = ["guild"];
	ignoreBots = true;
	triggers = new Set();
	minArgs = 0;
	isAllowed = (message) => true;
	path = __dirname;

	constructor(arguments, opts) {
		Object.assign(this, opts);
		this.args = Object.entries(arguments || {}).sort((a, b) => a[1].order - b[1].order);
	}

	checkBasicPermissions(message) {
		let errors = [];
		if (this.ignoreBots && message.author.bot) errors.push([EVENTS.COMMANDS.BOT_NOT_ALLOWED]); 
		if (!this.accept.contains(message.type)) errors.push([EVENTS.COMMANDS.INVALID_TYPE]);
		return errors;
	}

	getError(event, ...args) {
		if (event == EVENTS.COMMANDS.INVALID_TYPE) return `This command is not allowed on ${this.message.type}`;
		else if (event == EVENTS.COMMANDS.INVALID_ARGUMENT) return args[0];
		else if (event == EVENTS.COMMANDS.MISSING_ARGUMENTS) return `This command requires at least ${this.minArgs} arguments`;
		return '';
	}

	checkGuildPermissions(message) {
		let errors = [];
		if (message.type != "dm") {
			let missingPerm = this.userPermissions.find(p => !message.member.hasPermission(p));
			if (missingPerm) errors.push([EVENTS.COMMANDS.MISSING_PERMISSION, missingPerm]);
		}
		return errors;
	}

	checkPermissions(message) {
		return this.checkBasicPermissions(message).concat(this.checkGuildPermissions(message));
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
				errors.push([EVENTS.COMMANDS.INVALID_ARGUMENT, `Error on ${name} argument, ` + arg.errorMessage(str.substring(j, re.lastIndex))]);
				break;
			}
			args[name] = match.length > 1 ? match.slice(1) : match[0];
			j = re.lastIndex;
		}

		if (this.minArgs > Object.keys(args).length) errors.push([EVENTS.COMMANDS.MISSING_ARGUMENTS])

		return {args, errors};
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
}

module.exports = {command: Command, CommandException}