import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { toast } from "react-toastify";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

import suggestion from "./suggestion";
import Toolbar from "./toolbar";

import {
  GetAllOrganizationEventsAPI,
  GetEventAPI,
  CreateEmailCampaignAPI,
  SendEmailCampaignAPI,
  GetEmailCampaignByIdAPI,
  UpdateEmailCampaignAPI,
  SendTestEmailCampaignAPI,
  UploadEmailCampaignAttachmentsAPI,
} from "../../services/allApis";

import { getUserData } from "../../utils/authUtil";
import {
  getCachedAttachments,
  addCachedAttachment,
  removeCachedAttachment,
  clearCachedAttachments,
  cleanupOldCachedAttachments,
  setDraftCampaignId,
  getDraftCampaignId,
  clearDraftCampaignId,
} from "../../utils/emailAttachmentUtil";

import styles from "./emailCampaignsPage.module.scss";
import "react-datepicker/dist/react-datepicker.css";

const DECORATORS = [
  "@AddToCalendar",
  "@EventName",
  "@OrganiserName",
  "@FirstName",
  "@LastName",
  "@OrderNumber",
];

const EmailCampaignsPage = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const isPreviewOnly = searchParams.get("preview") === "true";

  const fileInputRef = useRef(null);

  // ---------------- STATE ----------------
  const [campaignName, setCampaignName] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendOption, setSendOption] = useState("now");
  const [scheduledAt, setScheduledAt] = useState(new Date());

  const [attachments, setAttachments] = useState([]); // cached URLs
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmails, setTestEmails] = useState([]);
  const [newTestEmail, setNewTestEmail] = useState("");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [subjectCursorPosition, setSubjectCursorPosition] = useState(0);

  const MAX_FILE_SIZE_MB = 5;

  // ---------------- TIPTAP ----------------
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your message here..." }),
      Mention.configure({
  HTMLAttributes: { class: styles.mention },
  renderLabel: ({ node }) => `@${node.attrs.id}`, // ✅ add '@' at render time
  suggestion,
}),
    ],
    content: message,
    onUpdate: ({ editor }) => setMessage(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && message !== editor.getHTML()) {
      try {
        editor.commands.setContent(message || "");
      } catch {}
    }
  }, [editor, message]);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userData = getUserData();
        const orgId = userData?.organizationId;
        if (!orgId) return toast.error("Organization ID not found");
        const res = await GetAllOrganizationEventsAPI(orgId);
        setEvents(res.data || []);
      } catch {
        toast.error("Failed to load events");
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const res = await GetEmailCampaignByIdAPI(campaignId);
        const data = res.data;
        setCampaignName(data.campaignName || "");
        setSubject(data.subject || "");
        setMessage(data.message || "");
        if (data.message) editor?.commands?.setContent(data.message);
        setSelectedEvents(data.eventIds?.map(String) || []);
        setSendOption(data.sendType?.toLowerCase() || "now");
        setScheduledAt(
          data.scheduledAt ? new Date(data.scheduledAt) : new Date()
        );
        setAttachments(data.attachments || []);
      } catch {
        toast.error("Failed to load campaign");
      } finally {
        setLoading(false);
        if (isPreviewOnly) setIsPreviewOpen(true);
      }
    };
    fetchCampaign();
  }, [campaignId, editor, isPreviewOnly]);

  // Restore valid cached attachments on mount
  useEffect(() => {
  if (campaignId) {
    // editing existing campaign — keep its attachments
    return;
  }

  // New campaign: clear cached attachments from previous drafts
  clearCachedAttachments();
  clearDraftCampaignId();

  setAttachments([]); // ensure UI shows empty
}, [campaignId]);


  // ---------------- PAYLOAD BUILDER ----------------
  const createCampaignPayload = (isSent = false) => {
    const userData = getUserData();

    // Fetch cached attachment URLs directly from localStorage
    const cached = getCachedAttachments();
    const urls = cached.map((a) => a.url);

    const sanitizeMentions = (html) => {
  // 1️⃣ Remove data attributes from mention spans
  let clean = html.replace(/\sdata-[^=]+="[^"]*"/g, "");
  // 2️⃣ Convert non-breaking spaces to normal spaces
  clean = clean.replace(/&nbsp;/g, " ");
  // 3️⃣ Trim overall whitespace
  return clean.trim();
};

    const cleanMessage = sanitizeMentions(
  (message || "")
    .replace(/\uFFFD/g, "")
    .replace(/\u00A0/g, " ")
);

    return {
      campaignName,
      subject,
      message: cleanMessage,
      includeEventBanner: false, // Simplified for this example
      includeEventLocationAndDate: false, // Simplified for this example
      sendType: sendOption.toUpperCase(),
      scheduledAt: sendOption === "at" ? scheduledAt.toISOString() : null,
      eventIds: selectedEvents.map(Number),
      sent: isSent,
      replyTo: "noreply@prizmatix.nz",
      recipientType: "EVENT_BUYERS",
      organizationId: userData?.organizationId,
      attachments: urls && urls.length > 0 ? urls : [],
    };
  };

  // ---------------- HANDLERS ----------------
  const handleBack = () => navigate(-1);
  

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      toast.warning(`file size should not exceed ${MAX_FILE_SIZE_MB} MB and were not uploaded.`);
      if (fileInputRef.current) fileInputRef.current.value = null; 
      return;
    }

    setUploading(true);

    try {
      let effectiveCampaignId = campaignId || getDraftCampaignId();

      if (!effectiveCampaignId) {
        const draftPayload = {
          campaignName: campaignName || "Draft Campaign",
          subject: subject || "",
          message: "",
          replyTo: "noreply@prizmatix.nz",
          recipientType: "EVENT_BUYERS",
          sent: false,
          eventIds: [],
          organizationId: getUserData()?.organizationId,
        };
        const res = await CreateEmailCampaignAPI(draftPayload);
        effectiveCampaignId = res.data?.id;
        if (!effectiveCampaignId)
          throw new Error("Failed to create draft campaign for uploads.");
        setDraftCampaignId(effectiveCampaignId);
      }

      for (let f of files) {
        const formData = new FormData();
        formData.append("file", f);
        const res = await UploadEmailCampaignAttachmentsAPI(
          effectiveCampaignId,
          formData
        );

        let url = null;
        if (Array.isArray(res.data)) {
          url = res.data[0];
        } else if (typeof res.data === "object" && res.data?.url) {
          url = res.data.url;
        } else if (typeof res.data === "string" && res.data.startsWith("http")) {
          url = res.data;
        }

        if (url) {
          addCachedAttachment(url);
          setAttachments((prev) => [...prev, url]);
        }
      }

      toast.success("File(s) uploaded successfully!");
    } catch (err) {
      console.error("Attachment upload failed:", err);
      toast.error("Attachment upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleRemoveAttachment = (url) => {
    setAttachments((prev) => prev.filter((a) => a !== url));
    removeCachedAttachment(url);
  };

  const handleSend = async () => {
    if (!selectedEvents.length) return toast.error("Select at least one event");
    setIsCreating(true);
    setLoading(true);

    try {
      let effectiveCampaignId = campaignId || getDraftCampaignId();

      if (!effectiveCampaignId) {
        const res = await CreateEmailCampaignAPI(createCampaignPayload(false));
        effectiveCampaignId = res.data.id;
        if (!effectiveCampaignId)
          throw new Error("Campaign created but no ID was returned.");
      } else {
        await UpdateEmailCampaignAPI(
          effectiveCampaignId,
          createCampaignPayload(false)
        );
      }

      await SendEmailCampaignAPI(effectiveCampaignId);
      toast.success("Campaign sent successfully!");
      clearCachedAttachments();
      clearDraftCampaignId();
      navigate("/campaigns");
    } catch (err) {
      console.error(err);
      toast.error("Error sending campaign");
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  };

  const handleSendTestEmails = async () => {
  if (!testEmails || testEmails.length === 0) {
    return toast.error("Please add at least one test email address.");
  }

  try {
    let effectiveCampaignId = campaignId || getDraftCampaignId();
    if (effectiveCampaignId) effectiveCampaignId = Number(effectiveCampaignId);

    // Step 1️⃣ - Create or use existing campaign
    if (!effectiveCampaignId) {
      const res = await CreateEmailCampaignAPI(createCampaignPayload(false));
      effectiveCampaignId = res.data.id;
      if (!effectiveCampaignId)
        throw new Error("Campaign created but no ID returned.");
      setDraftCampaignId(String(effectiveCampaignId));
    }

    // Step 2️⃣ - Update campaign with current form data
    await UpdateEmailCampaignAPI(
      effectiveCampaignId,
      createCampaignPayload(false)
    );

    // Step 3️⃣ - Send test emails
    await SendTestEmailCampaignAPI(effectiveCampaignId, testEmails);

    toast.success("Test emails sent successfully!");
    setIsTestModalOpen(false);
  } catch (err) {
    console.error("Failed to send test emails:", err);
    toast.error("Failed to send test emails");
  }
};


  const handleSubjectChange = (e) => {
  setSubject(e.target.value);
};


  const handleSubjectSuggestionClick = (decorator) => {
    const before = subject.substring(0, subjectCursorPosition - 1);
    const after = subject.substring(subjectCursorPosition);
    setSubject(`${before}${decorator}${after}`);
    setShowSubjectSuggestions(false);
  };

  const handleOpenPreview = async () => {
    if (selectedEvents.length === 1) {
      try {
        const res = await GetEventAPI(selectedEvents[0]);
        setEventDetails(res.data);
      } catch {
        setEventDetails(null);
      }
    }
    setIsPreviewOpen(true);
  };

  const eventOptions = events.map((e) => ({ value: e.id, label: e.name }));

  return (
    <div className={styles.emailCampaignsPageContainer}>
      {/* --- HIDDEN FILE INPUT --- */}
      <input
        ref={fileInputRef}
        id="attachmentInput"
        type="file"
        multiple
        accept="*/*"
        style={{ display: "none" }}
        onChange={handleAttachmentUpload}
      />

      <div className={styles.pageHeader}>
        <div className={styles.breadcrumbs}>
          <span>Email Campaign</span>
          <span className={styles.breadcrumbDivider}>›</span>
          <span>{campaignId ? "Edit Campaign" : "New Campaign"}</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            onClick={() => setIsTestModalOpen(true)}
          >
            Send Test Mail
          </button>
        </div>
      </div>

      <h1 className={styles.pageTitle}>
        {campaignId ? "Edit Email Campaign" : "Create Email Campaign"}
      </h1>

      {/* --- NEW UNIFIED FORM CONTAINER --- */}
      <div className={styles.emailFormContainer}>
        <div className={styles.formGroup}>
          <label htmlFor="campaignName">Campaign Name</label>
          <input
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g. Weekly Newsletter, New Event Promo"
          />
        </div>

        <h2 className={styles.formSubheading}>Recipients</h2>
        <div className={styles.formGroup}>
          <label htmlFor="events">Select Event(s)</label>
          <Select
            inputId="events"
            isMulti
            options={eventOptions}
            value={eventOptions.filter((o) =>
              selectedEvents.includes(o.value.toString())
            )}
            onChange={(s) => setSelectedEvents(s.map((o) => o.value.toString()))}
            className={styles.multiSelect}
            classNamePrefix="select"
          />
        </div>

        <h2 className={styles.formSubheading}>Content & Design</h2>
        <div className={styles.formGroup}>
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            value={subject}
            onChange={handleSubjectChange}
            placeholder="Your email subject line"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Message</label>
          <div className={styles.richTextEditorWrapper}>
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        <h2 className={styles.formSubheading}>Attachments</h2>
        <p className={styles.fileSizeNote}>
          Maximum file size: 5 MB per file
        </p>
        <div className={styles.attachmentSection}>
          <div className={styles.attachmentList}>
            {attachments.map((url, i) => (
              <div key={`att-${i}`} className={styles.attachmentItem}>
                <span>{url.split("/").pop().split("?")[0]}</span>
                <button onClick={() => handleRemoveAttachment(url)}>×</button>
              </div>
            ))}
          </div>
          {attachments.length === 0 && (
            <div className={styles.attachmentPlaceholder}>No files attached</div>
          )}
          <button
            type="button"
            className={styles.addAttachmentButton}
            onClick={() => fileInputRef.current.click()}
          >
            {uploading ? "Uploading..." : "+ Add Attachment"}
          </button>
        </div>

        <h2 className={styles.formSubheading}>Delivery Schedule</h2>
        <div className={styles.formGroup}>
          <div className={styles.toggleGroup}>
            {["now", "at"].map((opt) => (
              <button
                key={opt}
                onClick={() => setSendOption(opt)}
                className={`${styles.toggleButton} ${
                  sendOption === opt ? styles.active : ""
                }`}
              >
                {opt === "now" ? "Send Now" : "Schedule for later"}
              </button>
            ))}
          </div>
          {sendOption === "at" && (
            <div className={styles.dateTimePickerWrapper}>
              <label>Choose Date & Time</label>
              <DatePicker
                selected={scheduledAt}
                onChange={setScheduledAt}
                showTimeSelect
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className={styles.dateTimeInput}
              />
            </div>
          )}
        </div>

        <div className={styles.footerActions}>
          <button className={styles.secondaryButton} onClick={handleBack}>
            Back
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleSend}
            disabled={isCreating || loading || uploading}
          >
            {uploading
              ? "Waiting for upload..."
              : isCreating
              ? "Creating..."
              : loading
              ? "Sending..."
              : campaignId
              ? "Update & Send"
              : "Send Campaign"}
          </button>
        </div>
      </div>

      {/* --- MODALS --- */}
      {isTestModalOpen && (
        <div className={styles.previewOverlay}>
          <div className={styles.previewModal}>
            <h2>Send Test Emails</h2>
            <p>Enter up to 5 test email addresses</p>
            <div className={styles.formGroup}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="email"
                  value={newTestEmail}
                  placeholder="Enter email"
                  onChange={(e) => setNewTestEmail(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (
                      newTestEmail &&
                      !testEmails.includes(newTestEmail) &&
                      testEmails.length < 5
                    ) {
                      setTestEmails([...testEmails, newTestEmail]);
                      setNewTestEmail("");
                    }
                  }}
                  className={styles.secondaryButton}
                >
                  Add
                </button>
              </div>
              <ul className={styles.testEmailList}>
                {testEmails.map((email, i) => (
                  <li key={i}>
                    {email}
                    <button
                      onClick={() =>
                        setTestEmails(testEmails.filter((e) => e !== email))
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.previewActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setIsTestModalOpen(false)}
              >
                Cancel
              </button>
              <button
  className={styles.primaryButton}
  onClick={handleSendTestEmails}
  disabled={loading}
>
  {loading ? "Sending..." : "Send"}
</button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaignsPage;