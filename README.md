# zoetrope-widget

## Introduction

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

##MIT License

Copyright (c) 2009-2014 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.