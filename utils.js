const skipSpaces = (re, str) => {
	let r = / +/y;
	r.lastIndex = re.lastIndex;
	let m = str.match(r);
	re.lastIndex = m ? r.lastIndex : re.lastIndex;
	return str.match(re);
}

module.exports = {skipSpaces}