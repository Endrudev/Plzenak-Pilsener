const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minut okno
    max: 5,                   //max počet požadavků v okně = 5
    message: { error: 'Příliš mnoho pokusů o přihlášení. Zkuste znovu později.'},
})

module.exports = loginLimiter