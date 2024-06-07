const pool = require('../database/');

/* ***************************
 *  Register new account
 * ************************** */
async function registerAccount(firstname, lastname, email, password) {
  const result = await pool.query(
    'INSERT INTO account (account_firstname, account_lastname, account_email, account_password) VALUES ($1, $2, $3, $4) RETURNING *',
    [firstname, lastname, email, password]
  );
  return result.rows[0];
}

/* ***************************
 *  Get account by email
 * ************************** */
async function getAccountByEmail(email) {
  const result = await pool.query('SELECT * FROM account WHERE account_email = $1', [email]);
  return result.rows[0];
}

/* ***************************
 *  Get account by ID
 * ************************** */
async function getAccountById(accountId) {
  const result = await pool.query('SELECT * FROM account WHERE account_id = $1', [accountId]);
  return result.rows[0];
}

/* ***************************
 *  Update account information
 * ************************** */
async function updateAccount({ account_id, account_firstname, account_lastname, account_email }) {
  const result = await pool.query(
    'UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *',
    [account_firstname, account_lastname, account_email, account_id]
  );
  return result.rows[0];
}

/* ***************************
 *  Change password
 * ************************** */
async function changePassword(account_id, account_password) {
  const result = await pool.query(
    'UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *',
    [account_password, account_id]
  );
  return result.rows[0];
}

module.exports = {
  registerAccount,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  changePassword
};