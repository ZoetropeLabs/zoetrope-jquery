for file in svg/*; do
	inkscape -z -e `basename $file .svg`.png -w 140 -h 140 $file
	#convert `basename $file .svg`.png -resize 140x140 ./`basename $file .png`.gif;
	optipng -o7 `basename $file .svg`.png
done