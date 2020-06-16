class WordTree {
	root = {};

	constructor(parent) {
		this.depth = parent ? parent.depth + 1 : 0;
		this.parent = parent;
	}

	add(key, val) {
		let parts = key.split(/ +/);
		let tree = this._nodePath(parts, 0);

		while (tree.depth < parts.length) {
			tree = tree.root[parts[tree.depth]] = new WordTree(tree);
		}

		tree._val = val;
	}

	remove(key) {
		let parts = key.split(/ +/);
		let tree = this._nodePath(parts, 0);

		if (tree.depth == parts.length) {
			delete tree._val;
			while (Object.keys(tree.root).length == 0 && tree.parent) {
				delete tree.parent.root[parts.pop()];
				tree = tree.parent;
			}
		}
	}

	_nodePath(parts) {
		let tree = this;

		for (let part of parts) {
			if (tree.root.hasOwnProperty(part)) tree = tree.root[part];
			else break;
		}

		return tree;
	}

	get(key) {
		let parts = key.split(/ +/);
		let tree = this._nodePath(parts, 0);

		return tree.depth == parts.length ? tree._val : undefined; 
	}

	serialize() {
		return Object.keys(this.root).reduce((all, key) => {
			all[key] = this.root[key].serialize();
			if (this.root[key]._val != undefined) all[key]._val = this.root[key]._val;
			return all;
		}, {});
	}

	toString() {
		return JSON.stringify(this.serialize(), null, 2);
	}
}

module.exports = WordTree;