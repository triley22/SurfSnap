$(document).ready(function() {
	firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("hi");
    // var displayName = user.displayName;
    // var email = user.email;
    // var emailVerified = user.emailVerified;
    // var photoURL = user.photoURL;
    // var isAnonymous = user.isAnonymous;
    // var uid = user.uid;
    // var providerData = user.providerData;
    // ...
  } else {
    // User is signed out.
    window.location = "/index.html";
  }
});
});