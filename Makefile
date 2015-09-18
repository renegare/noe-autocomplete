setup:
	-rm -rf ./node_modules \
		./public/bower
	npm i
	bower i

publish: export P=patch
publish:
	npm version $(P)
	git push
	git push --tags
	npm publish
