public function testCreatingAndRemovingTables() {
  this.createTable("test_table");
  this.assert(tableExists("test_table"));
  this.assert(columnExists("test_table", "id", "INTEGER"));

  this.dropTable("test_table");
  this.refute(tableExists("test_table"));
}

public function testCreatingColumns() {
  this.createTable("test_table");
  this.addColumn("test_table", "name", "VARCHAR(255)");
  this.assert(columnExists("test_table", "name", "VARCHAR(255)"));

  this.dropTable("test_table");
}

public function testCreatingAndRemovingIndexes() {
  this.createTable("test_table");
  this.addColumn("test_table", "player_id", "INTEGER");
  this.addColumn("test_table", "player_type", "VARCHAR(20)");

  this.addIndex("test_table", { "player_id", "player_type" }, true);
  this.assert(indexExists("test_table", "index_test_table_on_player_id_player_type", true));

  this.dropIndex("test_table", "test_table_on_player_id_player_type");
  this.refute(indexExists("test_table", "index_test_table_on_player_id_player_type"));

  this.dropTable("test_table");
}

public function testBuildingIndexNames() {
  index = this.buildIndexName("test", { "name" });
  this.assert(index == "index_test_on_name");

  index = this.buildIndexName("test", { "name", "gender" });
  this.assert(index == "index_test_on_name_gender");
}

public function testTransactions() {
  this.beginTransaction();
  this.createTable("test_table");
  this.assert(tableExists("test_table"));

  this.rollbackTransaction();
  this.refute(tableExists("test_table"));

  this.createTable("test_table");

  this.beginTransaction();
  this.dropTable("test_table");
  this.commitTransaction();
  this.refute(tableExists("test_table"));
}

public function testBuildQueryWithEscapableCharacters() {
  query = this.buildQuery("SELECT * FROM t WHERE '%s'", { "haxxx'--" });

  this.assert(query == "SELECT * FROM t WHERE 'haxxx''--'");
}

public function testBuildQueryWithArray() {
  query = this.buildQuery("SELECT * FROM t WHERE id IN (%s)", { { 1, 2, 3} });

  this.assert(query == "SELECT * FROM t WHERE id IN (1,2,3)");
}

function tableExists(table) {
  query = this.buildQuery("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '%s'", { table });
  tablesExists = this.runQuery(query, true);
  tableExists = false;

  for (exists : tablesExists) {
    tableExists |= exists[0] == 1;
  }

  return tableExists;
}

function columnExists(table, column, type) {
  query = this.buildQuery("PRAGMA table_info('%s')", { table });
  columnInfos = this.runQuery(query, true);
  columnExists = false;

  for(columnInfo : columnInfos) {
    columnExists |= columnInfo[1] == column && columnInfo[2] == type;
  }

  return columnExists;
}

function indexExists(table, index, unique) {
  unique = unique ? 1 : 0;
  query = this.buildQuery("PRAGMA index_list('%s')", { table });
  indexInfos = this.runQuery(query, true);
  indexExists = false;

  for(indexInfo : indexInfos) {
    indexExists |= indexInfo[1] == index && indexInfo[2] == unique;
  }

  return indexExists;
}
