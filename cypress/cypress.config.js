const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    env: {
      backendUrl: "http://localhost:8080"
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: "e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "support/e2e.js",
    fixturesFolder: "fixtures",
    setupNodeEvents(on, config) {
      on('task', {
        queryDb(sql) {
          const mysql = require('mysql2/promise');
          return (async () => {
            const connection = await mysql.createConnection({
              host: 'localhost',
              user: 'root',
              password: 'rootpassword',
              database: 'client_support'
            });
            const [rows] = await connection.query(sql);
            await connection.end();
            return rows;
          })();
        }
      });
    },
  },
});
