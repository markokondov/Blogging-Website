window.addEventListener("load", function () {

    //Fetches an array of all users in the database
    async function getUsernames() {
        const response = await fetch("/users");
        const usersArr = await response.json();
        return usersArr;
    };
    
    //Links the relevant HTML elements from the page.
    const usernameInput = document.querySelector("#username");
    const userSubmit = document.querySelector("#userSubmit");
    const takenMessage = document.querySelector("#takenMessage");
    const firstHeading = document.querySelector("#firstHeading");
    const password1 = document.querySelector("#password");
    const password2 = document.querySelector("#password2");
    const dontMatch = document.querySelector("#dontMatch");
    const changePassword = document.querySelector("#changePasswordSubmit");

    //Uses above fetch function to compare inputed username with usernames on database
    async function checkUsernameFree(newUsername) {
        const userArr = await getUsernames();
        let isTaken
        if (usernameInput.value) {
            userArr.forEach(function(user) {
                if (user.username == newUsername) {
                    isTaken = true;
                };
            });
        };  
        //If username matches a username on the database, disable the submit button, add the taken class to the input, and set a message to inform the user the username is taken
        if (isTaken) {
            userSubmit.setAttribute("disabled", true);
            usernameInput.classList.add("taken");
            takenMessage.innerHTML = "Username is already in use, try something else";
            userSubmit.innerHTML = "Please enter a unique username prior to submitting";
        } else {
            //Otherwise if the inputted username is not taken, and the button is disabled, remove all above added to restore functionality
            if (takenMessage.innerHTML == "Username is already in use, try something else") {
                userSubmit.removeAttribute("disabled");
                usernameInput.classList.remove("taken");
                takenMessage.innerHTML = "";
                if(firstHeading) {
                    userSubmit.innerHTML = "Create Account"
                } else {
                    userSubmit.innerHTML = "Change username"
                }
            };
        };
    };

    //Checks the password inputs match, disabling the submit button (either setting page or registration page) if they don't match
    function checkPasswordsMatch(password1, password2) {
        //If the passwords don't match - adds css class "taken" to the input, and disable the button
        if (password1.value !== password2.value) {
            password2.classList.add("taken");
            dontMatch.innerHTML = "Passwords don't match";
            //Checks what page (first heading only present on the registration page, therefore is undefined on settings)
            if (firstHeading) {
                userSubmit.setAttribute("disabled", true);
                userSubmit.innerHTML = "Please ensure passwords match prior to submitting";
            } else {
                changePassword.setAttribute("disabled", true);
            }
            //Otherwise, if going from 'disabled' to valid - make the form submittable
        } else {
            if (dontMatch.innerHTML == "Passwords don't match") {
                password2.classList.remove("taken");
                dontMatch.innerHTML = "";
                if (firstHeading) {
                    userSubmit.removeAttribute("disabled");
                    userSubmit.innerHTML = "Create account";
                } else {
                    changePassword.removeAttribute("disabled");
                }
            }
        }
    };

    //Adds username chaeck function to the input event listener (each time the input element has "input", run the function to check)
    usernameInput.addEventListener("input", async function() {
        await checkUsernameFree(usernameInput.value);
    });

    //Adds the password check function to the input event listener
    password2.addEventListener("input", function() {
        checkPasswordsMatch(password1, password2);
    });

});