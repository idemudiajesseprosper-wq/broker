const SMARTSUPP_API_BASE = "https://api.smartsupp.com/v2";

function getSmartsuppToken() {
  return process.env.SMARTSUPP_ACCESS_TOKEN;
}

export async function smartsuppRequest(path, options = {}) {
  const token = getSmartsuppToken();

  if (!token) {
    return {
      skipped: true,
      reason: "SMARTSUPP_ACCESS_TOKEN is not configured",
    };
  }

  const response = await fetch(`${SMARTSUPP_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 404) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const details = Array.isArray(data.errors)
      ? ` (${data.errors
          .map((error) =>
            [error.path, error.message].filter(Boolean).join(": "),
          )
          .join("; ")})`
      : "";

    throw new Error(
      `Smartsupp API request failed (${response.status}): ${
        data.message || text || response.statusText
      }${details}`,
    );
  }

  return data;
}

function getContactId(payload) {
  return payload?.contact?.id || payload?.id || payload?.contact_id;
}

async function findSmartsuppContact(email) {
  if (!email) return null;
  const params = new URLSearchParams({ email });
  return smartsuppRequest(`/contacts/find?${params.toString()}`);
}

async function createSmartsuppContact(user) {
  return smartsuppRequest("/contacts", {
    body: JSON.stringify({
      email: user.email,
      identity_id: String(user._id),
      name: user.fullName,
      phone: user.phone,
    }),
    method: "POST",
  });
}

async function getOrCreateSmartsuppContact(user) {
  const existing = await findSmartsuppContact(user.email);

  if (existing?.skipped) return existing;
  if (getContactId(existing)) return existing;

  return createSmartsuppContact(user);
}

export async function notifySmartsuppSignup(user) {
  const contact = await getOrCreateSmartsuppContact(user);

  if (contact?.skipped) return contact;

  const contactId = getContactId(contact);

  if (!contactId) {
    throw new Error("Smartsupp contact id was not returned");
  }

  return smartsuppRequest("/conversations", {
    body: JSON.stringify({
      contact_id: contactId,
      ext_id: `signup-${user._id}`,
      text: `New account created: ${user.fullName} (${user.email}) from ${user.country}. Phone: ${user.phone}.`,
      variables: {
        Country: user.country,
        Email: user.email,
        Event: "Account registration",
        Full_name: user.fullName,
        Phone: user.phone,
        User_ID: String(user._id),
      },
    }),
    method: "POST",
  });
}
