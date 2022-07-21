window.addEventListener("load", function () {

    let higherIndex = 6;
    let lowerIndex = 0;
    let partArticleArray = [];

    const divForArticles = document.querySelector("#divForArticles");
    const loadMoreButton = document.querySelector("#loadButton");
    loadMoreButton.addEventListener("click", loadArticles);

    loadArticles();

    
    //Loads article overview from the database onto the homepage six articles at a time
    async function loadArticles() {

        //Get value from url and remove ? to find what sorting selection type the user has chosen. If no selection, sort by time
        let url = window.location.search;
        let sortBy;
        if (url != "") {
            sortBy = url.slice(1, url.length);
        } else {
            sortBy = "time";
        }
        //get articles based on user chosen sort type
        let articles = await getArticles(sortBy);
        articles = makeArray(articles);

        //Split the articles array up into a section of 6, using the higher and lower index variables to keep track of which
        //articles are showing
        if (higherIndex < articles.length) {
            partArticleArray = articles.slice(lowerIndex, higherIndex);
            lowerIndex += 6;
            higherIndex += 6;
        } else {
            partArticleArray = articles.slice(lowerIndex, articles.length);
            loadMoreButton.remove();
        }

        //Loop through the articles and display them on the page if there are more articles to show
        for (let i = 0; i < partArticleArray.length; i++) {
            displayArticleOnPage(partArticleArray[i]);
        }
    }

    
    //Create one html article within a form element and add it to the parent div
    function displayArticleOnPage(article) {
        const articleForm = document.createElement("form");
        articleForm.classList.add("articleBtn");
        articleForm.setAttribute("action", "/article");
        articleForm.setAttribute("method", "get");
        articleForm.setAttribute("type", "submit");
        articleForm.innerHTML = `
            <button class="flexbox-animated button">
            <h3>${article.title}</h3>
            <p><em>${article.overview}</em></p>
            <p><strong>Written by ${article.fullName}</strong></p>
            <p><strong>Date:</strong> ${article.time}</p>
            <input type="hidden" name="id" value="${article.id}">
            </button>
        `
        divForArticles.appendChild(articleForm);
    }

    
    //Retrieve articles from the database, already sorted
    async function getArticles(sortBy) {
        let response = await fetch(`/getArticles?type=${sortBy}`);
        let articleArray = await response.json();
        return articleArray;
    }

    
    function makeArray(input) {
        if (input === undefined) {
            return [];
        }
        else if (Array.isArray(input)) {
            return input;
        }
        else {
            return [input];
        }
    }


});