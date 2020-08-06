class Handler {
    handlers = [];

    add(...handlers) {
        this.handlers.push(handlers);
    }


    async runHandlers(handler, context, idx = 0) {
        if (idx >= handler.length) return true;
        if (handler[idx] instanceof Handler) return handler[idx].run(context);

        let func = handler[idx].run || handler[idx];

        func(context, () => this.runHandlers(handler, context, idx));
    }


    async run(context, idx = 0) {
        if (idx >= this.handlers.length) return;
        let copy = Object.assign({}, context);
        
        let done = await this.runHandlers(this.handlers[idx], copy);
        console.log(done)
        if (done === true) return copy;
        else await this.run(context, idx + 1);    
    }
}

module.exports = Handler;