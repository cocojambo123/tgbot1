const { Sequelize } = require("sequelize");

module.exports = new Sequelize("telega_bot", "root", "root", {
  host: "5.35.19.3",
  port: "5432",
  dialect: "postgres",
});
