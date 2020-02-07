#!/usr/bin/env node

const fs = require('fs')
const fse = require('fs-extra')
const compiler = require('./compiler')

let rootPath = `${process.cwd()}/${process.argv[2]}`

function buildPage(path, name, callback) {
	console.log('开始编译' + name + '模板')
	let result = compiler({
		html: fs.readFileSync(`${path}/index.html`, 'utf-8'),
		css: fs.readFileSync(`${path}/index.css`, 'utf-8'),
		js: require(`${path}/index.js`),
		template: fs.readFileSync(`${rootPath}/../template/index.html`, 'utf-8'),
		name: name
	}).result
	
	fse.outputFileSync(`dist/${result.moduleName}/index.html`, result.html,'utf8')
	fse.outputFileSync(`dist/${result.moduleName}/${result.otherName}.css`, result.css, 'utf8')
	fse.outputFileSync(`dist/${result.moduleName}/${result.otherName}.js`, result.js, 'utf8')
	console.log('成功')
	callback();
}

function buildTask(modules) {
	if(modules) {
		if(modules.length) {
			let item = modules.shift()
			if(fse.statSync(`${rootPath}/${item}`).isDirectory()) {
				console.log('开始Build' + item)
				buildPage(`${rootPath}/${item}`, item, function() {
					buildTask(modules)
				})
			}
		}
	}
}

fse.readdir(rootPath, (err, files) => {
	console.log(err)
	console.log(files)
	fse.emptyDirSync('dist')
	buildTask(files)
})