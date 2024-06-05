const { query } = require('./database/index');

(async () => {
    try {
        const res = await query('SELECT NOW()');
        console.log(res.rows[0]);
    } catch (err) {
        console.error('Database connection error', err);
    }
})();