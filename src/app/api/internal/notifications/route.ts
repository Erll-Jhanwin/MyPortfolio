import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/server/repositories";
import { equalSecret } from "@/lib/server/request-guards";
import { requireEnv } from "@/lib/server/env";
import { assertSmtpConfigured, sendSmtpNotification } from "@/lib/server/email/smtp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let secret: string;
  try { secret = requireEnv("WORKER_SECRET"); }
  catch { return NextResponse.json({ message: "Worker unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
  if (!equalSecret(request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""), secret)) return NextResponse.json({ message: "Not found." }, { status: 404 });

  try {
    assertSmtpConfigured();
    const now = new Date();
    const jobs = await repository().claimDueJobs(now.toISOString(), new Date(now.getTime() + 60000).toISOString(), 1);
    let acceptedBySmtp = 0;
    let failed = 0;
    for (const job of jobs) {
      try {
        await sendSmtpNotification(job);
        await repository().finishJob(job.id, new Date().toISOString());
        acceptedBySmtp++;
      } catch (error) {
        const attempts = job.attempts;
        const delay = Math.min(24 * 60 * 60 * 1000, 60 * 1000 * 2 ** Math.min(attempts - 1, 10));
        const permanent = attempts >= 8;
        await repository().failJob(job.id, attempts, new Date(Date.now() + delay).toISOString(), "smtp_delivery_failed", permanent);
        failed++;
        console.error("notification_delivery_failed", { jobId: job.id, attempt: attempts, permanent, code: error instanceof Error ? error.name : "unknown" });
      }
    }
    return NextResponse.json({ processed: jobs.length, acceptedBySmtp, failed }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("notification_worker_failed", { code: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ message: "Worker failed." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
