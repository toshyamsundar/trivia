$(document).ready(function() {
  var timer = 10;
  var index = 0;
  var timerInterval;
  var displayTimer;
  var correctAnswer;
  var timeOut;
  var triviaObj;
  var correctCount = 0;
  var wrongCount = 0;
  var unansweredCount = 0;

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

  var consolidateAnswers = tResponseObj => {
    var triviaAnswers = [];
    for (i = 0; i < tResponseObj.results.length; i++) {
      triviaAnswers = tResponseObj.results[i].incorrect_answers.slice();
      triviaAnswers.push(tResponseObj.results[i].correct_answer);
      //   console.log("Before: " + triviaAnswers);
      if (tResponseObj.results[i].type === "multiple") {
        tResponseObj.results[i].all_answers = shuffleAnswers(triviaAnswers.slice());
      } else {
        tResponseObj.results[i].all_answers = triviaAnswers;
      }
      //   console.log("After: " + tResponseObj.results[i].all_answers);
    }
    return tResponseObj;
  };

  var hideSection = elemId => {
    $(elemId).hide();
  };

  var showSection = elemId => {
    $(elemId).show();
  };

  var setHTML = (elemId, textValue) => {
    $(elemId)
      .html(textValue)
      .text();

    // console.log("ElemId: " + elemId);
    // console.log("TextValue: " + textValue + " " + correctAnswer);
    if (elemId !== "#question" && textValue === correctAnswer) {
      $(elemId).attr("data-correct", "true");
    } else {
      $(elemId).attr("data-correct", "false");
    }
  };

  var setTimer = timer => {
    if (timer < 10) {
      displayTimer = ":0" + timer;
    } else {
      displayTimer = ":" + timer;
    }
    $("#timer").text(displayTimer);
  };

  var showResults = () => {
    hideSection("#trivia-body");
    showSection("#results-body");
    $("#total-questions").text(triviaObj.results.length);
    $("#correct-count").text(correctCount);
    $("#wrong-count").text(wrongCount);
    $("#unanswered-count").text(unansweredCount);
  };

  var showTrivia = currTrivia => {
    correctAnswer = currTrivia.results[index].correct_answer;
    console.log("Question: " + currTrivia.results[index].question);
    console.log("Correct Answer: " + correctAnswer);
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
      hideSection("#answer3");
      hideSection("#answer4");
    }

    console.log("Index: " + index);
    console.log("Trivia Length: " + currTrivia.results.length);

    setTimer(timer);
    timer--;
    index++;

    timerInterval = setInterval(function() {
      console.log("Timer: " + timer);
      if (timer > 0) {
        setTimer(timer);
        timer--;
      } else {
        clearInterval(timerInterval);
        unansweredCount++;
        timer = 10;
        if (index < currTrivia.results.length) {
          timeOut = setTimeout(function() {
            showTrivia(triviaObj);
          }, 3000);
        } else {
          timeOut = setTimeout(function() {
            showResults();
          }, 3000);
        }
      }
    }, 1000);
  };

  var getTrivia = qURL => {
    $.ajax({
      url: qURL,
      method: "GET"
    }).then(function(responseObj) {
      triviaObj = consolidateAnswers(responseObj);
      console.log(triviaObj);
      hideSection("#trivia-choice");
      showSection("#trivia-body");

      showTrivia(triviaObj);
    });
  };

  var checkAnswer = (triviaContent, currButton) => {
    var correctBtnClass;
    var correctBtnElem;
    var newBtnClass;
    var wrongChoice = false;

    if (currButton.attr("data-correct") === "true") {
      newBtnClass = "bg-success";
      correctCount++;
    } else {
      newBtnClass = "bg-danger";
      wrongChoice = true;
      wrongCount++;

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

    timeOut = setTimeout(function() {
      if (index < triviaObj.results.length) {
        timer = 10;
        if (wrongChoice) {
          correctBtnElem.removeClass(correctBtnClass);
        }
        currButton.removeClass(newBtnClass);
        showTrivia(triviaObj);
      } else {
        showResults();
      }
    }, 3000);
  };

  $(".answerButton").on("click", function() {
    var currButton = $(this);
    clearInterval(timerInterval);
    checkAnswer("#trivia-content", currButton);
  });

  var getCategory = () => {
    return $("#categoryList").val();
  };

  var getDifficultyLevel = () => {
    return $("#diffLevel option:selected").text();
  };

  $("#start").on("click", function() {
    var category = getCategory();
    console.log("Category: " + category);
    var difficultyLevel = getDifficultyLevel().toLowerCase();
    console.log("Diff Level: " + difficultyLevel);
    var queryURL;

    if (category.toLowerCase() === "select" || difficultyLevel.toLowerCase() === "select") {
      console.log("Wrong choices made");
    } else {
      queryURL = "https://opentdb.com/api.php?amount=5&category=" + category + "&difficulty=" + difficultyLevel;
      getTrivia(queryURL);
    }
  });
});
