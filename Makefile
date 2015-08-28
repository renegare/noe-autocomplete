test:
	nodemon -w . $(shell which testem) -- -f testem.yml
