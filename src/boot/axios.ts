import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3333',
  timeout: 5000
})

export default boot(({ app }) => {
  app.config.globalProperties.$api = api
})

export { api }
