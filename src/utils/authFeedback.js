import { toast } from "react-toastify";

export const REMEMBERED_LOGIN_EMAIL_KEY = "rememberedLoginEmail";

export function notifyAuthError(message) {
  toast.error(message);
}

export function notifyAuthWarning(message) {
  toast.warning(message);
}

export function notifyAuthInfo(message) {
  toast.info(message);
}

export function notifyAuthSuccess(message) {
  toast.success(message);
}

export function getLoginErrorMessage(err) {
  const status = err.response?.status;
  const apiMessage = err.response?.data?.message;
  const fallbackMessage = typeof err?.message === "string" ? err.message : "";

  if (
    status === 401 ||
    (typeof apiMessage === "string" &&
      /invalid username or password|invalid credentials|bad credentials/i.test(apiMessage)) ||
    /invalid username or password|invalid credentials|bad credentials/i.test(fallbackMessage)
  ) {
    return "Invalid credentials";
  }

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage.trim();
  }

  if (fallbackMessage.trim() && fallbackMessage !== "Network Error") {
    return fallbackMessage.trim();
  }

  return "Login failed. Please try again.";
}

export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const message = err.response?.data?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  return fallback;
}
