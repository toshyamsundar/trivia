$(document).ready(function() {
  var timer = 10;
  var i = 0;
  var timerInterval;
  var displayTimer;

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
  };

  var setTimer = timer => {
    if (timer < 10) {
      displayTimer = ":0" + timer;
    } else {
      displayTimer = ":" + timer;
    }
    $("#timer").text(displayTimer);
  };

  var showTrivia = (currTrivia, index) => {
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
        console.log("i: " + index);
        console.log("Trivia Length: " + currTrivia.results.length);
        if (index < currTrivia.results.length) {
          timer = 10;
          showTrivia(currTrivia, index);
        }
      }
    }, 1000);
  };

  var getTrivia = qURL => {
    $.ajax({
      url: qURL,
      method: "GET"
    }).then(function(triviaObj) {
      var consolidatedObj = consolidateAnswers(triviaObj);
      console.log(consolidatedObj);
      hideSection("#trivia-choice");
      showSection("#trivia-body");

      showTrivia(consolidatedObj, 0);
    });
  };

  $(".answerButton").on("click", function() {});

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

    if (category === "SELECT" || difficultyLevel === "SELECT") {
      console.log("Wrong choices made");
    } else {
      queryURL = "https://opentdb.com/api.php?amount=3&category=" + category + "&difficulty=" + difficultyLevel;
      getTrivia(queryURL);
    }
  });
});
