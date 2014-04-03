/**
 * Transaction support for the database abstraction layer.
 * This library should not be used in production as it currently
 * does not support transaction isolation.
 */

/**
 * Setup depedencies.
 */
function onCreated() {
  this.join("db");
}

/**
 * In order to ensure that no destructive queries accidentally run
 * inside of an unrelated transaction, we "lock" the DB until the
 * transaction is finished and the lock is released.
 */
transactionLock = new TStaticVar("transactionLock");
transactionLock.locked = false;
transactionLock.owner = null;

/**
 * Begins a database transaction.
 */
public function beginTransaction() {
  this.runQuery("BEGIN", false);
}

/**
 * Commits the open database transaction.
 */
public function commitTransaction() {
  this.runQuery("COMMIT", false);
}

/**
 * Roll back the the open database transaction.
 */
public function rollbackTransaction() {
  this.runQuery("ROLLBACK", false);
}

/**
 * Runs the given function inside of a transaction. If the function
 * returns `false` then the transaction will be rolled back,
 * otherwise it will be committed.
 * @param {function} The function to run inside the transaction.
 *
 * @example
 * // The transaction will roll back and no inserts will happen.
 * this.inTransaction(_ = function() {
 *   this.runQuery("INSERT INTO test VALUES (1)", false);
 *   this.runQuery("INSERT INTO test VALUES (2)", false);
 *
 *   return false;
 * });
 *
 * // The transaction will be committed and the inserts will be
 * // recorded.
 * this.inTransaction(_ = function() {
 *   this.runQuery("INSERT INTO test VALUES (1)", false);
 *   this.runQuery("INSERT INTO test VALUES (2)", false);
 * });
 *
 * @returns {object} The object returned from the passed function.
 */
public function inTransaction(temp.func) {
  this.beginTransaction();
  returning = temp.func();

  if (returning == false && r != null) {
    this.rollbackTransaction();
  } else {
    this.commitTransaction();
  }

  return returning;
}
