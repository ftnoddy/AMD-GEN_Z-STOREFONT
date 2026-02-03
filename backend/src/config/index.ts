import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env first (works when you use .env or .env.development.local renamed to .env)
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}.local`);
const envNODE_ENVPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`);

if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else if (fs.existsSync(envNODE_ENVPath)) {
  config({ path: envNODE_ENVPath });
} else {
  config(); // dotenv default: .env in cwd
}

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
