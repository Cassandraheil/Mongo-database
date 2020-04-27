//clicking the scrape button
$(document).on("click", "#scrape", function () {
    $.ajax({
        method: "GET",
        url: "/scrape"
    })
        .then(function (data) {
            console.log("this confirms it went through", data);
            $.getJSON("/articles", function (data) {
                console.log("this should be json data", data)
                for (var i = 0; i < data.length; i++) {

                    var title = $("<h6 data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</h6>");
                    var summary = $("<p>" + data[i].summary+ "</p>")
                    var saveBtn = $("<button id='save' data-id='" + data[i]._id + "' class='btn btn-success' type='button'>Save Article</button> ");
                    var noteBtn = $("<button data-id='" + data[i]._id + "' class='note btn btn-primary' type='button'>Add/See Comment</button>" + "<br />");

                    $(".div").prepend(title, summary, saveBtn, noteBtn);

                }
            });

        });
});


//clicking to add a comment
$(document).on("click", ".note", function () {
    $("#notes").empty();
    var thisId = $(this).attr("data-id");
    document.getElementById("notes").style.display = "block";

    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        .then(function (data) {
            console.log("this is data.note", data.note);

            var articalTitle = $("<h4>" + data.title + "</h4>");
            var nameInput = $("<input id='nameInput' name='title' placeholder='username'>");
            var commentInput = $("<div class='form-group'><label for='exampleFormControlTextarea1' ></label><textarea class='form-control' placeholder='Your Comment'  id='bodyinput' rows='3'></textarea></div>");
            var save = $("<button data-id='" + data._id + "' id='savenote'>Save</button>");
            var cancel = $("<button data-id='" + data._id + "' id='cancel'>Cancel</button>");

// id='exampleFormControlTextarea1'

            $("#notes").append(articalTitle, nameInput, commentInput, save, cancel)

            if (data.note.title) {
                var name = $("<h6 class='name'></h6>")
                $(".name").val(data.note.title);
                // $(".name").val(data.note.body);
            }
        });
});
// clicking to save a comment
$(document).on("click", "#savenote", function () {
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("#nameInput").val(),
            body: $("#bodyinput").val()
        }
    })
        .then(function (data) {
            console.log("post to save data", data);
            alert("Your comment was added")
            document.getElementById("notes").style.display = "none";
        });
    $("#nameInput").val("");
    $("#bodyinput").val("");
});

// clicking to cancel out of note
$(document).on("click", "#cancel", function () {
    document.getElementById("notes").style.display = "none";
});



// save article btn
$(document).on("click", "#save", function () {
    var thisId = $(this).attr("data-id");

    console.log("save button was hit, id", thisId)

    $.ajax({
        method: "POST",
        url: "/saved/" + thisId,
        data: {
            saved: true
        }
    })
        .then(function (data) {
            console.log("save btn data", data);

        });

});