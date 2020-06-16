const assertEquals = (v1, v2, ...args) => {if (v1 !== v2) throw Error(`Expected ${v2} but got ${v1}, ` + args.map(JSON.stringify).join(" "))} 

module.exports = {assertEquals}