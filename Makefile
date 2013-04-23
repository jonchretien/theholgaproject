# set aliases
DIR := _publish

deploy: _publish
	@echo 'deploying to production'
	@rsync -avz -e ssh _publish/ ${THP}