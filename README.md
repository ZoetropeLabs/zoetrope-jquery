# Zoetrope Jquery

## Introduction
This repo contains the source for [Zoetrope's](http://zoetrope.io) 3D photography widget. The vast majority of users will not need to use this directly, since a prebuilt copy is served directly from the Zoetrope CDN.

This is aimed at helping our clients to develop new and interesting product imaging experiences.

We are aware how bad the documentation is - please bare with us :)

## Instalation

1. Clone the Repo
2. Make sure [nodejs](http://nodejs.org/download/) is installed.
3. Install depedencies (from root directory):
```bash
	sudo npm install .
```
4. build
```bash
	gulp
```

## Gulp task runner tasks

### `default`
This will build a one off and place it in dist/&lt;your branch&gt;/.

### `watch`
Build and spawn an HTTP server to serve up a demo. The code will be rebuilt on each save.

### `fetch`
Will download both translation files [from Zoetropes google docs](http://zoetrope.io/tech-blog/javascript-translations-google-drive-forms-and-gulpjs) and [mobile browser detection](http://detectmobilebrowsers.com/)

##Library Acknowledgements
1. [jQuery](http://jquery.com/)
2. [Keen IO](https://github.com/keenlabs/keen-js)
3. [Math.uuid.js](http://c4se.sakura.ne.jp/profile/ne.html)
4. [jQuery cookie](https://github.com/carhartl/jquery-cookie)

##License
This project is Licenced under GPLv3