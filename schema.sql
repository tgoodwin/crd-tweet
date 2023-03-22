SELECT load_extension('crsqlite');

CREATE TABLE IF NOT EXISTS users (id primary key, username, site_id);
CREATE TABLE IF NOT EXISTS tweets (id primary key, user_id, text, created_at);
CREATE TABLE IF NOT EXISTS follows (id primary key, user_id, follower_id, is_deleted);
CREATE TABLE IF NOT EXISTS likes (id primary key, user_id, post_id, is_deleted);

SELECT crsql_as_crr('users');
SELECT crsql_as_crr('tweets');
SELECT crsql_as_crr('follows');
SELECT crsql_as_crr('likes');