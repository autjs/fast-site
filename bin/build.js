#!/usr/bin/env node

const fs = require('fs')
const fse = require('fs-extra')
const compiler = require('./compiler')

let rootPath = `${process.cwd()}/${process.argv[2]}`

function buildPage(path, name = 'index') {
	let result = compiler({
		html: fs.readFileSync(`${path}/index.html`, 'utf-8'),
		css: fs.readFileSync(`${path}/index.css`, 'utf-8'),
		js: require(`${path}/index.js`),
		template: fs.readFileSync(`${rootPath}/../template/index.html`, 'utf-8'),
		name: name
	}).result
	
	fse.emptyDirSync('dist')
	fse.outputFileSync(`dist/${result.moduleName}/index.html`, result.html,'utf8')
	fse.outputFileSync(`dist/${result.moduleName}/${result.otherName}.css`, result.css, 'utf8')
	fse.outputFileSync(`dist/${result.moduleName}/${result.otherName}.js`, result.js, 'utf8')
	console.log('成功')
}

fse.readdir(rootPath, (err, files) => {
	console.log(err)
	console.log(files)
	files.forEach((item) => {
		if(fse.statSync(`${rootPath}/${item}`).isDirectory()) {
			buildPage(`${rootPath}/${item}`, item)
		}
	}) 
})