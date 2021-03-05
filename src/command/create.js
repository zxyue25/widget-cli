const path = require('path')
const fs = require('fs-extra')
const download = require('download-git-repo')
const handlebars = require('handlebars')
const ora = require('ora')
const inquirer = require('inquirer')
const logSymbols = require('log-symbols')
const chalk = require('chalk')
const { cwd } = require('../lib')

const downloadCode = async (projectName) => {
    const projectPath = path.join(cwd, projectName)
    if(!await checkExist(projectName)){
        return false
    }
    // 下载之前做loading提示
    console.log(`\n✨  Creating project in ${chalk.cyan(projectPath)}.`)
    console.log('🗃  Initializing git repository...')
    const spinner = ora().start('This might take a while...\n\n');
    // 根据模板名下载对应的模板到本地

    const downloadUrl = "https://gitlab-jdd.jd.com:zhengxiuyue/widget-template#master"
    download(downloadUrl, projectName, {clone: true}, async err => {
        if(err){
          spinner.fail()
          console.log(logSymbols.error, chalk.red(err))
          return 
        }
        spinner.succeed()
        answers = await inquirer.prompt([
          {
              type: 'input',
              name: 'name',
              message: `package name: (${projectName})`,
              default: projectName
          },
          {
              type: 'input',
              name: 'description',
              message: 'description'
          },
          {
              type: 'input',
              name: 'author',
              message: 'author'
          },
        ])
        const packagePath = `${projectName}/package.json`
        const packageContent = fs.readFileSync(packagePath,'utf-8')
        //使用handlebars解析模板引擎
        const packageResult = handlebars.compile(packageContent)(answers)
        //将解析后的结果重写到package.json文件中
        fs.writeFileSync(packagePath,packageResult)
        console.log(`🎉  Successfully created project ${chalk.yellow(projectName)}.`)
        console.log(`👉  Get started with the following commands: \n`)
        console.log(chalk.cyan(`$ cd ${projectName}\n$ npm run serve\n`))
    })
}

const checkExist = async (projectName) => {
    const projectPath = path.join(cwd, projectName)
    if(fs.existsSync(projectPath)){
        const answer =  await inquirer.prompt({
            type: 'list',
            name: 'checkExist',
            message: `\nTarget directory ${projectPath} already exists. Pick an action`,
            choices: [
                'Overwrite',
                'Cancel'
            ]
        })
        if(answer.checkExist === 'Overwrite'){
            console.log(`Removing ${chalk.cyan(projectPath)}...\n\n`)
            fs.removeSync(projectPath)
            return true
        } else {
            return false
        }

    }
    return true
}

const action = (projectName) => {
    downloadCode(projectName)
}

module.exports = {
   command: 'create <projectName>',
   description: '初始化',
   action: action,
}