const discord = require('discord.js');
const {skipSpaces} = require('./utils');
const EVENTS = require('./events');
const config = require('./config');

class CommandException extends Error {};


const eventHandlers = {
	[EVENTS.COMMANDS.BOT_NOT_ALLOWED]: (command) => {},
	[EVENTS.COMMANDS.INVALID_TYPE]: (command) => {throw new CommandException(`This command is not allowed on ${command.message.type}`)},
	[EVENTS.COMMANDS.MISSING_PERMISSION]: (command, permission) => {},
	[EVENTS.COMMANDS.INVALID_ARGUMENT]: (command, message) => {throw  new CommandException(message)},
	[EVENTS.COMMANDS.MISSING_ARGUMENTS]: (command) => {throw new CommandException(`This command requires at least ${command.minArgs} arguments`)}
}

class Command {

	clientPermissions = ["SEND_MESSAGES"];
	userPermissions = [];
	accept = ["guild"];
	devBypass = true;
	ignoreBots = true;
	triggers = [];
	args = [];
	minArgs = 0;
	active = true;
	isAllowed = (message) => true
	path = __dirname

	checkBasicPermissions() {
		if (this.ignoreBots && this.message.author.bot) this.emit(EVENTS.COMMANDS.BOT_NOT_ALLOWED); 
		if (!this.accept.contains(this.message.type)) this.emit(EVENTS.COMMANDS.INVALID_TYPE);
	}

	checkGuildPermissions() {
		if (this.isDm() || (this.devBypass && config.devs.hasOwnProperty(this.message.author.id)) && config.devs.bypassDisabled !== true) return;
		let missingPerm = this.userPermissions.find(p => !this.message.member.hasPermission(p))
		if (missingPerm) this.emit(EVENTS.COMMANDS.MISSING_PERMISSION, missingPerm);
	}

	emit(event, ...args) {
		if (eventHandlers[event]) eventHandlers[event](this, ...args);
	}

	checkPermissions() {
		this.checkBasicPermissions();
		this.checkGuildPermissions();
	}

	parse(str) {
		let j = 0;
		let args = [];
		
		for (let arg of this.args) {
			let re = arg.regex;
			re.lastIndex = j;
			let match = str.match(re);
			if (!match || !arg.isValid(match, this.message)) {
				re.lastIndex = j;
				match = skipSpaces(re, str)
			}
			if (!match || !arg.isValid(match, this.message)) this.emit(EVENTS.COMMANDS.INVALID_ARGUMENT, arg.errorMessage(str.substring(j)));
			args.push(match.length > 1 ? match.slice(1) : match[0]);
			j = re.lastIndex;
		}

		if (this.minArgs > args.length) this.emit(EVENTS.COMMANDS.MISSING_ARGUMENTS)

		return args;
	}

	reload() {
		delete require.cache[require.resolve(this.path)];
		return require(require.resolve(this.path));
	}

	run() {
		throw new CommandException("Command not implemented");
	}

	handleUnhandledError(e) {
		this.logger && this.logger.logUnhandledError(e);
	}

	isDm() {
		return this.message.type == "dm";
	}
}

Command.eventHandlers = eventHandlers;

module.exports = {command: Command, CommandException}