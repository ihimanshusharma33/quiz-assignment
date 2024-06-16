import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    // Fetch questions from backend
    axios.get('http://localhost:5000/questions')
      .then(response => (setQuestions(response.data),console.log(response.data)))
      .catch(error => console.error('Error fetching questions:', error));

    // Load saved state from localStorage
    const savedState = JSON.parse(localStorage.getItem('quizState'));
    if (savedState) {
      setCurrentQuestionIndex(savedState.currentQuestionIndex);
      setTimeLeft(savedState.timeLeft);
    }

    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prevTimeLeft => {
        if (prevTimeLeft <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Save state to localStorage
    localStorage.setItem('quizState', JSON.stringify({
      currentQuestionIndex,
      timeLeft,
    }));
  }, [currentQuestionIndex, timeLeft]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
      if (!document.fullscreenElement) {
        alert('Please enable full screen mode to take the quiz.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption(null);
    }
  };

  const handleStartQuiz = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }
  };

  if (!isFullScreen) {
    return (
      <div className="text-center mt-20">
        <h1 className='text-2xl bold'>Please enable full screen mode to take the quiz.</h1>
        <button className="bg-blue-500 mt-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleStartQuiz}>
          Start Quiz
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  if (timeLeft === 0) {
    return <div>Time's up! Quiz ended.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <div className="timer">Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</div>
      <div>{currentQuestion.question}</div>
      <div>
        {currentQuestion.options && currentQuestion.options.map(option => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            className={selectedOption === option ? 'selected' : ''}
          >
            {option}
          </button>
        ))}
      </div>
      <button onClick={handleNextQuestion} disabled={selectedOption === null}>Next</button>
    </div>
  );
};

export default App;
