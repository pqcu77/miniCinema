-- ...existing schema definitions...

-- Movie comments table for per-movie user comments and ratings
CREATE TABLE IF NOT EXISTS movie_comments (
  id BIGSERIAL PRIMARY KEY,
  movie_id INT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  rating NUMERIC(3,1),
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movie_comments_movie_id ON movie_comments (movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_comments_create_time ON movie_comments (create_time DESC);

