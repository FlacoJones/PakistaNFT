import '@/assets/css/tailwind.css'

import { createPinia } from 'pinia'
import { VueQueryPlugin as vueQuery } from 'vue-query'
import { vagmi } from '@/plugins/vagmi'

import { createApp } from 'vue'
import App from '@/App.vue'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia).use(vueQuery).use(vagmi)

app.mount('#app')
