const express = require("express");
const app = express();
const session = require("express-session");
const bodyParser = require("body-parser");

// app.use(express.static("public"));
app.use(session({
    secret: 'secretpassword',
    resave: false,
    saveUninitialized: true,
}));
app.use(bodyParser.urlencoded({extended: false}));
app.get('/login', (req, res) => res.sendFile('auth.html', {root: __dirname}));
let port = 4001;
app.listen(port, () => console.log("App listening on port " + port));

/*  PASSPORT SETUP  */

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

app.get("/success", (req, res) => res.send("Welcome " + req.query.username));
app.get("/error", (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
    console.log("Serialize", user);
    cb(null, user);
});

passport.deserializeUser(function (user, cb) {
    console.log("Deserialize", user);
    // User.findById(id, function(err, user) {
    cb(null, user);
    // });
});

/* MONGOOSE SETUP */

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/passporttest", {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});
const UserDetails = mongoose.model("userInfo", UserDetail, "userInfo");

/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require("passport-local").Strategy;

passport.use(
    new LocalStrategy(function (username, password, done) {
        console.log("Running strategy", username)
        UserDetails.findOne(
            {
                username: username
            },
            function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (user.password !== password) {
                    return done(null, false);
                }
                return done(null, user);
            }
        );
    })
);

app.post(
    "/",
    passport.authenticate("local", {failureRedirect: "/error"}),
    function (req, res) {
        res.redirect("/?username=" + req.user.username);
    }
);

app.get('/logout',
    (req, res) => {
        req.logout();
        res.redirect('/');
    });


app.get("/", (req, res) => res.send(`<html lang="no">
    <p>Main page. User:${req.user && req.user.username}</p>
    <p><a href="/login">Login</a></p>
    <p><a href="/logout">Logout</a></p>
    <p><a href="/secretpage">Secret page</a></p>
    </html>`));


const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    else res.redirect('/login')
};

app.get('/secretpage',
    ensureAuthenticated,
    (req, res) => {
        console.log("secretpage has user: ", req.user);
        res.send(`SecretPage. User: ${req.user && req.user.username}`)
    }
);