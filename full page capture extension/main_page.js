chrome.storage.local.get(['user_email'], function(result) {
    console.log('Value currently is ' + result.user_email);
    if (result.user_email.length!=0) {
        document.getElementById("capture_content").style.display='block';
        document.getElementById("signin_container").style.display='none';
        document.getElementById("signup_container").style.display='none';
    }
});

document.getElementById("signin_button").addEventListener("click", sign_in); 
document.getElementById("signup_button").addEventListener("click", sign_up);
document.getElementById("logout_icon").addEventListener("click", logout); 
document.getElementById("Capture_icon").addEventListener("click",capture_tab); 


function capture_tab(){
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
       // document.getElementById("signin_heading").innerHTML=tabs[0].id;
        capture_content.initialize();    // calling intialize() method
       
     });
     
}

function firebase_credential(){
       // Your web app's Firebase configuration
       var firebaseConfig = {
        apiKey: "AIzaSyAhrhq7sUdTqrrCfSTrN103Ya3K3uo9hho",
        authDomain: "internshiptask-279711.firebaseapp.com",
        databaseURL: "https://internshiptask-279711.firebaseio.com",
        projectId: "internshiptask-279711",
        storageBucket: "internshiptask-279711.appspot.com",
        messagingSenderId: "885348933196",
        appId: "1:885348933196:web:8f0f6abd82a06c883f9ee9"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
}

function sign_up(){
    var form_data={}
    var elements=document.getElementById("signup_form").getElementsByTagName("input");
    for (let index = 0; index < elements.length; index++) {
        var element = elements.item(index);
        form_data[element.name]=element.value;
    }
    if (form_data.password!=form_data.re_password) {
        alert("password Not matched");
    }
    else if (form_data.email==0 || form_data.password==0 || form_data.re_password==0){
        alert("All Fields Required!");

    }
    else{
        firebase_credential();
        const auth=firebase.auth();
        auth.createUserWithEmailAndPassword(form_data.email,form_data.password)
        .then(function(user){
            alert("your registartion done Successfully!!");
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
    }
 }

 
 function sign_in(){
    var form_data={}
    var elements=document.getElementById("signin_form").getElementsByTagName("input");
    for (let index = 0; index < elements.length; index++) {
        var element = elements.item(index);
        form_data[element.name]=element.value;
    }
    firebase_credential();
    firebase.auth().signInWithEmailAndPassword(form_data.email, form_data.password)
    .then(function(user){
        alert("you logged in Successfully!!");
        document.getElementById("capture_content").style.display='block';
        document.getElementById("signin_container").style.display='none';
        document.getElementById("signup_container").style.display='none';
        chrome.storage.local.set({user_email: form_data.email}, function() {
        });
        
    })
    .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
       
    });
 }

 function logout(){
    document.getElementById("capture_content").style.display='none';
    document.getElementById("signin_container").style.display='block';
    document.getElementById("signup_container").style.display='block';
    chrome.storage.local.set({user_email:''}, function() {
    });
    
 }

