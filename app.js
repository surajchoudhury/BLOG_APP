var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
var sassMiddleware = require('node-sass-middleware');


// routes

var indexRouter = require("./routes/index");
var articlesRouter = require("./routes/articles");
var usersRouter = require("./routes/users");


// connecting to database

mongoose.connect(
  "mongodb://sunny:sunny007@ds263307.mlab.com:63307/articles" || "mongodb://localhost/articles",
  {useNewUrlParser: true, useUnifiedTopology: true }, 
  err => {
    console.log("Connected", err ? err : true);
  }
);

// initializing express in app

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));

// session

app.use(session({
  secret:"secret",
  resave:false,
  saveUninitialized:false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// logged users

const loggedSession = require("./middleware/auth");
app.use(loggedSession.loggedSession);

// routes

app.use("/", indexRouter);
app.use("/articles", articlesRouter);
app.use("/users", usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
