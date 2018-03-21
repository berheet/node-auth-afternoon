const express = require("express");
const session = require("express-session");
require("dotenv").config();
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const students = require("./students.json");

const { DOMAIN, CLIENT_ID, CLIENT_SECRET } = process.env;

const app = express();

app.use(
  session({
    secret: "string",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new Auth0Strategy(
    {
      domain: DOMAIN,
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: "/login",
      scope: "openid email profile"
    },

    function(accessToken, refreshToken, extraParams, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  });
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: "/students",
    failureRedirect: "/login",
    connection: "github"
  })
);

function authenticated(req, res, next) {
  if (req.user) {
    next;
  } else {
    res.status(401).json({ message: "Unable to Authenticate" });
  }
}

app.get("/students", authenticated, (req, res, next) => {
  res.status(200).json(students);
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
