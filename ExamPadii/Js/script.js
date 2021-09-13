
function displayMsg(info) {
    var displayMsg = document.querySelector('#msg_section');

    displayMsg.style.borderColor = info.infoColor; // doesnt work fix it
    displayMsg.style.display = "block";
    displayMsg.innerHTML = info.infoMessage;

}

function removeMsg() {
    var displayMsg = document.querySelector('#msg_section');

    displayMsg.style.borderColor = ""; // doesnt work fix it
    displayMsg.style.display = "none";
    displayMsg.innerHTML = "";

}

function checkPasswordStrength() {

    var password = document.querySelector("#registerForm").elements['Password'].value;

    // regex for differnt password levels of strength
    // medium strength - at least 8 characters but does not contain a special character
    var mediumPasswordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

    // strong strength - at least 8 characters and contains at least a number, uppercase letter, lowercase letter and a special symbol
    var strongPasswordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;

    var info = { 'infoCode': null, 'infoMessage': null, 'infoColor': null };

    // this checks doesn't break the code it simply suggests that you use a stronger password

    if (strongPasswordRegex.test(password)) {

        info.infoColor = "green";
        info.infoCode = "102";
        info.infoMessage = "Password strength - Strong";

    } else if (mediumPasswordRegex.test(password)) {

        info.infoColor = "blue";
        info.infoCode = "101";
        info.infoMessage = "Password strength - Medium";

    } else {

        info.infoColor = "red";
        info.infoCode = "103";
        info.infoMessage = "Password strength - Weak";

    }

    // displays error message
    displayMsg(info);

    // removes error message
    setTimeout(() => {
        removeMsg();
    }, 3500);

}

function validate(data) {

    var error = { 'errorCode': null, 'errorMessage': null };

    // regex for email validation
    var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (data.email.trim().length == 0) {

        error.errorCode = "002";
        error.errorMessage = "email field is required";

        return error;

    }

    if (!emailRegex.test(data.email)) {

        error.errorCode = "003";
        error.errorMessage = "email is invalid";

        return error;

    }

    if (data.password.length < 8) {

        error.errorCode = "001";
        error.errorMessage = "Password is too short";

        return error;

    }

    if (data.confirmPassword && data.password != data.confirmPassword){

        error.errorCode = "004";
        error.errorMessage = "Password mismatch error";

        return error;

    }

    return;

}


function openUrl(destination) {

    var endUrlRegex = /.*\//;
    const windowUrl = window.location.href.match(endUrlRegex, '')[0];

    // redirects to login page
    window.open(`${windowUrl}${destination}`, '_self');

}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

    apiKey: "AIzaSyAU1_JRbQOn4CjKzMiJJkLAhJUOyjfhlys",
    authDomain: "exampadii.firebaseapp.com",
    databaseURL: 'https://exampadii-default-rtdb.firebaseio.com',
    projectId: "exampadii",
    storageBucket: "exampadii.appspot.com",
    messagingSenderId: "1030266139833",
    appId: "1:1030266139833:web:f68452ba9baba458fe1768"

};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// enable form once page is ready
var formFieldset = document.querySelector("#formFieldset");

if (formFieldset) formFieldset.removeAttribute("disabled");

// store sign up form object
var signUpForm = document.querySelector("#registerForm");

