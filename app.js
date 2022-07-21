
// Setup Express
const express = require("express");
const app = express();
const port = 3000;

// Setup Handlebars
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Setup body-parser
app.use(express.urlencoded({ extended: false, limit: '50mb'}));

// Setup cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Use the toaster middleware
app.use(require("./middleware/toaster-middleware.js"));

//Use addUserToLocals Middleware (if user is logged in, they have authToken cookie, add their information to locals so can be used in handlebars)
const { addUserToLocals } = require("./middleware/authentication-middleware.js");
app.use(addUserToLocals);

// Setup tinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// Setup routes
app.use(require("./routes/application-routes.js"));
app.use(require("./routes/authentication-routes.js"))
app.use(require("./routes/display-article-route.js"))

// Start the server running.
app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});