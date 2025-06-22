import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Optimized connection pool for heavy traffic (100k+ concurrent users)
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 50, // Maximum connections for heavy traffic
  min: 10, // Keep minimum connections alive
  idleTimeoutMillis: 30000, // 30 seconds idle timeout
  connectionTimeoutMillis: 10000, // 10 seconds connection timeout
  maxUses: 7500, // Connection reuse limit for stability
});

export const db = drizzle({ client: pool, schema });