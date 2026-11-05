export type NotificationReference = { id: string; inquiryId: string | null; privacyRequestId: string | null; type: string };

export function notificationContent(job: NotificationReference) {
  const inquiry = Boolean(job.inquiryId);
  const reference = job.inquiryId ?? job.privacyRequestId;
  return {
    subject: inquiry ? `New portfolio inquiry (${job.type})` : "New privacy request",
    text: inquiry
      ? `A portfolio inquiry is ready for review.\n\nReference: ${reference}\nType: ${job.type}\n\nUse the restricted operator database workflow to review the message and respond.`
      : `A privacy request is ready for review.\n\nRequest reference: ${reference}\nType: ${job.type}\n\nUse the restricted operator workflow to verify ownership before acting.`,
  };
}
