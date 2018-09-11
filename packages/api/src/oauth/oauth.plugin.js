const moment = require('moment');
const handlebars = require('handlebars');
const Boom = require('boom');
const models = require('./models');
const uuidHash = require('../uuid-hash');
const routes = require('./routes');
const getFormUrl = require('./routes/methods/get-form-url');

const contextBuilder = req => (!req.auth.credentials ? {} : {
  user: req.auth.credentials,
  logoutUrl: `/logout?redirect=${encodeURIComponent(getFormUrl(req))}`,
  redirectUri: req.query.redirect_uri,
  state: req.query.state,
});

module.exports = {
  name: 'oauth',
  version: '0.0.1',
  dependencies: ['mongodb', 'apps', 'users', 'hapi-auth-basic', 'hapi-auth-bearer-token'],
  async register(server, { accessTokenTTL, refreshTokenTTL, authorizationCodeTTL, scopes: validScopes }) {
    server.expose('models', models);
    server.expose('accessTokenTTL', moment.duration(accessTokenTTL).asSeconds());
    server.expose('validScopes', validScopes);

    const {
      AccessToken,
      RefreshToken,
      AuthorizationCode,
      Authorization,
    } = models;
    const { Application } = server.plugins.apps.models;

    server.views({
      engines: { hbs: handlebars },
      relativeTo: __dirname,
      layout: 'default',
      layoutPath: 'layouts',
      path: 'views',
      context: contextBuilder,
    });

    server.method('generateAccessToken', (user, application, scopes) => {
      const token = new AccessToken({
        user,
        isClientCredentialsToken: !user,
        application,
        expireAt: moment().add(moment.duration(accessTokenTTL)).toDate(),
        scopes,
      });
      return token.save();
    });

    server.method('generateRefreshToken', (user, application, scopes) => {
      const token = new RefreshToken({
        user,
        application,
        expireAt: moment().add(moment.duration(refreshTokenTTL)).toDate(),
        scopes,
      });
      return token.save();
    });

    server.method('generateAuthorizationCode', (user, application, scopes) => {
      const token = new AuthorizationCode({
        user,
        application,
        expireAt: moment().add(moment.duration(authorizationCodeTTL)).toDate(),
        scopes,
      });
      return token.save();
    });

    server.method('cleanupUserAuth', (user) => {
      const cleanupModels = [AccessToken, RefreshToken, AuthorizationCode, Authorization];
      return Promise.all(cleanupModels.map(model => model.remove({ user }).exec()));
    });

    server.method('uuidHash', uuidHash);

    server.expose('cleanupUserTokens', (user) => {
      const cleanupModels = [AccessToken, RefreshToken, AuthorizationCode];
      return Promise.all(cleanupModels.map(model => model.remove({ user }).exec()));
    });

    server.auth.strategy('application', 'basic', {
      async validate(req, appId, appSecret) {
        const application = await Application.findOne({ appId, appSecret });
        if (!application) {
          throw Boom.unauthorized('invalid_client');
        }
        return { isValid: true, credentials: application };
      },
    });

    server.auth.strategy('bearer', 'bearer-access-token', {
      async validate(req, bearer) {
        const token = await AccessToken.findOne({ token: bearer }).populate('user').exec();
        if (!token || (!token.user && !token.isClientCredentialsToken)) {
          throw Boom.unauthorized('invalid_token');
        }
        if (token.expireAt < new Date()) {
          throw Boom.unauthorized('token_expired');
        }
        return { isValid: true, credentials: token };
      },
    });

    server.auth.default('bearer');

    server.route(routes);
  },
};