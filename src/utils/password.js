export function getPasswordStrengthScore(password) {
  const value = String(password || "");
  let score = 0;

  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;

  return score;
}

export function isAcceptablePassword(password) {
  const value = String(password || "");
  return value.length >= 8 && getPasswordStrengthScore(value) >= 2;
}
