const WordTree = require('./wordTree');
const EVENTS = require('./events');
const {CommandException} = require('./command');
let config = require('./config');
let logger = require('./logger');

class CommandHandlerException extends Error {}

const eventHandlers = {
	[EVENTS.COMMAND_HANDLER.COMMAND_EXCEPTION]: (commandHandler, e, message) => message.channel.reply(e.message),
	[EVENTS.COMMAND_HANDLER.UNHANDLED_COMMAND_EXCEPTION]: (commandHandler, e, message) => {
		Object.entries(config.devs).forEach((id, dev) => {
			if (dev.sendErrors) message.client.users.fetch(id).then(u => u.send(e.message)).catch(logger.log)
		})
	}
	
}

class CommandHandler {
	tree = new WordTree()

	constructor(trigger = '!') {
		this.trigger = trigger;
	}

	runCommand(command, message) {
		if (!command.isAllowed(message)) return;

		try {
			command.checkPermissions();
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

	addCommand(command) {
		command.triggers.forEach(t => this.addCommandTrigger(t, command));
	}

	addCommandTrigger(trigger, command) {
		let val = this.tree.get(trigger) 
		if (val !== null) {
			if (val !== command) throw new CommandHandlerException(`Can't add trigger ${trigger} to commands, already defined`); 
			else return;
		}
		this.tree.add(trigger, command);
	}

	removeCommand(command) {
		command.triggers.forEach(t => this.tree.remove(t));
	}

	processMessage(message) {
		if (message.content.startsWith(this.trigger)) {
			let path = this.tree._nodePath(message.content.substring(this.trigger.length).matchAll(/[^ ]+/g))
			for (let i = path.length - 1; i >= 0; i--) {
				if (path[i]._val) return this.runCommand(path[i]._val, message);
			}
		}
	}
}

let cmd = new CommandHandler();
cmd.addCommandTrigger('get image', 3);
cmd.processMessage({content: '!get image 66'})
