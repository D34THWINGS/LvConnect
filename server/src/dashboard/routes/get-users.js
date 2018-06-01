const { HR, BOARD } = require('../../roles');

module.exports = {
  method: 'GET',
  path: '/dashboard/users',
  config: { auth: 'session' },
  handler(req, res) {
    const { User } = req.server.plugins.users.models;

    User
      .find()
      .select('-password')
      .sort('lastName firstName')
      .then((users) => {
        res.view('get-users', {
          pageTitle: 'Partners list',
          users,
          adminRoles: [HR, BOARD],
        });
      });
  },
};
