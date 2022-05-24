const smsProvider = require('./service/smsProvider.js');
const captcha = require('./service/captcha.js');
const auth = require('./service/auth.js');

module.exports = app => {
  const services = { smsProvider, captcha, auth };
  return services;
};