// checks what page is currently open
if (signUpForm != undefined && signUpForm != null) {

    // get values of inputs from form
    var firstName = signUpForm.elements['FirstName'];
    var lastName = signUpForm.elements['LastName'];
    var email = signUpForm.elements['EmailID'];
    var tel = signUpForm.elements['MobileNumber'];
    var gender = signUpForm.elements['Gender'];
    var password = signUpForm.elements['Password'];
    var confirmPassword = signUpForm.elements['ConfirmPassword'];

    // to store timeout event
    var timeout;

    password.onkeyup = () => {

        // this gets reset everytime so it will only fire after 3 seconds of inactivity
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(checkPasswordStrength, 3500);

    }

    // this compares the both password to see if they are a match
    confirmPassword.onkeyup = () => {

        if (confirmPassword.value != password.value) {
            
            // send back to front-end and prevent from from submitting
            var error = {'infoCode': 104, 'infoColor': 'red', 'infoMessage': 'Password Mismatch'};
            displayMsg(error);

            setTimeout(() => {
                removeMsg();
            }, 3500);

        }

    }

    signUpForm.onsubmit = (e) => {
        e.preventDefault();

        var dateOfBirth = signUpForm.elements['BirthDay'].value.toString() + '-' + signUpForm.elements['BirthdayMonth'].value.toString() + '-' + signUpForm.elements['BirthdayYear'].value.toString();

        var data = { 'email': email.value, 'password': password.value, 'confirmPassword': confirmPassword.value };

        err = validate(data);

        if (err) {
            console.log(err.errorCode + ": " + err.errorMessage);

            return;
        }

        auth.createUserWithEmailAndPassword(data.email, data.password)
            .then(userCrendentials => {

                var userObject = userCrendentials.user;

                var userId = userObject.uid;

                // var displayPhoto = userObject.photoURL;
                // var displayName = user.displayName;
                // var email = userObject.email;

                // this creates a table/json level called users with uniques layers marked by userID, if you remove userid it will overwrite the data
                db.ref('users/' + userId).set({
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    telephone: tel.value,
                    gender: gender.value,
                    dob: dateOfBirth, // compulsory to put this ending comma
                }, err => {
                    if (err) {
                        window.alert(err);

                        // this deletes the entry form that was just made incase of an error
                        auth.currentUser.delete();

                        return;
                    } else {
                        //
                    }
                })
                    .then(() => {

                        // figure out how to change password later

                        window.alert("User Created Successfully");

                        signUpForm.reset();

                        // redirect to maybe another page, the _self means open in current tab
                        openUrl('index.html');

                    })
                    .catch(err => {
                        if (err) {
                            console.log(err) 
                        }
                    })

            })
            .catch(err => {
                var errorCode = err.code;
                var errorMessage = err.message;

                window.alert(errorCode + ": " + errorMessage);
            })

    }

}


// store login form object
var logInForm = document.querySelector("#logInForm");

// checks what page is currently open
if (logInForm != undefined && logInForm != null) {

    // get values of inputs from form
    var email = logInForm.elements["emailInput"];
    var password = logInForm.elements["passwordInput"];

    logInForm.onsubmit = (e) => {
        e.preventDefault();

        var data = { 'email': email.value, 'password': password.value }

        err = validate(data)

        if (err) {
            console.log(err.errorCode + ": " + err.errorMessage);

            return;
        }

        auth.signInWithEmailAndPassword(data.email, data.password)
            .then(userCrendentials => {

                var userObject = userCrendentials.user;

                console.log("User Logged In Successfully");

                // some basic info you might need for additional info log the userObject to the console
                // var userId = userObject.uid;
                // var displayPhoto = userObject.photoURL;
                // var displayName = user.displayName;
                // var email = userObject.email;

                // redirect to maybe another page, the _self means open in current tab
                openUrl('index.html');

            })
            .catch(err => {
                var errorCode = err.code;
                var errorMessage = err.message;

                // debugging purposes
                console.log(errorCode + ": " + errorMessage);
            })

    }

}

// for logout function
// auth.signOut()
//     .then(() => {

//          console.log("User Logged out successfully");

//     })
//     .catch(err => {

//     })


// call exam function
var examBody = document.querySelector("#examPage");
if (examBody != null && examBody != undefined) {
    getExams();
}

function checkCurrentUser() {

    // for any page that needs the user's info
    auth.onAuthStateChanged(user => {

        if (user) {

            // info will be available in user object
            return user;

        } else {
            
            openUrl('login.html');
            
        }

    });

}

function parseUrl(params) {
    
    var baseURL = window.location.href.toString();
    var urlObject = new URL(baseURL);

    // matches and returns the queried parameter
    return urlObject.searchParams.get(params);

}

// Exam's page logic
var selectedAnswers = {};
var correctAnswers = {};
function nextQuestion(cid) {
    
    if (cid == 39) {
        // last question do nothing
    } else {
        
        selectedOption = document.querySelector('#formfor'+cid).elements['ans'].value;
        selectedAnswers[cid] = selectedOption;

        var nextQuestion = cid + 1;
        
        //hide current question
        document.querySelector('#q'+cid).classList.add('hide');

        if (selectedAnswers[cid] != '') {
            // add green background
            document.querySelector('#qNoBtn'+cid).classList.add('answered');
        }

        // make next question visible
        document.querySelector('#q'+nextQuestion).classList.remove('hide');

    }

}

