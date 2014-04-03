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
