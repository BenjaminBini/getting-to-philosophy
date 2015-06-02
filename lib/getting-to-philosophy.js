var cheerio = require('cheerio');
var request = require('request');

var visited = [];

/**
 * Check if the link is ok
 * @param  {String}  link  Link to test
 * @return {Boolean}  True if the link is valid
 */
function isLinkOk(link) {
  // Check link target
  var url = link.attr('href');
  var linkOk = visited.indexOf(url) === -1
    && url.indexOf('Help:') === -1
    && url.indexOf('File:') === -1
    && url.indexOf('Wikipedia:') === -1
    && url.indexOf('wiktionary.org/') === -1
    && url.indexOf('/wiki/') !== -1;

  if (linkOk) {
    // Check parenthesis
    var contentHtml = link.closest('p').length > 0 ? link.closest('p').html() : '';
    if (contentHtml !== '') {
      var linkHtml = 'href="' + url + '"';
      var contentBeforeLink = contentHtml.split(linkHtml)[0];
      var openParenthesisCount = contentBeforeLink.split('(').length - 1;
      var closeParenthesisCount = contentBeforeLink.split(')').length - 1;
      linkOk = !(openParenthesisCount > closeParenthesisCount);
    }
  }
  if (linkOk) {
    // Check italic
    linkOk = link.parents('i').length === 0;
  }

  return linkOk;
}

/**
 * Recursive function to go from a wikipedia page to the next by "clicking" the first link on the page
 * @param  {String}  url  URL of the Wikipedia page
 */
function goToNext(url, path, callbackEach, callback) {
  var selector = '#mw-content-text > p a, #mw-content-text > ul a';
  request(url, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log('Article does not exist');
      if (callback) {
        callback(['Error']);
      }
    }
    var $ = cheerio.load(body);
    var content = $('#mw-content-text');
    var noArticle = $('.noarticletext');
    if (!!content.html() && !noArticle.html()) {
      var link = $(selector).eq(0);
      url = link.attr('href');
      var i = 1;
      while (!isLinkOk(link)) {
        link = $(selector).eq(i);
        url = link.attr('href');
        i = i + 1;
      }
      visited.push(url);
      var title = $('#firstHeading').text();
      if (callbackEach) {
        callbackEach(title);
      }
      path.push(title);
      if (title === 'Philosophy') {
        if (callback) {
          callback(path);
        }
        return;
      }
      goToNext('http://en.wikipedia.com/' + url, path, callbackEach, callback);
    } else {
      if (callback) {
        callback(['Error']);
      }
    }
  });
}

/**
 * Start looping through Wikipedia pages until it reaches "Philosophy" article
 * @param  {String}  page  Starting page
 * @param  {Function}  callbackEach  Callback function for each iteration
 * @param  {Function}  callback  Callback function
 */
exports.start = function (page, callbackEach, callback) {
  // Launch the recursive function
  goToNext('http://en.wikipedia.com/wiki/' + page, [], callbackEach, callback);
};
