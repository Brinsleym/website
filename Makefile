.PHONY: dev deploy

dev:
	hugo server -D --environment development --config config.dev.toml

deploy:
	hugo --environment production --config config.toml
	mkdir -p static/css
	cp public/css/*.css static/css/ 2>/dev/null || true

clean:
	rm -rf public/

build: clean deploy
