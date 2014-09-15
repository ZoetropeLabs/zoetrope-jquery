# Zoetrope Engage&trade; Image Viewer

The Zoetrope Engage&trade; Image Viewer (refered to as 'ZEV' from here on in) is a pure html/js/css widget to display the 3D photography created by Zoetrope. The widget is built as a jQuery plugin but is also available as a self contained module. This document is aimed at developers who are creating integrations with the ZEV.

## Complete Example
Assuming that the Zoetrope JS and CSS has been included (for this example they're inserted in the footer of this page and we're including both jquery and the plugin), adding a Zoetrope image is as simple as follows:
```html

<img
    src="https://s3-eu-west-1.amazonaws.com/zoetrope-alpha/52ea7cc2c24f284cfaa26be8/500/0.jpg"
    class="zoe-engage-image"
    data-zoe-site="testingtesting"
    data-zoe-image="530b5d6cc24f281c908745ec"
    data-zoe-inline="true"
    width="500"
    height="500"
    />

with the following script in the `<head>` of the page:
```html	
	<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
	<script src="//d34tuy4jppw3dn.cloudfront.net/v3/js/zoetrope.jquery.min.js"></script>
	<link type="text/css" rel="stylesheet" href="//d34tuy4jppw3dn.cloudfront.net/v3/css/zoetrope.jquery.min.css" media="all">

```

Which will result in the folling:

> Example 1:
><img src="https://s3-eu-west-1.amazonaws.com/zoetrope-alpha/52ea7cc2c24f284cfaa26be8/500/0.jpg" class="zoe-engage-image" data-zoe-site="abc123" data-zoe-image="530b5d6cc24f281c908745ec" width="500" height="500" data-zoe-rel="ab" data-zoe-inline="true"/>

The `img` tag is replaced with the ZEV after loading. by using the `img` as ths initial element we are able to provided a fallback image, which can load very quickly (way before `window.onload` fires).

### Bandwidth saving
The ZEV detects the screen size of the client and uses this to decide which resolution profile to use for the display of the 3D image. The modes are as follows:

1. 250px square
2. 500px square
3. 1000px square

250px is intended for mobile and low resolution tablets, the 500px varient is used for HIDPI mobile devices (retina) and normal desktop machines and finally the 1000px varient is used for HIDPI desktop devices.

**note:** The ZEV also detects if the device is a known mobile device and will load half the number of views on these devices to save on bandwidth.


### Zoetrope CDN
The scripts and styles are served from the Zoetrope CDN so that updates can be seemlessly provided to our clients. Currently Zoetrope is using cloudfront in order to provide SSL support. All ZEV files are served from `https://d34tuy4jppw3dn.cloudfront.net`, though images for the ZEV may be hosted from other locations if self hosting the image resources.

## JSON Feeds

### Example
The JSON feed has been kept as simple as possible: an array of objects.

```javascript
[
	{
		"sku": "abc",
		"zoetrope_id":"5346ab94c24f28777972d7cf",
		"zoetrope_start_position":"0"
	},
	...
	{
		"sku": "def",
		"zoetrope_id":"53455f67c24f282735cb9806",
		"zoetrope_start_position":"20"
	}
]
```

## ZEV Styles
The ZEV will look for all elements on the page which have the class `zoe-engage-image`. All of these images will be processed and have the ZEV behaviors attached to them. Once this happens, there are 2 choices for the display style: **Popover** which will show the image in a colorbox or **Inline** which will replace the placeholder image with the interactive Zoetrope image.

### Inline (default)
By setting the inline attribute, the ZEV will replace the starting image with the interactive version in its place. This is well suited for use in product pages and places where there is only one image inline.

### Popover 
If you'd prefer not to display the ZEV inline, it can also be shown in a popover. This has the advantage that it allows greater cross device compatibility for sites which are not fully responsive. If you are using multiple ZEVs on a page, we recommend using the popover option to decrease resource usgae.

