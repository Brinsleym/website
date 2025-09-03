.PHONY: dev deploy

dev:
	hugo server -D --environment development --config config.dev.toml

deploy:
	hugo --environment production --config config.toml

clean:
	rm -rf public/

build: clean deploy
