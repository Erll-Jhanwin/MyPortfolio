import type { ProjectDraft, ProjectImageInput, ProjectImageRecord, ProjectRecord } from "@/lib/projects/types";
import type { ResumeDocument, ResumeState } from "@/lib/resume/types";

export type InquiryInput = { id:string; idempotencyKey:string; name:string; email:string; type:"project"|"job"|"other"; message:string; budget:string|null; timeline:string|null; consentVersion:string; consentedAt:string };
export type PrivacyInput = { id:string; idempotencyKey:string; email:string; type:"access"|"correction"|"deletion"; details:string|null; createdAt:string };
export type Job = { id:string; inquiryId:string|null; privacyRequestId:string|null; attempts:number; type:string };
export interface Repository {
  consumeRateLimit(key:string, now:string, limit:number, windowMs:number): Promise<{allowed:boolean; retryAfter:number}>;
  createInquiry(input:InquiryInput): Promise<{id:string; replayed:boolean}>;
  createPrivacyRequest(input:PrivacyInput): Promise<{replayed:boolean}>;
  claimDueJobs(now:string, leaseUntil:string, limit:number): Promise<Job[]>;
  finishJob(id:string, sentAt:string): Promise<void>;
  failJob(id:string, attempts:number, nextAttemptAt:string, failureCode:string, permanent:boolean): Promise<void>;
  listProjects(includeDrafts?:boolean): Promise<ProjectRecord[]>;
  getProjectById(id:string): Promise<ProjectRecord|null>;
  getProjectBySlug(slug:string): Promise<ProjectRecord|null>;
  saveProject(project:ProjectDraft, id?:string): Promise<ProjectRecord>;
  deleteProject(id:string): Promise<boolean>;
  countProjectImages(projectId:string): Promise<number>;
  addProjectImage(image:ProjectImageInput): Promise<void>;
  deleteProjectImage(projectId:string, imageId:string): Promise<boolean>;
  getProjectImage(projectId:string, imageId:string): Promise<ProjectImageRecord|null>;
  getResume(): Promise<ResumeState>;
  saveResumeDraft(resume:ResumeDocument): Promise<ResumeState>;
  publishResume(): Promise<ResumeState>;
}
