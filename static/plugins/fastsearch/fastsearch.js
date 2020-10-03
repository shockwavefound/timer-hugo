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
            open(first.href, "_self");
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

  if (results.length === 0) { // no results based on what was typed into the input box
    resultsAvailable = false;
    searchitems = '<li><a href="#">No results found.</a></li>';
  } else { // build our html
    for (let item in results.slice(0,5)) { // only show first 5 results
      let result = results[item].item;
      searchitems = searchitems + '<li><a href="' + result.permalink + '" tabindex="0">' + '<span class="title">' + result.title + '</span><br /> <span class="section">'+ result.section +'</span> — ' + result.date + ' — <em>' + result.summary + '</em></a></li>';
    }
    resultsAvailable = true;
  }

  document.getElementById("searchResults").innerHTML = searchitems;
  if (results.length > 0) {
    first = list.firstChild.firstElementChild; // first result container — used for checking against keyboard up/down location
    last = list.lastChild.firstElementChild; // last result container — used for checking against keyboard up/down location
  }
}
