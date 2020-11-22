const { TestEventHandler } = require('./lib');
const NodeEnvironment = require('jest-environment-node');

module.exports = class TimeoutEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.testEventHandler = new TestEventHandler(config, context);
  }

  async handleTestEvent(event, state) {
    await this.testEventHandler.handleTestEvent(event, state);
  }
}
