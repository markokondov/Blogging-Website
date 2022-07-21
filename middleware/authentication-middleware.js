const userDao = require("../modules/users-dao.js");

//Retrieves a user by authToken cookie, and adds this to the locals (to be run globally, where if theres an authToken and associated user, they will always be added to locals ensuring logged in)
async function addUserToLocals(req, res, next) {
    const user = await userDao.getUserWithAuthToken(req.cookies.authToken);
    res.locals.user = user;
    next();
}

//Checks user is logged in, in order to view pages where they need to be logged in to access
async function verifyAuthenticated(req, res, next) {
    if (res.locals.user) {
        next();
    }
    else {
        res.redirect("/login");
    }
}

//Checks a user is not logged in, for pages where a user has to be logged out to access
async function checkNotLoggedIn(req, res, next) {
    if (!res.locals.user) {
        next();
    }
    else {
        res.redirect("/");
    }
}


module.exports = {
    addUserToLocals,
    verifyAuthenticated,
    checkNotLoggedIn
}