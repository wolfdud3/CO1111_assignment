/*
 _____           _           _     _      _____  __  __ 
|  __ \         (_)         | |   | |    |  __ \|  \/  |
| |__) | __ ___  _  ___  ___| |_  | |    | |__) | \  / |
|  ___/ '__/ _ \| |/ _ \/ __| __| | |    |  _  /| |\/| |
| |   | | | (_) | |  __/ (__| |_  | |____| | \ \| |  | |
|_|   |_|  \___/| |\___|\___|\__| |______|_|  \_\_|  |_|
               _/ |                                     
              |__/     
A project by:
- Robin K. Schulz
- Lefteris Tziambouris
- Mohammed Al-Ghalibi

for CO1111 of the year 2020/2021
at University of Central Lancanshire Cyprus

LRM_script.js
*/


//URL of API
const url_api = "https://codecyprus.org/th/api";
const test_api = "https://codecyprus.org/th/test-api";

//URL of API + API function calling
const list_api = url_api + "/list";
const start_api = url_api + "/start";

const question_api = url_api + "/question";
const answer_api = url_api + "/answer";
const skip_api = url_api + "/skip";

const location_api = url_api + "/location";

const score_api = url_api + "/score";
const leaderboard_api = url_api + "/leaderboard";

//VARIABLES
//general game variables
let playername;
var playerscore;
//let sessionid;
let leaderboardLimit;

//element variables
let huntList;           //app.html#hunt-list
let leaderboardTable;   //leaderboard.html#leaderboard-table

//position variables
let latitude;
let longitude;


//COOKIE FUNCTIONS
function setCookie(sessionid, playername)
{
    console.log("setCookie(" + sessionid + "," + playername + ")");
    let date = new Date();
    let expireCookie = date.getTime() + (24*60*60*1000) //expire in 24 hours
    let expire = date.setTime(expireCookie);

    document.cookie = 'previousGame=true;' + ";" + "expires=" + expire + ";";
    document.cookie = 'sessionid=' + sessionid + ";" + "expires=" + expire + ";";
    document.cookie = 'playername=' + playername + ";" + "expires=" + expire + ";";

}

