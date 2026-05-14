<template>
  <div class="result-container">
    <div class="result-card">
      <!-- 成绩头部 -->
      <div class="result-header">
        <h1>考试成绩</h1>
        <div class="score-circle" :class="scoreClass">
          <span class="score-number">{{ score }}</span>
          <span class="score-label">分</span>
        </div>
        <p class="result-message">{{ resultMessage }}</p>
      </div>

      <!-- 统计信息 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-value">{{ totalQuestions }}</div>
          <div class="stat-label">总题数</div>
        </div>
        <div class="stat-card correct">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ correctCount }}</div>
          <div class="stat-label">正确</div>
        </div>
        <div class="stat-card wrong">
          <div class="stat-icon">❌</div>
          <div class="stat-value">{{ wrongCount }}</div>
          <div class="stat-label">错误</div>
        </div>
        <div class="stat-card time">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ formatTime(timeUsed) }}</div>
          <div class="stat-label">用时</div>
        </div>
      </div>

      <!-- 答题详情 -->
      <div class="detail-section">
        <h2>答题详情</h2>
        <div class="detail-grid">
          <div 
            v-for="(item, index) in answerDetails" 
            :key="index"
            class="detail-item"
            :class="{ 'correct': item.isCorrect, 'wrong': !item.isCorrect }"
          >
            <span class="detail-number">{{ index + 1 }}</span>
            <span class="detail-status">
              {{ item.isCorrect ? '✓' : '✗' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn btn-outline" @click="newExam">
          再考一次
        </button>
        <button class="btn btn-primary" @click="goHome">
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 考试结果数据
const examResult = ref(null)

// 计算属性
const score = computed(() => {
  return examResult.value?.score || 0
})

const scoreClass = computed(() => {
  if (score.value >= 90) return 'excellent'
  if (score.value >= 80) return 'good'
  if (score.value >= 60) return 'pass'
  return 'fail'
})

const resultMessage = computed(() => {
  if (score.value >= 90) return '太棒了！成绩优秀！'
  if (score.value >= 80) return '很好！继续保持！'
  if (score.value >= 60) return '及格了，再接再厉！'
  return '继续加油，下次会更好！'
})

const totalQuestions = computed(() => {
  return examResult.value?.totalQuestions || 0
})

const correctCount = computed(() => {
  return examResult.value?.correctCount || 0
})

const wrongCount = computed(() => {
  return examResult.value?.wrongCount || 0
})

const timeUsed = computed(() => {
  return examResult.value?.timeUsed || 0
})

const answerDetails = computed(() => {
  if (!examResult.value?.questions) return []
  
  return examResult.value.questions.map((q, i) => ({
    questionIndex: i,
    isCorrect: examResult.value.answers[q.id] === q.correctAnswer
  }))
})

// 方法
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const newExam = () => {
  router.push('/exam')
}

const goHome = () => {
  router.push('/')
}

// 初始化
onMounted(() => {
  // 从localStorage加载考试结果
  const savedResult = localStorage.getItem('examResult')
  if (savedResult) {
    examResult.value = JSON.parse(savedResult)
  } else {
    // 如果没有结果，返回首页
    router.push('/')
  }
})
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.result-card {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.result-header {
  text-align: center;
  margin-bottom: 40px;
}

.result-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 30px;
}

.score-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.score-circle.excellent {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
}

.score-circle.good {
  background: linear-gradient(135deg, #2196f3 0%, #1565c0 100%);
}

.score-circle.pass {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.score-circle.fail {
  background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
}

.score-number {
  font-size: 56px;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 18px;
  margin-top: 5px;
}

.result-message {
  font-size: 20px;
  color: #666;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card.correct {
  background: #e8f5e9;
}

.stat-card.wrong {
  background: #ffebee;
}

.stat-card.time {
  background: #e3f2fd;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-card.correct .stat-value {
  color: #4caf50;
}

.stat-card.wrong .stat-value {
  color: #f44336;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.detail-section {
  margin-bottom: 40px;
}

.detail-section h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 10px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
}

.detail-item:hover {
  transform: scale(1.05);
}

.detail-item.correct {
  background: #c8e6c9;
}

.detail-item.wrong {
  background: #ffcdd2;
}

.detail-number {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.detail-status {
  font-size: 16px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

@media (max-width: 768px) {
  .result-card {
    padding: 24px;
  }
  
  .score-circle {
    width: 140px;
    height: 140px;
  }
  
  .score-number {
    font-size: 40px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .action-buttons .btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>
