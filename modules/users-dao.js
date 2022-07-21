const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const bcrypt = require("bcrypt");

//function that uses an SQL update function using the users POSTed information to update the database
async function createUser(user) {
    const db = await dbPromise;

    const result = await db.run(SQL`
    INSERT INTO users (username, password, fullName, DOB, avatar, description) VALUES (
        ${user.username}, 
        ${user.password}, 
        ${user.fullName}, 
        ${user.DOB}, 
        ${user.avatar},
        ${user.description});`);

    //Assigns the automatically generated ID to the user (as id PK NOT NULL)
    user.id = result.lastID;
};

//Selects all information for a user, by their authToken (updated when logged in)
async function getUserWithAuthToken(authToken) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        SELECT * FROM users
            WHERE authToken = ${authToken};`);
        
        return user;
}

//Returns the users details as object by username and password
async function getUserWithCredentials(username, password) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        SELECT * FROM users
        WHERE username = ${username};`);
    
    if (user) {
        const match = await bcrypt.compare(password, user.password);
    
        if (match) {
            return user;
        }

    };
};

//Takes user object as parameter and updates database to include new information
async function updateUser(user) {
    const db = await dbPromise;

    await db.run(SQL`
        UPDATE users
            SET username = ${user.username}, 
            password = ${user.password}, 
            fullName = ${user.fullName}, 
            DOB = ${user.DOB}, 
            avatar = ${user.avatar}, 
            description = ${user.description}, 
            authToken = ${user.authToken}
            WHERE id = ${user.id};`);
};

//Returns array of all users in database
async function getAllUsers () {
    const db = await dbPromise;

    const users = await db.all(SQL`
        SELECT * FROM users;`);

    return users;
};

//For use in below function - returns array of articleIds by author, so able to delete all comments on a particular article prior to deleting
async function getArticleIdByUserId(userId) {
    const db = await dbPromise;
    const articleIds = await db.all(SQL`SELECT id FROM articles WHERE authorId = ${userId}`);

    return articleIds;
}

//Deletes user by ID (including all favourites, comments, and articles)
async function deleteUser(id) {
    const db = await dbPromise;
    await db.run(SQL`DELETE FROM favourites WHERE userId = ${id};`);
    await db.run(SQL`DELETE FROM comments WHERE commentorId = ${id};`);
    const articleIdArr = await getArticleIdByUserId(`${id}`);
    if (articleIdArr) {
        articleIdArr.forEach(async function(articleObj) {
            await db.run(SQL`DELETE FROM comments WHERE articleId = ${articleObj.id}`);
        });
    };
    await db.run(SQL`DELETE FROM articles WHERE authorId = ${id};`);
    await db.run(SQL`DELETE FROM users WHERE id = ${id};`);
};

//Retrieves public information about a user by specific id for rendering profile and user articles
async function retrievePublicUser(id) {
    const db = await dbPromise;

    const user = await db.get(SQL`SELECT id, username, fullName, DOB, avatar, description FROM users WHERE id = ${id};`)

    return user;
};

module.exports = {
    createUser,
    getUserWithAuthToken,
    getUserWithCredentials,
    updateUser,
    getAllUsers,
    deleteUser,
    retrievePublicUser
}