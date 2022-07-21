const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");


//Get all comments from database based on article id
async function getApprovedCommentsByArticleID(id) {
    const db = await dbPromise;
    const comments = await db.all(SQL `SELECT c.content, u.fullName FROM comments c, users u 
        WHERE ${id} = articleId
        AND c.commentorId =  u.id
        AND c.isApproved = 1 
        ORDER BY c.time;`
    );
    return comments;
}


//Populate comment table from form on article page
async function setComment(comContent, articleId, commentorId){
    const db = await dbPromise;

    const result = await db.run(SQL `INSERT INTO comments (content, isApproved, articleId, commentorId, time) 
        VALUES (${comContent}, false, ${articleId}, ${commentorId}, CURRENT_TIMESTAMP);`
    );

}


//Populate favourites table with like, or remove like if is already liked
async function setFavourite(userId, articleId){
    const db = await dbPromise;

    let isFavourited = await db.get(SQL `SELECT COUNT(*) AS favs FROM favourites
        WHERE ${userId} = userId
        AND ${articleId} = articleId;`);
    
    if (isFavourited.favs == 1){
        await db.run(SQL `DELETE FROM favourites 
            WHERE userId = ${userId}
            AND articleId = ${articleId};`
        );
        isFavourited = false;
    } 
    else {
        await db.run(SQL `INSERT INTO favourites VALUES (${userId}, ${articleId});`);
        isFavourited = true;
    } 
    return isFavourited;
}

//Count how many times a particular article has been favourited
async function getFavsCount(articleId){
    const db = await dbPromise;

    let result = await db.get(SQL `SELECT COUNT(*) AS numFavs FROM favourites
        WHERE ${articleId} = articleId;`
    );

    return result.numFavs;
}

//Check if current article is favourited
async function checkIfFavourited(userId, articleId){
    const db = await dbPromise;

    let isFavourited = await db.get(SQL `SELECT COUNT(*) AS favs FROM favourites
        WHERE ${userId} = userId
        AND ${articleId} = articleId;`
    );

    if (isFavourited.favs == 1){
        isFavourited = true;
    } else {
        isFavourited = false;
    }

    return isFavourited;
}

//Get array of unapproved comments articles written by the current user
async function getUnapprovedComments(userId){
    const db = await dbPromise;
    
    const unapprovedComments = await db.all(SQL `SELECT c.*, a.title FROM comments c, articles a
        WHERE a.authorId = ${userId}
        AND a.id = c.articleId
        AND c.isApproved = false
        ORDER BY time DESC;`
    );
    
    return unapprovedComments;
}


//Change selected comment's status to approved
async function setCommentApproved(commentId){
    const db = await dbPromise;
    await db.run(SQL `UPDATE comments
        SET isApproved = true
        WHERE id = ${commentId};`
    );
}


//Delete selected comment from database
async function deleteComment(commentId){
    const db = await dbPromise;
    await db.run(SQL `DELETE FROM comments
        WHERE id = ${commentId};`
    );
}

    
// Export functions.
module.exports = {
    getApprovedCommentsByArticleID,
    setComment,  
    setFavourite,
    getFavsCount,
    checkIfFavourited,
    getUnapprovedComments,
    setCommentApproved,
    deleteComment
};