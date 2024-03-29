class Path {
    handlers = [];
    errorHandlers = [];
    
    constructor(...handlers) {
        this.add(...handlers);
    }
    
    add(...handlers) {
        if(handlers.length) this.handlers.push(handlers);
        return this;
    }

    onError(...handlers) {
        this.errorHandlers = this.errorHandlers.concat(...handlers);
        return this;
    } 

    handleError(e, context, idx = 0) {
        if (idx >= this.errorHandlers.length) return e;

        return new Promise(async (res) => {
            await this.errorHandlers[idx].call(this.errorHandlers[idx], e, context, (e) => res(this.handleError(e, context, idx + 1)));
            res();
        })
    }

    async _runHandlers(handlers, context, idx = 0) {
        if (idx >= handlers.length) return context;

        let func = handlers[idx].run || handlers[idx];

        return new Promise(async (res, rej) => {
            try {
                await func.call(handlers[idx], context, (ctx) => res(this._runHandlers(handlers, ctx || context, idx + 1)));
            } catch(e) {
                let error = await this.handleError(e, context);
                if (error) rej(error);
            }
            res();
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

module.exports = Path;