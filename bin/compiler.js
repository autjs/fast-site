const cheerio = require('cheerio')
const uuid = require('./uuid.js')

function compiler(obj) {
	// html string --> 对象
	let htmlObj = {}
	let arr = []
	let str = obj.html
	obj.evts = []

	let $ = cheerio.load(obj.html, {ignoreWhitespace: true})
	$('body').children().first().addClass('module-root')
	
	// css
	$('[ss]').each((index, el) => {
		let startGet = false
		for (let key in el.attribs) {
			if(key === 'ss') {
				startGet = true
			}else {
				if(startGet) {
					let uid = uuid.uid8()
					$(el).addClass(key + `-${uid}`)
					startGet = false
					delete el.attribs['ss']
					delete el.attribs[key]
					let reg = new RegExp("." + key,'g')
					obj.css = obj.css.replace(reg, `.` + key + `-${uid}`)
				}
			}
		}
	})

	// cc
	$('[cc]').each((index, el) => {
		let startGet = false
		for (let key in el.attribs) {
			if(key === 'cc') {
				startGet = true
			}else {
				if(startGet) {
					let uid = uuid.uid8()
					$(el).attr('ccid', key + `_${uid}`).removeAttr(key).removeAttr('cc')
					startGet = false
					obj.js[key + `_${uid}`] = obj.js[key]
					delete obj.js[key]
				}
			}
		}
	})


	for (let key in obj.js) {
		if (obj.js.hasOwnProperty(key)) {
			const element = obj.js[key];
			if(typeof element == 'string' || typeof element == 'number' || typeof element =='boolean') {
				$('body').html($('body').html().replace(new RegExp(`{{${key}}}`,'g'), element))
			}else {
				if($(`[ccid]`).length) {
					$(`[ccid]`).each((index, el) => {
						// console.log(`el====${el}`)
						if(el.attribs['ccid'] === key) {
							if(element.for) {
								console.log(`检测到有for key是${key} 开始处理`)
								for(let forI in element.for) {
									let cloneEl = $(el).clone()
									cloneEl.html(cloneEl.html().replace(new RegExp(`{{key}}`,'g'), forI))
									cloneEl.html(cloneEl.html().replace(new RegExp(`{{value}}`,'g'), element.for[forI]))
									$(el).parent().append(cloneEl)
								}
							}
							$(el).remove()

							// 处理事件
							if(element.click) {
								obj.evts.push({type:'click', target: key, handler: element.click})
							}
						}
					})
				}
			}
		}

		
	}

		// 写数据
		// 取模板
		let randomName = uuid.uid8()
		let template = cheerio.load(obj.template, {ignoreWhitespace: true})
		template('#app').html($('body').html())

		template('head').append(`<link rel="stylesheet" type="text/css" href="./${randomName}.css">`)
		template('body').append(`<script type="text/javascript" src="./${randomName}.js"></script>`)

		let evtsStr = '', index = 1
		obj.evts.forEach(evt => {
			evtsStr += `var els${index} = document.querySelectorAll('[ccid=${evt.target}]')
			for(var i = 0; i < els${index}.length; i++) {
				var el = els${index}[i]
				el.addEventListener('${evt.type}', ${evt.handler});
			}
			`.replace(/click\(\)/g,'function(evt)')
		});
		obj.result = {
			html: template.html(),
			css: obj.css,
			js: `(function(){
				${evtsStr}
			})()`,
			moduleName: obj.name,
			otherName: randomName
		}
		return obj
}

module.exports = compiler