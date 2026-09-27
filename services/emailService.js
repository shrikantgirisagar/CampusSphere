const crypto = require("crypto");
const fs = require("fs");
const { Resend } = require("resend");

// Sender configuration
// onboarding@resend.dev is Resend's official development/sandbox sender address
const DEFAULT_FROM = "CampusSphere <onboarding@resend.dev>";

// Mock sender for automated testing
let mockSender = null;

function setMockSender(fn) {
  mockSender = fn;
}

function getMockSender() {
  return mockSender;
}

/**
 * Generate a cryptographically random 6-digit numeric OTP (000000 - 999999)
 * with guaranteed leading zeroes.
 */
function generateNumericOtp() {
  const code = crypto.randomInt(0, 1000000);
  return String(code).padStart(6, "0");
}

/**
 * Compute an HMAC-SHA256 hash of an OTP using a server secret.
 * Storing this hash ensures that plaintext OTPs are never stored in the database.
 */
function hashOtp(otp, secret = process.env.SESSION_SECRET || "campussphere_otp_secret_key") {
  return crypto.createHmac("sha256", secret).update(String(otp).trim()).digest("hex");
}

/**
 * Constant-time verification of an input OTP against the stored hash.
 */
function verifyOtpHash(inputOtp, storedHash, secret = process.env.SESSION_SECRET || "campussphere_otp_secret_key") {
  if (!inputOtp || !storedHash || typeof inputOtp !== "string" || typeof storedHash !== "string") {
    return false;
  }
  const computed = crypto.createHmac("sha256", secret).update(String(inputOtp).trim()).digest("hex");
  if (computed.length !== storedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
}

/**
 * Generate a cryptographically random 32-byte (64 hex characters) single-use reset token.
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a reset token using SHA-256 for secure database storage.
 */
function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token || "").trim()).digest("hex");
}

/**
 * Build professional CampusSphere HTML and plain text email templates.
 */
function buildOtpEmailTemplate({ otp, purpose }) {
  const isSignup = purpose === "signup_verification";
  const title = isSignup ? "Verify Your Email Address" : "Password Reset Request";
  const actionText = isSignup
    ? "Welcome to CampusSphere! Use the verification code below to verify your email and complete your registration:"
    : "We received a request to reset your CampusSphere password. Use the verification code below to verify your identity and reset your password:";
  const expiryNotice = "This verification code will expire in 10 minutes.";
  const ignoreNotice = isSignup
    ? "If you did not attempt to register on CampusSphere, please disregard this email."
    : "If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A2540 0%, #1459d9 100%); padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CampusSphere</h1>
              <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 13px; font-weight: 500;">Academic &amp; Attendance Management System</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 12px 0; color: #0A2540; font-size: 20px; font-weight: 700;">${title}</h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14.5px; line-height: 1.6;">${actionText}</p>

              <!-- OTP Code Display -->
              <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">Verification Code</div>
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0A2540;">${otp}</div>
                <div style="font-size: 12.5px; color: #e11d48; font-weight: 600; margin-top: 8px;">⏱️ ${expiryNotice}</div>
              </div>

              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px; line-height: 1.5;">${ignoreNotice}</p>
              <div style="border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;"></div>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                For your security, never share this verification code with anyone. CampusSphere staff will never ask for your code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 500;">
                Bharatesh College of Computer Applications, Belagavi
              </p>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px;">
                CampusSphere Portal • Automated System Notification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${title} - CampusSphere\n\n${actionText}\n\nVerification Code: ${otp}\n\n${expiryNotice}\n\n${ignoreNotice}\n\nBharatesh College of Computer Applications, Belagavi`;

  return { html, text };
}

/**
 * Send an OTP verification email using Resend (or the mock sender if configured).
 * 
 * Never logs the OTP. Never logs the API key.
 * 
 * @param {Object} options
 * @param {string} options.email - Destination email address
 * @param {string} options.otp - 6-digit verification code
 * @param {string} options.purpose - 'signup_verification' or 'password_reset'
 * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
 */
async function sendEmailOtp({ email, otp, purpose }) {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { success: false, error: "Invalid recipient email address." };
  }
  if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    return { success: false, error: "Invalid OTP format." };
  }
  if (purpose !== "signup_verification" && purpose !== "password_reset") {
    return { success: false, error: "Invalid OTP purpose." };
  }

  const subject = purpose === "signup_verification"
    ? "CampusSphere — Email Verification Code"
    : "CampusSphere — Password Reset Code";

  const { html, text } = buildOtpEmailTemplate({ otp, purpose });

  // Use test mock if registered
  if (typeof mockSender === "function") {
    try {
      const result = await mockSender({ to: email, subject, html, text, otp, purpose });
      if (result && result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, id: result?.id || "mock-id-12345" };
    } catch (err) {
      console.error("[EmailService] Mock sender error:", err.message || "Unknown error");
      return { success: false, error: "Email delivery failed." };
    }
  }

  // Handle test environment mocking for subprocess testing
  if (process.env.NODE_ENV === "test" && process.env.TEST_EMAIL_STORE_PATH) {
    try {
      const records = fs.existsSync(process.env.TEST_EMAIL_STORE_PATH)
        ? JSON.parse(fs.readFileSync(process.env.TEST_EMAIL_STORE_PATH, "utf8"))
        : [];
      records.push({ to: email, subject, otp, purpose, timestamp: Date.now() });
      fs.writeFileSync(process.env.TEST_EMAIL_STORE_PATH, JSON.stringify(records, null, 2));
    } catch (_) {}
    return { success: true, id: `test-mock-msg-${Date.now()}` };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    console.error("[EmailService] RESEND_API_KEY is not configured.");
    return { success: false, error: "Email service is not configured." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  try {
    const resend = new Resend(apiKey.trim());
    const response = await resend.emails.send({
      from: fromEmail,
      to: [email.trim().toLowerCase()],
      subject,
      html,
      text
    });

    if (response.error) {
      console.error("[EmailService] Resend API rejected email:", response.error.message || "Provider error");
      return { success: false, error: "Failed to deliver email through provider." };
    }

    return {
      success: true,
      id: response.data ? response.data.id : "sent"
    };
  } catch (error) {
    console.error("[EmailService] Unexpected error sending email:", error.message || "Unknown error");
    return { success: false, error: "An unexpected error occurred while sending email." };
  }
}

module.exports = {
  generateNumericOtp,
  hashOtp,
  verifyOtpHash,
  generateResetToken,
  hashResetToken,
  sendEmailOtp,
  buildOtpEmailTemplate,
  setMockSender,
  getMockSender
};
