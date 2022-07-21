window.addEventListener("load", function () {

    //Get all 'approve' comment buttons and all delete buttons
    const buttonArray = document.querySelectorAll(".approveCommentBtn");
    const deleteBtnArray = document.querySelectorAll(".deleteCommentBtn");


    //For each of the approve buttons, add an event listener so that when the button is
    //clicked, the comment is marked as approved in the database. Delete the div containing that 
    //comment when done
    let approveButtonId;
    for (let i = 0; i < buttonArray.length; i++) {
        buttonArray[i].addEventListener("click", async function () {
            approveButtonId = buttonArray[i].value;
            approveComment(approveButtonId);
            const commentDiv = document.querySelector(`#id${approveButtonId}`);
            commentDiv.remove();
        });
    }


    //For each of the delete buttons, add an event listener so that when the button is
    //clicked, the comment is deleted from the database. Delete the div containing that 
    //comment when done
    let deleteButtonId;
    for (let i = 0; i < deleteBtnArray.length; i++) {
        deleteBtnArray[i].addEventListener("click", async function () {
            deleteButtonId = deleteBtnArray[i].value;
            deleteComment(deleteButtonId);
            const commentDiv = document.querySelector(`#id${deleteButtonId}`);
            commentDiv.remove();
        });
    }

    //Update the database to change approval to true
    async function approveComment(approveButtonId) {
        const response = await fetch(`/approveComment?commentId=${approveButtonId}`);
    }

    //Delete the comment from the database
    async function deleteComment(deleteButtonId) {
        const response = await fetch(`/deleteComment?commentId=${deleteButtonId}`);
    }
  
});