import { createContext, useReducer, useEffect } from "react";

export const ProvincialAdminFormContext = createContext();

const STORAGE_KEY = "provincial_admin_form_draft";

const initialState = {
  formData: {},
  currentStep: 1,
  isNicVerified: false,
  isPersonalValid: false,
  isContactValid: false,
  isCurrentApptValid: false,
  error: null,
  isRestored: false,
  draftEnabled: true,
};

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FORM_DATA":
      return {
        ...state,
        formData:
          typeof action.payload === "function"
            ? action.payload(state.formData)
            : { ...state.formData, ...action.payload },
      };
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_NIC_VERIFIED":
      if (state.isNicVerified === action.payload) return state;
      return { ...state, isNicVerified: action.payload };
    case "SET_PERSONAL_VALID":
      if (state.isPersonalValid === action.payload) return state;
      return { ...state, isPersonalValid: action.payload };
    case "SET_CONTACT_VALID":
      if (state.isContactValid === action.payload) return state;
      return { ...state, isContactValid: action.payload };
    case "SET_CURRENT_APPT_VALID":
      if (state.isCurrentApptValid === action.payload) return state;
      return { ...state, isCurrentApptValid: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_DRAFT_ENABLED":
      return { ...state, draftEnabled: action.payload };
    case "COMPLETE_REGISTRATION":
      localStorage.removeItem(STORAGE_KEY);
      return { ...state, draftEnabled: false, error: null };
    case "CLEAR":
      localStorage.removeItem(STORAGE_KEY);
      return { ...initialState, isRestored: true, draftEnabled: true };
    case "RESTORE":
      return { ...initialState, ...action.payload, isRestored: true };
    default:
      return state;
  }
}

export function ProvincialAdminFormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // RESTORE form from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: "RESTORE", payload: parsed });
      } catch (error) {
        console.error("Failed to restore Provincial Admin form state:", error);
        dispatch({ type: "RESTORE", payload: initialState });
      }
    } else {
      dispatch({ type: "RESTORE", payload: initialState });
    }
  }, []);

  // SAVE form to localStorage whenever state changes
  useEffect(() => {
    if (state.isRestored && state.draftEnabled) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  return (
    <ProvincialAdminFormContext.Provider value={{ state, dispatch }}>
      {children}
    </ProvincialAdminFormContext.Provider>
  );
}
