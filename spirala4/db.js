const Sequelize = require("sequelize");
const sequelize = new Sequelize("wt2017906", "root", "root", {host:"localhost", dialect:"mysql", logging:false});
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.predmet = require("./predmet.js")(sequelize, Sequelize.DataTypes);
db.grupa = require("./grupa.js")(sequelize, Sequelize.DataTypes);
db.aktivnost = require("./aktivnost.js")(sequelize, Sequelize.DataTypes);
db.dan = require("./dan.js")(sequelize, Sequelize.DataTypes);
db.tip = require("./tip.js")(sequelize, Sequelize.DataTypes);
db.student = require("./student.js")(sequelize, Sequelize.DataTypes);

db.predmet.hasMany(db.grupa, {as:"grupeNaPredmetu", foreignKey:{allowNull:false}});

db.predmet.hasMany(db.aktivnost, {as:"aktivnostiIzPredmeta", foreignKey:{allowNull:false}});

db.grupa.hasMany(db.aktivnost, {as:"aktivnostiGrupe", foreignKey:{allowNull:true}});

db.dan.hasMany(db.aktivnost, {as:"aktivnostiUDanu", foreignKey:{allowNull:false}});

db.tip.hasMany(db.aktivnost, {as:"aktivnostiTipa", foreignKey:{allowNull:false}});

db.studentUGrupi = db.student.belongsToMany(db.grupa, {as:"grupe", through:"student_u_grupi", foreignKey:"grupaId"});
db.grupa.belongsToMany(db.student, {as:"studenti", through:"student_u_grupi", foreignKey:"studentId"});

module.exports = db;