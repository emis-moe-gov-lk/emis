export const getEnv = (key) => {
  return (window.env && window.env[key]) || import.meta.env[key];
};
