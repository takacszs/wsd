//callback solutions, not used in modern async methods!!

//setTimeout(() => console.log("time's upppp"), 3000)

//setInterval(() => console.log("interval time's upppp"), 2000)

// file fetch using a promise <- doesn't work cuz XMLHttpRequest is not built like this, it's for browsers
// let myPromise = new Promise(function(successMethod, failureMethod)
// {
//     let request = new XMLHttpRequest();
//     request.open('GET',"index.html")
//     request.onload = function () {
//         if(request.status == 200) successMethod(request.response)
//         else failureMethod("file not found..")
//     }
//     request.send();

// });

// myPromise.then(
//     function(value) {console.log(value)},
//     function(error) {console.log(error)}
// )

// async methods keyword
// The keyword async before a function makes the function return a promise:
async function myFunction() {
    return "Hello";
  }

// same as

// function myFunction() {

//     return new Promise.resolve("Hello")
// }

// usage of the method

myFunction().then(
    function(value) {console.log(value)},
    function(error) {console.log(error)}
)