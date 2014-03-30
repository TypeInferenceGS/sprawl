/**
 * A basic xUnit-style test framework.
 * Currently supports running a suite of tests and basic assert functions.
 */

/** Format strings used for displaying test outcomes. */
const TEST_SUCCESS_FORMAT = "[PASS][%s]: %s.";
const TEST_FAILURE_FORMAT = "[FAIL][%s]: %s.";
const SUITE_SUCCESS_FORMAT = "[PASS][%s]: %d of %d.";
const SUITE_FAILURE_FORMAT = "[FAIL][%s]: %d of %d.";

/**
 * Runs alls functions beginning with the prefix 'test' and keeps track of
 * successes and failures and prints them to the user.
 */
public function runTests() {
  this.totalTestCount = 0;
  this.failureTestCount = 0;

  functions = this.getfunctions();

  printf("Starting test run for %s.", this.name);

  for(func : functions) {
    if (func.starts("test")) {
      this.testPassed = true;

      this.totalTestCount++;

      this.(@ func)();

      if (this.testPassed) {
        printf(TEST_SUCCESS_FORMAT, this.name, func);
      } else {
        this.failureTestCount++;
        printf(TEST_FAILURE_FORMAT, this.name, func);
      }
    }
  }

  if (this.failureTestCount == 0) {
    printf(SUITE_SUCCESS_FORMAT,
      this.name, this.totalTestCount, this.totalTestCount);
  } else {
    printf(SUITE_FAILURE_FORMAT, this.name,
      this.totalTestCount - this.failureTestCount, this.totalTestCount);
  }
}

/**
 * Asserts that the the expected outcome is true.
 * @param {boolean} Test that the asserted behavior was true.
 */
public function assert(expected) {
  this.testPassed &= expected;
}

/**
 * Asserts that the expected outcome is false.
 * @param {boolean} Test that the asserted behavior was false.
 */
public function refute(expected) {
  assert(!expected);
}
