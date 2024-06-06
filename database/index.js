const { Pool } = require("pg");
require("dotenv").config();

let pool;

if (process.env.NODE_ENV === "development") {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        }
    });
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false, 
        }
    });
}

module.exports = {
    query: async (text, params) => {
        try {
            const res = await pool.query(text, params);
            console.log("executed query", { text, res });
            return res;
        } catch (error) {
            console.error("error in query", { text, error });
            throw error;
        }
    },
    pool
};