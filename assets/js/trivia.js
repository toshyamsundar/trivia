$(document).ready(function() {
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

  var getTrivia = qURL => {
    $.ajax({
      url: qURL,
      method: "GET"
    }).then(function(triviaObj) {
      var consolidatedObj = consolidateAnswers(triviaObj);
      console.log(consolidatedObj);
      hideSection("#trivia-choice");
      showSection("#trivia-body");
    });
  };

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
      queryURL = "https://opentdb.com/api.php?amount=10&category=" + category + "&difficulty=" + difficultyLevel;
      getTrivia(queryURL);
    }
  });
});
