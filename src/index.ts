import * as globby from 'globby'
import * as commander from 'commander'
const { program } = commander

// 获取业务线
let commandsPath = []
const getCommand = () => {
    commandsPath = (globby as any).sync('./command', { cwd:__dirname, deep:1 }) || []
    return commandsPath
}

function start() {
    const commandsPath = getCommand()
    program.version('0.1.0')
    commandsPath.forEach( commandPath => {
        const commandObj = require(`./${commandPath}`)
        const { command, description, action } = commandObj.default
        program
            .command(command)
            .description(description)
            .action(action)
    })
    program.parse(process.argv);
}

start()