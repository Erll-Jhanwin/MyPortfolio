import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact", description: "Start a conversation with Erll about a project or developer role." };

export default function ContactPage() {
  return <>
    <section className="page-hero"><div className="container page-heading"><p className="eyebrow">Contact</p><h1>Tell me what you’re working through.</h1><p>A few details are enough to start. Share your goal, context, and any constraints you already know.</p></div></section>
    <section className="page-body"><div className="container contact-layout">
      <aside className="contact-aside"><p className="eyebrow">A useful first message</p><h2>Start with the situation.</h2><p>What are you trying to make easier? Who will use it? What would you like to happen next? Please leave out sensitive information, passwords, and private records.</p><p>Project and job inquiries are welcome. Response timing and current availability have not been confirmed, so no response-time promise is made.</p><p>For a privacy request, use the dedicated <a className="inline-link" href="/privacy-request">privacy request form</a>.</p><p>By submitting, you confirm you are at least 18. If you are younger, ask a parent or guardian to contact me.</p></aside>
      <div><ContactForm /></div>
    </div></section>
  </>;
}
