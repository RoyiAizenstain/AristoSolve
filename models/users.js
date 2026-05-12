let users = [
  { userId: 1, firstName: 'Alice', lastName: 'Admin', email: 'alice@example.com', password: 'admin123', userRole: 'admin', level: 'advanced', createDate: '2024-01-01T00:00:00Z', updateDate: '2024-01-01T00:00:00Z' },
  { userId: 2, firstName: 'Bob', lastName: 'Builder', email: 'bob@example.com', password: 'company123', userRole: 'company', level: 'intermediate', createDate: '2024-01-02T00:00:00Z', updateDate: '2024-01-02T00:00:00Z' },
  { userId: 3, firstName: 'Carol', lastName: 'Chen', email: 'carol@example.com', password: 'candidate123', userRole: 'candidate', level: 'beginner', createDate: '2024-01-03T00:00:00Z', updateDate: '2024-01-03T00:00:00Z' },
  { userId: 4, firstName: 'Dave', lastName: 'Dev', email: 'dave@example.com', password: 'candidate123', userRole: 'candidate', level: 'intermediate', createDate: '2024-01-04T00:00:00Z', updateDate: '2024-01-04T00:00:00Z' },
  { userId: 5, firstName: 'Eva', lastName: 'Evans', email: 'eva@example.com', password: 'candidate123', userRole: 'candidate', level: 'advanced', createDate: '2024-01-05T00:00:00Z', updateDate: '2024-01-05T00:00:00Z' },
];
let nextId = 6;

const findAll = () => users;

const findById = (id) => users.find(u => u.userId === id);

const create = (data) => {
  const now = new Date().toISOString();
  const user = { userId: nextId++, ...data, createDate: now, updateDate: now };
  users.push(user);
  return user;
};

const update = (id, data) => {
  const idx = users.findIndex(u => u.userId === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data, updateDate: new Date().toISOString() };
  return users[idx];
};

const remove = (id) => {
  const idx = users.findIndex(u => u.userId === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
