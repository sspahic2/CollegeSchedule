const Sequelize = require("sequelize");
const sequelize = new Sequelize("wt2017906", "root", "root", {host:"localhost", dialect:"mysql", logging:false});
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;



module.exports = db;