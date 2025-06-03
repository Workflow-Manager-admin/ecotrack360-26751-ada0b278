export const mockDB = {
  users: [], // { id, email, passwordHash, profile, goals, rewards, integrations, carbonData }
};

export let nextUserId = 1;
export function incrementUserId() {
  return nextUserId++;
}
