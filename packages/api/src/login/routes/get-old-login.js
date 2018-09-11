module.exports = {
  method: 'GET',
  path: '/old/login',
  config: {
    auth: {
      mode: 'optional',
      strategies: ['session'],
    },
    plugins: { 'hapi-auth-cookie': { redirectTo: false } },
  },
  handler(req, res) {
    if (!req.auth.isAuthenticated) {
      return res.view('get-login', {
        title: 'Login',
      });
    }

    return res.redirect(req.query.redirect || '/old/dashboard');
  },
};