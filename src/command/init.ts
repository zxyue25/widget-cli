import * as path from 'path'
import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'
import * as logSymbols from 'log-symbols'
import * as chalk from 'chalk'
import * as globby from 'globby'
import { cwd } from '../lib'

const chooseType = async () => {
   const answer = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: 'please choose the type',
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
      message: `${type} name: (${type}-demo)`,
      default: `${type}-demo`
   })
   return answer.name
}

const checkExist = async (type, name) => {
   const paths = (globby as any).sync(path.join(cwd, 'src', `${type}s/*`), { cwd: __dirname, onlyDirectories: true, deep: 1 })
   if(paths.indexOf(path.join(cwd, 'src', `${type}s`, name)) !== -1){
      const answer =  await inquirer.prompt({
         type: 'list',
         name: 'checkExist',
         message: `\nTarget directory ${type} ${name} already exists. Pick an action`,
         choices: [
             'Overwrite',
             'Cancel'
         ]
     })
      if(answer.checkExist === 'Cancel'){
         return false
      }
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
   console.log('\n')
   console.log(logSymbols.success, `Finish creating file in ${chalk.yellow(pathSrc)}`)
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
   console.log(logSymbols.success, `Finish creating file in ${chalk.yellow(pathExp + '/' + name + '.vue')}`)
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
   console.log(logSymbols.success, `Finish creating file in ${chalk.yellow(pathDoc + '/' + name + '.md' )}`)
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
   console.log(logSymbols.success, `Finish creating file in ${chalk.yellow(pathSrc)}`)
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
      console.log(`\n🎉  Successfully inited ${chalk.yellow(type, name)}.`)
      console.log(`👉  Get started with the following commands: \n`)
      console.log(chalk.cyan(`$ npm run serve\n`))
   }
}

export default {
   command: 'init',
   description: '初始化',
   action,
}