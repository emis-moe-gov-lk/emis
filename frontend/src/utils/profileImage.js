import profileMaleImage from "@/assets/images/profile_m.png";
import profileFemaleImage from "@/assets/images/profile_f.png";

export const isDefaultProfilePicture = (value) =>
  typeof value === "string" && value.trim().toLowerCase() === "default.png";

const isMaleGender = (gender) => {
  if (gender == null) return false;

  const normalizedGender = String(gender).trim().toLowerCase();
  return normalizedGender === "g01" || normalizedGender === "male" || normalizedGender === "m";
};

export const resolveGenderProfileImage = (gender) =>
  isMaleGender(gender) ? profileMaleImage : profileFemaleImage;

export const resolveProfileImage = (value, gender) => {
  if (!value || isDefaultProfilePicture(value)) {
    return resolveGenderProfileImage(gender);
  }

  return value;
};

export default resolveGenderProfileImage;