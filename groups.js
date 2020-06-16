class Group {

	constructor() {
		this.config = {};
	}

	setParent(parent) {
		this.parent = parent;
	}

	set(config) {
		Object.assign(this.config, config);
	}

	getConfig() {
		let configs = [];
		let group = this;

		while (group) {
			configs.push(group.config);
			group = group.parent;
		}		

		return Object.assign({}, ...configs.reverse());
	}
}

class Groups {
	constructor() {
		this.groups = {};
	}

	assertGroupExists(name) {
		if (!this.groups.hasOwnProperty(name)) throw new Error(`There is no group named ${name}`);
	}

	createGroup(name) {
		if (this.groups.hasOwnProperty(name)) throw new Error("Group already exists");
		
		this.groups[name] = new Group();
	}

	setParent(name, parent) {
		this.assertGroupExists(name);
		this.assertGroupExists(parent);

		this.groups[name].setParent(this.groups[parent]);
	}

	setProperty(groupName, key, value) {
		this.assertGroupExists(groupName);

		this.groups[groupName].set({[key]: value});
	}

	getConfig(groupName) {
		this.assertGroupExists(groupName);
		return this.groups[groupName].getConfig();
	}


}

module.exports = {Groups, Group};