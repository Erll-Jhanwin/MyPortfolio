import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
const base=(process.env.APP_URL??"http://localhost:3000").replace(/\/$/,"");const secret=process.env.WORKER_SECRET;
if(!secret){console.error("notification_worker_unavailable: set WORKER_SECRET");process.exit(1);}
const response=await fetch(`${base}/api/internal/notifications`,{method:"POST",headers:{Authorization:`Bearer ${secret}`}});const body=await response.json().catch(()=>({message:"Worker response could not be read."}));console.log(JSON.stringify({status:response.status,...body}));if(!response.ok)process.exitCode=1;
