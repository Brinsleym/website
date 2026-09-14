.PHONY: dev deploy

dev:
	hugo server -D

deploy:
	hugo --environment production
	mkdir -p static/css
	cp public/css/*.css static/css/ 2>/dev/null || true

clean:
	rm -rf public/

build: clean deploy
