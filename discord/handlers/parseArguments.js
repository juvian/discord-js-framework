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
        let j = context.message.lastIndex || 0;
        let str = context.message.content;
		
		for (let [name, arg] of this.args) {
			let re = arg.regex;
			while (j < str.length && str[j] == ' ') j++;
            re.lastIndex = j;
            let match = arg.parse(str, name);
            console.log(name, arg, match)
            args[name] = arg.process(match, context);
            console.log(arg.match[0].length)
			j += arg.match[0].length;
		}

		if (this.minArgs > Object.keys(args).length) throw MissingArguments(this.minArgs, Object.keys(args).length);

        context.message.lastIndex = j;

        if (next) next();
        return context;
    }
}

module.exports = {Parser, MissingArguments, InvalidArgument}