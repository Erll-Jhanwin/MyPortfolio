import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
export const runtime="nodejs";
export async function GET(){const file=path.join(process.cwd(),"public","resume.pdf");if(!existsSync(file))return new Response("Résumé has not been published.",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}});return new Response(new Uint8Array(readFileSync(file)),{headers:{"Content-Type":"application/pdf","Content-Disposition":"attachment; filename=Erll-Resume.pdf","Cache-Control":"public, max-age=3600"}})}
