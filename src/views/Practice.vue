<template>
  <div class="practice-container">
    <!-- 侧边栏：题库选择 -->
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <h3>题库选择</h3>
        <button class="close-sidebar" @click="sidebarOpen = false">×</button>
      </div>
      
      <div class="category-list">
        <div 
          v-for="cat in categories" 
          :key="cat.id"
          class="category-item"
          :class="{ active: selectedCategories.includes(cat.id) }"
          @click="toggleCategory(cat.id)"
        >
          <div class="category-info">
            <span class="category-name">{{ cat.name }}</span>
            <span class="question-count">{{ cat.totalQuestions }}题</span>
          </div>
          <span class="check-icon" v-if="selectedCategories.includes(cat.id)">✓</span>
        </div>
      </div>

      <div class="sidebar-footer">
        <button class="btn btn-primary" @click="loadQuestions" :disabled="selectedCategories.length === 0">
          开始练习
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <header class="top-bar">
        <button class="menu-btn" @click="sidebarOpen = true">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 class="page-title">模拟练习</h1>
        <button class="btn btn-secondary" @click="goHome">返回首页</button>
      </header>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载题目...</p>
      </div>

      <!-- 题目区域 -->
      <div class="question-area" v-else-if="currentQuestion">
        <!-- 进度信息 -->
        <div class="progress-info">
          <span class="question-number">
            第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题
          </span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <!-- 题目内容 -->
        <div class="question-card">
          <div class="question-header">
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
              :class="{
                'selected': answers[currentQuestion.id] === index,
                'correct': showAnswer && currentQuestion.correctAnswer === index,
                'wrong': showAnswer && answers[currentQuestion.id] === index && answers[currentQuestion.id] !== currentQuestion.correctAnswer
              }"
            >
              <input 
                type="radio" 
                :name="'question-' + currentQuestion.id"
                :value="index"
                v-model="answers[currentQuestion.id]"
                @change="selectAnswer(index)"
              >
              <span class="option-label">{{ ['A', 'B', 'C', 'D'][index] }}.</span>
              <span class="option-text">{{ option }}</span>
            </label>
          </div>

          <!-- 答案解析 -->
          <div v-if="showAnswer" class="answer-explanation">
            <div class="correct-answer">
              <strong>正确答案：</strong>{{ ['A', 'B', 'C', 'D'][currentQuestion.correctAnswer] }}
            </div>
            <div class="explanation-text">
              <strong>解析：</strong>{{ currentQuestion.explanation || '暂无解析' }}
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="navigation-buttons">
          <button 
            class="btn btn-outline" 
            @click="prevQuestion"
            :disabled="currentQuestionIndex === 0"
          >
            上一题
          </button>
          
          <button 
            v-if="!showAnswer"
            class="btn btn-primary"
            @click="showAnswer = true"
          >
            查看答案
          </button>
          
          <button 
            class="btn btn-primary" 
            @click="nextQuestion"
            :disabled="currentQuestionIndex === questions.length - 1"
          >
            下一题
          </button>
        </div>

        <!-- 题目导航 -->
        <div class="question-navigator">
          <span class="navigator-label">快速跳转：</span>
          <div class="navigator-buttons">
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

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📚</div>
        <h2>请选择题库开始练习</h2>
        <p>从左侧菜单选择题库分类，点击"开始练习"按钮</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories, getRandomQuestions } from '../data/questionLoader.js'

const router = useRouter()

// 状态
const sidebarOpen = ref(false)
const categories = ref([])
const selectedCategories = ref([])
const questions = ref([])
const currentQuestionIndex = ref(0)
const answers = ref({})
const showAnswer = ref(false)
const loading = ref(false)

// 计算属性
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})

const progress = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100)
})

// 方法
const toggleCategory = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(categoryId)
  }
}

const loadQuestions = async () => {
  if (selectedCategories.value.length === 0) return
  
  loading.value = true
  
  try {
    // 从选中的分类中随机抽取题目
    const loadedQuestions = await getRandomQuestions({
      categories: selectedCategories.value,
      questionCount: 100 // 练习模式默认加载100题
    })
    
    // 添加分类名称
    const categoryMap = {
      'hse': 'HSE通用',
      'instrument': '仪表维修',
      'process': '工艺通用',
      'equipment': '设备通用'
    }
    
    loadedQuestions.forEach(q => {
      q.categoryName = categoryMap[q.category] || q.category
    })
    
    questions.value = loadedQuestions
    currentQuestionIndex.value = 0
    answers.value = {}
    showAnswer.value = false
    sidebarOpen.value = false
    
    console.log(`已加载 ${loadedQuestions.length} 道题目`)
  } catch (error) {
    console.error('加载题目失败:', error)
    alert('加载题目失败，请重试')
  } finally {
    loading.value = false
  }
}

const getQuestionTypeLabel = (type) => {
  const labels = {
    'single': '单选题',
    'multiple': '多选题',
    'judge': '判断题'
  }
  return labels[type] || '单选题'
}

const selectAnswer = (index) => {
  answers.value[currentQuestion.value.id] = index
  showAnswer.value = false
}

const goToQuestion = (index) => {
  currentQuestionIndex.value = index
  showAnswer.value = false
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    showAnswer.value = false
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    showAnswer.value = false
  }
}

const goHome = () => {
  router.push('/')
}

// 初始化
onMounted(async () => {
  try {
    categories.value = await getCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
})
</script>

<style scoped>
.practice-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 360px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h3 {
  font-size: 18px;
  color: #333;
}

.close-sidebar {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.category-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.category-item:hover {
  background: #f5f5f5;
}

.category-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.category-item.active .question-count,
.category-item.active .category-name {
  color: white;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
}

.question-count {
  font-size: 12px;
  color: #999;
}

.check-icon {
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.main-content {
  flex: 1;
  margin-left: 0;
  min-height: 100vh;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.menu-btn {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
}

.menu-btn span {
  display: block;
  width: 24px;
  height: 3px;
  background: #333;
  border-radius: 2px;
}

.page-title {
  font-size: 20px;
  color: #333;
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

.question-area {
  max-width: 900px;
  margin: 30px auto;
  padding: 0 20px;
}

.progress-info {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.question-number {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 10px;
  display: block;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.question-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.question-type {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.question-category {
  background: #f0f0f0;
  color: #666;
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

.option-item.correct {
  border-color: #4caf50;
  background: #e8f5e9;
}

.option-item.wrong {
  border-color: #f44336;
  background: #ffebee;
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

.answer-explanation {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #4caf50;
}

.correct-answer {
  font-size: 16px;
  color: #4caf50;
  margin-bottom: 10px;
}

.explanation-text {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  gap: 15px;
}

.btn-outline {
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-navigator {
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.navigator-label {
  font-weight: 600;
  color: #666;
  margin-bottom: 15px;
  display: block;
}

.navigator-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.nav-btn {
  width: 40px;
  height: 40px;
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

.empty-state {
  text-align: center;
  padding: 100px 20px;
  color: white;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 16px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .sidebar {
    width: 320px;
  }
  
  .mode-selection {
    grid-template-columns: 1fr;
  }
  
  .title {
    font-size: 32px;
  }
  
  .question-card {
    padding: 20px;
  }
  
  .question-text {
    font-size: 16px;
  }
  
  .navigation-buttons {
    flex-wrap: wrap;
  }
  
  .navigation-buttons .btn {
    flex: 1;
    min-width: 100px;
  }
}
</style>
