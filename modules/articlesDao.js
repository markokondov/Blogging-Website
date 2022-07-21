const { urlencoded } = require("express");
const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const checkMatch = require("./auth-modules.js");

// add new article into the db
async function createArticle(title, overview, content, authorId) {
    const db = await dbPromise;

    const result = await db.run(SQL`
    INSERT INTO articles (title, overview, content, authorId, time) VALUES (
        ${title}, 
        ${overview},
        ${content},
        ${authorId},
        CURRENT_TIMESTAMP);`
    );
    
    return result;
};

// add chosen category into db
async function insertCategory(category) {
    const db = await dbPromise;

    const result = await db.run(SQL`
    INSERT INTO categories (name) VALUES (
        ${category});`
    );

    return result;
};

// update existing article in db with changes
async function updateArticle(title, overview, content, authorId, articleId) {
    const db = await dbPromise;

    const result = await db.run(SQL`
        UPDATE articles
        SET title = ${title},
        overview = ${overview},
        content = ${content},
        authorId = ${authorId},
        time = datetime('now','localtime')
        WHERE id = ${articleId};`);

    return result;
};

// update existing categories in db with changes 
async function updateArticleCategory(articleId, categoryIdArray) {
    const db = await dbPromise;

    await db.run(SQL`DELETE FROM articleCategory WHERE articleId = ${articleId};`);

    for (let i = 0; i < categoryIdArray.length; i++) {
        await db.run(SQL`
            INSERT INTO articleCategory VALUES
            (${articleId},${categoryIdArray[i]});`);
    
};
}

// delete article using article id
async function deleteArticle(articleId) {
    const db = await dbPromise;
    await db.run(SQL`DELETE FROM favourites WHERE articleId = ${articleId};`);
    await db.run(SQL`DELETE FROM comments WHERE articleId = ${articleId};`);
    await db.run(SQL`DELETE FROM articleCategory WHERE articleId = ${articleId};`);
    await db.run(SQL`DELETE FROM articles WHERE id = ${articleId};`);
};


// takes an array of category ids e.g. [3, 2, 7] and puts the values into the articleCategory table
async function setArticleCategory(categoryIdArray, articleId) {
    const db = await dbPromise;

    for (let i = 0; i < categoryIdArray.length; i++) {
        await db.run(SQL`
            INSERT INTO articleCategory VALUES
            (${articleId},${categoryIdArray[i]});`);
    }
}

module.exports = {
    createArticle,
    insertCategory,
    updateArticle,
    updateArticleCategory,
    deleteArticle,
    setArticleCategory
};