import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const sql = neon(process.env.DATABASE_URL);

export default sql;
