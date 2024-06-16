import React, { useEffect, useState } from 'react';
import data from './components/data.json';

const App = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(60); // 10 minutes in seconds
  const [responses, setResponses] = useState({});
  const [quizEnded, setQuizEnded] = useState(false);
  const [warning, setWarning] = useState('');
  const [timerStarted, setTimerStarted] = useState(false); // Track if timer has started

  useEffect(() => {
    setQuestions(data);
    const savedResponses = JSON.parse(localStorage.getItem('responses'));
    const savedActiveQuestionIndex = JSON.parse(localStorage.getItem('activeQuestionIndex'));
    const savedTotalTimeLeft = JSON.parse(localStorage.getItem('totalTimeLeft'));
    if (savedResponses) setResponses(savedResponses);
    if (savedActiveQuestionIndex !== null) setActiveQuestionIndex(savedActiveQuestionIndex);
    if (savedTotalTimeLeft !== null) setTotalTimeLeft(savedTotalTimeLeft);
  }, []);

  // Set up timer and save state in localStorage
  useEffect(() => {
    let timer;
    if (timerStarted) {
      timer = setInterval(() => {
        setTotalTimeLeft(prevTotalTimeLeft => {
          if (prevTotalTimeLeft <= 1) {
            clearInterval(timer);
            handleQuizSubmit();
            return 0;
          }
          return prevTotalTimeLeft - 1;
        });
      }, 1000);
    }

    // Save responses and active question index to localStorage on unmount
    return () => {
      if (timer) clearInterval(timer);
      localStorage.setItem('responses', JSON.stringify(responses));
      localStorage.setItem('activeQuestionIndex', JSON.stringify(activeQuestionIndex));
      localStorage.setItem('totalTimeLeft', JSON.stringify(totalTimeLeft));
    };
  }, [timerStarted, activeQuestionIndex, responses, totalTimeLeft]);

  useEffect(() => { // handle full screen
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null)
      if (!document.fullscreenElement){
        setTimerStarted(false);   // Stop the timer when exiting full screen
      }else{
        setTimerStarted(true);    // Start the timer when entering full screen
      }
      
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const minutes = Math.floor(totalTimeLeft / 60);
  const remainingSeconds = totalTimeLeft % 60;
  const displaySeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  const openQuiz = () => {
    const appElement = document.documentElement;
    if (appElement.requestFullscreen) {
      appElement.requestFullscreen();
      setIsFullScreen(true);
      setTimerStarted(true); // Start the timer when the quiz is opened
    } else {
      setIsFullScreen(false);
    }
  };

  const handleOptionChange = (questionIndex, option) => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [questionIndex]: option
    }));
  };

  const handleNext = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      handleQuizSubmit();
    }
  };

  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleQuizSubmit = () => {
    setQuizEnded(true);
    localStorage.removeItem('responses');
    localStorage.removeItem('activeQuestionIndex');
    localStorage.removeItem('totalTimeLeft');
  };

  const renderQuiz = () => {
    if (quizEnded) {
      const correctAnswers = questions.filter((question, index) => responses[index] === question.answer).length;
      const totalQuestions = questions.length;

      return (
        <div className="bg-gray-100 min-h-screen">
          <div className="container mx-auto py-16">
            <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-8">Quiz Results</h1>
              <p className="text-2xl text-gray-800">You scored {correctAnswers} out of {totalQuestions}</p>
              <p className="text-lg text-gray-800 mt-4">Percentage: {((correctAnswers / totalQuestions) * 100).toFixed(2)}%</p>
              <p className="text-lg text-gray-800 mt-4">You Can exit the Test</p>
              <button className="w-fit mx-auto rounded-md text-md px-2 py-1 bg-green-600 text-white hover:bg-green-400 mt-8" onClick={() => {localStorage.clear(),window.location.reload()}}>
                Exit the window
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto py-16">
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg flex justify-center flex-col">
            <h1 className="text-2xl font-bold text-center">Question No. {activeQuestionIndex + 1}</h1>
            <h1 className="text-xl my-2 font-bold text-right">Time Left: {minutes}:{displaySeconds}</h1>
            <h2 className="text-2xl text-left font-bold mt-6">{questions[activeQuestionIndex]?.question}</h2>
            <div className="flex flex-col cursor-pointer px-4">
              {questions[activeQuestionIndex]?.options.map((option, index) => (
                <label key={index} className="m-4 flex items-center">
                  <input
                    type="radio"
                    name={`question-${activeQuestionIndex}`}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
                    checked={responses[activeQuestionIndex] === option}
                    onChange={() => handleOptionChange(activeQuestionIndex, option)}
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
            {warning && <p className="text-red-500 text-center mt-4">{warning}</p>}
            <div className="flex justify-between mt-4">
              <button
                className="rounded-md text-md px-2 py-1 bg-gray-600 text-white hover:bg-gray-400"
                onClick={handlePrevious}
                disabled={activeQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                className="rounded-md text-md px-2 py-1 bg-green-600 text-white hover:bg-green-400"
                onClick={handleNext}
              >
                {activeQuestionIndex < questions.length - 1 ? 'Next' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isFullScreen) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto py-16">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Welcome to Quiz App</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg flex justify-center flex-col">
            <h2 className="text-2xl text-center font-bold text-gray-800 mb-4">Start a Quiz</h2>
            <button
              className="w-fit mx-auto bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-center"
              onClick={openQuiz}
            >
              Click here
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return renderQuiz();
  }
};

export default App;
