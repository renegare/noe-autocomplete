test:
	nodemon -w . $(shell which testem) -- -f testem.yml

setup:
	-rm -rf node_modules && bower
	npm i	
