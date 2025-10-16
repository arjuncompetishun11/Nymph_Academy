/**
 * Email service utility to send emails using the email API
 */

/**
 * Send an email using a template
 * @param {string} to - Recipient email address
 * @param {Object} data - Data to replace template variables
 * @param {string} templateName - Name of the email template to use
 * @returns {Promise<Object>} - Response from the email service
 */
export const sendTemplateEmail = async (to, data, templateName = "nymph-academy-roll-number") => {
  try {
    const emailServiceBaseUrl = import.meta.env.VITE_EMAIL_BASE_URL;
    const emailServiceApiKey = import.meta.env.VITE_EMAIL_SERVICE_KEY;

    if (!emailServiceBaseUrl || !emailServiceApiKey) {
      console.error("Email service configuration is missing");
      throw new Error("Email service configuration is missing");
    }

    const endpoint = `${emailServiceBaseUrl}/api/services/email/send`;
    
    const payload = {
      templateName,
      to,
      data
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': emailServiceApiKey
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to send email");
    }

    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};