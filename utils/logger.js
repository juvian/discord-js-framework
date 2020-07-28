const fs = require('fs');


log = (...args) => {
	console.log(...args);
	let err = new Date().toISOString() + ' ' + ','.join(...args);
	fs.appendFileSync("log.txt", err);
}


module.exports = {log}