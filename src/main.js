import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import routes from './routes/routes.js'
import naive from 'naive-ui'
import { createPinia } from 'pinia'


const app = createApp(App)
const pinia = createPinia()


app.use(routes)
app.use(pinia)
app.use(naive) 


app.mount("#app")