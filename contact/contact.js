const CONTACT_FORM_CONFIG = {
  /*
    Default local backend route.
    Example:
    endpoint: "/api/contact-quote"

    Do not put your Resend API key in this file.
  */
  endpoint: "/api/contact-quote"
};

document.addEventListener("DOMContentLoaded", () => {
  const forms = Array.from(document.querySelectorAll(".quote-form"));
  if (forms.length === 0) return;

  const blockedUrlPattern =
    /(?:https?:\/\/|www\.|(?:^|\s)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|net|org|io|co|us|biz|info|gov|edu|me|ai|ly)\b)/i;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const minReadTimeMs = 5000;
  const cooldownMs = 120000;

  function sanitizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function valueHasUrl(value) {
    return blockedUrlPattern.test(value);
  }

  forms.forEach((form, index) => {
    const status = form.querySelector(".form-status");
    const submittedAtField = form.querySelector('input[name="submitted_at"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const formSource = form.dataset.formSource || `quote-form-${index + 1}`;
    const storageKey = `norris-quote-last-submit-${formSource}`;

    if (!status || !submittedAtField) return;

    submittedAtField.value = String(Date.now());

    function setStatus(message, type = "") {
      status.textContent = message;
      status.classList.remove("is-error", "is-success");
      if (type) {
        status.classList.add(type === "error" ? "is-error" : "is-success");
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("");

      const formData = new FormData(form);
      const name = sanitizeText(formData.get("name"));
      const company = sanitizeText(formData.get("company"));
      const email = sanitizeText(formData.get("email"));
      const phone = sanitizeText(formData.get("phone"));
      const specification = sanitizeText(formData.get("specification"));
      const details = sanitizeText(formData.get("details"));
      const website = sanitizeText(formData.get("website"));
      const startedAt = Number(formData.get("submitted_at") || "0");
      const processes = formData.getAll("processes").map(sanitizeText).filter (Boolean);
      const endpoint = CONTACT_FORM_CONFIG.endpoint || form.dataset.resendEndpoint || "";

      if (website) {
        setStatus("Submission blocked.", "error");
        return;
      }

      if (!name || !company || !email || !details) {
        setStatus("Please complete the required fields.", "error");
        return;
      }

      if (!emailPattern.test(email)) {
        setStatus("Enter a valid email address.", "error");
        return;
      }

      if (processes.length === 0) {
        setStatus("Select at least one process.", "error");
        return;
      }

      if (Date.now() - startedAt < minReadTimeMs) {
        setStatus("Please take a moment to review the form before sending.", "error");
        return;
      }

      const lastSubmit = Number(localStorage.getItem(storageKey) || "0");
      if (Date.now() - lastSubmit < cooldownMs) {
        setStatus("Please wait a couple of minutes before sending another inquiry.", "error");
        return;
      }

      const textFieldsToCheck = [name, company, phone, specification, details];
      if (textFieldsToCheck.some(valueHasUrl)) {
        setStatus("Links and website addresses are not allowed in this form.", "error");
        return;
      }

      if (!endpoint) {
        setStatus("Form route is missing.", "error");
        return;
      }

      const payload = {
        name,
        company,
        email,
        phone,
        specification,
        details,
        processes,
        source: formSource
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let errorMessage = "Inquiry could not be sent. Please try again or contact Norris Precision directly.";

          try {
            const responseBody = await response.json();
            if (responseBody && responseBody.error) {
              errorMessage = responseBody.error;
            }
          } catch {
            // Keep the default message when the server does not return JSON.
          }

          throw new Error(errorMessage);
        }

        localStorage.setItem(storageKey, String(Date.now()));
        form.reset();
        submittedAtField.value = String(Date.now());
        setStatus("Inquiry sent. Norris Precision will review your request.", "success");
      } catch (error) {
        const message = error instanceof TypeError
          ? "Inquiry could not be sent. Make sure the local Norris server is running."
          : error.message || "Inquiry could not be sent. Please try again.";
        setStatus(message, "error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Inquiry";
        }
      }
    });
  });
});
