const Handler = require('../discord/handler');
const {assertEquals} = require('./tests');

let count = (context, next) => {context.count++; next()}; 

async function test() {
    let handler = new Handler();
    handler.add(count, count);
    let result = await handler.run({count: 0});
    assertEquals(result.count, 2);
}

test();