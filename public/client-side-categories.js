window.addEventListener("load", async function () {

    
    await checkCategories();

    // function to get categories from db (from router)
    async function getCategories() {
        const response = await fetch("/getCategories");
        const categoriesArray = await response.json();
        return categoriesArray;
    };
    
    const categories = await getCategories();
    
    
    // select checkboxes
    const checkboxes = document.querySelectorAll(".checkbox");

    
    // loop through loop to check db against all categories and check boxes for those which match
    async function  checkCategories() {
        for (let i = 0; i < checkboxes.length; i++){
            for (let j = 0; j < categories.length; j++){
                if (checkboxes[i].value == parseInt(categories[j].id)){
                    checkboxes[i].setAttribute("checked", true);
                }
            }
        }    
    };

});