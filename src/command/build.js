const action = () => {
   console.log("build")
}

module.exports = {
   command: 'build',
   description: '初始化',
   action: action,
}