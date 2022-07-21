const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");


//Get full details of one article by article id and username of author 
async function getArticleByID(id) {
    const db = await dbPromise;
    const article = await db.get(SQL`SELECT a.*, u.fullName FROM articles a, users u WHERE a.id = ${id} AND u.id = a.authorId;`);

    // delete/comment out from merge request. the above was updated by Marko during group zoom call
    // const article = await db.get(SQL `SELECT a.*, u.fullName FROM articles a, users u WHERE ${id} = a.id;`);
    return article;
};

//Get all articles written by the user
async function getArticlesByUser(id) {
    const db = await dbPromise;
    const articles = await db.all(SQL`SELECT * FROM articles WHERE authorId = ${id};`);
    return articles;
}

//Get id of article for a new article where you know the values but not the id number (returns id object)
async function getArticleIdWithInfo(authorId, title, overview, content) {
    const db = await dbPromise;
    const articleId = await db.get(SQL`SELECT id FROM articles WHERE 
        ${authorId} = authorId
        AND ${title}= title
        AND ${overview} = overview
        AND ${content} = content;`);
    return articleId;
}

//Get overview of all articles favourited by user
async function getArticleOverviewFavourited(userId) {
    const db = await dbPromise;

    const overview = await db.all(`SELECT a.*, u.fullName FROM articles a, users u, favourites f
                            WHERE a.authorId = u.id
                            AND f.userId = ${userId}
                            AND a.id = f.articleId
                            ORDER BY a.time DESC;`);
    return overview;
}

//Get overview of all articles sorted by author
async function getArticleOverviewAuthor() {
    const db = await dbPromise;

    overview = await db.all(`SELECT a.*, u.fullName FROM articles a, users u 
                            WHERE a.authorId = u.id
                            ORDER BY u.fullName ASC;`);
    return overview;
}

//Get overview of all articles sorted by title
async function getArticleOverviewTitle() {
    const db = await dbPromise;
    overview = await db.all(`SELECT a.*, u.fullName FROM articles a, users u 
                            WHERE a.authorId = u.id
                            ORDER BY a.title ASC;`);

    return overview;
}

//Get overview of all articles of a particular category
async function getArticleOverviewCategory(categoryId) {
    const db = await dbPromise;

    const overview = await db.all(`SELECT a.*, u.fullName FROM articles a, users u, articleCategory aC, categories c 
                        WHERE a.authorId = u.id
                        AND aC.articleId = a.id
                        AND aC.categoryId = c.id
                        AND c.id = ${categoryId}
                        ORDER BY a.time DESC`);
    return overview;
}

//Get overview of all articles sorted by sortby data provided (date or title)
async function getArticleOverviewTime() {
    const db = await dbPromise;
    overview = await db.all(`SELECT a.*, u.fullName FROM articles a, users u 
                            WHERE a.authorId = u.id
                            ORDER BY a.time DESC;`);
    return overview;
}

//Gets all categories that correspond to an article in an array of objects, with
//name as the property of the object eg [ { name: 'Data Science' }, { name: 'Machine Learning' } ]
async function getCategoriesByArticleId(articleId) {
    const db = await dbPromise;

    const categories = await db.all(`SELECT c.name FROM categories c, articles a, articleCategory aC
                        WHERE c.id = aC.categoryId
                        AND a.id = aC.articleId
                        and a.id = ${articleId};`);
    return categories;
}

//returns categories ID
async function getCategoriesIdByArticleId(articleId) {
    const db = await dbPromise;

    const categories = await db.all(`SELECT c.id FROM categories c, articles a, articleCategory aC
                        WHERE c.id = aC.categoryId
                        AND a.id = aC.articleId
                        and a.id = ${articleId};`);
    return categories;
}

// Export functions.
module.exports = {
    getArticleOverviewFavourited,
    getArticleOverviewTime,
    getArticleOverviewTitle,
    getArticleOverviewCategory,
    getArticleOverviewAuthor,
    getArticleByID,
    getArticleIdWithInfo,
    getArticlesByUser,
    getCategoriesByArticleId,
    getCategoriesIdByArticleId
};