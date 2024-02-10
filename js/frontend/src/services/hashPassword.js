import bcrypt from 'bcryptjs';
const salt = '$2a$10$EJ46JvKZfl4omzio9k5Z9.';
export const hashPassword = async (password) => {
  return await bcrypt.hashSync(password, salt);
};