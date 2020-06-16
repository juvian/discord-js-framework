const WordTree = require('../wordTree');
const {assertEquals} = require('./tests');

let tree = new WordTree();
tree.add("a    weird command x", 3);
assertEquals(tree.get("a weird command x"), 3, tree.toString())
tree.add("a weird command x x", 4)
assertEquals(tree.get("a weird command x x"), 4, tree.toString())
tree.remove("a weird command x")
assertEquals(tree.get("a weird command x"), undefined, tree.toString())
assertEquals(tree.get("a weird command x x"), 4, tree.toString())
tree.remove("a weird command   x x")
assertEquals(tree.get("a weird command x x"), undefined, tree.toString())
assertEquals(tree.toString(), new WordTree().toString())