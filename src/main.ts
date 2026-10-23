import { createApp } from 'vue'
import App from './App.vue'

import BootstrapVueJK from 'bootstrap-vue-jk'

const app = createApp(App)

app.use(BootstrapVueJK)

app.mount('#app')
