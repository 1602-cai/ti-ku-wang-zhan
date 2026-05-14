import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExamStore = defineStore('exam', () => {
  // 状态
  const questions = ref([])
  const currentQuestionIndex = ref(0)
  const answers = ref({})
  const examMode = ref(false) // true: 考试模式, false: 练习模式
  const examStartTime = ref(null)
  const examEndTime = ref(null)
  const selectedCategories = ref([])
  const examTimeLimit = ref(60) // 默认60分钟

  // 获取器
  const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value] || null
  })

  const progress = computed(() => {
    if (questions.value.length === 0) return 0
    return Math.round((Object.keys(answers.value).length / questions.value.length) * 100)
  })

  const answeredCount = computed(() => {
    return Object.keys(answers.value).length
  })

  const isExamFinished = computed(() => {
    return examEndTime.value !== null
  })

  // 方法
  function setQuestions(newQuestions) {
    questions.value = newQuestions
  }

  function setAnswer(questionId, answer) {
    answers.value[questionId] = answer
  }

  function goToQuestion(index) {
    if (index >= 0 && index < questions.value.length) {
      currentQuestionIndex.value = index
    }
  }

  function nextQuestion() {
    goToQuestion(currentQuestionIndex.value + 1)
  }

  function prevQuestion() {
    goToQuestion(currentQuestionIndex.value - 1)
  }

  function startExam(timeLimit = 60) {
    examMode.value = true
    examStartTime.value = Date.now()
    examEndTime.value = null
    examTimeLimit.value = timeLimit
    answers.value = {}
    currentQuestionIndex.value = 0
  }

  function startPractice() {
    examMode.value = false
    examStartTime.value = null
    examEndTime.value = null
    answers.value = {}
    currentQuestionIndex.value = 0
  }

  function finishExam() {
    examEndTime.value = Date.now()
  }

  function calculateScore() {
    let correct = 0
    questions.value.forEach(q => {
      if (answers.value[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return {
      total: questions.value.length,
      correct,
      wrong: questions.value.length - correct,
      score: Math.round((correct / questions.value.length) * 100)
    }
  }

  function reset() {
    questions.value = []
    currentQuestionIndex.value = 0
    answers.value = {}
    examMode.value = false
    examStartTime.value = null
    examEndTime.value = null
    selectedCategories.value = []
  }

  return {
    // 状态
    questions,
    currentQuestionIndex,
    answers,
    examMode,
    examStartTime,
    examEndTime,
    selectedCategories,
    examTimeLimit,
    // 获取器
    currentQuestion,
    progress,
    answeredCount,
    isExamFinished,
    // 方法
    setQuestions,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    startExam,
    startPractice,
    finishExam,
    calculateScore,
    reset
  }
})
