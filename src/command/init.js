const action = () => {
   console.log("init")
}

module.exports = {
   command: 'init <template> <project>',
   description: '初始化',
   action: action,
}