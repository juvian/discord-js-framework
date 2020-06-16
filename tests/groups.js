const {Groups} = require('../groups');
const {assertEquals} = require('./tests');

let groups = new Groups();
groups.createGroup("server");
groups.createGroup("channel1")
groups.setProperty("channel1", "asd", 3);
assertEquals(groups.getConfig("channel1").asd, 3, groups.getConfig("channel1"));
groups.setProperty("channel1", "asd", 4);
assertEquals(groups.getConfig("channel1").asd, 4, groups.getConfig("channel1"));
groups.setProperty("server", "rest", 5);
groups.setProperty("server", "asd", 5);
groups.setParent("channel1", "server");
assertEquals(groups.getConfig("channel1").asd, 4, groups.getConfig("channel1"));
assertEquals(groups.getConfig("channel1").rest, 5, groups.getConfig("channel1"));
groups.getConfig("channel1").rest = 6;
assertEquals(groups.getConfig("channel1").rest, 5, groups.getConfig("channel1"));

