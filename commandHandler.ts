class CommandHandler {
	exec() {
		try {
			this.checkPermissions();
			await this.run();
		} catch(e) {
			if (e.constructor.name.includes("Command")) this["handle" + e.constructor.name.replace("Command", "")](e);
			this.handleUnhandledError(e);
		}
	}
}