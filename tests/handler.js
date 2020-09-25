const Handler = require('../discord/handler');
const {assertEquals} = require('./tests');

let count = (context, next) => {context.count++; next()}; 
let noop = () => {}
let broken = (context, next) => {throw "asd"}

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
    console.log(res)
    assertEquals(JSON.stringify(res), JSON.stringify(result));
}

async function test() {
    let handler = new Handler(count, count);
    await assertHandler(handler, {count: 0}, {count: 2});
}

async function testNested() {
    let h = new Handler();
    let handler = new Handler(count, h, count);
    await assertHandler(handler, {count: 0}, {count: 2});
    h.add(count, noop, count); // doesnt finish
    await assertHandler(handler, {count: 0}, undefined);
    h.add(count, count, count, noop, count); // doesnt finish
    await assertHandler(handler, {count: 0}, undefined);

    handler.add(count);
    await assertHandler(handler, {count: 0}, {count: 1});

    handler = new Handler(count, new Handler(count, new Handler(count), count), count, new Add(5));
    await assertHandler(handler, {count: 0}, {count: 10});

    handler = new Handler(noop);
    await assertHandler(handler, {count: 0}, undefined);

    handler = new Handler(count, broken);
    handler.add(count, count, count);
    await assertHandler(handler, {count: 0}, {count: 3, done: true});
}

(async function() {
    for (let t of [test, testNested]) {
        try {
            await t();
        } catch(e) {
            console.log(e);
        }
    }
}());