const Path = require('../discord/handler');
const {assertEquals, test, noop} = require('./tests');

let count = (context, next) => {context.count++; next()}; 
let broken = (context, next) => {throw Error("asd")}
let errorContinue = (e, context, next) => {context.cont = true;next(e)}
let errorSkip = (e, context, next) => {context.skip = true;}
let ret = (context, next) => context;

class Add {
    constructor(add) {
        this.add = add;
    }

    run(context, next) {
        context.count += this.add;
        next();
    }
}

async function assertHandler(handler, context, result) {
    let res = await handler.run(context);
    assertEquals(JSON.stringify(res), JSON.stringify(result));
}

async function testNested() {
    let handler = new Path(count, count);
    await assertHandler(handler, {count: 0}, {count: 2});

    let h = new Path();
    handler = new Path(count, h, count);
    await assertHandler(handler, {count: 0}, {count: 2});
    h.add(count, noop, count); // doesnt finish
    await assertHandler(handler, {count: 0}, undefined);
    h.add(count, count, count, noop, count); // doesnt finish
    await assertHandler(handler, {count: 0}, undefined);

    handler.add(count);
    await assertHandler(handler, {count: 0}, {count: 1});

    handler = new Path(count, new Path(count, new Path(count), count), count, new Add(5));
    await assertHandler(handler, {count: 0}, {count: 10});

    handler = new Path(noop);
    await assertHandler(handler, {count: 0}, undefined);

    handler = new Path(ret);
    await assertHandler(handler, {count: 0}, undefined);
}

async function testErrors() {
    let handler = new Path(count, broken).onError(errorSkip);
    handler.add(count, count, count);
    await assertHandler(handler, {count: 0}, {count: 3});

    handler = new Path(count, broken, count).onError(errorContinue, errorContinue, errorSkip);
    await assertHandler(handler, {count: 0}, undefined);
}

test([testNested, testErrors])
