const { expect } = require('chai');
const { noop } = require('lodash');

const [fixUser] = require('../fixtures/users');
const githubWorker = require('../../src/tasks/workers/github-org-user-link');
const testSetup = require('../setup');

describe.skip('Github user onboarding', () => {
  let server;
  let User;

  before(async () => {
    server = await testSetup();
    ({ User } = server.plugins.users.models);
  });

  after(() => server.stop());

  it('should add user to Github org', async () => {
    // When
    const user = await User.findOne({ email: fixUser.email });
    await githubWorker.initWorker(server)({ data: { user } }, noop);

    // Then
    const editedUser = await User.findOne({ email: fixUser.email });
    expect(editedUser.thirdParty.github).to.equal('success');
  });
});