function prevQuestion(cid) {
    
    if (cid == 0) {
        // last question do nothing
    } else {
        
        selectedOption = document.querySelector('#formfor'+cid).elements['ans'].value;
        selectedAnswers[cid] = selectedOption;

        var prevQuestion = cid - 1;
        
        //hide current question
        document.querySelector('#q'+cid).classList.add('hide');

        if (selectedAnswers[cid] != '') {
            // add green background
            document.querySelector('#qNoBtn'+cid).classList.add('answered');
        }

        // make next question visible
        document.querySelector('#q'+prevQuestion).classList.remove('hide');

    }

}

function jumpTo(qid) {
    
    // hide all questions
    for (let index = 0; index < 40; index++) {
        const element = document.querySelector('#q'+index);
        
        if (element.classList.contains('hide') == false) {

            // record option
            selectedOption = document.querySelector('#formfor'+index).elements['ans'].value;
            selectedAnswers[index] = selectedOption;

            element.classList.add('hide');

            if (selectedAnswers[index] != '') {
                // add green background
                document.querySelector('#qNoBtn'+index).classList.add('answered');
            }

            break;
        }
    }

    // make new element visible
    document.querySelector('#q'+qid).classList.remove('hide');

}

function preSubmit() {
    
    // this returns either true or false change this to a better pop up
    if (window.confirm("Are you sure?"))
    {
        submitExam();
    } else {
        // do nothing
    }

}

function submitExam() {
  
    // appends the current question's answer before submission
    var questions = document.getElementsByClassName('examContainer');

    for (let index = 0; index < questions.length; index++) {
        const element = questions[index];
        if (element.classList.contains('hide') == false) {

            // record option
            selectedOption = document.querySelector('#formfor'+index).elements['ans'].value;
            selectedAnswers[index] = selectedOption;

            if (selectedAnswers[index] != '') {
                // add green background
                document.querySelector('#qNoBtn'+index).classList.add('answered');
            }

            break;
        }
    }

    const Time = 40 * 60;
    const Score = 40;

    var score = 0;
    var len = Object.keys(selectedAnswers).length;

    for (let index = 0; index < len; index++) {
        const opt = selectedAnswers[index];

        if (opt == correctAnswers[index]) {
            score += 1;
        }
    }

    var time = document.querySelector('#time').textContent;
    time = time.split(':');

    var minInSecs = parseInt(time[0]) * 60;
    var secs = parseInt(time[1]);

    // calculate the time usage
    var remainingTime = minInSecs + secs;
    var elapsedTime = Time - remainingTime;

    // you can use these values to say things like work on your speed or work on your accuracy
    var timeEfficiency = (remainingTime / Time) * 5; // on a scale of 5
    var accuracy = (score / Score) * 5; // on a scale of 5

    // based on 40 questions
    // based on a 40 minutes exam
    if (score < 10 && elapsedTime < (10 * 60)) {
        timeEfficiency = 1; // just assigning it by default
    }

    var finalResult = timeEfficiency + accuracy;

    // store scores on database
    var subject = parseUrl('subject');

    // add AI suggestions
    var suggestions;

    if (finalResult >= 8.5) {
        suggestions = `Good Job, ${subject} is your thing!🔥🔥`;
    } else {

        // the person probably rushed
        if (timeEfficiency > accuracy && timeEfficiency > 3.5) {
            suggestions = 'Don\'t be in haste take your time.😉';
        } else if (accuracy > timeEfficiency && accuracy > 3.5) {
            // the person used too much time
            suggestions = `That was nice but you need to work on your speed`;
        } else {
            suggestions = `Try studying more and take another test, Good Luck.`;
        }

    }

    if (subject != null) {

        auth.onAuthStateChanged(user => {

            if (user) {
                
                var userId = user.uid;

                const recordsDB = db.ref('records/' + userId + '/');

                recordsDB.get()
                    .then(snapshot => {
                        
                        // this sets the new recordId but if there is something it gets overwritten
                        var recordId = 0;

                        if (snapshot.exists()) {
                            
                            // update the recordId to be 1 + the last one
                            // the length of the array starts from 1 but the index starts from zero that's why i didnt add 1 to it
                            recordId = snapshot.val().length;

                        }

                        var timeTaken = new Date();

                        db.ref('records/' + userId + '/' + recordId).set({
                            examName: subject.toString(),
                            score: score.toString(),
                            timeUsed: elapsedTime.toString(),
                            rating: finalResult.toString(),
                            AI_suggestions: suggestions,
                            date: timeTaken.toString(),
                        }, err => {
                            if (err) {

                                console.log(err);

                            }
                        })
                            .then(() => {

                                // result modal goes here
                                // var modal = document.getElementById("myModal");

                                // // removes additional text from date
                                // var date = date.replace(/\sGMT.*/, '');

                                // var percentageScore = (score / 40) * 100;
                                // percentageScore = percentageScore.toFixed(2);

                                // var percentageRating = (rating / 10) * 100;
                                // percentageRating = percentageRating.toFixed(2);

                                // modal.innerHTML += `

                                //     <div class="historyCard" style="background: white;">
                                //         <p class="historySubject"><b>${examName}</b></p>
                                //         <p class="historyDate"><small>${date}</small></p>
                                //         <br>
                                //         <div class="historyallScore">
                                //             <span class="hiScore">
                                //                 <h4>Normal Score</h4>
                                //                 <h2 class="historyNo">${score}/40</h2>
                                //             </span>
                                //             <span class="hiScore">
                                //                 <h4>Percentage Score</h4>
                                //                 <h2 class="historyNo">${percentageScore}%</h2>
                                //             </span>
                                //             <span class="hiScore">
                                //                 <h4>Rating Score</h4>
                                //                 <h2 class="historyNo">${percentageRating}%</h2>
                                //             </span>
                                //         </div>    
                                //         <div>
                                //             <h4 class="AIsuggest" style="text-align: center;">${AI_suggestions}</h4>
                                //         </div>
                                //         <button style="margin-left: 25vw;" class="takeExam" onclick="openUrl('history.html')">Continue</button>
                                //     </div>   

                                // `;

                                // modal.style.display = "flex";

                                // window.onclick = function(event) {
                                //     if (event.target == modal) {
                                //         openUrl('history.html')
                                //     }
                                // }
                                
                                openUrl('history.html')
                            })
                            .catch(err => {
                                if (err) {
                                    console.log(err) 
                                }
                            })
        
                    })
                    .catch(err => {
                        if (err) {
                            console.log(err) 
                        }
                    })
    
            } else {
                
                openUrl('login.html');
                
            }
    
        });

    }   

}

