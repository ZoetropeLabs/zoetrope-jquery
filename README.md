![Travis Status](https://travis-ci.org/ZoetropeImaging/zoetrope-jquery.svg?branch=v3)

# Zoetrope Jquery

## Introduction
This repo contains the source for [Zoetrope's](http://zoetrope.io) 3D photography widget. The vast majority of users will not need to use this directly, since a prebuilt copy is served directly from the Zoetrope CDN.

This is aimed at helping our clients to develop new and interesting product imaging experiences.

## Examples
We're working on a set of examples to demonstrate what can be done with the Zoetrope viewer - they're pending a review by our graphic designer at present!
* [Example 1 - Custom intro animation ](http://zoetropeimaging.github.io/zoetrope-jquery/example1/)
* [Example 2 - Gallery images](http://zoetropeimaging.github.io/zoetrope-jquery/example2/)
* [Example 3 - scroll presentation](http://zoetropeimaging.github.io/zoetrope-jquery/example3/)

## Installation

```bash
git clone https://github.com/ZoetropeImaging/zoetrope-jquery.git
cd zoetrope-jquery
sudo npm install .
gulp
```

1. Clone the Repo
2. Make sure [nodejs](http://nodejs.org/download/) is installed.
3. Make sure librsvg-dev is installed (ubuntu: `sudo apt-get install librsvg2-dev`)
4. Install depedencies (from project directory). This will install gulp globally
5. Build

## Developer docs
Full API documentation with basic implementation examples is available here: [Zoetrope Viewer Documentation](http://zoetropeimaging.github.io/zoetrope-jquery/docs/developer_docs.html)

## Gulp task runner tasks

### default `gulp`
This will build a one off and place it in dist/&lt;your branch&gt;/.

### watch `gulp watch`
Build and spawn an HTTP server to serve up a demo. The code will be rebuilt on each save.

### fetch `gulp fetch`
Will download both translation files [from Zoetropes google docs](http://zoetrope.io/tech-blog/javascript-translations-google-drive-forms-and-gulpjs) and [mobile browser detection](http://detectmobilebrowsers.com/)

##Library Acknowledgements
1. [jQuery](http://jquery.com/)
2. [Keen IO](https://github.com/keenlabs/keen-js)
3. [Math.uuid.js](http://c4se.sakura.ne.jp/profile/ne.html)
4. [jQuery cookie](https://github.com/carhartl/jquery-cookie)

##License
This project is Licenced under GPLv3
