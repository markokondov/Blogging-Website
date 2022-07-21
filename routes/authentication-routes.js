const { v4: uuid } = require("uuid");
const express = require("express");
const router = express.Router();

//Import the user DAO for updating the database with login/registration info
const usersDao = require("../modules/users-dao.js");

//Import bcrypt and set salt rounds for same
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Import middleware
const {
  verifyAuthenticated,
  checkNotLoggedIn,
} = require("../middleware/authentication-middleware.js");
const { checkMatch } = require("../modules/auth-modules.js");

// TODO - add check for whether confirm password input matches - ? back-end in /register, or front-end js

//render login page only if not logged in. If already logged in and manually navigates to the login page, redirects to home page.
router.get("/login", checkNotLoggedIn, function (req, res) {
  res.locals.login = true;
  res.locals.pageTitle = "Login page";
  res.render("login");
});

/*Takes input in login form to match with user from database - if matches then creates auth token with UUID package, 
adds this to user database, and creates a cookie so it can then be utilised in addUserToLocals middleware which is 
globally active*/
router.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const user = await usersDao.getUserWithCredentials(username, password);
  if (user) {
    const authToken = uuid();
    user.authToken = authToken;
    await usersDao.updateUser(user);
    res.cookie("authToken", authToken);
    res.redirect("/");
  } else {
    //set res.locals.user to falsy value, display invalid login and redirects back to login page.
    res.locals.user = null;
    res.setToastMessage("Invalid login");
    res.redirect("/login");
  }
});

//Displays the register view - utilising checkNotLoggedIn middleware (as shoudln't be able to register if already on an account)
router.get("/register", checkNotLoggedIn, function (req, res) {
  res.locals.script = `<script src="./client-side-auth.js"></script>`;
  res.locals.register = true;
  res.locals.pageTitle = "Create new account";

  res.render("register");
});

//Processes register information and utilises dao to add the users information on to the database
router.post("/register", async function (req, res) {
  //Sets the inputted password to a variable, and ensures the passwords match prior to proceeding further
  const initialPassword = req.body.password;
  if (!checkMatch(initialPassword, req.body.password2)) {
    res.setToastMessage("Passwords don't match");
    res.redirect("/register");
  } else {
    //Generates hash to store in the database instead of plain text password
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(initialPassword, salt, async function (err, hash) {
        //Once hash created, set this, and other user information inputted in the form as a JSON
        const user = {
          username: req.body.username,
          password: hash,
          fullName: req.body.fullName,
          DOB: req.body.DOB,
          avatar: req.body.avatar,
          description: req.body.description,
        };
        try {
          //Attempt to create a user based on above JSON
          await usersDao.createUser(user);
          res.setToastMessage(
            "Account successfully created! Please enter login details to continue."
          );

          res.redirect("/login");
        } catch (error) {
          //If above fails, set a toastMessage to show up when redirected, displaying invalid details.
          console.log(error);
          res.setToastMessage("Error! Invalid details");
          res.redirect("/register");
        }
      });
    });
  }
});

//Uses verifyAuthenticated middleware to ensure a user is logged in when making get request, clears authToken cookie, nad user information from locals to log user out
router.get("/logout", verifyAuthenticated, function (req, res) {
  res.clearCookie("authToken");
  res.locals.user = null;
  res.setToastMessage("Successfully logged out");
  res.redirect("/login");
});

//For fetching in client-side Javascript, and checking username not currently on database prior to posting form request
router.get("/users", async function (req, res) {
  try {
    const usersData = await usersDao.getAllUsers();
    res.json(usersData);
  } catch (error) {
    console.log(error);
  }
});

//Renders the settings view
router.get("/settings", verifyAuthenticated, function (req, res) {
  res.locals.settingsPage = true;
  //Links in the client-side-auth javascript file on the settings page
  res.locals.script = `<script src="./client-side-auth.js"></script>`;
  res.locals.pageTitle = "Settings";

  res.render("settings");
});

//Processes form to update username, and updates same in the database
router.post("/updateUsername", async function (req, res) {
  const user = res.locals.user;

  if (req.body.oldUsername == user.username) {
    user.username = req.body.newUsername;

    try {
      await usersDao.updateUser(user);
      res.redirect("/profile");
    } catch (error) {
      res.setToastMessage("Invalid new username");
      res.redirect("/settings");
    }
  } else {
    res.setToastMessage("Invalid previous username");
    res.redirect("/settings");
  }
});

//Processes form to update password (pending password matches users previous password)
router.post("/updatePassword", async function (req, res) {
  const user = res.locals.user;

  const match = await bcrypt.compare(req.body.oldPassword, user.password);

  if (!match) {
    res.setToastMessage("Incorrect previous password");
    res.redirect("/settings");
  } else {
    if (!checkMatch(req.body.password, req.body.password2)) {
      res.setToastMessage("Passwords don't match");
      res.redirect("/register");
    } else {
      bcrypt.genSalt(saltRounds, async function (err, salt) {
        bcrypt.hash(req.body.newPassword, salt, async function (err, hash) {
          user.password = hash;

          try {
            await usersDao.updateUser(user);
            res.redirect("/profile");
          } catch (error) {
            res.setToastMessage("Invalid password");
            res.redirect("/settings");
          };
        });
      });
    };
  };
});

//Processes form to update description in database
router.post("/updateDesc", async function (req, res) {
  const user = res.locals.user;
  user.description = req.body.newDescription;

  try {
    await usersDao.updateUser(user);
    res.redirect("/profile");
  } catch (error) {
    res.setToastMessage("Invalid description");
    res.redirect("/settings");
  }
});

//Processes form to update user's avatar choice
router.post("/updateAvatar", async function (req, res) {
  const user = res.locals.user;
  user.avatar = req.body.avatar;

  try {
    await usersDao.updateUser(user);
    res.redirect("/profile");
  } catch (error) {
    res.setToastMessage("Invalid avatar selection");
    res.redirect("/settings");
  }
});

//uses deleteUser function to delete account that is logged into - ? whether need to check user informaion prior?
router.get("/deleteAccount", async function (req, res) {
  await usersDao.deleteUser(res.locals.user.id);
  res.clearCookie("authToken");
  res.locals.user = null;
  res.setToastMessage("Account deleted successfully");
  res.redirect("/");
});

module.exports = router;
