'use-strict';

//get elements
var btnLogout = document.getElementById('btnLogout');  
var addSurfSnap = document.getElementById('addSurfSnap');

//add photo
addSurfSnap.addEventListener('click', e => {
  e.preventDefault();
  const mediaCapture = document.getElementById('addSurfSnapMediaCapture');
  const savedURL = document.getElementById('addSurfSnapSavedURL');
  const uploader = document.getElementById('addSurfSnapUploader');
  const imagePreview = document.getElementById('addSurfSnapImagePreview');
  handleImageUpload(mediaCapture, savedURL, uploader, imagePreview);
});

var user, name, email, photoUrl, uid, emailVerified;

   //realtime event listener
   firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      console.log(firebaseUser.displayName);
    } else {
      console.log("logged out");
    }
  });

  // monitor auth state
  var auth = firebase.auth();

  auth.onAuthStateChanged(function(user) {
    if (user) {
      console.log('Signed In');
      var uid = user.uid;
      console.log(uid);
    } else {
      window.location = "/index.html";
    }
  });

   var metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        'caption': $("#photoCaption").val(),
      },
   };

    //get reference to storage service
    var storage = firebase.storage();

   function handleImageUpload (mediaCapture, savedURL, uploader, imagePreview) {
    //create storage reference from storage service
    var storageRef = firebase.storage().ref();
        
    var file = mediaCapture.files[0];
    var uploadTask = storageRef.child('oceanside/' + file.name).put(file, metadata);
        
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        //tracks progress
        function(snapshot) {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploader.value = progress;
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED:
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING:
                    console.log('Upload is running');
                    break;
            }
        },
        //error handling
        function(error) {
            switch (error.code) {
                // User doesn't have permission to access the object
                case 'storage/unauthorized':
                    break;
                // User canceled the upload
                case 'storage/canceled':
                    break;
                // Unknown error occurred, inspect error.serverResponse
                case 'storage/unknown':
                    break;
            }
        },
        //on completion
        function() {
            var imageURL = uploadTask.snapshot.downloadURL;
            savedURL.value = imageURL;
            imagePreview.setAttribute("src", imageURL);

            //push to firebase database
            var updates = {};
            var postKey = firebase.database().ref('photos/').push().key;
            var postData = {
              url: imageURL,
              caption: $("#photoCaption").val(),
            };
            updates['/photos/oceanside/' + postKey] = postData;
            firebase.database().ref().update(updates);
            //allow user to post to database only when upload is complete
            $("#uploadPhoto").show();
      });
}

function uploadPhoto() {
  alert("SurfSnap Successfully Saved!");
  window.location.replace("/beaches/oceanside.html");
}

$(document).ready(function() {
  $("#uploadPhoto").hide();
  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var token = firebase.auth().currentUser.uid;
    queryDatabase(token);
  } else {
    // User is signed out.
    window.location = "index.html";
  }
});
});

function queryDatabase(token) {
  firebase.database().ref('/photos/oceanside/').once('value').then(function(snapshot) {
    var photoObject = snapshot.val();
    var keys = Object.keys(photoObject).reverse();
    var currentRow;
    for (var i = 0; i < keys.length; i++) {
      var currentObject = photoObject[keys[i]];
      if (i % 2 === 0) {
        currentRow = document.createElement("div");
        $("#photoGallery").append(currentRow);
      }
      var col = document.createElement("div");
      $(col).addClass("col-lg-6");
      var image = document.createElement("img");
      image.src = currentObject.url;
      $(image).addClass("contentImage");
      var paragraph = document.createElement("paragraph");
      $(paragraph).html(currentObject.caption);
      $(paragraph).addClass("contentCaption");
      //like button
      var button = document.createElement("button");
      $(button).addClass("fa fa-thumbs-o-up fa-lg");
      $(button).on("click", function(event) {
        $(this).css('color', '#2f7ec8');
      });
      $(col).append(image, button, paragraph);     
      $(currentRow).append(col);
    }
  });
}