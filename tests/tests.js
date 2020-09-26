const assertEquals = (v1, v2, ...args) => {
    if (typeof v1 === "object" && v1) {
        [v1, v2] = [JSON.stringify(v1), JSON.stringify(v2)]
    }
    if (v1 !== v2) throw Error(`Expected ${v2} but got ${v1}, ` + args.map(JSON.stringify).join(" "))
} 
const test = async(tests) => {
    for (let t of tests) {
        try {
            await t();
        } catch(e) {
            console.log(e);
        }
    }
}
const noop = () => {}

module.exports = {assertEquals, test, noop}