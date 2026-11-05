import "server-only";
import type { Repository } from "./types";
import { sqliteRepository } from "./sqlite";
import { postgresRepository } from "./postgres";
export function repository():Repository{const provider=process.env.DATA_PROVIDER??(process.env.NODE_ENV==="production"?"":"sqlite");if(process.env.NODE_ENV==="production"&&provider!=="postgres")throw new Error("production_requires_postgres");if(provider==="sqlite")return sqliteRepository;if(provider==="postgres")return postgresRepository;throw new Error("database_provider_not_configured");}
