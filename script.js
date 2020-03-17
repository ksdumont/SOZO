const CLIENT_ID = "85a6fca57ef044718e4391ebbb54d25b";

function getAuthToken() {
  try {
    return window.location.hash
      .substr(1)
      .split("&")
      .find(x => x.startsWith("access_token="))
      .split("=")[1];
  } catch {
    return undefined;
  }
}

const token = getAuthToken();

function load() {
  $("#notLoggedIn").hide();
  $("#loggedIn").hide();

  if (token) {
    renderLoggedIn(token);
  } else {
    renderNotLoggedIn();
  }
}

function renderNotLoggedIn() {
  $("#notLoggedIn").show();

  $("#loginButton").click(event => {
    event.preventDefault();

    const params = {
      client_id: CLIENT_ID,
      redirect_uri: window.location.href,
      response_type: "token"
    };
    window.location = `https://accounts.spotify.com/authorize?${$.param(
      params
    )}`;
  });
}

function renderLoggedIn(token) {
  $("#loggedIn").show();
  console.log(token);
}
// Search Spotify for song and song id
function fetchSong(path, params = {}) {
  return fetch(`https://api.spotify.com/v1/${path}?${$.param(params)}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      console.log(responseJson);
      showSongResults(responseJson);
    })
    .catch(err => console.log(err.message));
}
// Get Audio features of track
function fetchAudioFeatures(id) {
  return fetch(`https://api.spotify.com/v1/audio-features/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      console.log(responseJson);
      showAudioFeatures(responseJson);
    })
    .catch(err => console.log(err.message));
}

function showSongResults(responseJson) {
  let data = responseJson.tracks.items;
  let artist = data[0].artists[0].name;
  let song = data[0].name;
  let id = data[0].id;

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].artists.length; j++) {
      if (
        data[i].artists[j].name.toLowerCase().includes(
          $("#artistSearch")
            .val()
            .trim()
            .toLowerCase()
        )
      ) {
        artist = data[i].artists[j].name;
        song = data[i].name;
        id = data[i].id;
      }
    }
  }
  console.log(artist);
  console.log(song);
  console.log(id);

  $("#results").html("");
  $("#results").append(`<h2>${song} by ${artist}</h2>`);

  fetchAudioFeatures(id);
}
//convert 0,1 to Minor/Major, Convert Pitch Notation
function showAudioFeatures(responseJson) {
  let mode = responseJson.mode;
  if (mode === 1) {
    mode = "Major";
  } else {
    mode = "Minor";
  }

  let key = responseJson.key;
  if (key == 0) {
    key = "C";
  } else if (key == 1) {
    key = "C#";
  } else if (key == 2) {
    key = "D";
  } else if (key == 3) {
    key = "D#";
  } else if (key == 4) {
    key = "E";
  } else if (key == 5) {
    key = "F";
  } else if (key == 6) {
    key = "F#";
  } else if (key == 7) {
    key = "G";
  } else if (key == 8) {
    key = "G#";
  } else if (key == 9) {
    key = "A";
  } else if (key == 10) {
    key = "A#";
  } else {
    key = "B";
  }

  $("#results").append(`<p>
      Tempo: ${responseJson.tempo}<br>
      Time signature: ${responseJson.time_signature}<br>
      Key: ${key}<br>
      Mode: ${mode} 
  </p>`);
}

$("form").submit(e => {
  e.preventDefault();

  fetchSong("search", {
    q: $("#songSearch")
      .val()
      .trim(),
    type: "track",
    limit: 50
  });
});

$(load);
