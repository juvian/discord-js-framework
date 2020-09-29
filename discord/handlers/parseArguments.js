class InvalidArgument extends Error {
    constructor(name, arg, substr) {
        super();
        Object.assign(this, {name, arg, substr});
        this.message = arg.errorMessage(substr, name);
    }
}
class MissingArguments extends Error {}

class Parser {
    constructor(args, opts) {
        Object.assign(this, opts);
        this.args = Object.entries(args || {}).sort((a, b) => a[1].order - b[1].order);
    }

    run(context, next) {
        let args = context.args = {};
		
		for (let [name, arg] of this.args) {
            let j = 0;
            while (j < context.input.length && context.input[j] == ' ') j++;
            context.input = context.input.substring(j);
            let match = arg.parse(context, name);
            args[name] = arg.process(match, context);
		}

		if (this.minArgs > Object.keys(args).length) throw MissingArguments(this.minArgs, Object.keys(args).length);

        if (next) next();
        return context;
    }
}

module.exports = {Parser, MissingArguments, InvalidArgument}