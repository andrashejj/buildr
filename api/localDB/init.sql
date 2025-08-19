-- Create app database
CREATE DATABASE app WITH ENCODING 'UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8';

-- Create hopper-service database
CREATE DATABASE "hopper-service" WITH ENCODING 'UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8';

-- Connect to hopper-service database and create vector extension
\c "hopper-service"
CREATE EXTENSION IF NOT EXISTS vector;