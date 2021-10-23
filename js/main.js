$(document).ready(function() {

    // ======================= Creating new blog posts ========================

    // used to create original blog post objects - see setup.js for raw object property data
    class Blog {
        constructor(ref, title, adventure, location, difficulty, date, text) {
            this.ref = ref
            this.title = title
            this.adventure = adventure;
            this.location = location;
            this.difficulty = difficulty;
            this.date = date;
            this.text = text;
        }
    };  

    // creates objects to store the ID of clicked buttons
    class ClickedButton {
        constructor(buttonId) {
            this.buttonId = buttonId;
        }
    };

    // creates objects to store user comments
    class Comment {
        constructor(postId, contentValue) {
            this.postId = postId;
            this.contentValue = contentValue;
        }
    };

    // display to user 
    class UI {

        // called a) on load and b) on adding a bookmark
        // parameters - blog object array & boolean (false - add to logbook.html || true - add to bookmark.html)
        static addToDisplayTable(blogArray, boolean) { 

            blogArray.forEach(function(blog) {

                // create new table row element
                const row = document.createElement("tr");
                            
                // add blog object data to row
                row.innerHTML = `
                <td><a class="link-light" href="logbook.html#${blog.ref}">${blog.title}</a></td>
                <td>${blog.adventure}</td>
                <td>${blog.location}</td>
                <td>${blog.difficulty}</td>
                <td>${blog.date}</td>
                `;
            
                // if blog is bookmarked (button or from storage) - display in bookmark page  
                if (boolean === true) {
                    
                    // remove default settings
                    if ($("#bookmarks").hasClass("section-empty")) {
                        
                        $("#bookmarks").removeClass("section-empty");
                        $(".bookmark-div").show();
                        $(".bookmark-empty-msg").hide();
                    };

                    // bookmark page ID
                    row.id = blog.ref + "-bookmark";

                    // add to bookmark page table
                    let list = $("#bookmark-list");
                    list.append(row);

                    // debug
                    console.log("Post added to bookmark.html (" + blog.ref + ").");
                }
                else {
                    
                    // logbook page ID
                    row.id = blog.ref + "-Table";
                    
                    // else add to logbook table
                    let list = $("#logbook-list");
                    list.append(row);

                    // add blog section
                    UI.addBlogSection(blog);
                }  
            });


        };

        static addBlogSection(blog) {
        
            // ------ create blog content section  ------ 
            const section = document.createElement("section");
            section.id = blog.ref;
            section.classList.add("section-light");
            
            section.innerHTML = `
            <h2><b>${blog.title}</b></h2>
            <div class="section-description">
            <p><em>${blog.adventure} for ${blog.difficulty}</em></p>
            <p><button id="${blog.ref}-like" class="un-clicked like-button">Like</button></p>
            <p><button id="${blog.ref}-bookmark-button" class="un-clicked bookmark-me ">Bookmark</button></p>
            </div>
            <p>${blog.text}</p>
            <div id="${blog.ref}-comments" class="blog-tab">
                <p>${blog.location}</p>
                <p>${blog.date}</p>
            </div>`;

            // create comment section
            const inputSection = document.createElement("section");
            inputSection.id = blog.ref + "-comment" 
            inputSection.classList.add("section-dark");

            // comments will be added in comment-div by js
            inputSection.innerHTML = `
            <div id="${blog.ref}-comment-div">
                <p class="comment-heading">COMMENTS</p>
            </div>
            <div class="input-content">
                <p><input id="${blog.ref}-comment-text" class="comment-input" type="text"></p>
                <p><button id="${blog.ref}-comment-button" class="un-clicked comment-button ">Leave a Comment</button></p>
            </div>`;

            // ----- parallax image before blog post -----
            const logbookImage = document.createElement("div");
            logbookImage.classList.add("logbook-p-img1");
            logbookImage.classList.add("p-height");

            // place new blog post & parallax img before last parallax image in logbook
            $(logbookImage).insertBefore("#logbook-last-img");
            $(section).insertBefore("#logbook-last-img");
            $(inputSection).insertBefore("#logbook-last-img");

            console.log("Post added to logbook.html (" + blog.ref + ").");

        }; // end of addBlogSection

        static showAlert(newBookmarkArray) {

            // get post that user wants to bookmark
            let newBookmark = newBookmarkArray[newBookmarkArray.length-1]
            
            // get new bookmark count
            let bookmarkCount = newBookmarkArray.length;
            console.log("Current bookmark count: " + bookmarkCount);

            // create alert that shows a new bookmark has been added
            const alertSection = document.createElement("section");
            alertSection.id = "#alertMsg" 
            alertSection.className = ".alert";
            alertSection.classList.add("section-dark");

            // alert message, gives current bookmark count
            alertSection.innerHTML = `<p>Saved to your bookmarks.
            You now have ${bookmarkCount} bookmark item(s).</p>`;
            
            // add the alert and remove alert after 2 seconds
            const activePost = $("#" + newBookmark.ref)
            $(alertSection).insertAfter(activePost).delay(2000).slideUp(1000);
        };

    }; // end of UI

    class Store {

        // arrayKeyName = logbook array ("blogPosts") or bookmark array ("bookmarkedPosts") 
        // or liked buttons array ("likedButtons") or bookmarked buttons array ("bookmarkedButtons")
        // or comment button ("comments")
        static getArraysFromLocalStorage(arrayKeyName) {

            let blogArray;

            // check local storage for stored blog posts            
            if (localStorage.getItem(arrayKeyName) === null) {
                console.log("There are no " + arrayKeyName + " in local storage");
                blogArray = [];

                // if no items have been stored yet, show empty message
                if ($("#bookmarks").hasClass("section-empty")) {
                    
                    // hide table headings
                    $(".bookmark-div").hide();
                };
            } 

            // if there is a stored array, parse string from local storage
            else {
                blogArray = JSON.parse(localStorage.getItem(arrayKeyName));
            }

            return blogArray;
        };

        static checkForBookmarkDuplicates(newBookmarkRef) {
            
            // get current blog post and bookmarked post arrays from local storage 
            const logbookArray = Store.getArraysFromLocalStorage("blogPosts");
            let bookmarkArray = Store.getArraysFromLocalStorage("bookmarkedPosts");
            let newBookmarkArray = [];

            // if previous bookmarks have been stored, check for duplicates
            if (bookmarkArray.length > 0 && bookmarkArray.filter(function(e) {return e.ref === newBookmarkRef;}).length > 0) {

                // filter = if created array contains objects, it means that bookmark already exists 
                console.log("You are trying to duplicate a bookmark.");

                // bookmarkArray value does not change
                newBookmarkArray = bookmarkArray;
            }
            // if there are no previous bookmarks or if there are no duplicates present, update bookmarked array 
            else {

                // Use new bookmark ref (id) to find matching object in original logbook array
                let obj = logbookArray.find(obj => obj.ref == newBookmarkRef); 

                // push that blog object onto newBookmarkedArray.
                newBookmarkArray = bookmarkArray
                newBookmarkArray.push(obj);

                // local storage is updated, if new bookmark is not a duplication
                Store.updateLocalStorageBookmarkArray(newBookmarkArray);
            };

            return newBookmarkArray;
        }; 

        static updateLocalStorageBookmarkArray(newBookmarkArray) {

            // add updated stringified newBookmarkedArray to local storage
            localStorage.setItem("bookmarkedPosts", JSON.stringify(newBookmarkArray));

            // alert user & console
            console.log("Local Bookmark storage updated.");
            UI.showAlert(newBookmarkArray);
        };

    }; // end of Store class


    //  ============ Getting started - load these blog posts to local storage ===========

    // Blog post objects
    let blog1 = new Blog("blog1", "Creating this Website", "Coding", "Home", "Couch Potatoes", "14 October 2021", "Time consuming, but oh so worth it. Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptates similique, delectus sequi ea natus repudiandae molestias distinctio, repellat obcaecati dolore alias accusantium accusamus sunt, error exercitationem aperiam amet maxime.");
    let blog2 = new Blog("blog2", "Best Lazy Lawn Activity", "Boules", "Back Yard", "Couch Potatoes", "17 June 2021", "Best afternoon activity with family or friends. Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptates similique, delectus sequi ea natus repudiandae molestias distinctio, repellat obcaecati dolore alias accusantium accusamus sunt, error exercitationem aperiam amet maxime.");
    let blog3 = new Blog("blog3", "Highest Waterfall in Africa", "Day Hike", "Drakensberg", "Outdoor Enthusiasts", "9 August 2021", "You need a head for heights for this one, but I promise the views are spectacular. Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptates similique, delectus sequi ea natus repudiandae molestias distinctio, repellat obcaecati dolore alias accusantium accusamus sunt, error exercitationem aperiam amet maxime.");
    let blog4 = new Blog("blog4", "Snow for Africa", "Road Trip", "Underberg", "Couch Potatoes", "28 August 2021", "You need a head for heights for this one, but I promise the views are spectacular. Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptates similique, delectus sequi ea natus repudiandae molestias distinctio, repellat obcaecati dolore alias accusantium accusamus sunt, error exercitationem aperiam amet maxime.");
    let blog5 = new Blog("blog5", "Easy Day Hike for Gautengers", "Day Hike", "Magaliesburg", "Weekend Opportunists", "19 September 2021", "Perfect Gauteng day hike with fantastic natural pools as a reward after a long week. Lorem ipsum dolor sit amet consectetur adipisicing elit. A voluptates similique, delectus sequi ea natus repudiandae molestias distinctio, repellat obcaecati dolore alias accusantium accusamus sunt, error exercitationem aperiam amet maxime.");

    // push to blog array
    let blogArray = [];
    blogArray.push(blog1, blog2, blog3, blog4, blog5);

    // add to local storage
    localStorage.setItem("blogPosts", JSON.stringify(blogArray));


    // ================ EVENT: On load - add stored object arrays to UI =================
    
    // --------------------------- get arrays from storage ------------------------------

    let startingLogbookArray = Store.getArraysFromLocalStorage("blogPosts");
    let startingBookmarkArray = Store.getArraysFromLocalStorage("bookmarkedPosts");

    let likedButtonArray = [];
    let bookmarkedButtonArray = [];
    let commentsArray = [];

    likedButtonArray = Store.getArraysFromLocalStorage("likedButtons");
    bookmarkedButtonArray = Store.getArraysFromLocalStorage("bookmarkedButtons");
    commentsArray = Store.getArraysFromLocalStorage("comments")

    // ----------------------- load populated blog arrays to UI ------------------------- 

    if (startingLogbookArray.length != 0) {
        UI.addToDisplayTable(startingLogbookArray, false);
    };
    
    if (startingBookmarkArray.length != 0) {
        UI.addToDisplayTable(startingBookmarkArray, true);
    };

    // -------------------------- update liked buttons UI -------------------------------
   
    // change button display for previously liked buttons
    if (likedButtonArray.length != 0) {

        likedButtonArray.forEach(function(buttonObject) {

            $("#" + buttonObject.buttonId).html("Liked")
            $("#" + buttonObject.buttonId).removeClass("un-clicked").addClass("clicked");
        });

        console.log("Like buttons updated.");
    };

    // ------------------------ update bookmarked buttons UI ----------------------------

    // change button display for previously bookmarked buttons
    if (bookmarkedButtonArray.length != 0) {

        bookmarkedButtonArray.forEach(function(buttonObject) {

            $("#" + buttonObject.buttonId).html("Bookmarked")
            $("#" + buttonObject.buttonId).removeClass("un-clicked").addClass("clicked");
        });

        console.log("Bookmark buttons updated.");
    };

    // ----------------------------- update comments to UI ------------------------------

    function updateCommentUI(postId, contentValue) {

        let newCommentUI = `
        <div class="comment-content">
            <p class="comment-text">Current User:</p>
            <p class="comment-text">${contentValue}</p>
        </div>
        `;

        // append comments section to UI
        $("#" + postId + "-div").append(newCommentUI);

        }; 


    if (commentsArray.length != 0) {
        
        commentsArray.forEach(function(object) {

            // "blog4-comment-contentValue"

            let objectPostId = object.postId;
            let objectContentValue = object.contentValue;

            updateCommentUI(objectPostId, objectContentValue);

        });

        console.log("Comments updated.");
    }
    

    // ========================= EVENT: on click - bookmark button ======================

    $(".bookmark-me").click(function(e) {
        e.preventDefault();

        // --------------------------- Update Bookmarked Page ---------------------------

        console.log("Bookmark Click Event: " + $(this).parent().parent().parent().attr("id"));
        
        // get id of clicked on section
        let activeRef = $(this).parent().parent().parent().attr("id");

        // check for bookmark duplicates and update local storage if needed
        // alert is triggered if array needs to be updated
        newBookmarkArray = Store.checkForBookmarkDuplicates(activeRef);

        // add post to bookmark page display (true = display on bookmark page )
        UI.addToDisplayTable(newBookmarkArray, true)

        // --------------------- Update Bookmarked Button Array -------------------------
        
        // get id of clicked on button
        let bookmarkedButtonId = $(this).attr("id");
        
        // new bookmark ClickedButtonObject
        let newBookmarkedPost = new ClickedButton(bookmarkedButtonId); 

        // check liked array for duplicates and update liked array 
        if (bookmarkedButtonArray.length > 0 && bookmarkedButtonArray.filter(function(e) {return e.buttonId === bookmarkedButtonId;}).length > 0) {
            
            console.log("You are trying to duplicate a like.");
        }
        else {
            bookmarkedButtonArray.push(newBookmarkedPost)

            // add updated array to storage
            localStorage.setItem("bookmarkedButtons", JSON.stringify(bookmarkedButtonArray))
            console.log("bookmarkedButtonArray updated & added to local storage");
        };

        // ---------------------- Update Bookmarked Button UI ---------------------------

        let bookmarkedButton = e.target;

        bookmarkedButton.innerHTML = "Bookmarked";
        $(bookmarkedButton).removeClass("un-clicked").addClass("clicked");

    });  

    // ========================== EVENT: on click - like button =========================

    $(".like-button").click(function(e) {
        e.preventDefault();
        
        // ------------------------- Update Liked Button Array --------------------------

        // get id of clicked on button
        let likedButtonId = $(this).attr("id");
        console.log("Like Click Event: " + likedButtonId);   

        // new likedButtonObject
        let newLikedPost = new ClickedButton(likedButtonId);   

        // check liked array for duplicates and update liked array 
        if (likedButtonArray.length > 0 && likedButtonArray.filter(function(e) {return e.buttonId === likedButtonId;}).length > 0) {
            
            console.log("You are trying to duplicate a like.");
            // filter = if created array contains objects, it means that bookmark already exists
        }
        else {
            likedButtonArray.push(newLikedPost)

            // add updated array to storage
            localStorage.setItem("likedButtons", JSON.stringify(likedButtonArray))
            console.log("likedButtonArray updated & added to local storage");
        };

        // --------------------------- Update Liked Button UI ---------------------------

        let likedButton = e.target;

        likedButton.innerHTML = "Liked";
        $(likedButton).removeClass("un-clicked").addClass("clicked");
    });  
    

    // ========================= EVENT: on click - dropdown button ======================
    
    $(".dropdown-button").click(function(e) {
        e.preventDefault();

        $("#dropdown-menu").toggleClass("show-dropdown");
        
        $(".dropdown-button").toggleClass("un-clicked").toggleClass("clicked");
    });

    // --------------------------- EVENT: click outside menu button ---------------------

    // Close the dropdown menu if the user clicks outside of it
    $(window).click(function(e) {
        if (!e.target.matches(".dropdown-button")) {

            let dropdownItems = $(".dropdown-content");

            if (dropdownItems.hasClass("show-dropdown")) {
                dropdownItems.removeClass("show-dropdown");
            }

            $(".dropdown-button").removeClass("clicked").addClass("un-clicked");
        };
    });


    // ==================== EVENT: on click - contact form submit button =================

    $("#contact-form").submit(function(e) {
        // don't reload page
        e.preventDefault();

    });


    // ======================= EVENT: on hover - main index heading ======================

    $(".p-text-high").hover(function() {

        // chained animation effects to create feeling of mist
        $(".p-img1").fadeTo(3000, 0.6).fadeTo(3000, 1).fadeTo(2000, 0.5).fadeTo(3000, 1)

    });

    // ======================== EVENT: on click - leave a comment  =======================

    $(".comment-button").click(function() {
        
        // get comment object properties from html
        let postId = $(this).parent().parent().parent().attr("id");
        let contentValue = "";
        contentValue = $("#" + postId + "-text").val();

        console.log("postID: " + postId); 
        console.log("contentValue: " + contentValue); 

        if (contentValue != "") {

            // -------------------------- Update local storage -------------------------------
            let newComment = new Comment(postId, contentValue);
            commentsArray.push(newComment)

            localStorage.setItem("comments", JSON.stringify(commentsArray))
            console.log("commentsArray updated & added to local storage");

            // ------------------- change comment button & input UI --------------------------
            $(this).html("Posted!");
            setTimeout(() => {
                $(this).html("Leave a Comment");
            }, 2000);

            // ------------------- add comment to UI display -------------------------
            
            updateCommentUI(postId, contentValue);

            // reset input
            contentValue = $("#" + postId + "-text").val("");

        }
        else {
            alert("Please enter a comment first.");
        }
         
    });


}); //end of on load





