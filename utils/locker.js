class Locker {
	locks = {}

	async execute(lockId, task, behaviour) {
		let promise = new Promise((acc, rej) => {
			if (lockId == null) acc(task());

			if (this.locks.hasOwnProperty(lockId)) {
				if (behaviour == "queue") {
					this.locks[lockId].push(task); 
				} else if (behaviour == "error") {
					rej("Task already running");
				}
			} else {
				this.locks[lockId] = [task];
				this.executeTask(lockId, task);
			}
		})

		return promise;
	}

	removeTask(lockId, task) {
		let tasks = this.locks[lockId];
		let idx = tasks.indexOf(task);

		if (idx != -1) {
			tasks.splice(idx, 1);
			if (tasks.length == 0) delete this.locks[lockId];
			else this.executeTask(lockId, tasks[0]);
		}
	}

	async executeTask(lockId, task) {
		try {
			await task();
		} finally {
			this.removeTask(lockId, task);
		}
	}

}

module.exports = Locker;