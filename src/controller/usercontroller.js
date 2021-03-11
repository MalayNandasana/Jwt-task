const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const auth = require('../middleware/auth')
const mailgun = require('mailgun-js')
const _=require('loadsh')
var DOMAIN = 'sandboxbf85762bcd604ccf880e53f23db686c8.mailgun.org';
var mg =mailgun({apiKey: process.env.API_KEY, domain: DOMAIN});

module.exports.users_post = async (req, res) => {
    try {
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({ user, token })
        } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.user_login_post=async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
        } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.user_logout_post=async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}

module.exports.user_forgetpassword_put=async(req,res)=>{
    try{
        const {email}= req.body;
        User.findOne({email}, (err, user)=>{
            
            const token = jwt.sign({_id: user._id.toString()}, 'thisismynewcourse',{expiresIn: '2'});
            const data = {
                from: 'Mailgun Sandbox <postmaster@sandboxbf85762bcd604ccf880e53f23db686c8.mailgun.org>',
                    to: email,
                    subject: 'Forget Password',
                    text: `Forget password ${token}`
                };

                return user.updateOne({resetLink: token},(error, success)=>{
                    if(err){
                        return res.status(400).json({error:"reset password link error"})
                    }else{
                          mg.messages().send(data, (error, body) => {
                           if(error){
                               return res.json({
                                   error: error.messages
                               })
                           }
                           return res.json({message: 'Email has been sent , kindly follow the instrunction'});
                        });
                    }
                
                })
             })
         }
         catch (e){
        res.status(500).send()
    }
}

module.exports.user_resetpassword_put=async(req,res)=>{

    const {resetLink, newPass }= req.body;
    if(resetLink){
        User.findOne({resetLink},(err,user)=>{
            if(err|| !user){
                return res.status(400).json({error:"User with this token does not exist or session timeout"})
            }
            const obj = {
                password: newPass,
                resetLink:''
            }
            user = _.extend(user, obj)
            user.save((err,result)=>{
                if(err){
                    return res.status(400).json({error:"reset password error"})
                }else{
                    return res.status(200).json({message:"Your password has been change"})
                }
            })
        })
    }
}