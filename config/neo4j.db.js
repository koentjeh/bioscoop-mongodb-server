const neo4j = require('neo4j-driver').v1;
// const config = require('./env/env');

const driver = neo4j.driver('bolt://hobby-ihhgiahodeihgbkeobjoijal.dbs.graphenedb.com:24786', neo4j.auth.basic('production', 'b.zjkgmOohh342.patSN12g8KS4kUQN'));

module.exports = driver;

