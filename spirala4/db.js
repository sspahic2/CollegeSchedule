const Sequelize = require("sequelize");
const sequelize = new Sequelize("wt2017906", "root", "root", {host:"localhost", dialect:"mysql", logging:false});
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.predmet = sequelize.import(__dirname+"/predmet.js");
db.predmet = sequelize.import(__dirname+"/grupa.js");
db.predmet = sequelize.import(__dirname+"/aktivnost.js");
db.predmet = sequelize.import(__dirname+"/dan.js");
db.predmet = sequelize.import(__dirname+"/tip.js");
db.predmet = sequelize.import(__dirname+"/student.js");



module.exports = db;