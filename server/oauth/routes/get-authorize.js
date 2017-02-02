const Joi = require('joi');
const displayPermissions = require('./methods/display-permissions');

module.exports = {
  method: 'GET',
  path: '/oauth/authorize',
  config: {
    auth: false,
    validate: {
      query: Joi.object().keys({
        app_id: Joi.string().required(),
        redirect_uri: Joi.string().required(),
      }),
    },
  },
  handler(req, res) {
    req.server.auth.test('session', req, (err, credentials) => {
      if (err) {
        return res.view('oauth-login', {
          pageTitle: 'Login',
          appId: req.query.app_id,
          redirectUri: req.query.redirect_uri,
        });
      }

      return displayPermissions(req, res, credentials);
    });
  },
};