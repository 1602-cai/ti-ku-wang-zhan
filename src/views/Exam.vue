<template>
  <div class="exam-container">
    <!-- 考试头部 -->
    <header class="exam-header">
      <div class="header-left">
        <h1>模拟考试</h1>
        <span class="exam-info">共 {{ questions.length }} 题</span>
      </div>
      
      <div class="header-center">
        <div class="timer" :class="{ 'warning': remainingTime < 300 }">
          <span class="timer-icon">⏱️</span>
          <span class="timer-text">{{ formatTime(remainingTime) }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <button class="btn btn-outline" @click="confirmSubmit">
          交卷
        </button>
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在生成试卷...</p>
    </div>

    <!-- 考试内容 -->
    <div v-else-if="currentQuestion" class="exam-content">
      <!-- 题目卡片 -->
      <div class="question-card">
        <div class="question-header">
          <span class="question-number">第 {{ currentQuestionIndex + 1 }} 题</span>
          <span class="question-type">{{ getQuestionTypeLabel(currentQuestion.type) }}</span>
          <span class="question-category">{{ currentQuestion.categoryName }}</span>
        </div>
        
        <h3 class="question-text">{{ currentQuestion.question }}</h3>
        
        <!-- 选项 -->
        <div class="options-list">
          <label 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            class="option-item"
            :class="{ 'selected': answers[currentQuestion.id] === index }"
          >
            <input 
              type="radio" 
              :name="'question-' + currentQuestion.id"
              :value="index"
              v-model="answers[currentQuestion.id]"
            >
            <span class="option-label">{{ ['A', 'B', 'C', 'D'][index] }}.</span>
            <span class="option-text">{{ option }}</span>
          </label>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="navigation-buttons">
        <button 
          class="btn btn-outline" 
          @click="prevQuestion"
          :disabled="currentQuestionIndex === 0"
        >
          ← 上一题
        </button>
        
        <button 
          class="btn btn-outline" 
          @click="nextQuestion"
          :disabled="currentQuestionIndex === questions.length - 1"
        >
          下一题 →
        </button>
      </div>
    </div>

    <!-- 题目导航栏 -->
    <div class="question-navigator" :class="{ 'navigator-collapsed': navigatorCollapsed }">
      <div class="navigator-header" @click="navigatorCollapsed = !navigatorCollapsed">
        <span class="navigator-title">答题卡</span>
        <span class="navigator-toggle">{{ navigatorCollapsed ? '展开' : '收起' }}</span>
      </div>
      
      <div v-show="!navigatorCollapsed" class="navigator-content">
        <div class="navigator-stats">
          <span class="stat-item">
            <span class="stat-dot answered"></span>
            已答 {{ answeredCount }}
          </span>
          <span class="stat-item">
            <span class="stat-dot unanswered"></span>
            未答 {{ questions.length - answeredCount }}
          </span>
        </div>
        
        <div class="navigator-grid">
          <button 
            v-for="(q, index) in questions" 
            :key="q.id"
            class="nav-btn"
            :class="{
              'current': index === currentQuestionIndex,
              'answered': answers[q.id] !== undefined
            }"
            @click="goToQuestion(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
      </div>
    </div>

    <!-- 交卷确认弹窗 -->
    <div v-if="showSubmitModal" class="modal-overlay">
      <div class="modal-content">
        <h3>确认交卷？</h3>
        
        <div class="submit-summary">
          <div class="summary-item">
            <span class="summary-label">总题数：</span>
            <span class="summary-value">{{ questions.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">已答题：</span>
            <span class="summary-value answered">{{ answeredCount }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">未答题：</span>
            <span class="summary-value unanswered">{{ questions.length - answeredCount }}</span>
          </div>
        </div>

        <div v-if="answeredCount < questions.length" class="warning-message">
          ⚠️ 还有 {{ questions.length - answeredCount }} 道题未作答，是否确认交卷？
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="showSubmitModal = false">
            继续答题
          </button>
          <button class="btn btn-primary" @click="submitExam">
            确认交卷
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories, getRandomQuestionsByRatio } from '../data/questionLoader.js'

const router = useRouter()

// 状态
const loading = ref(true)
const questions = ref([])
const currentQuestionIndex = ref(0)
const answers = ref({})
const remainingTime = ref(3600)
const timer = ref(null)
const navigatorCollapsed = ref(false)
const showSubmitModal = ref(false)
const examConfig = ref(null)

// 计算属性
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})

const answeredCount = computed(() => {
  return Object.keys(answers.value).length
})

const scoreClass = computed(() => {
  // 用于显示不同的颜色
  return ''
})

// 方法
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getQuestionTypeLabel = (type) => {
  const labels = {
    'single': '单选题',
    'multiple': '多选题',
    'judge': '判断题'
  }
  return labels[type] || '单选题'
}

