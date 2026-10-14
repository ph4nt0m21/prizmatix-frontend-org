// ================================
// emailAttachmentUtil.js
// Handles pre-uploaded email attachment caching and draft campaign tracking
// ================================

const ATTACHMENT_KEY = "tempEmailAttachments";
const DRAFT_CAMPAIGN_KEY = "draftCampaignId";

/**
 * Get cached attachments from localStorage
 */
export const getCachedAttachments = () => {
  try {
    const data = localStorage.getItem(ATTACHMENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading cached attachments:", err);
    return [];
  }
};

/**
 * Add new cached attachment URL with timestamp
 */
export const addCachedAttachment = (url) => {
  try {
    const existing = getCachedAttachments();
    existing.push({ url, timestamp: Date.now() });
    localStorage.setItem(ATTACHMENT_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Error adding cached attachment:", err);
  }
};

/**
 * Remove one cached attachment
 */
export const removeCachedAttachment = (url) => {
  try {
    const list = getCachedAttachments();
    const filtered = list.filter((a) => a.url !== url);
    localStorage.setItem(ATTACHMENT_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Error removing cached attachment:", err);
  }
};

/**
 * Clear all cached attachments
 */
export const clearCachedAttachments = () => {
  try {
    localStorage.removeItem(ATTACHMENT_KEY);
  } catch (err) {
    console.error("Error clearing cached attachments:", err);
  }
};

/**
 * Clean up attachments older than expiry time
 */
export const cleanupOldCachedAttachments = (expiryMinutes = 30) => {
  try {
    const list = getCachedAttachments();
    if (!list.length) return [];
    const now = Date.now();
    const filtered = list.filter(
      (item) => now - item.timestamp < expiryMinutes * 60 * 1000
    );
    if (filtered.length !== list.length) {
      localStorage.setItem(ATTACHMENT_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (err) {
    console.error("Error cleaning cached attachments:", err);
    return [];
  }
};

/**
 * Draft Campaign ID helpers
 */
export const setDraftCampaignId = (id) => {
  try {
    localStorage.setItem(DRAFT_CAMPAIGN_KEY, id);
  } catch (err) {
    console.error("Error saving draft campaign id:", err);
  }
};

export const getDraftCampaignId = () => {
  try {
    return localStorage.getItem(DRAFT_CAMPAIGN_KEY);
  } catch {
    return null;
  }
};

export const clearDraftCampaignId = () => {
  try {
    localStorage.removeItem(DRAFT_CAMPAIGN_KEY);
  } catch (err) {
    console.error("Error clearing draft campaign id:", err);
  }
};
