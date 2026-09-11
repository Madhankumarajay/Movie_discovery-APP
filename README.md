Movie Discovery App

A simple movie discovery application that helps users search for movies and explore movie details in one place.

About the Project

I built this project to create a simple and user-friendly movie discovery experience. Users can search for movies, view movie information, and explore different movies through the application.

The project uses a movie API to fetch real-time movie data and display it on the application.

Features

- 🔍 Search for movies
- 🎬 Browse movies
- ⭐ View movie ratings
- 📖 View movie details
- 🖼️ Display movie posters
- 📱 Responsive user interface
- ⚡ Fast and simple movie discovery

Technologies Used

- React.js
- JavaScript
- HTML
- CSS
- Movie API

How to Run

1. Clone the repository.
2. Open the project folder.
3. Install the required packages:

npm install

4. Add your movie API key if required.
5. Start the application:

npm run dev

6. Open the local URL shown in the terminal.

What I Learned

While working on this project, I got practical experience with React, API integration, handling movie data, creating reusable components, and building a responsive frontend.

Future Improvements

- Add user authentication
- Add a favorites/watchlist feature
- Add movie filtering and sorting
- Improve the recommendation system
- Add more detailed movie information

Author

Madhan Kumar

Built as a learning project to improve my frontend development and API integration skills.

## Project Structure

movie-discovery-app/
├── backend/
│   └── src/
│       ├── config/          env-driven configuration
│       ├── controllers/     request handlers
│       ├── db/              SQLite connection + wishlist repository
│       ├── middleware/      device-id resolution, error handling
│       ├── routes/          /api/movies, /api/wishlist
│       ├── services/        TMDB client, cache, circuit breaker
│       └── server.js
└── frontend/
    └── src/
        ├── api/               fetch client
        ├── components/        MovieCard, MovieGrid, FilterBar, etc.
        ├── context/           WishlistContext (global wishlist state)
        ├── hooks/             useDebounce, useInfiniteScroll
        ├── pages/             Home, MovieDetails, Wishlist
        └── styles/
```//
