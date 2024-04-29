const apiKey = 'fcbd2e010ac490f8a50eec8385a17680';

const currentUser = {
    id: 1,
    username: 'VivRose96',
    favoriteMovie: 'Creed',
    topMovies: [
    ]
};

function displayUserProfile(user) {
    const userName = document.getElementById('userName');
    const favoriteMovie = document.getElementById('favoriteMovie');
    const movieList = document.getElementById('topMovieList');
    if (userName && favoriteMovie && movieList) {
        userName.textContent = user.username;
        favoriteMovie.textContent = user.favoriteMovie;
        movieList.innerHTML = '';
        user.topMovies.forEach(movie => {
            const listItem = document.createElement('li');
            listItem.textContent = `${movie.title} (${movie.year})`;
            movieList.appendChild(listItem);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchLatestMovies();
});

async function fetchLatestMovies() {
    const moviesContainer = document.getElementById('moviesContainer');
    if (!moviesContainer) {
        console.log("moviesContainer element not found. Exiting fetchLatestMovies.");
        return; // Exit the function if moviesContainer is not found
    }

    const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results, moviesContainer);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

function displayMovies(movies, container) {
    container.innerHTML = '';
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button onclick="addToMustSeeList('${movie.id}', event)">Add to Must See</button>
        `;
        container.appendChild(movieElement);
    });
}

function addToMustSeeList(movieId, event) {
    let mustSeeMovies = JSON.parse(localStorage.getItem('mustSeeMovies')) || [];
    if (!mustSeeMovies.includes(movieId)) {
        mustSeeMovies.push(movieId);
        localStorage.setItem('mustSeeMovies', JSON.stringify(mustSeeMovies));

        const button = event.target;
        button.textContent = 'Added';
        button.disabled = true;
    } else {
        alert("This movie is already in your Must See list.");
    }
}

function displayConfirmationMessage(message, isError = false) {
    const messageDiv = document.getElementById('confirmationMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.style.color = isError ? 'red' : 'yellow'; 
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    } else {
        console.error('Confirmation message element not found');
    }
}

function displayMustSeeMovies() {
    const movieList = document.getElementById('mustSeeMovieList');
    const mustSeeMovies = JSON.parse(localStorage.getItem('mustSeeMovies')) || [];

    movieList.innerHTML = '';
    mustSeeMovies.forEach(movieId => {
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`)
            .then(response => response.json())
            .then(movie => {
                const movieElement = document.createElement('div');
                movieElement.className = 'movie';
                movieElement.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                    <h3>${movie.title}</h3>
                    <button class="remove-btn" onclick="removeFromMustSeeList('${movieId}')">Remove</button>
                `;
                movieList.appendChild(movieElement);
            });
    });
}

function removeFromMustSeeList(movieId) {
    let mustSeeMovies = JSON.parse(localStorage.getItem('mustSeeMovies'));
    const index = mustSeeMovies.indexOf(movieId);
    if (index > -1) {
        mustSeeMovies.splice(index, 1);
        localStorage.setItem('mustSeeMovies', JSON.stringify(mustSeeMovies));
        displayMustSeeMovies();
    }
}

async function searchMovies() {
    const searchQuery = document.getElementById('searchBox').value;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displaySearchResults(data.results);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

function displaySearchResults(movies) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button onclick="addToProfile('${movie.id}')">Add to My Ratings</button>
        `;
        container.appendChild(movieElement);
    });
}

function addToProfile(movieId) {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`)
        .then(response => response.json())
        .then(movie => {
            const profileContainer = document.getElementById('myMovieRatings');
            const movieElement = document.createElement('div');
            movieElement.className = 'movie';
            movieElement.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                ${generateStarRatingHtml(movie.id)}
                <button onclick="removeFromProfile('${movie.id}')">Remove from Ratings</button>
            `;
            profileContainer.appendChild(movieElement);
            saveMovieToRatings(movie);
            displayConfirmationMessage(`${movie.title} has been added to your ratings!`);
        })
        .catch(error => {
            console.error('Error adding movie to profile:', error);
            displayConfirmationMessage('Failed to add movie to ratings.', true);
        });
}

function generateStarRatingHtml(movieId) {
    return `
        <div class="rating" data-movie-id="${movieId}">
            ${[1, 2, 3, 4, 5].map(num => `
                <span class="star" onclick="rateMovie('${movieId}', ${num})">&#9733;</span>
            `).join('')}
        </div>
    `;
}

function rateMovie(movieId, rating) {
    let movieRatings = JSON.parse(localStorage.getItem('movieRatings'));
    const index = movieRatings.findIndex(movie => movie.id === parseInt(movieId));
    if (index !== -1) {
        movieRatings[index].rating = rating;
        localStorage.setItem('movieRatings', JSON.stringify(movieRatings));
        updateStarDisplay(movieId, rating);
    }
}