function countDown() {

    var time = document.querySelector('#time');

    let timeLeft = setInterval(() => {
        var t = time.textContent;

        t = t.split(":");

        min = parseInt(t[0]);
        sec = parseInt(t[1]);

        if (sec > 0) {
            sec--;
        } else if (min > 0) {
            min--;
            sec = 59;
        } else {
            submitExam();
            clearInterval(timeLeft);
        }

        // to append additional zero
        min = '0'.repeat(2 - min.toString().length) + min;
        sec = '0'.repeat(2 - sec.toString().length) + sec;

        // add red effect
        if (parseInt(min) <= 5 && !(time.classList.contains('hurryUp'))) {
            time.classList.add("hurryUp");
        }

        time.innerHTML = min +':'+ sec;

    }, 995);

}

function getExams() {

    // does authetication
    checkCurrentUser();

    var examBody = document.querySelector('#currentQuestion');

    // calls the function that parses and returns the match parameter
    var subject = parseUrl('subject');

    var time = document.querySelector('#timer');

    if (subject == null) {
        openUrl('selection.html');
    }

    // baseURL = https://questions.aloc.ng/api/v2/
    // questions = q?subject=blah     returns 1 question
    // questions = q/5?subject=blah    returns 5 question
    // questions = m?subject=blah      returns 40 questions
    // the body of the response is a bit different, also the larger the questions the more time it will take but it typically takes a few seconds

    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://questions.aloc.ng/api/v2/m?subject=${subject}`, true);
    // specifies a bunch of additional header info
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('AccessToken', 'ALOC-b34f725ffdb8b5a120c4');
    xhr.onreadystatechange = function () {
        if (this.status == 200 && this.readyState == 4) {
            
            var data = JSON.parse(this.responseText);

            // checks if the returned data is correct
            if (data.status == 200){

                var preloader = document.querySelector("#preloader");
                preloader.classList.add("hide");

                time.classList.remove('hide');
                countDown();
                // lol this is not wrong there is a data object in the first data object
                data = data.data;

                for (let index = 0; index < data.length; index++) {
                    const q = data[index];

                    correctAnswers[index] = q.answer;

                    // question id will be sequential i will make it myself
                    var newQuestion = `
                        <div id="q${index}" class="examContainer hide" align="left">
                            <p><small class="qNo">${index+1}</small>${q.question}</p>

                            <form class="eForm"onsubmit="return False" id="formfor${index}">
                                <!-- Make us of a loop incase options are more than four -->
                                <input type="radio" name="ans" id="opta${index}" class="examRadio" value="a"> 
                                <label for="opta${index}">${q.option.a}</label>
                                <br>
                                <input type="radio" name="ans" id="optb${index}" class="examRadio" value="a"> 
                                <label for="optb${index}">${q.option.b}</label>
                                <br>
                                <input type="radio" name="ans" id="optc${index}" class="examRadio" value="a"> 
                                <label for="optc${index}">${q.option.c}</label>
                                <br>
                                <input type="radio" name="ans" id="optd${index}" class="examRadio" value="a"> 
                                <label for="optd${index}">${q.option.d}</label>
                                <br>
                            </form>
                            <br>

                            <div class="btns row">
                                <h4 onclick="prevQuestion(${index})" class="examA">Previous</h4>
                                <h4 onclick="nextQuestion(${index})" class="examA">Next</h4>
                            </div>
                        </div>
                    `;

                    examBody.innerHTML += newQuestion;
                    
                }

                var jumpTo = document.createElement('div');
                jumpTo.classList.add('jumpTo');
                
                for (let index = 0; index < data.length; index++) {
                    
                    jumpTo.innerHTML += `<button id="qNoBtn${index}" class="qNoBtn" onclick="jumpTo(${index})">${index+1}</button>`;
                    
                }

                examBody.appendChild(jumpTo);

                document.querySelector('#q0').classList.remove('hide'); // this makes the first question visible
                examBody.innerHTML += `
                    
                    <button class="sExam" onclick="preSubmit()">Submit Exam</button>

                `;

            }

        }
    };
    xhr.send();

}

