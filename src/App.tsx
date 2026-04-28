import { useState, useCallback, useMemo } from 'react'
import './App.css'

// Import all unit data
import unit1Data from '../data/Unit1.json'
import unit5Data from '../data/Unit5.json'
import unit6Data from '../data/Unit6.json'
import unit7Data from '../data/Unit7.json'
import unit8Data from '../data/Unit8.json'
import unit10Data from '../data/Unit10.json'
import unit11Data from '../data/Unit11.json'

interface Question {
  q: string
  options: string[]
  answer: number
}

interface UnitInfo {
  id: string
  label: string
  name: string
  data: Question[]
}

type Screen = 'landing' | 'quiz' | 'results'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

const UNITS: UnitInfo[] = [
  { id: 'u1', label: 'Unit 1', name: 'Structure Of Computers', data: unit1Data as Question[] },
  { id: 'u5', label: 'Unit 5', name: 'Microprogrammed Control Organization', data: unit5Data as Question[] },
  { id: 'u6', label: 'Unit 6', name: 'CPU Organization & Addressing', data: unit6Data as Question[] },
  { id: 'u7', label: 'Unit 7', name: 'Pipelining & Parallel Processing', data: unit7Data as Question[] },
  { id: 'u8', label: 'Unit 8', name: 'I/O Organization', data: unit8Data as Question[] },
  { id: 'u10', label: 'Unit 10', name: 'Computer Arithmetic', data: unit10Data as Question[] },
  { id: 'u11', label: 'Unit 11', name: 'Multiprocessor Systems', data: unit11Data as Question[] },
]

