// ================================
// emailAttachmentUtil.js
// Remembers the draft campaign that attachments were uploaded to
// ================================

const DRAFT_CAMPAIGN_KEY = "draftCampaignId";

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
