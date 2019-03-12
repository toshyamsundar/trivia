$(document).ready(function() {
  var timer = 15;
  var index = 0;
  var timerInterval;
  var displayTimer;
  var correctAnswer;
  var timeOut;
  var triviaObj;
  var correctCount = 0;
  var wrongCount = 0;
  var unansweredCount = 0;
  var correctBtnClass;
  var correctBtnElem;
  var disableButton = false;

  //Function to shuffle the answers, as the correct one is always appended at the end
  var shuffleAnswers = answers => {
    var len;
    var randIndex;
    var tempValue;

    len = answers.length;
    while (len) {
      randIndex = Math.floor(Math.random() * len--);

      tempValue = answers[len];
      answers[len] = answers[randIndex];
      answers[randIndex] = tempValue;
    }
    return answers;
  };

  //Function to update the response object with all_answers, as they are available in key
  var consolidateAnswers = tResponseObj => {
    var triviaAnswers = [];
    for (i = 0; i < tResponseObj.results.length; i++) {
      triviaAnswers = tResponseObj.results[i].incorrect_answers.slice();
      triviaAnswers.push(tResponseObj.results[i].correct_answer);
      //Shuffle only if multiple answers. Not required in case of True or False questions
      // if (tResponseObj.results[i].type === "multiple") {
      tResponseObj.results[i].all_answers = shuffleAnswers(triviaAnswers.slice());
      // } else {
      //   tResponseObj.results[i].all_answers = triviaAnswers;
    }
    return tResponseObj;
  };

  // Function to hide a section
  var hideSection = elemId => {
    $(elemId).hide();
  };

  //Function to show a section
  var showSection = elemId => {
    $(elemId).show();
  };

  //Function to set the HTML value of the given element
  var setHTML = (elemId, textValue) => {
    $(elemId)
      .html(textValue)
      .text();
    // Set the data-correct attribute to true if it is the correct answer
    if (elemId !== "#question" && textValue === correctAnswer) {
      $(elemId).attr("data-correct", "true");
    } else {
      $(elemId).attr("data-correct", "false");
    }
  };

  //Function to display the timer at the top
  var setTimer = timer => {
    if (timer < 10) {
      displayTimer = ":0" + timer;
    } else {
      displayTimer = ":" + timer;
    }
    $("#timer").text(displayTimer);
  };

  //Function to show the results summary
  var showResults = () => {
    hideSection("#trivia-body");
    showSection("#results-body");
    $("#total-questions").text(triviaObj.results.length);
    $("#correct-count").text(correctCount);
    $("#wrong-count").text(wrongCount);
    $("#unanswered-count").text(unansweredCount);
  };

  var resetCorrectFlag = () => {
    $("#trivia-content")
      .children("button")
      .each(function() {
        $(this).attr("data-correct", "false");
      });
  };

  //Function to display the questions one after the other
  var showTrivia = currTrivia => {
    correctAnswer = currTrivia.results[index].correct_answer;
    disableButton = false;

    resetCorrectFlag();
    // console.log("Question: " + currTrivia.results[index].question);
    // console.log("Correct Answer: " + correctAnswer);
    setHTML("#question", currTrivia.results[index].question);
    if (currTrivia.results[index].all_answers.length === 4) {
      showSection("#answer3");
      showSection("#answer4");
      setHTML("#answer1", currTrivia.results[index].all_answers[0]);
      setHTML("#answer2", currTrivia.results[index].all_answers[1]);
      setHTML("#answer3", currTrivia.results[index].all_answers[2]);
      setHTML("#answer4", currTrivia.results[index].all_answers[3]);
    } else {
      setHTML("#answer1", currTrivia.results[index].all_answers[0]);
      setHTML("#answer2", currTrivia.results[index].all_answers[1]);
      // setHTML("#answer1", "True");
      // setHTML("#answer2", "False");
      hideSection("#answer3");
      hideSection("#answer4");
    }

    // console.log("Index: " + index);
    // console.log("Trivia Length: " + currTrivia.results.length);

    setTimer(timer);
    timer--;
    index++;
    // Time interval for the current question
    timerInterval = setInterval(function() {
      // Continue setting the timer until 0;
      if (timer >= 0) {
        setTimer(timer);
        timer--;
      } else {
        // At the end of the timer, clear it and increase unanswered count
        clearInterval(timerInterval);
        unansweredCount++;
        //Reset the timer for the next question
        timer = 15;

        $("#trivia-content")
          .children("button")
          .each(function() {
            if ($(this).attr("data-correct") === "true") {
              correctBtnElem = $(this);
              correctBtnClass = "bg-success";
              correctBtnElem.addClass(correctBtnClass);
            }
          });

        //Call the showTrivia recursively until the last question after a timeout
        if (index < currTrivia.results.length) {
          timeOut = setTimeout(function() {
            correctBtnElem.removeClass(correctBtnClass);
            showTrivia(triviaObj);
          }, 1500);
        } else {
          //Else call ShowResults after all the questions are done
          timeOut = setTimeout(function() {
            showResults();
          }, 1500);
        }
      }
    }, 1000); //1 Second timer for the display at the top
  };

  // Function to make the API call to get the trivia questions
  var getTrivia = qURL => {
    $.ajax({
      url: qURL,
      method: "GET"
    })
      .then(function(responseObj) {
        triviaObj = consolidateAnswers(responseObj);
        // console.log(triviaObj);
        hideSection("#trivia-choice");
        showSection("#trivia-body");

        showTrivia(triviaObj);
      })
      .catch(function(err) {
        console.log("Error in getting a response");
        location.reload();
      });
  };

  // Function to the check the user clicked answer & highlight whether it is correct or wrong
  var checkAnswer = (triviaContent, currButton) => {
    var newBtnClass;
    var wrongChoice = false;

    if (currButton.attr("data-correct") === "true") {
      //If the user answer is correct, change the color of the clicked button to green
      newBtnClass = "bg-success";
      correctCount++;
    } else {
      //If not, change the color of the clicked button to red
      newBtnClass = "bg-danger";
      wrongChoice = true;
      wrongCount++;
      // Also set the color of the correct answer to green
      $(triviaContent)
        .children("button")
        .each(function() {
          if ($(this).attr("data-correct") === "true") {
            correctBtnElem = $(this);
            correctBtnClass = "bg-success";
            correctBtnElem.addClass(correctBtnClass);
          }
        });
    }
    currButton.addClass(newBtnClass);

    // Timeout to show the highlighted answers to the user
    timeOut = setTimeout(function() {
      //Call the showTrivia function again if there are more questions
      if (index < triviaObj.results.length) {
        timer = 15;
        if (wrongChoice) {
          correctBtnElem.removeClass(correctBtnClass);
        }
        currButton.removeClass(newBtnClass);
        showTrivia(triviaObj);
      } else {
        //if no more questions, show the results summary
        showResults();
      }
    }, 1500);
  };

  //Callback function for clicking on the button click
  $(".answerButton").on("click", function() {
    if (!disableButton) {
      var currButton = $(this);
      disableButton = true;
      clearInterval(timerInterval);
      checkAnswer("#trivia-content", currButton);
    }
  });

  //Return the value of the selected category
  var getCategory = () => {
    return $("#categoryList").val();
  };

  //Return the value of the selected difficulty level
  var getDifficultyLevel = () => {
    return $("#diffLevel option:selected").text();
  };

  //Create the API URL based on the selected choices
  $("#start").on("click", function() {
    var category = getCategory();
    var difficultyLevel = getDifficultyLevel().toLowerCase();
    var queryURL;

    $("#category").text($("#categoryList option:selected").text());
    if (category.toLowerCase() === "select" || difficultyLevel.toLowerCase() === "select") {
      console.log("Wrong choices made");
    } else {
      queryURL = "https://opentdb.com/api.php?amount=10&category=" + category + "&difficulty=" + difficultyLevel;
      getTrivia(queryURL);
    }
  });

  //Reload the page on clicking the Play Again button on the results page
  $("#reset").on("click", function() {
    location.reload();
  });
});