function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>([])

  // All questions flattened with unit info
  const allQuestions = useMemo(() => {
    const result: { question: Question; unitLabel: string; unitName: string }[] = []
    for (const unit of UNITS) {
      for (const q of unit.data) {
        result.push({ question: q, unitLabel: unit.label, unitName: unit.name })
      }
    }
    return result
  }, [])

  const totalQuestions = allQuestions.length
  const totalMarks = totalQuestions

  const current = allQuestions[currentIndex]
  const currentQuestion = current?.question

  const handleBegin = useCallback(() => {
    setScreen('quiz')
    setCurrentIndex(0)
    setScore(0)
    setSelectedOption(null)
    setAnswered(false)
    setAnswers(new Array(totalQuestions).fill(null))
  }, [totalQuestions])

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (answered || !currentQuestion) return
      setSelectedOption(optionIndex)
      setAnswered(true)

      const newAnswers = [...answers]
      newAnswers[currentIndex] = optionIndex
      setAnswers(newAnswers)

      if (optionIndex === currentQuestion.answer) {
        setScore((prev) => prev + 1)
      }
    },
    [answered, answers, currentIndex, currentQuestion]
  )

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setAnswered(false)
    } else {
      setScreen('results')
    }
  }, [currentIndex, totalQuestions])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      const prevAnswer = answers[currentIndex - 1]
      setSelectedOption(prevAnswer)
      setAnswered(prevAnswer !== null)
    }
  }, [currentIndex, answers])

  const getOptionClass = (optionIndex: number): string => {
    if (!answered || !currentQuestion) return ''
    if (optionIndex === selectedOption) {
      return optionIndex === currentQuestion.answer
        ? 'option-correct'
        : 'option-wrong'
    }
    if (
      selectedOption !== currentQuestion.answer &&
      optionIndex === currentQuestion.answer
    ) {
      return 'option-reveal-correct'
    }
    return 'option-disabled'
  }

  const correctCount = answers.filter(
    (a, i) => a !== null && a === allQuestions[i].question.answer
  ).length
  const wrongCount = answers.filter(
    (a, i) => a !== null && a !== allQuestions[i].question.answer
  ).length
  const percentage = Math.round((correctCount / totalQuestions) * 100)

  const getResultMessage = () => {
    if (percentage >= 90) return 'Outstanding! You nailed it! 🔥'
    if (percentage >= 70) return 'Great job! Keep it up! 💪'
    if (percentage >= 50) return 'Good effort! Room to improve 📚'
    return "Keep studying, you'll get there! 💡"
  }

  return (
    <div className="quiz-app">
      {/* Header */}
      <header className="quiz-header">
        <div className="quiz-badge">· COA · MID 2 ·</div>
        <h1 className="quiz-title">
          <span className="quiz-title-top">COA</span>
          <span className="quiz-title-bottom">QUIZ</span>
        </h1>
        <p className="quiz-subtitle">
          1 mark each <span>·</span> no negative marking <span>·</span> must
          answer to proceed
        </p>
      </header>

      {/* ===== LANDING SCREEN ===== */}
      {screen === 'landing' && (
        <div className="landing-page">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{totalQuestions}</div>
              <div className="stat-label">Questions</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{totalMarks}</div>
              <div className="stat-label">Total Marks</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚫</div>
              <div className="stat-value">0</div>
              <div className="stat-label">Negative Marking</div>
            </div>
          </div>

          <div className="topics-grid">
            {UNITS.map((unit) => (
              <div className="topic-card" key={unit.id}>
                <div className="topic-label">{unit.label}</div>
                <div className="topic-name">
                  {unit.name} ({unit.data.length} Qs)
                </div>
              </div>
            ))}
          </div>

          <button className="begin-btn" id="begin-btn" onClick={handleBegin}>
            Begin →
          </button>
        </div>
      )}

      {/* ===== QUIZ SCREEN ===== */}
      {screen === 'quiz' && currentQuestion && (
        <>
          <div className="progress-section">
            <span className="progress-text">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="score-text">
              Score: <span className="score-value">{score}</span>
            </span>
          </div>

          <div className="topic-banner">
            <span className="topic-banner-text">
              {current.unitLabel} · {current.unitName}
            </span>
          </div>

          <div className="question-card">
            <div className="question-card-inner">
              <div className="question-watermark">{currentIndex + 1}</div>

              <div className="question-meta">
                <span className="question-number">Q{currentIndex + 1}</span>
                <span className="question-meta-sep">·</span>
                <span className="question-mark">1 Mark</span>
              </div>

              <h2 className="question-text">{currentQuestion.q}</h2>

              <div className="options-list">
                {currentQuestion.options.map((option, i) => (
                  <button
                    key={`${currentIndex}-${i}`}
                    id={`option-${i}`}
                    className={`option-btn ${getOptionClass(i)} ${answered ? 'option-disabled' : ''}`}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                  >
                    <span className="option-letter">{LETTERS[i]}</span>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>

              {answered && (
                <div
                  className={`feedback-banner ${selectedOption === currentQuestion.answer
                    ? 'feedback-correct'
                    : 'feedback-wrong'
                    }`}
                >
                  {selectedOption === currentQuestion.answer
                    ? '✓ Correct!'
                    : `✗ Wrong! Answer: ${LETTERS[currentQuestion.answer]}) ${currentQuestion.options[currentQuestion.answer]}`}
                </div>
              )}
            </div>
          </div>

          <div className="nav-row">
            <button
              className="nav-btn nav-prev"
              id="prev-btn"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ← Prev
            </button>
            <button
              className="nav-btn nav-next"
              id="next-btn"
              onClick={handleNext}
              disabled={!answered}
            >
              {currentIndex === totalQuestions - 1 ? 'Finish →' : 'Next →'}
            </button>
          </div>
        </>
      )}

      {/* ===== RESULTS SCREEN ===== */}
      {screen === 'results' && (
        <div className="results-page">
          <div className="results-score-circle">
            <div className="results-score-value">{correctCount}</div>
            <div className="results-score-total">/ {totalQuestions}</div>
          </div>

          <div className="results-percentage">{percentage}%</div>
          <div className="results-message">{getResultMessage()}</div>

          <div className="results-stats-row">
            <div className="results-stat">
              <div className="results-stat-value correct">{correctCount}</div>
              <div className="results-stat-label">Correct</div>
            </div>
            <div className="results-stat">
              <div className="results-stat-value wrong">{wrongCount}</div>
              <div className="results-stat-label">Wrong</div>
            </div>
            <div className="results-stat">
              <div className="results-stat-value skipped">0</div>
              <div className="results-stat-label">Neg. Marks</div>
            </div>
          </div>

          <button
            className="restart-btn"
            id="restart-btn"
            onClick={handleBegin}
          >
            Restart →
          </button>
        </div>
      )}
    </div>
  )
}

export default App
