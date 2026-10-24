.PHONY: dev deploy

dev:
	hugo server -D

deploy:
	hugo --environment production

clean:
	rm -rf public/

build: clean deploy
