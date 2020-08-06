class ConsumeInput {
    constructor(triggers) {
        if (Array.isArray(triggers) == false) triggers = [];
        this.triggers = triggers.map(t => t.toLowerCase());
    }
    
    run(context, next) {
        let input = context.input.trim();
        let matchingTrigger = this.triggers.find(t => input.startsWith(t));
        if (matchingTrigger) {
            context.input = input.substring(matchingTrigger.length);
            next();
        }
    }
}

module.exports = ConsumeInput;