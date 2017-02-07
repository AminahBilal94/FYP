(function () {
    'use strict';

    angular
        .module('app')
        .controller('Game.IndexController', Controller);

    myApp.controller('mainController', ['$scope', 'DataService', 'Shuffle', '$timeout', '$interval', '$location', '$http', function ($scope, DataService, Shuffle, $timeout, $interval, $location, $http) {



    $scope.player = {};

    //getScore is used for retrieving a user's total score from all game plays
    $scope.getScore = function() {
        DataService.getUserScore($scope.player.name).then(function(result){
            $scope.totalScore = result.data.totalScore;
        });
    }

    //getHighScore retrieves the top X players from the database
    $scope.getHighScore = function() {
        DataService.getHighScore().then(function(result){
            $scope.highScore = result.data;
        });
    }

    //postScore sends the user's score to the database at the end of the round
    $scope.postScore = function(name, score) {
        DataService.postScore(name, score).then(function(result){
            $scope.getScore();
        });

    }

    //resets the question (such as question content, answers, colors, timer)
    function resetQuestion() {
        var correctAnswer,
                myArray,
                answerClass = " answerBtn btn btn-primary";

        $scope.data = {};
        $scope.elementInfo = {
            answerClass: [answerClass, answerClass, answerClass, answerClass]
        };
        $scope.timer = 5;
        $scope.seconds = 5;
    }

    //gets the questions from the database
    function getQuestion() {
        $scope.showTimer = true;
        resetQuestion();
        $scope.currentQuestionNo++;
        //HTTP GET
        DataService.getQuestion().then(function (result) {
            //result contains the question obj {question, answer and three wrong choices}
            var question = result.data;
            //$scope.data.q holds the question for e.g: "what is the capital of France?"
            $scope.data.q = question.q;
            correctAnswer = question.a;
            myArray = [question.a, question.v1, question.v2, question.v3];
            myArray = Shuffle.randomizeArray(myArray);
            $scope.data.answers = myArray;
        });
        //this is the countdown timer; it starts when the questions is loaded; it stops when the time runs out or when you pick an answer
        myTimer = $interval(function () {
            if ($scope.timer > 0) {
                $scope.timer--;
            } else {
                $scope.validateAnswer(4);
            }
        }, 500);
    };

    //it validates your answer, makes your choice orange, makes the right one green, makes the wrong one red.
    //the timer is cancelled when this function is called
    $scope.validateAnswer = function (ans) {
        $scope.showTimer = false;
        $interval.cancel(myTimer);
        $scope.elementInfo.answerClass[ans] += " btn-warning";
        for (var i = 0; i < 4; i++) {
            $scope.elementInfo.answerClass[i] += " disabled";
        }
        var timer = $timeout(function () {
            for (var i = 0; i < 4; i++) {
                if (ans == i) {
                    if ($scope.data.answers[ans] == correctAnswer) {
                        $scope.elementInfo.answerClass[ans] = " answerBtn btn btn-primary btn-success disabled ";
                        $scope.currentScore += 10;
                    } else {
                        $scope.elementInfo.answerClass[ans] += " btn-danger";
                    }
                } else if ($scope.data.answers[i] == correctAnswer) {
                    $scope.elementInfo.answerClass[i] += " btn-success";

                }
            }
        }, 500);
        //checks if there are questions of left for e.g: question 1 of 5, 2 of 5, etc.
        if ($scope.currentQuestionNo < $scope.numberOfQuestions) {
            var timer2 = $timeout(function () {
                getQuestion();
            }, 500);
        } else {
            //if no questions left, then the game ends
            $timeout(function(){
                $location.path('/endgame');
                $scope.postScore($scope.player.name, $scope.currentScore);
                $scope.getHighScore();
            }, 500);
        }
    };


    $scope.setTopic = function (no) {
        $scope.setTopic = no;
    }

    //this gets fired when you press the START button
    $scope.startGame = function () {
        var myTimer;
        $scope.currentScore = 0;
        $scope.currentQuestionNo = 0;
        getQuestion();
    }


} ]);