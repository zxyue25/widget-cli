const action = () => {
   console.log("create")
}

module.exports = {
   command: 'create',
   description: '初始化',
   action: action,
}