/**
 * Database abstraction layer.
 * Contains helper functions for doing database alterations such as
 * creating table, columns, and indexes.
 */

/**
 * Creates a table given it does not already exist.
 * @param {string} The table name.
 */
public function createTable(table) {
  primaryKey = "id INTEGER PRIMARY KEY AUTOINCREMENT";
  query = this.buildQuery("CREATE TABLE IF NOT EXISTS %s (%s)", { table, primaryKey });

  this.runQuery(query, false);
}

/**
 * Deletes a table given it exists.
 * @param {string} The table name.
 */
public function dropTable(table) {
  query = this.buildQuery("DROP TABLE IF EXISTS %s", { table });

  this.runQuery(query, false);
}

/**
 * Adds a column to a table.
 * @param {string} The table name.
 * @param {string} The column name.
 * @param {string} The SQL column type.
 */
public function addColumn(table, column, type) {
  query = this.buildQuery("ALTER TABLE %s ADD COLUMN %s %s", { table, column, type });

  this.runQuery(query, false);
}

/**
 * Adds an index to a table.
 * @param {string} The table name.
 * @param {string[]} Ordered column names to index on.
 * @param {boolean} Whether the index should be unique.
 */
public function addIndex(table, columns, unique) {
  unique = unique ? "UNIQUE" : "";
  indexName = this.buildIndexName(table, columns);

  query = this.buildQuery("CREATE %s INDEX IF NOT EXISTS %s ON %s (%s)",
    { unique, indexName, table, columns });

  this.runQuery(query, false);
}

/**
 * Drops an index from a table given it exists.
 * @param {string} The index name.
 */
public function dropIndex(index) {
  query = this.buildQuery("DROP INDEX IF EXISTS %s", { index });

  this.runQuery(query, false);
}

/**
 * Builds an index name from a table and column names.
 * @param {string} The table name.
 * @param {string[]} Ordered columns names.
 *
 * @example
 * // returns "index_test_on_id_name"
 * this.buildIndexName("test", { "id", "name" });
 *
 * @returns {string} The index name.
 */
public function buildIndexName(table, columns) {
  index = "index_" @ table @ "_on";

  for(column : columns) {
    index @= "_" @ column;
  }

  return index;
}

/**
 * Runs a query on the database.
 * @param {string} Query to run.
 * @param {boolean} Whether you expect rows to be returned.
 *   For example, when issuing a 'SELECT' query.
 *
 * @example
 * // Given there is a record in test_table with `id` of 1.
 * // returns { { 1 } }
 * this.runQuery("SELECT id FROM test_table LIMIT 1", true);
 *
 * @returns {object[][]|null} An array of rows contains arrays of
 *   selected column data or nothing if the request was an error or
 *   we expect no rows.
 */
public function runQuery(query, returningRows) {
  request = requestSQL(query, returningRows);

  if (request.error != "" || !returningRows) return;

  if (returningRows && !request.complete) {
    waitfor(request, "onReceiveData", 5);
  }

  return request.rows;
}

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
 * Builds a query from a format string and data. Note that the
 * data is escaped to prevent SQL injection attacks.
 * @param {string} printf-style format string.
 * @param {string[]} Data to be escaped and injected into the format string.
 *
 * @example
 * // returns "SELECT id FROM test WHERE name = 'TypeInference'''"
 * this.buildQuery("SELECT id FROM test WHERE name = '%s'", { "TypeInference'" });
 *
 * @returns {string} Query with data injected.
 */
public function buildQuery(query, data) {
  for(i = 0; i < data.size(); i++) {
   data[i] = escapestring(data[i]);
  }

  return format2(query, data);
}
