#!/bin/bash
#Script to deploy the zoetrope widget after testing is sucessful

#Make sure the script fails if any commands inside fail.
set -e

#Use the secure private key to clone the private github repo.
ssh-agent (ssh-add ~/.ssh/id_ci_github; git clone git@github.com:ZoetropeImaging/widget.git)

cd widget
git submodule init
git submodule update
cd lib/jquery-zoetrope
git checkout $TRAVIS_BRANCH
npm install
cd ../..
npm install
gulp-fetch
gulp




