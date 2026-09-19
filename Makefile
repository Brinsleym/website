.PHONY: dev deploy

dev:
	hugo server -D

# static/css is build output that is committed so jsDelivr can serve it.
# It has to be emptied first: otherwise Hugo copies the old stylesheets into
# public/, they are copied straight back, and every build leaves another one
# behind. resources/_gen goes too, because a cached resource whose published
# copy has been deleted is not written out again, which would ship a site with
# no stylesheet at all. The copy is deliberately not silenced for the same
# reason - if it fails, the build should fail with it.
deploy:
	rm -rf static/css public resources/_gen
	hugo --environment production
	mkdir -p static/css
	cp public/css/*.css static/css/

clean:
	rm -rf public/

build: clean deploy
