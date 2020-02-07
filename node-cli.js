#!/usr/bin/env node

var shell = require("shelljs");     //执行shell
var watch = require('watch');       //监测目录变化

const fs = require('fs-extra')

let argv = process.argv
if(argv[2] === 'create') {
    if(!argv[3]) {
        console.log('请输入一个项目名或指定一个目录')
        return
    }
    fs.copySync(`${__dirname}/template_project/`, argv[3])
}else if(argv[2] === 'start') {
    if(!argv[3]) {
        console.log('请输入您的项目目录')
        return
    }
    watch.watchTree(`${argv[3]}/pages`, function (f, curr, prev) {
        shell.exec(`node ${__dirname}/bin/build.js ${argv[3]}/pages`);
        console.log('检测到文件变更, 已编译')
    });
}else {
    console.log('没有此命令')
}
