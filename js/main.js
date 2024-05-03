// SETTING UP WEBHOOK
const webhookID = "MmDiFAtAmq4J";

// SHOCK FUNCTION
function shock(duration, intensity, id) {
    const url = `https://webhook.xtoys.app/?id=${id}&action=temporary-on&seconds=${duration}&intensity=${intensity}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
            // Implement retry mechanism or fallback plan here if needed
        });
}

window.onload = function () {
    var questionArea = document.getElementsByClassName('questions')[0],
        answerArea = document.getElementsByClassName('answers')[0],
        checker = document.getElementsByClassName('checker')[0],
        current = 0,
        failedQuestions = 0, // Track failed questions
        allQuestions;

    function fetchQuestions() {
        fetch('https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple')
            .then(response => response.json())
            .then(data => {
                const apiQuestions = data.results;
                const formattedQuestions = {};

                apiQuestions.forEach((questionObj, index) => {
                    const question = questionObj.question;
                    const correctAnswer = questionObj.correct_answer;
                    const incorrectAnswers = questionObj.incorrect_answers;
                    const allAnswers = [correctAnswer, ...incorrectAnswers];
                    allAnswers.sort(() => Math.random() - 0.5);
                    const correctAnswerIndex = allAnswers.indexOf(correctAnswer);
                    formattedQuestions[question] = [...allAnswers, correctAnswerIndex];
                });

                startQuiz(formattedQuestions);
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
                questionArea.innerHTML = 'Error fetching questions. Please try again later.';
            });
    }

    function startQuiz(questions) {
        allQuestions = questions;
        loadQuestion(current);
        loadAnswers(current);
    }

    function loadQuestion(curr) {
        var question = Object.keys(allQuestions)[curr];
        question = decodeEntities(question); // Decode HTML entities
        questionArea.innerHTML = '';
        questionArea.appendChild(document.createTextNode(question));
    }

    function decodeEntities(encodedString) {
        var textarea = document.createElement('textarea');
        textarea.innerHTML = encodedString;
        return textarea.value;
    }

    function loadAnswers(curr) {
        var answers = allQuestions[Object.keys(allQuestions)[curr]];
        answerArea.innerHTML = '';

        // Iterate over all answers except the last one (correct answer index)
        for (var i = 0; i < answers.length - 1; i += 1) {
            var createDiv = document.createElement('div'),
                answerText = decodeURIComponent(answers[i]); // Decode the answer
            createDiv.innerHTML = answerText; // Use innerHTML to decode HTML entities
            createDiv.addEventListener("click", checkAnswer(i, answers));
            answerArea.appendChild(createDiv);
        }
    }

    function checkAnswer(i, arr) {
        return function () {
            var givenAnswer = i,
                correctAnswer = arr[arr.length - 1];

            if (givenAnswer === correctAnswer) {
                addChecker(true);
            } else {
                addChecker(false);
            }

            if (givenAnswer !== correctAnswer) {
                failedQuestions++; // Increment failed questions count
            }

            if (failedQuestions >= 5) {
                // Trigger webhook for failure
                shock(5, 100, webhookID); // Hardcoded settings for failure
            }

            if (current < Object.keys(allQuestions).length - 1) {
                current += 1;
                loadQuestion(current);
                loadAnswers(current);
            } else {
                questionArea.innerHTML = 'Done';
                answerArea.innerHTML = '';
            }
        };
    }

    function addChecker(bool) {
        var createDiv = document.createElement('div'),
            txt = document.createTextNode(current + 1);

        createDiv.appendChild(txt);

        if (bool) {
            createDiv.className += 'correct';
            checker.appendChild(createDiv);
        } else {
            createDiv.className += 'false';
            checker.appendChild(createDiv);
        }
    }

    fetchQuestions();
};