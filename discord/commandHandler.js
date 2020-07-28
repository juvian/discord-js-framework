const EVENTS = require('./events');
const {CommandException} = require('./command');
let config = require('./config');
let logger = require('../utils/logger');
const CommandGroup = require('./commandGroup');
const emitter = new require('events')();

class CommandHandlerException extends Error {}

const eventHandlers = {
	[EVENTS.COMMAND_HANDLER.COMMAND_EXCEPTION]: (commandHandler, e, message) => message.channel.reply(e.message),
	[EVENTS.COMMAND_HANDLER.UNHANDLED_COMMAND_EXCEPTION]: (commandHandler, e, message) => {
		Object.entries(config.devs).forEach((id, dev) => {
			if (dev.sendErrors) message.client.users.fetch(id).then(u => u.send(e.message)).catch(logger.log)
		})
	}
}

class CommandHandler extends CommandGroup {

	runCommand(command, commandContent, message) {
		if (!command.isAllowed(message)) return;

		try {
			let errors = command.checkPermissions(message);
			
			if (errors.length == 0) {
				let {args, errors} = command.parse(commandContent, message);
				if (errors.length == 0) return command.run(args, message);
			}
			
			errors.forEach(e => emitter.emit.apply(emitter, e));
			let errorMessage = errors.map(e => command.handleError.apply(e)).filter(str => str.trim()).join('\n');
			if (errorMessage) throw new CommandException(errorMessage);
		} catch(e) {
			if (e instanceof CommandException) {
				this.emit(EVENTS.COMMAND_HANDLER.COMMAND_EXCEPTION, e, message);
			} else {
				this.emit(EVENTS.COMMAND_HANDLER.UNHANDLED_COMMAND_EXCEPTION, e, message);
			}
		}
	}

	emit(event, ...args) {
		if (eventHandlers[event]) eventHandlers[event](this, ...args);
	}

	reloadCommand(command) {
		this.removeCommand(command);
		let newCommand = new command.reload().command;
		this.addCommand(newCommand);
	}

	processMessage(message) {
		let message = message.content;
		for (let i = 1; i < message.length; i++) {
			if (message[i] != ' ' && (message[i - 1] == ' ') || i + 1 == message.length) {
				this.run(message.substring(0, i));
			}
		}
	}
}
