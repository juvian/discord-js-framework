class Handler {
    handlers = [];
    
    constructor(...handlers) {
        this.add(...handlers);
    }
    
    add(...handlers) {
        if(handlers.length) this.handlers.push(handlers);
        return this;
    }


    async _runHandlers(handlers, context, idx = 0) {
        if (idx >= handlers.length) return context;

        let func = handlers[idx].run || handlers[idx];

        return new Promise(async (res) => {
            let r = await func.call(handlers[idx], context, (ctx) => res(this._runHandlers(handlers, ctx || context, idx + 1)));
            res(r);
        });
    }

    async run(context, next) {
        next = next || ((v) => v);

        if (this.handlers.length == 0) return next(context);

        for (let handler of this.handlers) {
            let copy = Object.assign({}, context);
            let res = await this._runHandlers(handler, copy);
            if (res) return next(res);
        } 
    }
}

module.exports = Handler;