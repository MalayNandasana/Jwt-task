const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');


const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decryptedString = cryptr.decrypt(token);

        const decoded = jwt.verify(decryptedString, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } 
    catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth