const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next){
    const headerAuth = req.get('Authorization')

    if(!headerAuth || !headerAuth.startsWith('Bearer ')){
        return res.status(401).json({error : 'Uživatel nemá pro akci oprávnění.'})
    }

    const token = headerAuth.split(' ')[1]
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload 
        next()
    }catch(err){
        if(err.name === 'TokenExpiredError'){
            return res.status(401).json({error: 'Vypršela platnost tokenu.'})
        }else{
            return res.status(401).json({error: 'Neplatný token uživatele. Zkuste se znovu přihlásit.'})
        }
    }

}

module.exports = authMiddleware