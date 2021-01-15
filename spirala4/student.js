const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    const Student = sequelize.define("student", {
        naziv:Sequelize.STRING,
        index:Sequelize.STRING
    });
    return Student;
};