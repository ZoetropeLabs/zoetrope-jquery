
/* The little script which loads everything else in

   requires some markup like:
   	<img src="http://placehold.it/300x300" width=""
   	class="zoe-engage-image" data-zoe-site="abc123" data-zoe-image="def456">

   `data-zoe-site` provides the site uuid
   `data-zoe-image` prodives the image uuid

	the `width` and `height` attributes need to be set & the class
	must include `zoe-engage-image`
 */
!function(doc,tag,tag2,id,baseUrl,http,https,v){
	var selector = doc.querySelector,
	 	prefix = (https == doc.location.protocol ? https : http) + baseUrl;
	if (typeof selector == "undefined") return; //dont run on old browsers

	var js,
		css
		first_js=doc.getElementsByTagName(tag)[0];

	if(!doc.getElementById(id)){
		js=doc.createElement(tag);
		js.id=id;
		js.src=prefix+"/"+v+"/js/zoe-widget.js";
		first_js.parentNode.insertBefore(js,first_js);

		css=doc.createElement(tag2);
		css.rel="stylesheet";
		css.href=prefix+"/"+v+"/css/style.css";
		first_js.parentNode.insertBefore(css,first_js);
	}
}(document,"script","link","zoetrope-wjs",'{{cdn-base}}','http:','https:','v3');