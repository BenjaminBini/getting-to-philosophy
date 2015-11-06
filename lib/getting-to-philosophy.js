var cheerio = require('cheerio');
var request = require('request');

var visited = [];
var path = [];

/**
 * Check if the link is ok
 * @param  {String}  link  Link to test
 * @return {Boolean}  True if the link is valid
 */
function isLinkOk(link) {
  /**
   * Check that the link target has not been visited
   * is not a meta page
   * is not from wiktionary.org
   * is a wiki page
   */
  var url = link.attr('href');
  var linkOk = visited.indexOf(url) === -1 &&
    url.indexOf('Help:') === -1 &&
    url.indexOf('File:') === -1 &&
    url.indexOf('Wikipedia:') === -1 &&
    url.indexOf('wiktionary.org/') === -1 &&
    url.indexOf('/wiki/') !== -1;

  if (linkOk) {
    /**
     * Check if the link is between parenthesis
     */
    var contentHtml = link.closest('p').length > 0 ? link.closest('p').html() : '';
    if (contentHtml !== '') {
      var linkHtml = 'href="' + url + '"';
      var contentBeforeLink = contentHtml.split(linkHtml)[0];
      var openParenthesisCount = contentBeforeLink.split('(').length - 1;
      var closeParenthesisCount = contentBeforeLink.split(')').length - 1;
      linkOk = openParenthesisCount <= closeParenthesisCount;
    }
  }

  if (linkOk) {
    // Check that the link is not in italic
    linkOk = link.parents('i').length === 0;
  }

  return linkOk;
}

/**
 * Recursive function to go from a wikipedia page to the next by "clicking" the first link on the page
 * @param  {String}  url  URL of the Wikipedia page
 */
function goToNext(url, callbackEach, callback) {
  // Selector for all the main content links
  var selector = '#mw-content-text > p a, #mw-content-text > ul a';

  // Retrieve content from the url
  request(url, function (error, response, body) {
    // If we have an error we callback and return
    if (error || response.statusCode !== 200) { 
      console.log('Article does not exist');
      if (callback) {
        callback(['Error']);
      }
      return;
    }

    // Let's parse the content !
    var $ = cheerio.load(body);
    
    // First check that the page is an actual article
    var content = $('#mw-content-text');
    var noArticle = $('.noarticletext');
    if (!!content.html() && !noArticle.html()) {
      // 
      var link = $(selector).eq(0);
      url = link.attr('href');

      // If the link is not good, we iterate throught the next ones
      // until we find a good one !
      var i = 1;
      while (!isLinkOk(link)) {
        link = $(selector).eq(i);
        url = link.attr('href');
        i = i + 1;
      }

      // We push the url of the next page in the 'visited' array
      visited.push(url);

      // And the title of the current page in the 'path' array
      var title = $('#firstHeading').text();
      path.push(title);

      // Time to call 'callbackEach' method
      if (callbackEach) {
        callbackEach(title);
      }
      // If we arrived at 'Philosophy', VICTORY !
      // We can callback and return
      if (title === 'Philosophy') {
        if (callback) {
          callback(path);
        }
        return;
      }

      // If not, let's do all of this again
      goToNext('http://en.wikipedia.com/' + url, callbackEach, callback);
    } else { // If it is not an actual Wikipedia article, callback error and return
      console.log('Article does not exist');
      if (callback) {
        callback(['Error']);
      }
      return;
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
  goToNext('http://en.wikipedia.com/wiki/' + page, callbackEach, callback);
};
