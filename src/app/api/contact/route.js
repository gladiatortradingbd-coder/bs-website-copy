import { Resend } from "resend";

const EMAIL_TO = process.env.EMAIL_TO;
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@yourdomain.com";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export async function POST(req) {
  try {
    const resend = getResendClient();

    if (!resend || !EMAIL_TO) {
      return new Response(JSON.stringify({ error: "Contact email is not configured" }), { status: 500 });
    }

    const body = await req.json();
    const { name, email, phone, subject, message } = body || {};

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const safeMessage = String(message).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; color: #111;">
        <h2 style="margin-bottom:8px">New contact submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || '—'}</p>
        <p><strong>Subject:</strong> ${subject || '—'}</p>
        <hr style="margin:12px 0" />
        <div style="white-space:pre-wrap">${safeMessage}</div>
      </div>
    `;

    const text = [
      "New contact submission",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "—"}`,
      `Subject: ${subject || "—"}`,
      "Message:",
      String(message),
    ].join("\n");

    await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      replyTo: email,
      subject: `Contact form: ${subject || 'New message from website'}`,
      html,
      text,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Contact send error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 500 });
  }
}
