Final project &ndash; A personal blogging system &ndash; Starter project
==========

## Introduction

Welcome to our webapp! This is an interactive blog, where users are able to write and edit their own articles, or to comment on and favourite articles written by others. On our home page, you can browse articles, sorting by date, author name, or title, or (if you're logged in) articles that you've favourited. Alternatively, you can select only articles of a particular category. To check the articles you've written and approve comments that other users have written on your articles, head to your profile page. If you want to edit your profile or log in details, these can be adjusted under settings. To edit or delete an article, click on the article that you've written and want to change. 

## Compulsory Features:

Under the "Create account" part of the website (found on the navbar) - the user has the ability to create a new account in order to access certain features of the site. These include commenting, favouriting articles, posting a new article and viewing their own profile. The information required for this user registration is a Full name, username, password, date of birth, description and choice of a set of 6 pre-defined avatars.

When choosing a username, each time the username input element is updated, the client will check whether there is already a username identical to this in the database. If there is, the colour of the input will change, and the submit button is disabled (along with a message informing the user that the username is already in use). Otherwise, if the username is available, the form will be able to be submitted provided other required fields are filled out.

Also, on the registration page, a user has to re-enter their password to decrease the risk of a typo, and then being unable to log in to their account if there has been a typo in creating their password. There is a similar function to check the passwords match - informing the user and disabling the submission button if the passwords don't match - meaning the user is not able to submit the form with passwords that don't match.

When creating an account - there is a pre-defined set of 6 avatars the user can choose from, representing different animals. The users avatar choice can be changed, and is displayed on their profile.

Once the user has an account - their inputted account information is then stored on the database. They will then need to log in using the "Log in" page, to succesfully log in to their account. Once logged in, a unique authentication token is created and the users database information is updated to include this authentication token, and the authentication token is stored as a cookie. Then, when browsing between pages, the users information is made accessible to the handlebars file on each page through retrieving from the database by the users authentication token. In order to log out - this authentication cookie is deleted, and the user information is no longer accessible to the handlebars file.

For security reasons - passwords are not stored as plain text in the database. Instead, they are encrypted using the bcrypt npm package. When a user creates a new password, a function is ran that generate a "salt" - a random string of characters. This salt is then added to the password input by the user, and then made into a "hash". Adding a salt ensures that even 2 of the same passwords are not stored the same in a database, making it much harder to crack. A hash is created by the string and the salt, and is essentially the result of an encrypting algorithm - making it very difficult to find out what the plain text password is through looking at it. Passwords are stored on the database as hashes, and the user then utilises bcrypt functionality when loging in to check whether their password matches the hash. If it does, they can login, otherwise they can't.

The homepage of the website displays a selection of articles/blog posts posted by all users. This is viewable whether or not a user is logged in or not. Displayed is the article title, author, category/categories and a brief overview of what the post is about. The user can then click into this to see the full content of the post. If a user is logged in, they can browse to their own profile page, and on this is a display of all the articles they have posted. Alternatively, whether logged in or not, a user is able to click on the name of the author (displayed on a post) to browse to the authors profile and see a list of their posts. Six article overviews load at a time - the user can press the 'load more' button to show more articles on the screen. 

When the user is logged in, they are able to create a new post, as well as edit and delete posts they have made. They can do this through browsing to the "Create Article" part of the navigation bar, or alternatively click the "Create Article" button on their own profile page.

When creating an article, the user must specify a title, overview and incldue the content of the article. When inserting content, the tinyMCE What You See Is What You Get (WYSIWYG) text editor was utilised. This allows users to insert more than just plain text, and view what it will look like when published prior to submitting the article (this includes bolding, headings, underline, italics, strikethrough etc.).

Once a user is logged in - they are able to browse to their account settings page. In this page, a user is able to change their username, password, account description, and their chosen avatar. This will then update the stored information in the database. The user also has the option to delete their account on this page. If the user clicks into the delete account option - they are prompted with a confirm message, informing them that if they delete their account, all articles they have made, comments they have made, and favourites they have made will be deleted.

Finally, during the design of the website, we ensured to keep a consistent look and feel through the use of a handlebars layout - with a consistent css file, and use of a lot of classes - which could then be used on other similar pages (for example, a lot of similarities in the appearance between the login, register, create account, account settings and create and edit article forms through use of similar css classes). We also included media queries, flexbox and grid layouts to ensure pages were responsive, as well as including a responsive navigation bar with a dropdown.

## Extra features 

We enabled users to be able to browse each others profiles, with a profile page showing the avatar, username, full name, date of birth and personal description of the user in a public view, along with an overview of each of the articles that that user has written which can be clicked to go to that article. On a specific article page, a user being able to click on the author's name to be taken to the profile page of that author. 

We created the ability for users to be able to comment on their own articles and on articles of other users if they are logged in, however comments need to be approved before they show on the article. Until a comment is approved, it is recorded in the database as isApproved = false. Once an comment is submitted, it appears on the author's profile page underneath their personal details for approval. The author can then choose to click a button to approve the comment, or a button to delete the comment. If they approve the comment, the comment will then show on articles. If they delete the comment, the comment is erased from the database. When a user comments on an article, a toast message lets the user know that the comment has been submitted for approval. 

We have added the ability for users to favourite or unfavourite an article that they like, if they are logged in. Our code checks whether an article has been favourited by the user already and a button either says "favourite" or "unfavourite", depending on the result. The sum of the amount of times an article has been favourited shows up on the article page. This updates in real time to show a user that their submission has been added or subtracted from the total, while the button for favouriting also updates it's value.

Additionally, we have added categories that a user assigns to an article that they write. These categories are displayed on the article page and can be utilised in our final extra feature, the two sort functions. 

We have added two sort functions to the article home page. Users can click the 'Sort by' button to sort the articles by time, author first name, or title; or they can choose to use the 'Filter category' button to filter the articles by category. If a user is logged in, they can also use the 'Sort by' button to display only the articles that they have favourited.  

## Instructions for use

Prior to running the programme - the user will have to create an SQLite database called "project-database.db". They will then have to run the "project-database-init-script.sql" file onto the database in order to create the required tables, and the dummy data (pre-installed user, and articles).

The user will then have to run 'npm install' in their terminal in order to install utilised npm packages on their local repository.

Once this is complete, the user can then start the server through 'npm run start', 'npm start', 'node app.js', utilising npm scripts on VSCode or any other valid way of running a node.js server.

There are 3 pre-registered accounts the user is able to log in with, which has already published some articles, comments and favourites - the details for these accounts are as follows:

    Username: user1
    Password: pa55word

    Username: user2
    Password: pa55word

    Username: user3
    Password: pa55word

Once logged in, the user should then be able to explore the full functionality of the website.
