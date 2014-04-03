function onCreated() {
  this.join("db_testing");
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

public function testTransactionsWithFunction() {
  this.inTransaction(_ = function() {
    this.createTable("test_table");
    this.assert(tableExists("test_table"));

    return false;
  });

  this.refute(tableExists("test_table"));

  this.inTransaction(_ = function() {
    this.createTable("test_table");
  });

  this.assert(tableExists("test_table"));

  this.dropTable("test_table");
}
