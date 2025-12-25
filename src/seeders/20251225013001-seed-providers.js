'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert("providers", [
      { code: "repuestosmax", name: "RepuestosMax", createdAt: now, updatedAt: now },
      { code: "autopartsplus", name: "AutoPartsPlus", createdAt: now, updatedAt: now },
      { code: "globalparts", name: "GlobalParts", createdAt: now, updatedAt: now },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("providers", {
      code: ["repuestosmax", "autopartsplus", "globalparts"],
    });
  }
};
