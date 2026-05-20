import { createApp } from 'vue'
import { create, NCard, NForm, NFormItem, NSelect, NInputNumber, NDivider, NDescriptions, NDescriptionsItem, NTag, NSpace, NCheckbox, NCollapse, NCollapseItem, NText, NButton, NEmpty, NTable, NLayout, NLayoutFooter, NGrid, NGridItem, NTabs, NTabPane } from 'naive-ui'
import './style.css'
import App from './App.vue'
import router from './router'

const naive = create({
  components: [
    NCard,
    NForm,
    NFormItem,
    NSelect,
    NInputNumber,
    NDivider,
    NDescriptions,
    NDescriptionsItem,
    NTag,
    NSpace,
    NCheckbox,
    NCollapse,
    NCollapseItem,
    NText,
    NButton,
    NEmpty,
    NTable,
    NLayout,
    NLayoutFooter,
    NGrid,
    NGridItem,
    NTabs,
    NTabPane
  ]
})

const app = createApp(App)
app.use(naive)
app.use(router)
app.mount('#app')
