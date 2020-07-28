const Locker = require('../locker');
const {assertEquals} = require('./tests');

let executed = 0;

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(executed++), time));

let locker = new Locker();

let task1 = () => sleep(200)
let task2 = () => sleep(100);
let task3 = () => sleep(100);
let task4 = () => sleep(10);

locker.execute('server', task1).then(() => {
	console.log(23, executed, locker)
	assertEquals(executed, 3);
})

locker.execute('server1', task2);
locker.execute('server2', task3);

locker.execute('server', task4, "error").then(() => {throw Error("did not reject")}).catch(() => {});

locker.execute('server', task4, "queue").then(() => {
	console.log(24, executed, locker)
	assertEquals(executed, 3);	
})
