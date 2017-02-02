const Boom = require('boom');

module.exports = function authorize(req, res) {
  const { models: { Authorization, Application }, validScopes } = req.server.plugins.oauth;
  const { generateAuthorizationCode } = req.server.methods;
  const { redirect_uri: redirectUri, app_id: appId } = req.query;
  const user = req.auth.credentials;

  return Application.findOne({ appId })
    .then(application => Authorization.findOne({ user, application }).then(auth => [auth, application]))
    .then(([authorization, application]) => {
      if (!application.redirectUris.find(uri => redirectUri === uri)) {
        return Promise.reject(Boom.badRequest('Invalid redirect URI.'));
      }

      const scopes = req.payload.scopes.split(',');
      if (scopes.some(perm => !validScopes.find(scope => perm.startsWith(scope)))) {
        return Promise.reject(Boom.badRequest('Invalid scopes.'));
      }

      if (authorization === null) {
        return Authorization.create({
          user,
          application,
          allowedScopes: scopes,
        }).then(() => [application, scopes]);
      }

      return Authorization.findByIdAndUpdate(authorization._id, {
        $set: { allowedScopes: scopes },
      }).then(() => [application, scopes]);
    })
    .then(([application, scopes]) => generateAuthorizationCode(user, application, scopes))
    .then(authorizationCode => res.redirect(`${redirectUri}?code=${authorizationCode.code}`))
    .catch(error => res(Boom.wrap(error)));
};