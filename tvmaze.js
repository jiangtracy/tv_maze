"use strict";

const SHOW_URL = "http://api.tvmaze.com";
const MISSING_IMG_URL = "https://tinyurl.com/tv-missing";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let response = await axios.get(`${SHOW_URL}/search/shows`, { params: { q: term } });
  let showData = response.data;

  return showData.map(function (show) {
    let showObj = show.show;

    let id = showObj.id;
    let name = showObj.name;
    let image = (showObj.image) ? showObj.image.medium : MISSING_IMG_URL;
    let summary = showObj.summary;

    return { id, name, image, summary };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${show.image} 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
  let response = await axios.get(`${SHOW_URL}/shows/${id}/episodes`);
  let episodeData = response.data;

  return episodeData.map(function(episode) {
    let id = episode.id;
    let name = episode.name;
    let season = episode.season;
    let number = episode.number;

    return {id, name, season, number};
  });
}

/*
 *Adds a list of the episodes list DOM 
*/
function populateEpisodes(episodes) {
  $episodesList.empty();
  $episodesArea.attr("style", "");

  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (Season ${episode.season}, number ${episode.number})</li>`);

    $episodesList.append($episode);
  }
}

/**Returns the ID of the show */
function getShowId(evt) {
  let showId = $(evt.target)
    .closest(".Show")
    .attr("data-show-id");
  
  return showId;
}

/**Gets the episodes of the show ID and displays the list of episodes in the DOM */
async function getEpisodesAndDisplay(evt) {
  let id = getShowId(evt);
  let episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);  
}


/**Adds event listener to the submit button */
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/**Adds event listener to the Episodes buttons */
$showsList.on("click", ".Show-getEpisodes", async function(evt) {
  evt.preventDefault();
  await getEpisodesAndDisplay(evt);
});