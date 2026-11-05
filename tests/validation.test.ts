import { describe, expect, it } from "vitest";
import { inquirySchema } from "../src/lib/server/validation";
import { safeExternalUrl } from "../src/lib/urls";
import { notificationContent } from "../src/lib/email-content";

const valid = {
  name: "  Test visitor  ", email: "TEST@example.invalid", type: "project", message: "A sufficiently detailed synthetic test message.",
  budget: "", timeline: "", consent: true, adultConfirmed: true, idempotencyKey: "00000000-0000-4000-8000-000000000001", website: "",
};

describe("server validation", () => {
  it("normalizes whitespace and accepts a consented bounded inquiry", () => {
    const parsed = inquirySchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toMatchObject({ name: "Test visitor", email: "TEST@example.invalid" });
  });

  it("rejects missing consent, malformed email, and unexpected fields", () => {
    expect(inquirySchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, admin: true }).success).toBe(false);
  });

  it("does not treat non-HTTPS project links as external links", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeExternalUrl("https://example.invalid/project")).toBe("https://example.invalid/project");
  });

  it("builds a reference-only notification without inquiry details", () => {
    const content = notificationContent({ id: "opaque-id", inquiryId: "lead-id", privacyRequestId: null, type: "project" });
    expect(content.subject).toContain("project");
    expect(content.text).toContain("lead-id");
    expect(content.text).not.toContain("visitor@example.invalid");
    expect(content.text).not.toContain("Synthetic test body");
  });
});
