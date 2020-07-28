const { CommandException, Command } = require("./command");

class CommandGroup extends Command {
    children = {}
    groups = [];
    

    add(cmd) {
        if (cmd instanceof CommandGroup) this.addCommandGroup(cmd);
        else if (cmd instanceof Command) this.addCommand(cmd);
        else throw CommandException("Only commands and command groups can be added");
    }

    addCommandGroup(group) {
        if (group.triggers.size == 0) groups.push(group);
        this.registerTriggers(group);
    }

    addCommand(cmd) {
        if (cmd.triggers.size == 0) throw new CommandException("Command has no triggers");
        this.registerTriggers(cmd);
    }

    registerTriggers(cmd) {
        for (let trigger of cmd.triggers) {
            if (!this.children.hasOwnProperty(trigger)) this.children = new Set();
            if (this.children[trigger].has(cmd)) throw new CommandException("Command already registered");
            this.children[trigger].add(cmd);
        }
    }

    remove(cmd) {
        for (let trigger of cmd.triggers) {
            if (!this.children.hasOwnProperty(trigger) || !this.children[trigger].has(cmd)) throw new CommandException("Command is not a part of this group");
            this.children[trigger].delete(cmd);
            if (this.children[trigger].size == 0) delete this.children[trigger];
        }
    }

    run(message,)

}

module.exports = CommandGroup;