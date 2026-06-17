const users = require('./users');

// Per-user settings, keyed by userId. Seeded for the mock users.
let settings = [
  { userId: 1, displayName: 'Alice Admin', email: 'alice@example.com', theme: 'dark', emailNotifications: true },
  { userId: 2, displayName: 'Bob Builder', email: 'bob@example.com', theme: 'dark', emailNotifications: true },
  { userId: 3, displayName: 'Carol Chen', email: 'carol@example.com', theme: 'dark', emailNotifications: false },
  { userId: 4, displayName: 'Dave Dev', email: 'dave@example.com', theme: 'light', emailNotifications: true },
  { userId: 5, displayName: 'Eva Evans', email: 'eva@example.com', theme: 'dark', emailNotifications: false },
];

// Returns the user's settings, lazily creating a default record from the
// user profile if none exists yet (e.g. a freshly registered user).
const findByUserId = (userId) => {
  let record = settings.find(s => s.userId === userId);
  if (!record) {
    const user = users.findById(userId);
    if (!user) return null;
    record = {
      userId,
      displayName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      theme: 'dark',
      emailNotifications: true,
    };
    settings.push(record);
  }
  return record;
};

// Updates (and creates if needed) the user's settings. Only known fields are applied.
const upsert = (userId, data) => {
  const record = findByUserId(userId);
  if (!record) return null;
  const { displayName, email, theme, emailNotifications } = data;
  if (displayName !== undefined) record.displayName = displayName;
  if (email !== undefined) record.email = email;
  if (theme !== undefined) record.theme = theme;
  if (emailNotifications !== undefined) record.emailNotifications = emailNotifications;
  return record;
};

module.exports = { findByUserId, upsert };
