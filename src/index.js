const globby = require('globby')
const path  = require('path')
const commander  =  require('commander')
const { program } = commander

// 获取业务线
const getCommand = () => {
    let commands = []
    const commandsPath = globby.sync('./command', { cwd:__dirname, deep:1 })
    commandsPath.map( command =>  {
        commands.push(path.basename(command, path.extname(command)))
    })
    return commandsPath
}

const run = () => {
    const commandsPath = getCommand()
    program.version('0.1.0')
    commandsPath.map( commandPath => {
        const commandObj = require(`./${commandPath}`)
        const { command, description, action } = commandObj
        program
            .command(command)
            .description(description)
            .action(action)
    })
    program.parse(process.argv);
}

run()