class TMDbApi {
  constructor(apiKey) {
    this.baseUrl = "https://api.themoviedb.org/3";
    this.apiKey = apiKey;
  }

  async search(query) {
    const searchUrl = `${this.baseUrl}/search/movie`;
    const response = await fetch(searchUrl + "?api_key=" + this.apiKey + "&query=" + encodeURIComponent(query));

    if (response.status === 200) {
      return await response.json();
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  }

  async getMovieDetails(movieId) {
    const detailsUrl = `${this.baseUrl}/movie/${movieId}`;
    const response = await fetch(detailsUrl + "?api_key=" + this.apiKey);

    if (response.status === 200) {
      return await response.json();
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  }

  async getMovieCredits(movieId) {
    const creditsUrl = `${this.baseUrl}/movie/${movieId}/credits`;
    const response = await fetch(creditsUrl + "?api_key=" + this.apiKey);

    if (response.status === 200) {
      return await response.json();
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  }

  async getMovieVideos(movieId) {
    const videosUrl = `${this.baseUrl}/movie/${movieId}/videos`;
    const response = await fetch(videosUrl + "?api_key=" + this.apiKey);

    if (response.status === 200) {
      return await response.json();
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-movie-form");
  const movieTitleInput = document.getElementById("movie-title");
  const movieList = document.getElementById("movie-list");
  const searchResults = document.createElement("div");
  const apiKey = "6a576fbdf182d1c090691b8d5426e005";

  form.parentNode.insertBefore(searchResults, form.nextSibling);

  loadSavedMovies();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const movieTitle = movieTitleInput.value.trim();

    if (movieTitle) {
      searchResults.innerHTML = "";
      const moviesData = await fetchMoviesData(movieTitle, apiKey);

      if (moviesData.length > 0) {
        moviesData.forEach((movieData) => {
          const resultItem = document.createElement("div");
          resultItem.textContent = `${movieData.title} (${movieData.year})`;
          resultItem.addEventListener("click", () => {
            addMovieToList(movieData);
            saveMovie(movieData);
            searchResults.innerHTML = "";
          });
          searchResults.appendChild(resultItem);
        });
      } else {
        alert("Фильмы не найдены");
      }
    }
  });

  async function fetchMoviesData(movieTitle, apiKey) {
    const api = new TMDbApi(apiKey);
    const data = await api.search(movieTitle);
  
    if (data.results) {
      const moviesData = await Promise.all(
        data.results.map(async (movie) => {
          const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : "N/A";
          const details = await api.getMovieDetails(movie.id);
          const credits = await api.getMovieCredits(movie.id);
          const videos = await api.getMovieVideos(movie.id);
  
          const director = credits.crew.find((member) => member.job === "Director");
          const mainActors = credits.cast.slice(0, 3).map((actor) => actor.name).join(", ");
          const trailer = videos.results.find((video) => video.type === "Trailer" && video.site === "YouTube");
  
          return {
            title: movie.title,
            year: movie.release_date.slice(0, 4),
            id: movie.id,
            poster: posterPath,
            director: director ? director.name : "N/A",
            mainActors: mainActors,
            trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "N/A",
          };
        })
      );
  
      return moviesData;
    } else {
      return [];
    }
  }
  
  function addMovieToList(movieData) {
    const movieItem = document.createElement("li");
    movieItem.style.display = "flex";
    movieItem.style.justifyContent = "space-between";
    movieItem.style.alignItems = "flex-start";
  
    const movieInfo = document.createElement("div");
    movieInfo.innerHTML = `<h3>${movieData.title} (${movieData.year})</h3>
                           <p>Режиссер: ${movieData.director}</p>
                           <p>Главные актеры: ${movieData.mainActors}</p>`;
    if (movieData.trailer !== "N/A") {
      movieInfo.innerHTML += `<a href="${movieData.trailer}" target="_blank">Смотреть трейлер</a>`;
    }
    movieItem.appendChild(movieInfo);
  
    if (movieData.poster !== "N/A") {
      const moviePoster = document.createElement("img");
      moviePoster.src = movieData.poster;
      moviePoster.alt = `Постер фильма ${movieData.title}`;
      moviePoster.width = 100;
      movieItem.appendChild(moviePoster);
    }
  
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.addEventListener("click", () => {
      movieList.removeChild(movieItem);
      removeMovie(movieData.title);
    });
  
    movieItem.appendChild(deleteButton);
    movieList.appendChild(movieItem);
  }

  function saveMovie(movieData) {
    const savedMovies = getSavedMovies();
    savedMovies.push(movieData);
    localStorage.setItem("movies", JSON.stringify(savedMovies));
  }

  function removeMovie(movieTitle) {
    const savedMovies = getSavedMovies();
    const updatedMovies = savedMovies.filter((movieData) => movieData.title !== movieTitle);
    localStorage.setItem("movies", JSON.stringify(updatedMovies));
  }

  function getSavedMovies() {
    const savedMovies = localStorage.getItem("movies");
    return savedMovies ? JSON.parse(savedMovies) : [];
  }

  function loadSavedMovies() {
    const savedMovies = getSavedMovies();
    savedMovies.forEach((movieData) => addMovieToList(movieData));
  }
});