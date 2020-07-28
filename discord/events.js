const EVENTS = {
	COMMANDS: {
		BOT_NOT_ALLOWED: 'BotDenied',
		INVALID_TYPE: 'TypeDenied',
		MISSING_PERMISSION: 'MissingPermission',
		INVALID_ARGUMENT: 'InvalidArgument',
		MISSING_ARGUMENTS: 'MissingArguments'
	},
	COMMAND_HANDLER: {
		COMMAND_EXCEPTION: 'CommandException',
		UNHANDLED_COMMAND_EXCEPTION: 'UnhandledCommandException'
	}
}

module.exports = EVENTS;