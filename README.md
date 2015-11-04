![npm version](https://img.shields.io/npm/v/getting-to-philosophy.svg) ![npm license](https://img.shields.io/npm/l/getting-to-philosophy.svg)

# Getting to philosophy

[As you may know](http://en.wikipedia.org/wiki/Wikipedia:Getting_to_Philosophy), if you go to any page on Wikipedia and keep clicking on the first link of the page (ignoring meta links, links between parenthesis and the ones in italic), you will eventually reach the [Philosophy article](http://en.wikipedia.org/wiki/Philosophy).

This (quite useless) node.js library allows you to query a Wikipedia page and get the list of the different pages that will get you to "Philosophy".

You're welcome.

## Install

```
npm install --save getting-to-philosophy
```

## Usage

### start(page, callbackEach, callback)

* page : the starting wikipedia page name
* callbackEach : function called after each new page is reached
	* the page name is passed as a parameter to the function
* callback : function called after start function ends
	* an array containing all the pages name is passed as a parameter to the callback function

```
var gettingToPhilosophy = require('getting-to-philosophy');

gettingToPhilosophy.start('Paris', function (pageName) {
	console.log(pageName)
}, function (path) {
	console.log(path);
});
```
