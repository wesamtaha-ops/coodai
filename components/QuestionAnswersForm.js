import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './QuestionAnswersForm.module.css';

const QuestionAnswersForm = ({ clientName }) => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [questionInput, setQuestionInput] = useState('');
    const [answerInput, setAnswerInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQA();
    }, []);

    const fetchQA = async () => {
        try {
            const response = await axios.get(`/api/questions/${clientName}`);
            const { questions, answers } = response.data;
            setQuestions(questions);
            setAnswers(answers);
        } catch (error) {
            console.error(error);
            setError('Error fetching QA data.');
        }
    };

    const addQA = async () => {
        if (questionInput.trim() === '' || answerInput.trim() === '') {
            setError('Question and Answer cannot be empty.');
            return;
        }

        const newQuestions = [...questions, questionInput.trim()];
        const newAnswers = [...answers, answerInput.trim()];

        setQuestions(newQuestions);
        setAnswers(newAnswers);
        setQuestionInput('');
        setAnswerInput('');
        setError('');

        try {
            await axios.post(`/api/questions/${clientName}`, {
                questions: newQuestions,
                answers: newAnswers,
            });
        } catch (error) {
            console.error(error);
            setError('Error updating QA data.');
        }
    };

    const updateQA = async (index, updatedQuestion, updatedAnswer) => {
        const newQuestions = [...questions];
        const newAnswers = [...answers];
        newQuestions[index] = updatedQuestion;
        newAnswers[index] = updatedAnswer;

        setQuestions(newQuestions);
        setAnswers(newAnswers);

        try {
            await axios.post(`/api/questions/${clientName}`, {
                questions: newQuestions,
                answers: newAnswers,
            });
        } catch (error) {
            console.error(error);
            setError('Error updating QA data.');
        }
    };

    const removeQA = async (index) => {
        const newQuestions = [...questions];
        const newAnswers = [...answers];
        newQuestions.splice(index, 1);
        newAnswers.splice(index, 1);

        setQuestions(newQuestions);
        setAnswers(newAnswers);

        try {
            await axios.post(`/api/questions/${clientName}`, {
                questions: newQuestions,
                answers: newAnswers,
            });
        } catch (error) {
            console.error(error);
            setError('Error removing QA data.');
        }
    };

    const handleQuestionInputChange = (event) => {
        setQuestionInput(event.target.value);
        setError('');
    };

    const handleAnswerInputChange = (event) => {
        setAnswerInput(event.target.value);
        setError('');
    };

    return (
        <div className={styles.container}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.form}>
                <h5 className={styles.title}>Add New Question</h5>

                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        value={questionInput}
                        onChange={handleQuestionInputChange}
                        placeholder="Enter Question"
                        style={{ maxHeight: 50 }}
                    />
                    <textarea
                        value={answerInput}
                        onChange={handleAnswerInputChange}
                        placeholder="Enter Answer"
                        style={{ minHeight: 100 }}
                    />
                    <button onClick={addQA} className={styles.button}>Add</button>
                </div>

                <div className={styles.qaContainer}>
                    <br />
                    <h5 className={styles.title}>Question and Answers</h5>

                    {questions.map((question, index) => (
                        <div key={index} className={styles.qaItem}>
                            <input
                                type="text"
                                value={question}
                                onChange={(event) =>
                                    updateQA(index, event.target.value, answers[index])
                                }
                            />
                            <textarea
                                value={answers[index]}
                                onChange={(event) =>
                                    updateQA(index, question, event.target.value)
                                }
                                style={{ minHeight: 80 }}
                            />
                            <button onClick={() => removeQA(index)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionAnswersForm;
