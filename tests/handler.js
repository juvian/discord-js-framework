const Handler = require('../discord/handler');
const {assertEquals} = require('./tests');

let count = (context, next) => {context.count++; next()}; 
let noop = () => {}

async function assertHandler(handler, context, result) {
    let res = await handler.run(context);
    assertEquals(JSON.stringify(res), JSON.stringify(result));
}

async function test() {
    let handler = new Handler(count, count);
    await assertHandler(handler, {count: 0}, {count: 2, done: true});
}

async function testNested() {
    let h = new Handler();
    let handler = new Handler(count, h, count);
    await assertHandler(handler, {count: 0}, {count: 2, done: true});
    h.add(count, noop, count); // doesnt finish
    await assertHandler(handler, {count: 0}, null);
    h.add(count, count, count, noop, count); // doesnt finish
    await assertHandler(handler, {count: 0}, null);

    handler.add(count);
    await assertHandler(handler, {count: 0}, {count: 1, done: true});
}

test();
testNested();