function getCookie(cookieName) 
{
    console.log("getCookie()");
  
    let name = cookieName + "=";
    let decodedcookie=decodeURIComponent(document.cookie);
    let ca = decodedcookie.split(';');
    for(let i = 0; i <ca.length; i++) 
    {
        let c = ca[i];
        while (c.charAt(0) === ' ') 
        {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) 
        {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

//QR CODE READER
//As seen in the lab worksheet (code taken from the lab worksheet and edited a bit)
let opts = {
    continuous: true,
    video: document.getElementById('preview'),
    mirror: true,
    captureImage: false,
    backgroundScan: true,
    refractoryPeriod: 5000,
    scanPeriod: 1
};

function scanCamera() {

    document.getElementById("camera").style.display = "block";

    let scanner = new Instascan.Scanner(opts);
    Instascan.Camera.getCameras()
        .then(function (cameras) {
                if (cameras.length > 0) {

                    scanner.start(cameras[0]); //First camera
                } else {
                    alert("No cameras found."); //Alerting the user
                }
            }
        )

        .catch
        (function (e) {
            console.error("Some errors:" + e);
        });

        scanner.addListener('scan', function (content) {
        console.log(content);
        document.getElementById("content").innerHTML = content;
    });
}


//SESSION FUNCTIONS
function startSession()
{

}

function endSession()
{

}

//GAME FUNCTIONS
function getHunt()      //get List of Treasure Hunts
{
    console.log("getHunt called");
    if (getCookie('previousGame') == 'true' && confirm('Do you want to coninue the previous saved game?'))
    {
        console.log("previous game detected");
        sessionid = getCookie('sessionid');
        startGame();
    }
    else
    {
        console.log("no previous game detected");

        fetch(list_api)
            .then(response => response.json())  //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
            .then(JSONresponse =>
                {
                    console.log(JSONresponse);
                    if(JSONresponse.status == "OK")
                    {
                        console.log("getHunt(): OK");
                        let treasureHunt; //

                        huntList = document.getElementById('hunt-list');

                        for (treasureHunt of JSONresponse.treasureHunts) //for each
                        {
                            //add li elements to ul
                            //give id to every li (use uuid)
                            let THelement = document.createElement('li');
                            //THelement.id = treasureHunt.uuid;
                            THelement.className="ul-remove";
                            THelement.className="li-TH";
                        

                            let THelementName = document.createElement('h3');
                            THelementName.innerText = treasureHunt.name;

                            //details about hunt
                            let THelementDetails = document.createElement('p');
                            let treasureHuntStartDate = new Date (treasureHunt.startsOn);
                            let treasureHuntEndDate = new Date (treasureHunt.endsOn);
                            let tresureHuntDuration = (treasureHunt.maxDuration / 1000 / 60);

                            THelementDetails.innerHTML = "<b>Description:</b> " + treasureHunt.description + '<br>' 
                                                        + "<b>Starts on:</b> " + treasureHuntStartDate.toLocaleDateString('de-DE') + '<br>'
                                                        + "<b>Ends on:</b> " + treasureHuntEndDate.toLocaleDateString('de-DE') + '<br>'
                                                        + "<b>Duration:</b> around " + tresureHuntDuration + " minutes";

                            let THelementButton = document.createElement('button');
                            THelementButton.id = treasureHunt.uuid;
                            THelementButton.innerText = "Play";
                            THelementButton.addEventListener("click", startGame);

                            THelement.appendChild(THelementName);
                            THelement.appendChild(THelementDetails);
                            THelement.appendChild(THelementButton);
                            huntList.appendChild(THelement);    //puts li inside of ul; instead of huntList.innerHTML += "<li> </li>"
                        }
                    }
                    else
                    {
                        //error message
                        console.log("getHunt(): ERROR");
                        window.alert("There was an error. Please refresh or try again later.");
                    }
                    
                }
            );
    }
}

function getPlayername()
{
    /*
    * popup window? https://www.w3schools.com/js/js_popup.asp
    */
    playername = prompt("Please enter your name:", "");
    if (playername == "")
    {
        //code for no name
        window.alert("To play, you need to submit a name");
    }
    else 
    {
        return playername;
    }

}

function startGame(event)    //called with EventListener(click) in getHunt()
{
    //start session + remember session id
    let TreasureHuntID 
    
    if(event == undefined)
    {
        console.log("getCookie('sessionid");
        console.log(getCookie('sessionid'));
        let sessionid = getCookie('sessionid');

        window.open("quiz.html?sessionid=" + sessionid, '_self', true);

    }
    else 
    {
        console.log(event.target.id);
        TreasureHuntID = event.target.id; //move out from function into html
    
        playername = getPlayername();

        //Example url from CodeCyprus: https://codecyprus.org/th/api/start?player=Homer&app=simpsons-app&treasure-hunt-id=ag9nfmNvZGVjeXBydXNvcmdyGQsSDFRyZWFzdXJlSHVudBiAgICAvKGCCgw
        let startGameURL = start_api + "?player=" + playername + "&app=lrm-quiz&treasure-hunt-id=" + TreasureHuntID;
        fetch(startGameURL)
            .then(response => response.json())
            .then(JSONresponse2=>
                {
                    console.log(startGameURL);
                    console.log(JSONresponse2);
                    if(JSONresponse2.status == "OK")
                    {
                        /*
                        pseudo:
                        - open new page
                        - pass session id as html parameter
                        */
                        console.log("startGame(): OK");
                        let sessionid = JSONresponse2.session;

                        setCookie(sessionid, playername);

                        window.open("quiz.html?sessionid=" + sessionid, '_self', true);
                    }
                    else
                    {
                        //error message
                        console.log("startGame(): OK");
                        window.alert(JSONresponse2.errorMessages);
                    }

                }

            );
    }
}

function getQuestion()
{
    //get questions using session id
    //example: https://codecyprus.org/th/api/question?session=ag9nfmNvZGVjeXBydXNvcmdyFAsSB1Nlc3Npb24YgICAoMa0gQoM
    const urlParams = new URLSearchParams(window.location.search);

    let getQuestionURL = question_api + "?session=" + urlParams.get('sessionid');
    fetch(getQuestionURL)
        .then(response => response.json())
        .then(JSONresponse3 =>
            {
                //check for more questions
                if (JSONresponse3.currentQuestionIndex == JSONresponse3.numOfQuestions)
                {
                    let sessionid = urlParams.get('sessionid');
                    leaderboardLimit = 25;
                    console.log("leaderboardLimit: " + leaderboardLimit);
                    window.open("leaderboard.html?sessionid=" + sessionid + "&leaderboardLimit=" + leaderboardLimit, '_self', true);// + "?leaderboardLimit=" + leaderboardLimit, '_self', true);
                }

                if(JSONresponse3.status == "OK")
                {
                    console.log("getQuestion(): OK");
                    console.log(JSONresponse3.numOfQuestions);
                    console.log(JSONresponse3.currentQuestionIndex);
                    questionBox = document.getElementById('questionBox');
                    answerBox = document.getElementById('answerBox');
                    skipBox = document.getElementById('skipBox');
                    
                    //check for location
                    let locationHint;
                    if (JSONresponse3.requiresLocation == true)
                    {
                        locationHint = document.createElement('p');
                        locationHint.className = "hint";
                        locationHint.innerText = "This question requires the correct location.";
                        answerBox.appendChild(locationHint);
                        getLocation();
                    }

                    //show number of questions
                    let questionNumber = document.createElement('p');
                    currentQuestion = JSONresponse3.currentQuestionIndex + 1;
                    amountQuestion = JSONresponse3.numOfQuestions;
                    questionNumber.innerText = "Question " + currentQuestion + " out of " + amountQuestion;
                    questionBox.appendChild(questionNumber);

                    //show score
                    let scoreParagraph = document.createElement('p');

                    getScore(scoreParagraph);
                    questionBox.appendChild(scoreParagraph);
                    
                    //create question
                    let questionParagraph = document.createElement('p');
                    questionParagraph.innerHTML = JSONresponse3.questionText;
                    //append questionParagraph
                    questionBox.appendChild(questionParagraph);

                    console.log("correct Score: " + JSONresponse3.correctScore);
                    console.log("wrong Score: " + JSONresponse3.wrongScore);
                    console.log("skip Score: " + JSONresponse3.skipScore);

                    let questionType = JSONresponse3.questionType;

                    switch(questionType)
                    {
                        //BOOLEAN QUESTIONS
                        case "BOOLEAN":
                            
                            console.log("type = " + questionType);

                            //two buttons w/ true and false
                            
                            //button true
                            let buttonTrue = document.createElement('button');
                            buttonTrue.innerText = "True";
                            buttonTrue.value = true;
                            buttonTrue.id = "buttonTrue";
                            buttonTrue.addEventListener("click", sendAnswer);
                            
                            //button false
                            let buttonFalse = document.createElement('button');
                            buttonFalse.innerText = "False";
                            buttonFalse.value = false;
                            buttonFalse.id = "buttonFalse";
                            buttonFalse.addEventListener("click", sendAnswer);
    
                            //append
                            answerBox.appendChild(buttonTrue);
                            answerBox.appendChild(buttonFalse);    
                            break;


                        //MULTIPLE CHOICE QUESTIONS
                        case "MCQ":

                            console.log("type = " + questionType);
                            
                            //create buttons

                            //button A
                            let choiceA = document.createElement('button');
                            choiceA.innerText = "A";
                            choiceA.value = "A";
                            choiceA.id = "choiceA";
                            choiceA.addEventListener("click", sendAnswer);

                            //button B
                            let choiceB = document.createElement('button');
                            choiceB.innerText = "B";
                            choiceB.value = "B";
                            choiceB.id = "choiceB";
                            choiceB.addEventListener("click", sendAnswer);

                            //button C
                            let choiceC = document.createElement('button');
                            choiceC.innerText = "C";
                            choiceC.value = "C";
                            choiceC.id = "choiceC";
                            choiceC.addEventListener("click", sendAnswer);

                            //button D
                            let choiceD = document.createElement('button');
                            choiceD.innerText = "D";
                            choiceD.value = "D";
                            choiceD.id = "choiceD";
                            choiceD.addEventListener("click", sendAnswer);

                            //append everything
                            answerBox.appendChild(choiceA);
                            answerBox.appendChild(choiceB);
                            answerBox.appendChild(choiceC);
                            answerBox.appendChild(choiceD);

                            break;


                        //INTEGER QUESTIONS
                        case "INTEGER":
                            console.log("type = " + questionType);
                            //code for integer questions

                            //create form
                            let intAnswer = document.createElement('form');
                            intAnswer.action = 'javascript:sendAnswer()';

                            //create textBox in Form
                            let intTextBox = document.createElement('input');
                            intTextBox.id = "answerTextBox";
                            intTextBox.type = "number";

                            //submit button in form
                            let intSubmit = document.createElement('input');
                            intSubmit.type = "submit";

                            //append everything
                            intAnswer.appendChild(intTextBox);
                            intAnswer.appendChild(intSubmit);
                            answerBox.appendChild(intAnswer);

                            break;


                        //NUMERIC QUESTIONS
                        case "NUMERIC":
                            console.log("type = " + questionType);
                            //code for numeric questions

                            //create form
                            let numAnswer = document.createElement('form');
                            numAnswer.action = 'javascript:sendAnswer()';

                            //create textBox in form
                            let numTextBox = document.createElement('input');
                            numTextBox.id = "answerTextBox";
                            numTextBox.type = "number";

                            //submit button in form
                            let numSubmit = document.createElement('input');
                            numSubmit.type = "submit";
                            numSubmit.value = "submit";

                            //append everything
                            numAnswer.appendChild(numTextBox);
                            numAnswer.appendChild(numSubmit);
                            answerBox.appendChild(numAnswer);

                            break;


                        //TEXT QUESTIONS
                        case "TEXT":

                            console.log("type = " + questionType);
                            //code for text questions

                            //create form
                            let textAnswer = document.createElement('form');
                            textAnswer.action = 'javascript:sendAnswer()';

                            //create textBox in form
                            let textTextBox = document.createElement('input');
                            textTextBox.id = "answerTextBox";
                            textTextBox.type = "text";

                            //submit button in form
                            let textSubmit = document.createElement('input');
                            textSubmit.type = "submit";
                            textSubmit.value = "submit";

                            //append everything
                            textAnswer.appendChild(textTextBox);
                            textAnswer.appendChild(textSubmit);
                            answerBox.appendChild(textAnswer);

                            break;
                    }
                    //END OF SWITCH/CASE

                    //skip button
                    let skipButton = document.createElement('button');
                    skipButton.innerText = "skip";
                    skipButton.id = "skipButton";

                    console.log(JSONresponse3.canBeSkipped);

                    if (JSONresponse3.canBeSkipped == true)
                    {
                        skipButton.addEventListener("click", skipAnswer);
                    }
                    else
                    {
                        document.getElementByID("skipButton").disabled = true;
                    }

                    skipBox.appendChild(skipButton);


                    //append everything!

                }
                else
                {
                    console.log("getQuestion(): ERROR");
                    window.alert(JSONresponse3.errorMessages);
                }
            }
            );
}

function sendAnswer(event)   //call with EventListener('click') in getQuestion()
{

    let answer;

    //get values from elements via Event Listener
    if (event == undefined)
    {
        let textBoxInput = document.getElementById("answerTextBox").value;
        answer = textBoxInput;
    }
    else
    {
        let buttonInput = document.getElementById(event.target.id).value;
        answer = buttonInput;

        console.log("Answer: " + answer);
    }
   

    //example url: https://codecyprus.org/th/api/answer?session=ag9nfmNvZGVjeXBydXNvcmdyFAsSB1Nlc3Npb24YgICAoMa0gQoM&answer=42
    const urlParams = new URLSearchParams(window.location.search);

    let sendAnswerURL = answer_api + "?session=" + urlParams.get('sessionid') + "&answer=" + answer;

    fetch(sendAnswerURL)
    .then(response => response.json())
    .then(JSONresponse4 =>
        {
            console.log(sendAnswerURL);
            console.log(JSONresponse4);

            if(JSONresponse4.status == "OK")
            {
                console.log("sendAnswer(): OK");
                if(JSONresponse4.correct == true)           //answer correct
                {
                    console.log("correct answer");

                    window.location.reload(true);
                }
                else if (JSONresponse4.correct == false)    //answer false
                {
                    window.alert("This answer was false. Try again.")
                    console.log("false answer");

                    window.location.reload(true);
                }
            }
            else
            {
                console.log("sendAnswer(): ERROR");
                window.alert(JSONresponse4.errorMessages);
                //go back to choice
            }
        }
        );
    

}

function skipAnswer()   //call with onclick=""?
{
    if(confirm("Do you really want to skip?"))
    {
        //example URL: https://codecyprus.org/th/api/skip?session=ag9nfmNvZGVjeXBydXNvcmdyFAsSB1Nlc3Npb24YgICAoMa0gQoM
        const urlParams = new URLSearchParams(window.location.search);

        let skipAnswerURL = skip_api + "?session=" + urlParams.get('sessionid');
        fetch(skipAnswerURL)
        .then(response => response.json())
        .then(JSONresponse6 =>
            {
                if(JSONresponse6.status == "OK")
                {
                    //code
                    console.log("skipAnswer(): OK")

                    window.location.reload(true);
                }
                else
                {
                    //error message
                    window.alert(JSONresponse6.errorMessages);
                    console.log("skipAnswer(): ERROR");
                }
            }
            );
    }
    else
    {
        
    }

}

//SCORE FUNCTIONS
function getScore(scoreParagraph)
{
    //example URL: https://codecyprus.org/th/api/score?session=ag9nfmNvZGVjeXBydXNvcmdyFAsSB1Nlc3Npb24YgICAoMa0gQoM
    const urlParams = new URLSearchParams(window.location.search);

    let getScoreURL = score_api + "?session=" + urlParams.get('sessionid');

    fetch(getScoreURL)
    .then(response => response.json())
    .then(JSONresponse7 =>
        {
            if(JSONresponse7.status == "OK")
            {
                console.log("getScore(): OK");
                console.log("getScore(): " + JSONresponse7.score);
                playerscore = JSONresponse7.score;
                console.log("getScore(): " + playerscore);

                scoreParagraph.innerText = "Your Score: " + playerscore;

            }
            else
            {
                console.log("getScore(): ERROR");
                window.alert(JSONresponse7.errorMEssages);
            }
        }
        );

}

function getLeaderboard()
{
    //example URL: https://codecyprus.org/th/api/leaderboard?session=ag9nfmNvZGVjeXBydXNvcmdyFAsSB1Nlc3Npb24YgICAoMa0gQoM&sorted&limit=10
    const urlParams = new URLSearchParams(window.location.search);
    
    leaderboardLimit = urlParams.get('leaderboardLimit');

    let getLeaderboardURL = leaderboard_api + "?session=" + urlParams.get('sessionid') + "&sorted&limit=" + leaderboardLimit;
    
    console.log("urlParam: " + urlParams.get('leaderboardLimit'));
    fetch (getLeaderboardURL)
        .then(response => response.json())
        .then(JSONresponse8 =>
            {
                if(JSONresponse8.status == "OK")
                {
                    console.log("getLeaderboard(): OK");
                    let leaderboardTH;
                    let leaderboardPosition = 0;
                    let playerrank; //Rank of Player

                    let leaderboardScore = document.getElementById('leaderboard-score');
                    let scoreParagraph = document.createElement('p');
                    let rankParagraph = document.createElement('p');
                    getScore(scoreParagraph);

                    playername = getCookie("playername");
                    console.log("Playername: " + playername);                

                    //show playerrank
                    let leaderboardEntry = JSONresponse8.leaderboard;
                    for(let i = 0; i < leaderboardEntry.length; i++)
                    {
                        console.log("For loop");
                        if(leaderboardEntry[i].player === playername)
                        {
                            playerrank = "You are on place " + i;
                            console.log("playerRank inside if: " + playerrank);
                        }
                        else
                        {
                            playerrank = "There was an error showing your place on the leaderboard";
                        }
                    }
                    console.log("playerRank: " + playerrank);

                    rankParagraph.innerText = "Hi, " + playername + ". " + playerrank;
                    leaderboardScore.appendChild(rankParagraph);

                    scoreParagraph.innerText = "Your score is " + playerscore + " Points.";
                    leaderboardScore.appendChild(scoreParagraph);

                    leaderboardTable = document.getElementById('leaderboard-table');

                    //create table data with for loop
                    for(leaderboardTH of JSONresponse8.leaderboard)
                    {
                        let leaderboardTableRowData = document.createElement('tr');
                        leaderboardTableRowData.className = "leaderboard-row"

                        let leaderboardDataPos = document.createElement('td');
                        leaderboardPosition++;
                        leaderboardDataPos.className = "content-right";
                        leaderboardDataPos.innerText = leaderboardPosition;

                        let leaderboardDataPlayername = document.createElement('td');
                        leaderboardDataPlayername.innerText = leaderboardTH.player;
    
                        let leaderboardDataScore = document.createElement('td');
                        leaderboardDataScore.innerText = leaderboardTH.score;
    
                        let leaderboardDataTime = document.createElement('td');
                        let leaderboardDateString = new Date (leaderboardTH.completionTime);
                        leaderboardDataTime.className = "content-right";
                        leaderboardDataTime.innerText = leaderboardDateString.toLocaleDateString('de-DE');

                        leaderboardTableRowData.appendChild(leaderboardDataPos);
                        leaderboardTableRowData.appendChild(leaderboardDataPlayername);
                        leaderboardTableRowData.appendChild(leaderboardDataScore);
                        leaderboardTableRowData.appendChild(leaderboardDataTime);
                        leaderboardTable.appendChild(leaderboardTableRowData);
                    }

                    let leaderboardButton = document.getElementById("leaderboard-button");
                    leaderboardButton.addEventListener("click", function()
                    {
                        leaderboardLimit = leaderboardLimit + 25;
                        window.open("leaderboard.html?sessionid=" + urlParams.get('sessionid') + "&leaderboardLimit=" + leaderboardLimit, '_self', true);
                    });

                    let leaderboardRefresh = document.getElementById("leaderboard-refresh");
                    leaderboardRefresh.addEventListener("click", function(){window.location.reload(true)});

                }
                else
                {
                    console.log("getLeaderboard(): ERROR");
                    window.alert(JSONresponse8.errorMEssages);
                }

            }
            );
}


//GEOLOCATION FUNCTIONS
function getLocation()
{
    //get position, update every 30 seconds
    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(showPosition);
        console.log("getLocation(): OK");
        setTimeout(getLocation, 30000);
    } 
    else 
    { 
        alert("Geolocation is not supported by this browser.");
    } 

    console.log("Latitude: " + latitude + ", Longitude: " + longitude);

}

//showing the postition of the user
function showPosition(position)
{
    //showing the location of the user on the console for debugging issues
    console.log("Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude);
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;


    //example URL: https://codecyprus.org/th/api/location?session=ag9nfmNvZGVjeXBydXNvcmdyFAsSB1Nlc3Npb24YgICAoMa0gQoM&latitude=34.683646&longitude=33.055391
    const urlParams = new URLSearchParams(window.location.search);

    let getLocationURL = location_api + "?session=" + urlParams.get('sessionid') + "&latitude=" + latitude + "&longitude=" + longitude;
    console.log(getLocationURL);
    fetch(getLocationURL)
        .then(response =>response.json())
        .then(JSONrepsonse5 =>
        {
            if(JSONrepsonse5.status === "OK")
            {
                //code
                console.log("showLocation(): OK")
                console.log(JSONrepsonse5.message);
                
            }
            else
            {
                //error message
                console.log("showLocation(): ERROR");
                window.alert(JSONrepsonse5.errorMessages);
            }
        }
        );
}