function updateStarDisplay(movieId, rating) {
    const stars = document.querySelectorAll(`.rating[data-movie-id="${movieId}"] .star`);
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('rated');
        } else {
            star.classList.remove('rated');
        }
    });
}

function saveMovieToRatings(movie) {
    let movieRatings = JSON.parse(localStorage.getItem('movieRatings'));
    const movieData = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        rating: 0  // Default rating when added
    };
    movieRatings.push(movieData);
    localStorage.setItem('movieRatings', JSON.stringify(movieRatings));
}

function displayMovieRatings() {
    const movieRatings = JSON.parse(localStorage.getItem('movieRatings'));
    const profileContainer = document.getElementById('myMovieRatings');
    profileContainer.innerHTML = '';

    movieRatings.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            ${generateStarRatingHtml(movie.id)}
            <button onclick="removeFromProfile('${movie.id}')">Remove from Ratings</button>
        `;
        profileContainer.appendChild(movieElement);
        updateStarDisplay(movie.id, movie.rating);
    });
}

function removeFromProfile(movieId) {
    const profileContainer = document.getElementById('myMovieRatings');
    let movieRatings = JSON.parse(localStorage.getItem('movieRatings'));
    movieRatings = movieRatings.filter(movie => movie.id !== parseInt(movieId));
    localStorage.setItem('movieRatings', JSON.stringify(movieRatings));
    displayMovieRatings();
}

function clearSearch() {
    document.getElementById('searchBox').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

let comparisonMovies = [];

function addToComparison(movieId) {
    if (comparisonMovies.length < 3) {
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=genres,box_office`)
            .then(response => response.json())
            .then(movie => {
                if (!comparisonMovies.find(m => m.id === movieId)) {
                    comparisonMovies.push(movie);
                    displayComparisonMovies();
                } else {
                    alert("This movie is already added for comparison.");
                }
            })
            .catch(error => console.error('Error adding movie to comparison:', error));
    } else {
        alert('You can only compare up to 3 movies at a time.');
    }
}

function removeFromComparison(movieId) {
    console.log("Current comparisonMovies before removal:", comparisonMovies); // Debug: Show current movies

    // Filter out the movie with the given ID
    comparisonMovies = comparisonMovies.filter(movie => movie.id !== parseInt(movieId));

    console.log("Updated comparisonMovies after removal:", comparisonMovies); // Debug: Show updated movies

    // Re-display the comparison movies
    displayComparisonMovies();
}

document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', searchMoviesForComparison);
    }
    // other initialization code
});

function searchMoviesForComparison() {
    const searchQuery = document.getElementById('comparisonSearchBox').value;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayComparisonSearchResults(data.results);
        })
        .catch(error => console.error('Error fetching search results for comparison:', error));
}

function displayComparisonMovies() {
    const container = document.getElementById('comparisonResults');
    container.innerHTML = ''; // Clear the container first

    comparisonMovies.forEach(movie => {
        const imdbRating = movie.imdbRating ? `IMDb Rating: ${movie.imdbRating}` : 'IMDb Rating: N/A';
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Year: ${movie.release_date.split('-')[0]}</p>
            <p>Genres: ${movie.genres.map(genre => genre.name).join(', ')}</p>
            <p>${imdbRating}</p>
            <button onclick="removeFromComparison('${movie.id}')">Remove from Comparison</button>
        `;
        container.appendChild(movieElement);
    });
}

function displayComparisonSearchResults(movies) {
    const container = document.getElementById('comparisonResults');
    container.innerHTML = ''; // Clear previous results
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button onclick="addToComparison('${movie.id}')">Add to Comparison</button>
        `;
        container.appendChild(movieElement);
    });
}

function fetchCriticScores(movieId) {
    const url = `https://www.omdbapi.com/?i=${movieId}&apikey=d33c76e2`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                const movieIndex = comparisonMovies.findIndex(m => m.id === movieId);
                if (movieIndex !== -1) {
                    comparisonMovies[movieIndex].criticScores = {
                        rottenTomatoes: data.Ratings.find(r => r.Source === "Rotten Tomatoes")?.Value,
                        metacritic: data.Ratings.find(r => r.Source === "Metacritic")?.Value
                    };
                    displayComparisonMovies(); 
                }
            } else {
                console.error("Failed to fetch critic scores:", data.Error);
            }
        })
        .catch(error => console.error('Error fetching critic scores:', error));
}

window.onload = () => {
    if (window.location.pathname.includes('profile.html')) {
        displayUserProfile(currentUser);
        displayMustSeeMovies();
        displayMovieRatings();
    } else {
        fetchLatestMovies();
    }
};
