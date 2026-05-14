// 题库数据 - 解析Excel文件后生成
// 实际使用时，这些数据应该从Excel文件解析而来

// 这里我先创建一个数据结构示例
// 真实数据将通过脚本解析Excel文件生成

export const categories = [
  { id: 'hse', name: 'HSE通用题库（技能）', file: 'HSE通用题库（技能）.xls' },
  { id: 'instrument', name: '仪表维修工专业题库500题（班员）', file: '仪表维修工专业题库500题（班员）.xls' },
  { id: 'process', name: '工艺通用题库（技能）', file: '工艺通用题库（技能）.xls' },
  { id: 'equipment', name: '设备通用题库（技能）', file: '设备通用题库（技能）.xls' }
]

// 临时示例数据 - 实际会从Excel解析
export const sampleQuestions = [
  {
    id: '1',
    category: 'hse',
    type: 'single',
    question: '以下哪项是HSE管理体系的核心要素？',
    options: ['领导作用', '事故调查', '财务报表', '市场营销'],
    correctAnswer: 0,
    explanation: 'HSE管理体系中，领导作用是核心要素之一。'
  },
  {
    id: '2',
    category: 'hse',
    type: 'single',
    question: '在进入受限空间作业前，必须进行什么检测？',
    options: ['氧气含量', '温度', '湿度', '噪音'],
    correctAnswer: 0,
    explanation: '受限空间作业前必须检测氧气含量，确保安全。'
  }
]

// 从Excel解析题目的函数
export async function parseExcelQuestions(fileContent) {
  // 这里将使用xlsx库解析Excel
  // 返回标准化的题目数组
  return []
}
