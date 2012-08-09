# set aliases
DIR := _publish

build:
	@grunt removeSite # clear out previous site
	@grunt makeDirectory
	@grunt js # lint and minify js files
	@grunt cssmin # minify css files
	@cp -R .htaccess robots.txt index.html css js $(DIR) # copy files into _publish directory
	@grunt scriptsrc # replace reference to js source files in html file with concat and minified file
	
deploy: _publish
	@echo 'deploying to production'
	@rsync -avz -e ssh _publish/ ${THP}