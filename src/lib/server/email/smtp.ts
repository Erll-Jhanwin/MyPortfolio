import "server-only";
import { createTransport } from "nodemailer";
import type { Job } from "@/lib/server/repositories/types";
import { requireEnv } from "@/lib/server/env";
import { notificationContent } from "@/lib/email-content";
import { z } from "zod";

export function assertSmtpConfigured() {
  const port = Number(process.env.SMTP_PORT ?? 1025);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("smtp_port_invalid");
  const host = requireEnv("SMTP_HOST");
  if (/[\r\n]/.test(host)) throw new Error("smtp_host_invalid");
  for (const name of ["INQUIRY_FROM_EMAIL", "INQUIRY_TO_EMAIL"]) {
    if (!z.string().email().safeParse(requireEnv(name)).success) throw new Error("smtp_address_invalid");
  }
  if (process.env.SMTP_USER) requireEnv("SMTP_PASSWORD");
}

/** Sends an operator notice containing only an opaque record reference and category. */
export async function sendSmtpNotification(job: Job): Promise<void> {
  assertSmtpConfigured();
  const port = Number(process.env.SMTP_PORT ?? 1025);
  const transport = createTransport({
    host: requireEnv("SMTP_HOST"), port, secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: requireEnv("SMTP_PASSWORD") } : undefined,
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
  });
  const from = requireEnv("INQUIRY_FROM_EMAIL");
  const to = requireEnv("INQUIRY_TO_EMAIL");
  const { subject, text } = notificationContent(job);
  try {
    await transport.sendMail({ messageId: `<${job.id}@portfolio.local>`, from, to, subject, text });
  } finally {
    transport.close();
  }
}
