window.addEventListener("load", function () {


    document.querySelector("#favButton").addEventListener("click", async function () {
        await updateFavouriteFields();
    });

    //Updates in real time the total number of times an article has been favourited and the 
    //button for users to click if they want to favourite or unfavourite an article
    async function updateFavouriteFields() {
        const favInfo = await getFavInfo();

        //Update the text of the favButton depending on whether or not the user has it favourited
        if (favInfo.isFavourited == true) {
            favButton.innerText = "Unfavourite article";
        }
        else if (favInfo.isFavourited == false) {
            favButton.innerText = "Favourite article";
        }

        //Update the displayFavTotal with the current number of favourites 
        const displayFavTotal = document.querySelector("#displayFavTotal");
        displayFavTotal.innerHTML = `Favourited ${favInfo.favTotal}x <i class="material-icons">bookmark_border</i>`
    };

    //Check the database to see whether an article is favourited and how many times it's favourited
    async function getFavInfo() {
        const response = await fetch("/favourite");
        const isFavourited = await response.json();
        return isFavourited;
    }

});