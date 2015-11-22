# Web project boilerplate
This is my basic boilerplate for web Projects

## Install
After cloning the repo run the following command in the terminal to install the dev dependencies:
```
npm install
```

##Gulp workflow
### Start
To get started run:
```
gulp
```
This will ...
* start a **local server** on port 8000 that points to the `www` directory
* **watch all scss** files for changes and **compile them to css** (`www/css/`)
* activate **livereload** for you project.
 * If you change an HTML file, the page will reload. 
 * If you changed the scss, only the css will reload (so you wont get a complete page reload!)
 
###Bower
If you installed any bower components via `bower install ...` you can run the following command to copy the main files of the installed bower components to `www/js/vendor` and uglify them.
```
gulp bower-files
```
After running this you can include them in your HTML:
```html
<script src="/js/vendor/your-plugin.js"></script>
```

###Build
To get your site ready for production run this command to minify your css. This will also run `gulp bower-files`, to make sure all bower plugins are available.
```
gulp build
```
The minified css files will be suffixed with ".min". So dont forget to change the file name in your HTML!
