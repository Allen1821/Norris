const BLOCKED_URL_PATTERN =
  /(?:https?:\/\/|www\.|(?:^|\s)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|net|org|io|co|us|biz|info|gov|edu|me|ai|ly)\b)/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, null);
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
  const RESEND_FROM = process.env.RESEND_FROM || "";
  const CONTACT_FORM_TO = process.env.CONTACT_FORM_TO || "info@norrisprecision.com";
  const CONTACT_FORM_SUBJECT = process.env.CONTACT_FORM_SUBJECT || "Norris Precision Quote Request";

  if (!RESEND_API_KEY || !RESEND_FROM || !CONTACT_FORM_TO) {
    sendJson(res, 500, { error: "Missing email configuration" });
    return;
  }

  let payload;

  try {
    payload = await readPayload(req);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON" });
    return;
  }

  const sanitized = {
    name: sanitizeText(payload.name),
    company: sanitizeText(payload.company),
    email: sanitizeText(payload.email),
    phone: sanitizeText(payload.phone),
    specification: sanitizeText(payload.specification),
    details: sanitizeText(payload.details),
    source: sanitizeText(payload.source),
    processes: Array.isArray(payload.processes)
      ? payload.processes.map((item) => sanitizeText(item)).filter(Boolean)
      : []
  };

  if (!sanitized.name || !sanitized.company || !sanitized.email || !sanitized.details) {
    sendJson(res, 400, { error: "Missing required fields" });
    return;
  }

  if (!EMAIL_PATTERN.test(sanitized.email)) {
    sendJson(res, 400, { error: "Invalid email" });
    return;
  }

  if (sanitized.processes.length === 0) {
    sendJson(res, 400, { error: "Select at least one process" });
    return;
  }

  const textFields = [
    sanitized.name,
    sanitized.company,
    sanitized.phone,
    sanitized.specification,
    sanitized.details
  ];

  if (textFields.some((value) => BLOCKED_URL_PATTERN.test(value))) {
    sendJson(res, 400, { error: "Links are not allowed" });
    return;
  }

  const processList = sanitized.processes.join(", ");
  const textBody = [
    `Source: ${sanitized.source || "website"}`,
    `Name: ${sanitized.name}`,
    `Company: ${sanitized.company}`,
    `Email: ${sanitized.email}`,
    `Phone: ${sanitized.phone || "Not provided"}`,
    `Processes: ${processList}`,
    `Specification: ${sanitized.specification || "Not provided"}`,
    "",
    "Project Details:",
    sanitized.details
  ].join("\n");

  const htmlBody = buildEmailHtml(sanitized, processList);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [CONTACT_FORM_TO],
      reply_to: sanitized.email,
      subject: CONTACT_FORM_SUBJECT,
      text: textBody,
      html: htmlBody
    })
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    console.error("Resend error:", errorText);
    sendJson(res, 502, { error: "Email delivery failed" });
    return;
  }

  sendJson(res, 200, { ok: true });
};

