import { MONGO_URI, DB_HOST, DB_PORT, DB_DATABASE } from '@config';

// Use MONGO_URI if provided, otherwise fall back to constructing from DB_HOST, DB_PORT, DB_DATABASE
export const dbConnection = {
  url: MONGO_URI || `${DB_HOST}/${DB_DATABASE}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

