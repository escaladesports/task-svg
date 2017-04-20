'use strict'
const path = require('path')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const svgMin = require('gulp-svgmin')
const svgStore = require('gulp-svgstore')
const rename = require('gulp-rename')
const changed = require('gulp-changed')
const notify = require('task-notify')
const error = require('task-error-notify')

 module.exports = function(config, cb){
 	function createMaps(cb){
		let dirName
		return gulp.src(`${config.src}/${config.img}/${config.svgMapPrefix}*/*.svg`)
			.pipe(plumber({ errorHandler: error }))

			// Minify and give each sprite an ID that matches its filename
			.pipe(svgMin(file => {
				let prefix = path.basename(file.relative, path.extname(file.relative));
				return {
					plugins: [{
						cleanupIDs: {
							prefix: prefix + '-',
							minify: true
						}
					}]
				}
			}))

			// Get directory name
			.pipe(rename(path => {
				dirName = path.dirname.replace(config.svgMapPrefix, '')
			}))

			// Create map
			.pipe(svgStore())

			// Rename map to directory name without prefix
			.pipe(rename(path => {
				path.basename = dirName
			}))

			// Done!
			.pipe(gulp.dest(config.dist + '/' + config.img))
			.on('end', () => {
				notify('SVG maps created')
				if(typeof cb === 'function') cb()
			})
 	}

 	function minify(cb){
		return gulp.src([
				`${config.src}/${config.img}/**/*.svg`,
				`!${config.src}/${config.img}/${config.svgMapPrefix}*/*.svg`
			])
			.pipe(plumber({ errorHandler: error }))
			.pipe(changed(`${config.dist}/${config.img}`))
			.pipe(svgMin())
			.pipe(gulp.dest(`${config.dist}/${config.img}`))
			.on('end', () => {
				notify('SVG images minified')
				if(typeof cb === 'function') cb()
			})
 	}

	new Promise(createMaps)
		.then(new Promise(minify))
		.then(() => {
			if(typeof cb === 'function') cb()
		})
		.catch(error)
}


