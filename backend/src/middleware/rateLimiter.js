const rateLimit = require('express-rate-limit')
const { loginLimitMax } = require('../lib/loginLimit')

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minut okno
    max: loginLimitMax(process.env.LOGIN_RATE_LIMIT_MAX), //výchozí 5, lokálně víc (lib/loginLimit.js)
    message: { error: 'Příliš mnoho pokusů o přihlášení. Zkuste znovu později.'},
})

module.exports = loginLimiter
