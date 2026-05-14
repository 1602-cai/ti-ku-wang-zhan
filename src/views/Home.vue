<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="title">模拟考试系统</h1>
      <p class="subtitle">选择模式开始练习或参加模拟考试</p>
    </div>

    <div class="mode-selection">
      <div class="mode-card" @click="goToPractice">
        <div class="mode-icon">📚</div>
        <h2>模拟做题</h2>
        <p>自由练习模式，即时查看答案和解析</p>
        <ul class="feature-list">
          <li>✓ 可选择题库分类</li>
          <li>✓ 即时显示正确答案</li>
          <li>✓ 查看详细解析</li>
        </ul>
        <button class="btn btn-primary">开始练习</button>
      </div>

      <div class="mode-card" @click="showExamConfig">
        <div class="mode-icon">📝</div>
        <h2>模拟考试</h2>
        <p>真实考试模拟，随机抽题，限时作答</p>
        <ul class="feature-list">
          <li>✓ 随机抽题，每次不同</li>
          <li>✓ 按题库比例出题</li>
          <li>✓ 计时考试，交卷评分</li>
        </ul>
        <button class="btn btn-secondary">开始考试</button>
      </div>
    </div>

    <!-- 考试配置弹窗 -->
    <div v-if="showConfigModal" class="modal-overlay" @click.self="closeConfigModal">
      <div class="modal-content">
        <h3>考试设置</h3>
        
        <div class="config-section">
          <label>选择题库分类：</label>
          <div class="category-checkboxes">
            <label v-for="cat in categories" :key="cat.id" class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="selectedCategories" 
                :value="cat.id"
              >
              <span>{{ cat.name }}</span>
            </label>
          </div>
        </div>

        <div class="config-section">
          <label>题目数量：{{ questionCount }} 题</label>
          <input 
            type="range" 
            v-model.number="questionCount" 
            min="10" 
            max="100" 
            step="10"
          >
        </div>

        <div class="config-section">
          <label>考试时长：{{ timeLimit }} 分钟</label>
          <input 
            type="range" 
            v-model.number="timeLimit" 
            min="15" 
            max="120" 
            step="15"
          >
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeConfigModal">取消</button>
          <button class="btn btn-primary" @click="startExam" :disabled="selectedCategories.length === 0">
            开始考试
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { categories } from '../data/questions.js'

const router = useRouter()

const showConfigModal = ref(false)
const selectedCategories = ref([])
const questionCount = ref(50)
const timeLimit = ref(60)

const goToPractice = () => {
  router.push('/practice')
}

const showExamConfig = () => {
  // 默认全选所有分类
  selectedCategories.value = categories.map(c => c.id)
  showConfigModal.value = true
}

const closeConfigModal = () => {
  showConfigModal.value = false
}

const startExam = () => {
  // 保存考试配置到localStorage
  const examConfig = {
    categories: selectedCategories.value,
    questionCount: questionCount.value,
    timeLimit: timeLimit.value
  }
  localStorage.setItem('examConfig', JSON.stringify(examConfig))
  
  closeConfigModal()
  router.push('/exam')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 50px;
  color: white;
}

.title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.subtitle {
  font-size: 20px;
  opacity: 0.9;
}

.mode-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.mode-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.mode-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.mode-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.mode-card h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 12px;
}

.mode-card > p {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
  text-align: left;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.feature-list li {
  padding: 8px 0;
  color: #555;
  font-size: 15px;
}

.btn {
  padding: 14px 40px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-secondary:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  color: #333;
}

.config-section {
  margin-bottom: 24px;
}

.config-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: #555;
}

.category-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.checkbox-label:hover {
  background: #f0f0f0;
}

.checkbox-label input {
  margin-right: 10px;
  width: 18px;
  height: 18px;
}

.checkbox-label span {
  font-size: 14px;
  color: #444;
}

input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.modal-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .mode-selection {
    grid-template-columns: 1fr;
  }
  
  .title {
    font-size: 32px;
  }
  
  .mode-card {
    padding: 30px 20px;
  }
}
</style>
