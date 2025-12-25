"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("offers", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "providers", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      internal_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price_value: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stock_qty: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      stock_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dispatch_eta: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_seen_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("offers");
  },
};