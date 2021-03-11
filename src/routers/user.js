const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const auth = require('../middleware/auth')
const mailgun = require('mailgun-js')
const userController = require('../controller/usercontroller')
const _=require('loadsh')
var DOMAIN = 'sandboxbf85762bcd604ccf880e53f23db686c8.mailgun.org';


const router = new express.Router()

router.post('/users', userController.users_post);
router.post('/users/login', userController.user_login_post);
router.post('/users/logout',auth,userController.user_logout_post);
router.put('/users/forget-password',auth,userController.user_forgetpassword_put);
router.put('/users/reset-password',auth, userController.user_resetpassword_put);


// router.post('/users', async (req, res) => {
    // try {
    //     const user = new User(req.body)
    //     const token = await user.generateAuthToken()
    //     await user.save()
    //     res.status(201).send({ user, token })
    // } catch (e) {
    //     res.status(400).send(e)
    // }
// })
module.exports = router