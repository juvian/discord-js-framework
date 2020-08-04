const { CommandException, Command } = require("./command");

class CommandGroup {
    children = new Set();
    triggers = new Set();

    add(cmd) {
        if (this.children.has(cmd)) throw new CommandException("Command already in group");
        this.children.add(cmd);
    }

    remove(cmd) {
        if (!this.children.has(cmd)) throw new CommandException("Command not in group");
        this.children.delete(cmd);
    }

    _handle(currentText, message, context) {
        for (let child of this.children) {
            if (child.handle(currentText, message, context)) return true;
        }
    }

    handle(currentText, message, context) {
        if (this.triggers && this.triggers.size) {
            for (let [qty, str] of currentText) {
                if (this.triggers.has(str)) {
                    currentText.forward(qty);
                    if (this._handle(currentText, message, context)) return true;
                    currentText.backward(qty);
                }
            }
        } else {
            return this._handle(currentText, message, context);
        }
    }

}

module.exports = CommandGroup;