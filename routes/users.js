const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

router.get('/register', (req, res) =>
{
    res.render('users/register')
})

router.post('/register',catchAsync(async (req, res) =>
{
    try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, (err) => {
        console.log(registeredUser)
        if(err) 
        {return next(err);
        }
    })
    req.flash('success', 'Welcome!!');
    res.redirect('/');
    }
    catch(e)
    {
        req.flash('error', e.message)
        res.redirect('register');
    }
    
}));

router.get('/login', (req, res) =>
{
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) =>
{
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    req.flash('success', 'welcome back!!')
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => 
{
    req.logout(() => {
    req.flash('success', 'good byee!!')
    res.redirect('/')})
})

module.exports = router;
