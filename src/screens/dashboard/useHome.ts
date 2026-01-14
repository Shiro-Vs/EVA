import { auth } from "../../config/firebaseConfig";

export const useHome = () => {
  // Placeholder logic for now
  const user = auth.currentUser;

  return {
    user,
  };
};
