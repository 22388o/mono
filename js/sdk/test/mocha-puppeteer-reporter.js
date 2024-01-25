/**
 * @file A custom mocha reporter for use with puppeteer
 */

const Mocha = require('mocha');
const {
  EVENT_HOOK_BEGIN,
  EVENT_HOOK_END,
  EVENT_RUN_BEGIN,
  EVENT_DELAY_BEGIN,
  EVENT_DELAY_END,
  EVENT_RUN_END,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
  EVENT_TEST_RETRY
} = Mocha.Runner.constants;

/**
 * A custom mocha reporter that emits
 */
class MochaPuppeteerReporter extends Mocha.reporters.Spec {
  constructor(runner, opts) {
    super(runner, opts)

    const bubble = window.__bubble__
    const handle = event => [event, (...args) => bubble(event, ...args)]
    runner
      .on(...handle(EVENT_HOOK_BEGIN))
      .on(...handle(EVENT_HOOK_END))
      .on(...handle(EVENT_RUN_BEGIN))
      .on(...handle(EVENT_DELAY_BEGIN))
      .on(...handle(EVENT_DELAY_END))
      .on(...handle(EVENT_RUN_END))
      .on(...handle(EVENT_SUITE_BEGIN))
      .on(...handle(EVENT_SUITE_END))
      .on(...handle(EVENT_TEST_BEGIN))
      .on(...handle(EVENT_TEST_END))
      .on(...handle(EVENT_TEST_FAIL))
      .on(...handle(EVENT_TEST_PASS))
      .on(...handle(EVENT_TEST_PENDING))
      .on(...handle(EVENT_TEST_RETRY))
  }
}

/**
 * Export the mocha reporter
 */
module.exports = { MochaPuppeteerReporter }