function buildEmailHtml(sanitized, processList) {
  const escapedSource = escapeHtml(sanitized.source || "website");
  const escapedName = escapeHtml(sanitized.name);
  const escapedCompany = escapeHtml(sanitized.company);
  const escapedEmail = escapeHtml(sanitized.email);
  const escapedPhone = escapeHtml(sanitized.phone || "Not provided");
  const escapedProcesses = escapeHtml(processList);
  const escapedSpecification = escapeHtml(sanitized.specification || "Not provided");
  const escapedDetails = escapeHtml(sanitized.details).replace(/\n/g, "<br>");

  return `
    <!doctype html>
    <html>
      <body style="margin:0; padding:0; background:#f4f7fb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%; background:#f4f7fb; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%; max-width:640px; border-collapse:collapse; font-family:Arial, Helvetica, sans-serif; color:#10243d; background:#ffffff; border:1px solid #dbe7f0;">
                <tr>
                  <td style="background:#0a192f; padding:28px 32px; border-bottom:4px solid #3282b8;">
                    <p style="margin:0 0 10px; font-size:12px; line-height:1.4; letter-spacing:2px; text-transform:uppercase; color:#8fc7eb; font-weight:700;">Norris Precision Mfg.</p>
                    <h1 style="margin:0; font-size:28px; line-height:1.15; color:#ffffff; font-weight:700;">New Quote Request</h1>
                    <p style="margin:12px 0 0; font-size:15px; line-height:1.6; color:#d8e6ef;"></p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:26px 32px 10px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%; border-collapse:collapse;">
                      <tr>
                        <td width="50%" style="padding:0 12px 16px 0; vertical-align:top;">
                          <p style="margin:0 0 6px; font-size:11px; line-height:1.4; letter-spacing:1.4px; text-transform:uppercase; color:#64798c; font-weight:700;">Name</p>
                          <p style="margin:0; font-size:17px; line-height:1.5; color:#0a192f; font-weight:700;">${escapedName}</p>
                        </td>
                        <td width="50%" style="padding:0 0 16px 12px; vertical-align:top;">
                          <p style="margin:0 0 6px; font-size:11px; line-height:1.4; letter-spacing:1.4px; text-transform:uppercase; color:#64798c; font-weight:700;">Company</p>
                          <p style="margin:0; font-size:17px; line-height:1.5; color:#0a192f; font-weight:700;">${escapedCompany}</p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:0 12px 16px 0; vertical-align:top;">
                          <p style="margin:0 0 6px; font-size:11px; line-height:1.4; letter-spacing:1.4px; text-transform:uppercase; color:#64798c; font-weight:700;">Email</p>
                          <p style="margin:0; font-size:15px; line-height:1.5; color:#0f4c75;"><a href="mailto:${escapedEmail}" style="color:#0f4c75; text-decoration:none;">${escapedEmail}</a></p>
                        </td>
                        <td width="50%" style="padding:0 0 16px 12px; vertical-align:top;">
                          <p style="margin:0 0 6px; font-size:11px; line-height:1.4; letter-spacing:1.4px; text-transform:uppercase; color:#64798c; font-weight:700;">Phone</p>
                          <p style="margin:0; font-size:15px; line-height:1.5; color:#10243d;">${escapedPhone}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%; border-collapse:collapse; background:#f8fbfe; border:1px solid #dbe7f0;">
                      <tr>
                        <td style="padding:18px 20px; border-bottom:1px solid #dbe7f0;">
                          <p style="margin:0 0 6px; font-size:11px; line-height:1.4; letter-spacing:1.4px; text-transform:uppercase; color:#64798c; font-weight:700;">Processes Needed</p>
                          <p style="margin:0; font-size:16px; line-height:1.55; color:#0a192f; font-weight:700;">${escapedProcesses}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 6px; font-size:11px; line-height:1.4; letter-spacing:1.4px; text-transform:uppercase; color:#64798c; font-weight:700;">Relevant Specification</p>
                          <p style="margin:0; font-size:15px; line-height:1.6; color:#10243d;">${escapedSpecification}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 32px 28px;">
                    <p style="margin:0 0 10px; font-size:11px; line-height:1.4; letter-spacing:1.4px; text-transform:uppercase; color:#64798c; font-weight:700;">Project Details</p>
                    <div style="font-size:16px; line-height:1.7; color:#10243d; border-left:4px solid #3282b8; padding:2px 0 2px 16px;">${escapedDetails}</div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 32px; background:#eef5fa; border-top:1px solid #dbe7f0;">
                    <p style="margin:0; font-size:12px; line-height:1.6; color:#64798c;">Source: <strong style="color:#10243d;">${escapedSource}</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function readPayload(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  const rawBody = await readRequestBody(req);
  return JSON.parse(rawBody);
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (statusCode === 204) {
    res.end();
    return;
  }

  res.end(JSON.stringify(payload));
}

function sanitizeText(value) {
  return String(value || "").replace(/\r/g, "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Request too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
