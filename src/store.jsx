import { create } from "zustand";
import { persist } from "zustand/middleware";

// Create a Zustand store with persistence
export const useAuthStore = create(
  persist(
    (set, get) => {
      return {
        user: null,
        token: null,
        refreshToken: null,
        logIn: ({user, token, refreshToken}) => {
          set({ user, token, refreshToken });
        },
        logOut: async () => {
          set({ user: null, token: null, refreshToken: null });
        },
      };
    },
    {
      name: "abcn_student_portal",
    }
  )
);

export const useSnackStore = create((set, get) => ({
  message: null,
  variant: null,
  isLoading: false,
  setLoading: (bool) => set({ isLoading: bool }),
  setAlert: async ({ variant, message }) => {
    set({ variant, message });
  },
}));

// Global error modal store — single source of truth for the error modal
export const useErrorModalStore = create((set, get) => ({
  open: false,
  title: null,
  message: null,
  details: null,
  actions: null,
  onClose: null,
  showError: ({ title = "Something went wrong", message, details = null, actions = null, onClose = null }) => {
    const defaultActions = [
      {
        label: "Dismiss",
        onClick: () => get().hideError(),
        variant: "soft",
        color: "neutral",
      },
    ];
    set({
      open: true,
      title,
      message: message || "An unexpected error occurred.",
      details,
      actions: actions ?? defaultActions,
      onClose,
    });
  },
  hideError: () => {
    const { onClose } = get();
    if (typeof onClose === "function") onClose();
    set({
      open: false,
      title: null,
      message: null,
      details: null,
      actions: null,
      onClose: null,
    });
  },
}));

/** Programmatic helper: show the global error modal from anywhere */
export function showErrorModal(options) {
  useErrorModalStore.getState().showError(options);
}
