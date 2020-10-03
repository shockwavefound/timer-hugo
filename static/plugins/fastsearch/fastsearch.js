var fuse; // holds our search engine
var searchVisible = false;
var firstRun = true; // allow us to delay loading json data unless search activated
var list = document.getElementById('searchResults'); // targets the <ul>
var first = list.firstChild; // first child of search list
var last = list.lastChild; // last child of search list
var maininput = document.getElementById('searchInput'); // input box for search
var resultsAvailable = false; // Did we get any search results?

// ==========================================
// The main keyboard event listener running the show
//
document.addEventListener('keydown', function(event) {
  // CMD-/ or CTRL-/ to show and focus on search box
  if ((event.metaKey || event.ctrlKey) && event.which == 191) {
      if (!searchVisible) {
          maininput.focus();            // put focus in input box
          searchVisible = true;
      } else {
          document.activeElement.blur();
          list.style.visiblity = "hidden";
          list.innerHTML = "";
          searchVisible = false;
      }
  }

  // Allow ESC (27) to close search box
  if (event.keyCode == 27) {
      if (searchVisible) {
          document.activeElement.blur();
          list.style.visiblity = "hidden";
          list.innerHTML = "";
          searchVisible = false;
      }
  }

  // DOWN (40) arrow
  if (event.keyCode == 40) {
    if (searchVisible && resultsAvailable) {
      event.preventDefault(); // stop window from scrolling
      if (document.activeElement == maininput) {
          // if the currently focused element is the main input --> focus the first <li>
          first.focus();
      } else if (document.activeElement == last) {
          // if we're at the bottom, stay there
          last.focus();
      } else {
          // otherwise select the next search result
          document.activeElement.parentElement.nextSibling.firstElementChild.focus();
      }
    }
  }

  // UP (38) arrow
  if (event.keyCode == 38) {
    if (searchVisible && resultsAvailable) {
      event.preventDefault(); // stop window from scrolling
      if (document.activeElement == maininput) {
          // If we're in the input box, do nothing
          maininput.focus();
      } else if (document.activeElement == first) {
          // If we're at the first item, go to input box
          maininput.focus();
      } else {
          // Otherwise, select the search result above the current active one
          document.activeElement.parentElement.previousSibling.firstElementChild.focus();
      }
    }
  }
});

//
// ==========================================
// load JSON on focus of the search input field
// (we don't load json unless searches are going to happen; keep user payload small unless needed)
//
document.getElementById("searchInput").onfocus = function(e) {
      if (firstRun) {
        loadSearch(); // loads our json data and builds fuse.js search index
        firstRun = false; // let's never do this again
      }
      list.style.visibility = "visible"; // show search results
      searchVisible = true;
}

document.getElementById("searchInput").onsearch = function(e) {
    if (!this.value) {
        list.style.visiblity = "hidden";
        list.innerHTML = "";
        searchVisible = false;
    } else if (resultsAvailable) {
        if (first && first.href) {
            location.assign(first.href);
        }
    }
}

// ==========================================
// execute search as each character is typed
//
document.getElementById("searchInput").onkeyup = function(e) {
      executeSearch(this.value);
}

// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
      }
    }
  };
  httpRequest.open('GET', path);
  httpRequest.send();
}


// ==========================================
// load our search index, only executed once
// on first call of search box (CMD-/)
//
function loadSearch() {
  fetchJSONFile('/index.json', function(data){

    var options = { // fuse.js options; check fuse.js website for details
      threshold: 0.4,
      minMatchCharLength: 2,
      keys: [
          { name: "title", weight: 0.8 },
          { name: "summary", weight: 0.6 },
          { name: "contents", weight: 0.5 },
          { name: "tags", weight: 0.3 },
          { name: "categories", weight: 0.3 }
        ]
    };
    fuse = new Fuse(data, options); // build the index from the json file
  });
}


// ==========================================
// using the index we loaded on CMD-/, run
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term) {

  let results = fuse.search(term); // the actual query being run using fuse.js
  let searchitems = ''; // our results bucket

  while (list.firstChild)
      list.removeChild(list.lastChild);

  if (results.length === 0) { // no results based on what was typed into the input box
    resultsAvailable = false;
    list.appendChild(htmlToElement('<li><a href="#">No results found.</a></li>'));
  } else { // build our html
    var templateDefinition = document.getElementById('searchResultsTemplate').innerHTML;
    for (let item in results.slice(0,5)) { // only show first 5 results
      let output = render(templateDefinition, results[item].item);
      list.appendChild(htmlToElement(output));
    }
    resultsAvailable = true;
    first = list.firstChild.firstElementChild; // first result container — used for checking against keyboard up/down location
    last = list.lastChild.firstElementChild; // last result container — used for checking against keyboard up/down location
  }
}

function render(templateString, data) {
  var conditionalMatches, conditionalPattern, copy;
  conditionalPattern = /\$\{\s*isset ([a-zA-Z]*)\s*\}(.*)\$\{\s*end\s*}/g;
  // since loop below depends on re.lastInxdex, we use a copy to capture any manipulations
  // whilst inside the loop
  copy = templateString;
  while ((conditionalMatches = conditionalPattern.exec(templateString)) !== null) {
    if (data[conditionalMatches[1]]) {
      //valid key, remove conditionals, leave content.
      copy = copy.replace(conditionalMatches[0], conditionalMatches[2]);
    } else {
      //not valid, remove entire section
      copy = copy.replace(conditionalMatches[0], '');
    }
  }
  templateString = copy;
  //now any conditionals removed we can do simple substitution
  var key, find, re;
  for (key in data) {
    find = '\\$\\{\\s*' + key + '\\s*\\}';
    re = new RegExp(find, 'g');
    templateString = templateString.replace(re, data[key]);
  }
  return templateString;
}

/**
 * By Mark Amery: https://stackoverflow.com/a/35385518
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
