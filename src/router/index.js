import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Practice from '../views/Practice.vue'
import Exam from '../views/Exam.vue'
import ExamResult from '../views/ExamResult.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/practice/:category?',
    name: 'Practice',
    component: Practice
  },
  {
    path: '/exam',
    name: 'Exam',
    component: Exam
  },
  {
    path: '/exam-result',
    name: 'ExamResult',
    component: ExamResult
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
