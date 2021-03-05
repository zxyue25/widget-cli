const inquirer = require('inquirer')
const chalk = require('chalk')
const logSymbols = require('log-symbols')
const path = require('path')
const globby = require('globby')
const { cwd } = require('../lib')
const fs = require('fs-extra')

const chooseType = async () => {
   const answer = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择你要初始化的类型',
      choices: [
         'page',
         'widget'
      ]   
   })
   return answer.type
}

const inputName = async (type) => {
   const answer = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: `请填写要初始化的${type}名称(建议用-分隔,如bread-crumb)`,
   })
   return answer.name
}

const checkExist = async (type, name) => {
   const paths = globby.sync(path.join(cwd, 'src', `${type}s/*`), { cwd: __dirname, onlyDirectories: true, deep: 1 })
   if(paths.indexOf(path.join(cwd, 'src', `${type}s/*`, name)) !== -1){
      const answer = await inquirer.prompt({
         type: 'confirm',
         name: 'isExist',
         message: `本地工程已存在${type} ${name}；是否覆盖本地工程`,
      })
      return answer.isExist
   }
   return true
}

const initSrc = async (name) => {
   const templateSrc =
`<template>
   <div>${name}</div>
</template>`

   const pathSrc = path.join('src/widgets', name)
   await fs.mkdirSync(pathSrc, { recursive: true })
   fs.writeFile(path.join(pathSrc, 'index.vue'), templateSrc, e => {
      if (e) {
         throw e
      }
   })
   console.log(logSymbols.success, `${name}组件初始化完成,路径:${pathSrc}`)
}

const initExp = async (name) => {
   const templateExp = 
`<template>
   <widget-render src="js/${name}.widgets.js">
   </widget-render>
</template>

<script>
import WidgetRender from "../components/WidgetRender"
export default {
   components: {
      WidgetRender
   }
}
</script>`

   const pathExp = path.join('examples/routers')
   await fs.mkdirSync(pathExp, { recursive: true })
   fs.writeFile(path.join(pathExp, `${name}.vue`), templateExp, e => {
      if (e) {
         throw e
      }
   })
   console.log(logSymbols.success, `${name}示例文件初始化完成,路径:${pathExp}/${name}.vue`)
}

const initDoc = async (name) => {
   const templateDoc =`# ${name}`
   const pathDoc = path.join('docs/widget')
   await fs.mkdirSync(pathDoc, { recursive: true })
   fs.writeFile(path.join(pathDoc, `${name}.md`), templateDoc, e => {
      if (e) {
         throw e
      }
   })
   console.log(logSymbols.success, `${name}文档初始化完成,路径:${pathDoc}/${name}.md`)
}

const initWidget = async (name) => {
   initSrc(name)
   initExp(name)
   initDoc(name)
}

const initPage = async (name) => {
   const pathSrc = path.join('src/pages', name)
   fs.mkdirSync(pathSrc, {recursive: true})
   const templateApp = 
`<template>
   <div>${name}</div>
</template>

<script> 
export default {
   name: "${name}"
};
</script>`

   fs.writeFile(path.join(pathSrc, 'App.vue'), templateApp, e => {
      if(e){
         throw e
      }
   })

   const templateMain = 
`import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
   
Vue.use(ElementUI);
   
new Vue({
   render: h => h(App)
}).$mount('#app')
`
   fs.writeFile(path.join(pathSrc, 'main.js'), templateMain, e => {
      if(e){
         throw e
      }
   })
   console.log(logSymbols.success, `page初始化完成,路径:${pathSrc}`)
}

const action = async () => {
   const type = await chooseType()
   const name = await inputName(type)
   const checkResult = await checkExist(type, name)
   if(checkResult){
      if(type === 'widget'){
         try{
            await initWidget(name)
         } catch (e) {
            console.log(chalk.red(e))
         }
      } else {
         try{
            await initPage(name)
         } catch (e) {
            console.log(chalk.red(e))
         }
      }
      console.log(logSymbols.success, chalk.green('初始化完成，请执行npm run dev'))
   } else {
      console.log(logSymbols.info, chalk.yellow('请重新执行npm run init初始化'))
   }
}

module.exports = {
   command: 'init',
   description: '初始化',
   action: action,
}