function getHistory() {
    
    var historyBox = document.querySelector('#historySection');

    var preloader = document.querySelector('#preloader');

    auth.onAuthStateChanged(user => {

        if (user) {

            var userId = user.uid;

            const recordsDB = db.ref('records/' + userId + '/');

            recordsDB.get()
                .then(snapshot => {

                    if (snapshot.exists()) {
                        
                        // hide preloader
                        preloader.classList.add('hide');

                        var data = snapshot.val();

                        for (let index = 0; index < data.length; index++) {
                            const element = data[index];

                            // removes additional text from date
                            var date = data[index].date.replace(/\sGMT.*/, '');

                            var percentageScore = (data[index].score / 40) * 100;
                            percentageScore = percentageScore.toFixed(2);

                            var percentageRating = (data[index].rating / 10) * 100;
                            percentageRating = percentageRating.toFixed(2);
                            
                            historyBox.innerHTML += `

                                <div class="historyCard">
                                    <p class="historySubject"><b>${data[index].examName}</b></p>
                                    <p class="historyDate"><small>${date}</small></p>
                                    <br>
                                    <div class="historyallScore">
                                        <span class="hiScore">
                                            <h4>Normal Score</h4>
                                            <h2 class="historyNo">${data[index].score}/40</h2>
                                        </span>
                                        <span class="hiScore">
                                            <h4>Percentage Score</h4>
                                            <h2 class="historyNo">${percentageScore}%</h2>
                                        </span>
                                        <span class="hiScore">
                                            <h4>Rating Score</h4>
                                            <h2 class="historyNo">${percentageRating}%</h2>
                                        </span>
                                    </div>    
                                    <div>
                                        <h4 class="AIsuggest">${data[index].AI_suggestions}</h4>
                                    </div>
                                    <button class="takeExam" onclick="openUrl('exam.html?subject=${data[index].examName}')">Try an Exam</button>
                                </div>        

                            `;

                        }

                    } else {
                        // empty history page

                        historyBox.innerHTML += '<h4 class="errText">Oops! No Exams Yet Head on and take one.</h4>'
                    }
                })
                .catch(err => {
                    if (err) console.log(err);
                })

        } else {
            openUrl('register.html')
        }
    })

}