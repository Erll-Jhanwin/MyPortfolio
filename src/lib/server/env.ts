import "server-only";
export function requireEnv(name:string){const value=process.env[name];if(!value)throw new Error(`missing_${name.toLowerCase()}`);return value;}
