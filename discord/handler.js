class Handler {
    handlers = [];
    
    constructor(...handlers) {
        this.add(...handlers);
    }
    
    add(...handlers) {
        this.handlers.push(handlers);
    }


    async runHandlers(handler, context, idx = 0) {
        if (idx >= handler.length) {
            context.done = true; return;
        }

        if (handler[idx] instanceof Handler) {
            let res = await handler[idx].run(context);
            if (res && res.done) return res;
            return this.runHandlers(handler, context, idx + 1);
        }

        let func = handler[idx].run || handler[idx];

        func(context, () => this.runHandlers(handler, context, idx + 1));
    }


    async run(context, idx = 0) {
        if (idx >= this.handlers.length) return;
        let copy = Object.assign({}, context);
        
        await this.runHandlers(this.handlers[idx], copy);
        console.log(copy)
        if (copy.done === true) return copy;
        else return this.run(context, idx + 1);    
    }
}

module.exports = Handler;