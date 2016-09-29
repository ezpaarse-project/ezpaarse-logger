.PHONY: help install publish
.DEFAULT_GOAL := help

help: ## Show the current help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install the bower dependencies of the WebApp
	cd src && bower install

publish: install ## Install dependencies and publish the WebApp
	rsync -avz --delete ./src/ anawiki@vpanalogist.intra.inist.fr:~/www/ezlogger
