// imports
const express = require("express");
const router = express.Router();
const articlesDao = require("../modules/articlesDao.js");
const makeArray = require("../modules/make-array.js")
const retrieveArticlesDb = require("../modules/retrieve-articles-dao.js");
const commentsDao = require("../modules/comments-dao.js");
const { verifyAuthenticated } = require("../middleware/authentication-middleware.js");
const authMod = require("../modules/auth-modules.js")
const usersDao = require("../modules/users-dao.js")


// profile view

//To render other peoples profile's - to link - href will have to include ?id=${id} of profile to view.
router.get("/profile", async function (req, res) {
    res.locals.profile = true;
    res.locals.script = `<script src="./client-side-profile.js"></script>`;

    const id = req.query.id;

    //Sets userInfo variable to a user by specified id, or if none exists, sets it to the local users id
    let userInfo
    if (id) {
        //retrieve other user info based on ID provided
        userInfo = await usersDao.retrievePublicUser(`${parseInt(id)}`);
    } else {
        userInfo = res.locals.user;
    };

    //Adds ownProfile to locals in order to add functionality to the page only if the user is on their own profile page
    if (res.locals.user && (res.locals.user.id == userInfo.id)) {
        res.locals.ownProfile = true;
        //Add unapproved comments to profile page only if the user is on their profile page
        const unapprovedComments = await commentsDao.getUnapprovedComments(userInfo.id);
        res.locals.unapprovedComments = makeArray(unapprovedComments);
    } else {
        res.locals.ownProfile = false;
    }
    if (res.locals.ownProfile) {
        res.locals.pageTitle = "My Profile";
    } else {
        res.locals.pageTitle = `${userInfo.fullName}'s profile`;
    }

    //If userInfo not defined (browsed to profile without query.id while not logged out, or to a user that doesn't exist) - redirect to homepage sending message saying invalid id.
    if (!userInfo) {
        res.setToastMessage("Invalid user ID");
        res.redirect("/");
    }
    else {
        res.locals.userInfo = userInfo;

        //retrieve article information based on ID provided
        res.locals.articles = await retrieveArticlesDb.getArticlesByUser(userInfo.id);

        res.render("profile");
    }

});



// create-article form view
router.get("/createArticle", verifyAuthenticated, function (req, res) {

    res.locals.createArticle = true;
    res.locals.pageTitle = "Create a New Article";

    res.render("createarticle")
});



// SUBMIT article router
router.post("/submitArticle", async function (req, res) {

    //handling category array
    const categoryArray = makeArray(req.body.category);

    // make articles local
    res.locals.articles = {
        title: req.body.articleTitle,
        categories: categoryArray,
        overview: req.body.overview,
        content: req.body.content
    };

    // get user id
    const user = await usersDao.getUserWithAuthToken(req.cookies.authToken);
    const userId = user.id;

    // functions for inserting article and category into article and categories tbale in db
    await articlesDao.createArticle(req.body.articleTitle, req.body.overview, req.body.content, userId);

    // get article id from database to add to cookie and so that we can add categories to the database
    const result = await retrieveArticlesDb.getArticleIdWithInfo(userId, req.body.articleTitle, req.body.overview, req.body.content);
    const articleId = result.id;

    res.cookie("article", {
        id: articleId,
    });

    //Load categories into database 
    await articlesDao.setArticleCategory(categoryArray, articleId);

    // display in article view
    res.redirect("/article");
});



// EDIT article router
router.get("/editArticle", verifyAuthenticated, async function (req, res) {

    res.locals.script = `<script src="./client-side-categories.js"></script>`;

    // get id of previously loaded article
    const article = await retrieveArticlesDb.getArticleByID(req.query.id);

    // handling category array
    const categoryArray = makeArray(article.category);
    const selectedCategory = categoryArray;

    // make articles local
    res.locals.article = {
        id: req.query.id,
        title: article.title,
        category: selectedCategory,
        overview: article.overview,
        content: article.content
    };

    // make authorId local
    const authorId = res.locals.user.id;

    let articleId = req.query.id;
    const articleCookie = req.cookies.article;
    if (articleId == undefined) {
        articleId = articleCookie.id;
    }

    const categories = await retrieveArticlesDb.getCategoriesByArticleId(articleId);
    res.locals.categories = categories;

    res.render("editArticle");
});


// GET CATEGORIES router
router.get("/getCategories", async function (req, res) {

    const articleCookie = req.cookies.article;

    // get categories from db and make local then return as json to function in client-side
    const categories = await retrieveArticlesDb.getCategoriesIdByArticleId(articleCookie.id);
    res.locals.categories = categories;
    res.json(categories);
});


// SUBMIT EDITTED router
router.post("/submitEdittedArticle", async function (req, res) {

    // handling category array
    const categoryArray = makeArray(req.body.category);
    const selectedCategory = categoryArray;

    // make articles local
    res.locals.articles = {
        title: req.body.articleTitle,
        category: selectedCategory,
        overview: req.body.overview,
        content: req.body.content
    };

    // make authorId local
    const authorId = res.locals.user.id;

    // articleId
    let articleId = req.body.id;
    const articleCookie = req.cookies.article;
    if (articleId == undefined) {
        articleId = articleCookie.id;
    };

    // functions for inserting article and category into article and categories tbale in db
    await articlesDao.updateArticle(req.body.articleTitle, req.body.overview, req.body.content, authorId, articleId);
    await articlesDao.updateArticleCategory(articleId, selectedCategory);

    // display in article view
    res.redirect("/article");
});


router.get("/deleteArticle", async function (req, res) {

    // make article id local and use cookie if needed
    let articleId = req.query.id;
    const articleCookie = req.cookies.article;
    if (articleId == undefined) {
        articleId = articleCookie.id;
    }

    // delete using article id
    await articlesDao.deleteArticle(articleId);

    // return acknowledgement 
    res.setToastMessage("Article deleted successfully");
    res.redirect("/profile");
});

module.exports = router;