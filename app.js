const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')
const ExpressError =  require('./utils/ExpressError');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');
const T = require('tesseract.js');
const fetch = require('node-fetch');

const userRoutes = require('./routes/users');
const summeryRoutes = require('./routes/summeries');

const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const summery = require('./models/summery');

mongoose.connect('mongodb://localhost:27017/summ-proj')

const db = mongoose.connection;

db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("database connected");
})
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('hello');
        cb(null, path.join(__dirname, '/public/uploads/'))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
})

const upload = multer({storage : fileStorageEngine})

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUnintialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => 
{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.post('/predict', (req, res) =>
{
    const textValue = req.body.inputField;
    fetch('https://634ed863f34e1ed82697c3be.mockapi.io/api/summary' )
    .then((response) => response.json())
    .then((data) => 
    {
        res.render('summary', {data});
    }
    );
})

app.post('/filesubmission' ,upload.single('new'), (req, res) =>
{
    console.log(req.file);
    let dataBuffer = fs.readFileSync(req.file.path);
 
     pdf(dataBuffer).then(function(data) {
    const result = data.text;
    console.log(result)
    res.render('fileconfirmation' , {result});
});
})

app.post('/imagesubmission' ,upload.single('img') , (req, res) =>
{
    let text;
    console.log(req.file);
    T.recognize(req.file.path, 'eng', {logger: e => console.log(e)})
    .then( (out) => 
    {
    // {console.log(out.data.text)
        text = out.data.text;
        console.log(text);
        return res.render('imageconfirmation.ejs', {text});
    }
    )
    .catch((e) => console.log(e))
    
});

app.use('/', userRoutes);
app.use('/summeries', summeryRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode=500,  message='somethisng not founds'} = err;
    if(!err.message) err.message = 'Oh No, Something went wrong!!'
    res.status(statusCode).render('error', {err});
    res.send('Oh boy, something went wronggg!!')
    console.log('came here')
    console.log(err)
})

app.listen('3000', (req, res) => {
    console.log('serving on port 3000');
});