>Example:
><img src="https://s3-eu-west-1.amazonaws.com/zoetrope-alpha/52ea7cc2c24f284cfaa26be8/500/0.jpg" class="zoe-engage-image" data-zoe-site="abc123" data-zoe-image="52ea7cc2c24f284cfaa26be8" data-zoe-inline="false" width="500" height="500">

## Settings
The ZEV makes use of html 5 `data-*` attributes to control the viewer settings. Due to this, an html 5 doc type (`<!doctype html>`) should be used in order to pass validation. There's an overview of `data-*` attributes [here](http://ejohn.org/blog/html-5-data-attributes/). All settings are prefixed with `data-zoe-` where the `zoe-` acts as a Zoetrope name space.

> As an example of the name spacing, the `image` setting is added to the html in the attribute `data-zoe-image="[image id]"`.

Zoetrope images are

### Compulsory Settings
#### Image `image`
The `image` setting contains the Zoetrope provided UUID of the image which is to be displayed. For deep integrations these will normally be provided through a JSON feed.

#### Site ID `site`
The site ID is needed for analytics purposes maninly, but is likely to be used to serve up custom style sheets and othe future features. You will be provided with a site ID by Zoetrope.

### Optional Settings
#### Start Position `start-position`
The start position is the view which will be used for the intial viewing angle of the zoetrope image and should be used to generate an appropriate placeholder image url too. At present this should be a number between 0-107 and will default to 0 if it has not been set.

Most integration modules would store a tuple of the `image` id and `start-position` since they are the 2 parts which will be unique to all ZEV instances.

>It's highly recomended that the `start-position` attribute is used!

#### Inline `inline`
By setting the `inline` attribute to `false`, the ZEV will display in the popover, rather than inline. See [Inline](#inline).

#### Slideshow grouping `rel`
>Only applies to popover style image.

For situations where multiple ZEV instances are used in popovers on the same page, setting the same `rel` value for multiple ZEV instances will show next/previous buttons on the popover.

#### Preload Images `preload`
>To be considerate of bandwidth, this should not be used for multiple ZEV instances on the same page!

By setting the `preload` attribute, the ZEV will preload the image resources for the viewer, which clearly allows for a smoother experience for the client. Resources will not be loaded until after `window.onload` has fired. 

#### Show Call to Action `show-cta`
By default the ZEV shows a few strings and icons to indicate that the ZEV is more than a static image. These strings are currently avaliable in 5 languages (`en`,`fr`,`de`,`it` and `hi`), with more being added all the time. If a specific new langauage is needed, please contact us.

#### Auto Rotate on Load `loadspin`
When this attribute is set, the ZEV will start to rotate as soon as it has loaded. This can be applied to inline or popover style ZEV instances. Currently this rotates does a single 360° rotation on the same level as the image specified in 'start-position'.

#### Animate When Idle `idle-animate`
If `idle-animate` is set, the ZEV will rotate whenever the user is not interacting with it. After an interaction there is a timeout before the viewer begins the animation again. Currently this rotates on the same level as the image specified in `start-position`, until the user changes the level.


<!-- Add the Zoetrope Scripts -->
<script>
!function(doc,tag,tag2,id,baseUrl){

	var js,
		head=doc.getElementsByTagName('head')[0],
		p = document.location.protocol === 'https:' ? 'https:' : 'http:';

	if(!doc.getElementById(id)){
		js=doc.createElement(tag);
		js.id='jq';
		js.src="http://code.jquery.com/jquery-1.11.0.min.js"
		js.type="text/javascript";
		jsz = doc.createElement(tag);
		jsz.id=id;
		jsz.type="text/javascript";
		jsz.src= p+"//d34tuy4jppw3dn.cloudfront.net/v3-dev/js/zoetrope.jquery.js";
		head.appendChild(js);
		head.appendChild(jsz);

		css=doc.createElement(tag2);
		css.rel="stylesheet";
		css.href=p+"//d34tuy4jppw3dn.cloudfront.net/v3-dev/css/zoetrope.jquery.min.css";
		head.appendChild(css);
	}

}(document,"script","link","zoetrope-wjs",'');
</script>

