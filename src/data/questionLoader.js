// 题目数据加载器
// 从JSON文件加载题库数据

const categories = [
  { id: 'hse', name: 'HSE通用题库', file: 'hse.json' },
  { id: 'instrument', name: '仪表维修工题库', file: 'instrument.json' },
  { id: 'process', name: '工艺通用题库', file: 'process.json' },
  { id: 'equipment', name: '设备通用题库', file: 'equipment.json' }
];

// 缓存已加载的数据
let cachedData = null;

// 加载所有题库数据
export async function loadAllQuestions() {
  if (cachedData) {
    return cachedData;
  }

  const allData = {
    categories: [],
    questions: [],
    categoryMap: {}
  };

  for (const cat of categories) {
    try {
      const response = await fetch(`./data/${cat.file}`);
      if (!response.ok) {
        console.warn(`Failed to load ${cat.file}`);
        continue;
      }
      
      const data = await response.json();
      
      allData.categories.push({
        id: cat.id,
        name: cat.name,
        totalQuestions: data.totalQuestions || data.questions?.length || 0
      });
      
      if (data.questions && Array.isArray(data.questions)) {
        allData.questions.push(...data.questions);
        allData.categoryMap[cat.id] = data.questions;
      }
      
      console.log(`Loaded ${cat.name}: ${data.questions?.length || 0} questions`);
    } catch (error) {
      console.error(`Error loading ${cat.file}:`, error);
    }
  }

  cachedData = allData;
  return allData;
}

// 获取分类列表
export async function getCategories() {
  const data = await loadAllQuestions();
  return data.categories;
}

// 获取指定分类的题目
export async function getQuestionsByCategory(categoryId) {
  const data = await loadAllQuestions();
  return data.categoryMap[categoryId] || [];
}

// 随机抽取题目
export async function getRandomQuestions(config) {
  const { categories: selectedCategories, questionCount } = config;
  
  // 获取所有可用题目
  const allQuestions = [];
  
  if (selectedCategories && selectedCategories.length > 0) {
    for (const catId of selectedCategories) {
      const questions = await getQuestionsByCategory(catId);
      allQuestions.push(...questions);
    }
  } else {
    // 如果没有选择分类，使用所有题目
    const data = await loadAllQuestions();
    allQuestions.push(...data.questions);
  }
  
  // 打乱顺序并取前N个
  const shuffled = shuffleArray([...allQuestions]);
  return shuffled.slice(0, Math.min(questionCount, shuffled.length));
}

// 按分类比例随机抽取题目
export async function getRandomQuestionsByRatio(config) {
  const { categories: selectedCategories, questionCount } = config;
  
  // 获取每个分类的题目
  const categoryQuestions = {};
  let totalAvailable = 0;
  
  for (const catId of selectedCategories) {
    const questions = await getQuestionsByCategory(catId);
    if (questions.length > 0) {
      categoryQuestions[catId] = questions;
      totalAvailable += questions.length;
    }
  }
  
  // 按比例分配题目数量
  const selectedQuestions = [];
  let remainingCount = questionCount;
  
  const catIds = Object.keys(categoryQuestions);
  
  for (let i = 0; i < catIds.length; i++) {
    const catId = catIds[i];
    const questions = categoryQuestions[catId];
    
    // 计算该分类应抽取的题目数量
    let count;
    if (i === catIds.length - 1) {
      // 最后一个分类使用剩余数量
      count = Math.min(remainingCount, questions.length);
    } else {
      // 按比例分配
      const ratio = questions.length / totalAvailable;
      count = Math.floor(questionCount * ratio);
      count = Math.min(count, questions.length);
    }
    
    // 从该分类随机抽取
    const shuffled = shuffleArray([...questions]);
    selectedQuestions.push(...shuffled.slice(0, count));
    
    remainingCount -= count;
  }
  
  // 如果还有剩余数量，从所有可用题目中补充
  if (remainingCount > 0) {
    const allQuestions = Object.values(categoryQuestions).flat();
    const usedIds = new Set(selectedQuestions.map(q => q.id));
    const available = allQuestions.filter(q => !usedIds.has(q.id));
    
    if (available.length > 0) {
      const shuffled = shuffleArray([...available]);
      selectedQuestions.push(...shuffled.slice(0, Math.min(remainingCount, shuffled.length)));
    }
  }
  
  // 最后打乱所有选中题目的顺序
  return shuffleArray(selectedQuestions);
}

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 清除缓存
export function clearCache() {
  cachedData = null;
}