const goToQuestion = (index) => {
  currentQuestionIndex.value = index
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const confirmSubmit = () => {
  showSubmitModal.value = true
}

const submitExam = () => {
  clearInterval(timer.value)
  
  // 计算得分
  let correct = 0
  questions.value.forEach(q => {
    if (answers.value[q.id] === q.correctAnswer) {
      correct++
    }
  })
  
  const score = Math.round((correct / questions.value.length) * 100)
  
  // 保存考试结果
  const result = {
    questions: questions.value,
    answers: answers.value,
    score,
    correctCount: correct,
    wrongCount: questions.value.length - correct,
    totalQuestions: questions.value.length,
    timeUsed: (examConfig.value?.timeLimit || 60) * 60 - remainingTime.value,
    examConfig: examConfig.value
  }
  
  localStorage.setItem('examResult', JSON.stringify(result))
  
  // 跳转到结果页面
  router.push('/exam-result')
}

// 初始化
onMounted(async () => {
  // 从localStorage加载考试配置
  const savedConfig = localStorage.getItem('examConfig')
  if (savedConfig) {
    examConfig.value = JSON.parse(savedConfig)
  } else {
    // 默认配置
    examConfig.value = {
      categories: ['hse', 'instrument', 'process', 'equipment'],
      questionCount: 50,
      timeLimit: 60
    }
  }
  
  // 设置考试时间
  remainingTime.value = (examConfig.value.timeLimit || 60) * 60
  
  // 加载题目
  try {
    loading.value = true
    
    // 使用按比例抽题
    questions.value = await getRandomQuestionsByRatio({
      categories: examConfig.value.categories,
      questionCount: examConfig.value.questionCount
    })
    
    // 为每道题添加分类名称
    const categoryMap = {
      'hse': 'HSE通用',
      'instrument': '仪表维修',
      'process': '工艺通用',
      'equipment': '设备通用'
    }
    
    questions.value.forEach(q => {
      q.categoryName = categoryMap[q.category] || q.category
    })
    
    console.log(`已加载 ${questions.value.length} 道题目`)
    
    loading.value = false
    
    // 启动倒计时
    timer.value = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--
      } else {
        // 时间到，自动交卷
        submitExam()
      }
    }, 1000)
    
  } catch (error) {
    console.error('加载题目失败:', error)
    loading.value = false
  }
})

onUnmounted(() => {
  clearInterval(timer.value)
})
</script>

<style scoped>
.exam-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  font-size: 20px;
  color: #333;
}

.exam-info {
  color: #666;
  font-size: 14px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f0f0f0;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.timer.warning {
  background: #ffebee;
  color: #f44336;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.timer-icon {
  font-size: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 16px;
}

.exam-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
}

.question-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.question-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.question-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.question-category {
  background: #f3e5f5;
  color: #7b1fa2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.question-text {
  font-size: 18px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 30px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.option-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.option-item input {
  display: none;
}

.option-label {
  font-weight: 600;
  margin-right: 10px;
  min-width: 24px;
}

.option-text {
  flex: 1;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

/* 答题卡样式 */
.question-navigator {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 99;
}

.navigator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
}

.navigator-title {
  font-weight: 600;
  color: #333;
}

.navigator-toggle {
  color: #667eea;
  font-size: 14px;
}

.navigator-content {
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.navigator-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.stat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.stat-dot.answered {
  background: #2196f3;
}

.stat-dot.unanswered {
  background: #e0e0e0;
}

.navigator-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  gap: 8px;
}

.navigator-collapsed .navigator-content {
  display: none;
}

.nav-btn {
  width: 45px;
  height: 45px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.nav-btn:hover {
  border-color: #667eea;
}

.nav-btn.current {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.nav-btn.answered {
  background: #e3f2fd;
  border-color: #2196f3;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 450px;
  width: 100%;
  text-align: center;
}

.modal-content h3 {
  font-size: 24px;
  margin-bottom: 24px;
  color: #333;
}

.submit-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  color: #666;
}

.summary-value {
  font-weight: 600;
  color: #333;
}

.summary-value.answered {
  color: #4caf50;
}

.summary-value.unanswered {
  color: #f44336;
}

.warning-message {
  background: #fff3e0;
  color: #e65100;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 15px;
}

.modal-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .exam-header {
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 15px;
  }
  
  .header-left h1 {
    font-size: 16px;
  }
  
  .timer {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .exam-content {
    padding-bottom: 100px;
  }
  
  .question-card {
    padding: 20px;
  }
  
  .question-text {
    font-size: 16px;
  }
  
  .option-item {
    padding: 12px 16px;
  }
}
</style>
