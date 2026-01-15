import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.development.local in the backend root directory
// Try multiple paths to ensure it works in both development and production
const envFile = `.env.${process.env.NODE_ENV || 'development'}.local`;
const envPath = path.resolve(process.cwd(), envFile);

config({ path: envPath });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { 
  NODE_ENV, 
  PORT, 
  MONGO_URI,
  DB_HOST, 
  DB_PORT, 
  DB_DATABASE, 
  SECRET_KEY, 
  JWT_SECRET, 
  LOG_FORMAT, 
  LOG_DIR, 
  ORIGIN 
} = process.env;
