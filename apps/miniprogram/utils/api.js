const mockData = require('./mock-data')

function getHomeData() {
  return Promise.resolve({
    growthPlan: mockData.growthPlan,
    modules: mockData.modules,
    articles: mockData.articles,
    studentState: mockData.studentState,
  })
}

function getGrowthPlan() {
  return Promise.resolve(mockData.growthPlan)
}

function getArticleById(id) {
  return Promise.resolve(mockData.articles.find((article) => article.id === id) || mockData.articles[0])
}

function getStudentState() {
  return Promise.resolve(mockData.studentState)
}

module.exports = {
  getArticleById,
  getGrowthPlan,
  getHomeData,
  getStudentState,
}
