import { z } from "zod";
const safeString=(min:number,max:number)=>z.string().transform(v=>v.trim()).pipe(z.string().min(min).max(max));
const key=z.string().uuid();
const email=z.string().trim().max(254).email().refine(v=>!/[\r\n]/.test(v),"Invalid email address");
export const inquirySchema=z.object({name:safeString(1,100),email,type:z.enum(["project","job","other"]),message:safeString(20,3000),budget:z.enum(["","under-500","500-1500","1500-5000","over-5000","not-applicable"]).optional(),timeline:z.string().trim().max(100).optional(),consent:z.boolean().refine(v=>v,{message:"Please agree before sending."}),adultConfirmed:z.boolean().refine(v=>v,{message:"Please confirm you are at least 18."}),idempotencyKey:key,website:z.string().max(200).optional()}).strict();
export const privacySchema=z.object({email,type:z.enum(["access","correction","deletion"]),details:z.string().trim().max(500).optional(),website:z.string().max(200).optional(),idempotencyKey:key}).strict();
export function errorsOf(issues:readonly {path:PropertyKey[];message:string}[]){const errors:Record<string,string>={};for(const issue of issues){const key=String(issue.path[0]??"form");if(!errors[key])errors[key]=issue.message;}return errors;}
