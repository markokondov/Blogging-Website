const express = require("express");
const router = express.Router();


//Import the articles DAO for retrieving from the database information
const articlesDao = require("../modules/retrieve-articles-dao.js");
const usersDao = require("../modules/users-dao.js");
const commentsDao = require("../modules/comments-dao.js");


//Import make-array function
const makeArray = require("../modules/make-array.js");


//Home page route
router.get("/", async function (req, res) {

    res.locals.homePage = true;
    res.locals.script = `<script src="./client-side-home.js"></script>`;
    res.locals.pageTitle = "Homepage";  

    res.render("home");
});


module.exports = router;

//Works with the fetch() in client-side-home getArticles() function 
//to load selected articles to the homepage
router.get("/getArticles", async function (req, res) {
    
    const user = await usersDao.getUserWithAuthToken(req.cookies.authToken);
    
    const sortType = req.query.type;
    let results;

    //If the user has not chosen a sort value, or the sort value is 'time
    // sort the articles by time
    if (sortType == undefined || sortType == "time"){
        results = await articlesDao.getArticleOverviewTime();
    } 
    //If the user has chosen a category, the sort type will be a number relating
    //to that category id. Check if it is a number then get articles of that category
    else if (Number.isInteger(parseInt(sortType))) {
        results = await articlesDao.getArticleOverviewCategory(sortType);
    
    } 
    //If the user has chosen title, get articles ordered by title
    else if (sortType == "title") {
        results = await articlesDao.getArticleOverviewTitle();
    } 
    //If the user has chosen title, get articles favourited by the user only
        else if (sortType == "favourited"){
        results = await articlesDao.getArticleOverviewFavourited(user.id);
    } 
    //If the user has chosen author, order by the author's first name
    else if (sortType == "author") {
        results = await articlesDao.getArticleOverviewAuthor();
    } 
    //If the type is author, get all articles written by the user based on user id
    else if (sortType == "userId"){
        results = await articlesDao.getArticlesByUser(user.id);
    }
    
    res.json(results);
});



//Retrieves and renders a specific article (including comments) on the article page
router.get("/article", async function (req, res) {

    res.locals.script = `<script src="./client-side-article.js"></script>`;
    res.locals.pageTitle = "Article";

    //Check if there is a value the url for the article id. If not, use the 
    //articleCookie to get the article id
    let articleId = req.query.id;
    const articleCookie = req.cookies.article;
    if (articleId == undefined) {
        articleId = articleCookie.id;
    }

    //Load article
    const article = await articlesDao.getArticleByID(articleId);
    res.locals.article = article;

    //Load number of favourites
    const favs = await commentsDao.getFavsCount(articleId);
    res.locals.favsCount = favs;

    //Get user details from cookie then check if user has favourited this page. Update button
    const user = await usersDao.getUserWithAuthToken(req.cookies.authToken);
    let isFavourited;
    if (user != undefined) {
        isFavourited = await commentsDao.checkIfFavourited(user.id, articleId);
        if (isFavourited) {
            res.locals.isFavourited = "Unfavourite article";
        } else {
            res.locals.isFavourited = "Favourite article";
        }
    }

    //Check if the author of the article is also the user
    if (user != undefined) {
        if (user.id == article.authorId) {
            res.locals.ownArticle = true;
        }
    } else {
        res.locals.ownArticle = false;
    }

    //Load approved comments
    let comments = await commentsDao.getApprovedCommentsByArticleID(articleId);
    res.locals.comments = makeArray(comments);

    //Get article's categories
    const categories = await articlesDao.getCategoriesByArticleId(articleId);
    res.locals.categories = categories;

    //Create article cookie
    res.cookie("article", {
        id: articleId
    })

    res.render("article");
});


//Post new comment to article for approval by user
router.post("/submit-comment", async function (req, res) {

    //Get comment & article id from form
    const comContent = req.body.comment.trim();
    const articleId = req.body.id;

    //Get user details from cookie
    const user = await usersDao.getUserWithAuthToken(req.cookies.authToken);
    commentorId = user.id;

    //Create a cookie for the article id, so that the article will reload correctly
    //when redirected
    res.cookie("article", {
        id: articleId
    })

    //If the user has not written anything in the comment, send a message saying that the 
    //comment cannot be blank.
    if (comContent != "") {
        await commentsDao.setComment(comContent, articleId, commentorId);
        res.setToastMessage("Comment sent for approval");
        res.redirect("/article");
    } else {
        res.setToastMessage("Comment cannot be empty. Please try again.")
        res.redirect("/article");
    }
});


//When a user clicks favButton, checks if article is favourited
//and favourite it if it is not or unfavourite it if it is already
router.get("/favourite", async function (req, res) {

    //Get userId and articleID
    const user = await usersDao.getUserWithAuthToken(req.cookies.authToken);
    const userId = user.id;
    const articleCookie = req.cookies.article;
    const articleId = articleCookie.id;

    const isFavourited = await commentsDao.setFavourite(userId, articleId);
    const favTotal = await commentsDao.getFavsCount(articleId);

    //Send json to client-side-article.js to update button and screen
    const favInfo = {
        isFavourited: isFavourited,
        favTotal: favTotal
    }
    res.json(favInfo);
});


//When a user clicks an approve comment button, changes the value of the article 
//to approved in the database
router.get("/approveComment", async function (req, res) {

    //Get commentID from fetch
    const commentId = req.query.commentId;

    //Set comment as approved in database using commentId
    await commentsDao.setCommentApproved(commentId);
    res.json({ approved: "Comment approved" });
});


//When a user clicks an approve comment button, removes the comment from the database
router.get("/deleteComment", async function (req, res) {

    //Get commentID from fetch
    const commentId = req.query.commentId;

    //Set comment as approved in database using commentId
    await commentsDao.deleteComment(commentId);
    res.json({ approved: "Comment deleted" });
});


//When the articles page is loaded, gets the article content and passes it back to the client side
router.get("/articleContent", async function (req, res) {

    //Get articleId
    const articleCookie = req.cookies.article;
    const articleId = articleCookie.id;

    //Get all article information from the database by using the article id
    const article = await articlesDao.getArticleByID(articleId);
    const content = article.content;

    //Send article to client in json
    res.json(content);
});


module.exports = router;