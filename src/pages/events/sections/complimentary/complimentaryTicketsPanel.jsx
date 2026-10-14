import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FiGift, FiMail, FiSlash, FiClock, FiX } from "react-icons/fi";
import styles from "./complimentaryTicketsPanel.module.scss";
import {
  GetComplimentaryTicketsAPI,
  IssueComplimentaryTicketAPI,
  ResendComplimentaryTicketAPI,
  RevokeComplimentaryTicketAPI,
  GetComplimentaryTicketHistoryAPI,
} from "../../../../services/allApis";

export const COMPLIMENTARY_TYPES = [
  "Complimentary",
  "Artist +1",
  "Guest List",
  "Sponsor",
  "Staff / Crew",
  "VIP / Invite",
  "Giveaway",
  "Other",
];
const MAX_ENTRIES = 20;

const STATUS_LABEL = {
  ACTIVE: "Active",
  PARTIALLY_CHECKED_IN: "Partly checked in",
  CHECKED_IN: "Checked in",
  REVOKED: "Revoked",
};

const ACTION_LABEL = {
  ISSUED: "Issued",
  EMAIL_SENT: "Email sent",
  EMAIL_FAILED: "Email failed",
  RESENT: "Resent",
  CHECKED_IN: "Checked in",
  REVOKED: "Revoked",
};

/** One key per issue attempt; reused if the request is retried so it can't double-issue. */
const newRequestKey = () =>
  (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`)
    .replace(/[^A-Za-z0-9_-]/g, "");

const errorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  (typeof err?.response?.data === "string" ? err.response.data : null) ||
  fallback;

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

/** Ticket types an organiser can count complimentary entries against. */
const eligibleTypes = (tickets) =>
  (tickets || [])
    .filter((t) => t?.id && String(t.ticketKind || "").toUpperCase() !== "DONATION")
    .map((t) => {
      const unlimited = t.quantity === "No Limit";
      const remaining = unlimited ? null : Math.max(0, Number(t.quantity || 0) - Number(t.soldCount || 0));
      return { id: t.id, name: t.name, unlimited, remaining };
    });

const emptyForm = (types) => ({
  recipientName: "",
  recipientEmail: "",
  entries: 1,
  typeChoice: COMPLIMENTARY_TYPES[0],
  otherType: "",
  internalNote: "",
  ticketStructureId: types[0]?.id ?? "",
});

const ComplimentaryTicketsPanel = ({ eventId, tickets, onCapacityChange = () => {} }) => {
  const types = useMemo(() => eligibleTypes(tickets), [tickets]);

  const [summary, setSummary] = useState({ tickets: [], activeEntries: 0, checkedInEntries: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [step, setStep] = useState("details");
  const [form, setForm] = useState(() => emptyForm(types));
  const [formError, setFormError] = useState(null);
  const [requestKey, setRequestKey] = useState(newRequestKey);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [busyOrderId, setBusyOrderId] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await GetComplimentaryTicketsAPI(eventId);
      setSummary(res.data || { tickets: [] });
    } catch (err) {
      setLoadError(errorMessage(err, "Could not load complimentary tickets."));
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) load();
  }, [eventId, load]);

  const openIssue = () => {
    setForm(emptyForm(types));
    setStep("details");
    setFormError(null);
    setRequestKey(newRequestKey());
    setIsIssueOpen(true);
  };

  const closeIssue = () => {
    if (isSubmitting) return;
    setIsIssueOpen(false);
  };

  const description = form.typeChoice === "Other" ? form.otherType.trim() : form.typeChoice;
  const selectedType = types.find((t) => String(t.id) === String(form.ticketStructureId));

  const validateForm = () => {
    if (!form.recipientName.trim()) return "Enter the recipient's name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail.trim())) return "Enter a valid email address.";
    const n = Number(form.entries);
    if (!Number.isInteger(n) || n < 1 || n > MAX_ENTRIES) return `Entries must be between 1 and ${MAX_ENTRIES}.`;
    if (!description) return "Enter a description.";
    if (description.length > 50) return "Description must be 50 characters or fewer.";
    if (!selectedType) return "Choose which ticket type this counts against.";
    if (!selectedType.unlimited && n > selectedType.remaining) {
      return `Only ${selectedType.remaining} left for ${selectedType.name}.`;
    }
    return null;
  };

  const goToConfirm = (e) => {
    e.preventDefault();
    const problem = validateForm();
    setFormError(problem);
    if (!problem) setStep("confirm");
  };

  const issue = async () => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await IssueComplimentaryTicketAPI(
        eventId,
        {
          recipientName: form.recipientName.trim(),
          recipientEmail: form.recipientEmail.trim(),
          entries: Number(form.entries),
          complimentaryType: description,
          internalNote: form.internalNote.trim() || null,
          ticketStructureId: Number(form.ticketStructureId),
        },
        requestKey
      );
      const issued = res.data || {};
      if (issued.lastEmailStatus === "FAILED") {
        toast.warn("Ticket issued, but the email didn't send. Use Resend to try again.");
      } else {
        toast.success(
          issued.alreadyIssued ? "This ticket was already issued." : `Ticket sent to ${issued.recipientEmail}.`
        );
      }
      setIsIssueOpen(false);
      await load();
      onCapacityChange();
    } catch (err) {
      // Keep the same request key: if the request actually went through, retrying
      // returns that issuance instead of creating a second one.
      setFormError(errorMessage(err, "Could not issue the ticket. Please try again."));
      setStep("details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async (ticket) => {
    setBusyOrderId(ticket.orderId);
    try {
      await ResendComplimentaryTicketAPI(eventId, ticket.orderId);
      toast.success(`Ticket resent to ${ticket.recipientEmail}.`);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Could not resend the ticket."));
    } finally {
      setBusyOrderId(null);
    }
  };

  const revoke = async () => {
    const ticket = revokeTarget;
    if (!ticket) return;
    setBusyOrderId(ticket.orderId);
    try {
      await RevokeComplimentaryTicketAPI(eventId, ticket.orderId);
      toast.success("Ticket revoked. Its QR code will no longer be accepted.");
      setRevokeTarget(null);
      await load();
      onCapacityChange();
    } catch (err) {
      toast.error(errorMessage(err, "Could not revoke the ticket."));
    } finally {
      setBusyOrderId(null);
    }
  };

  const openHistory = async (ticket) => {
    setHistoryFor(ticket);
    setHistory([]);
    try {
      const res = await GetComplimentaryTicketHistoryAPI(eventId, ticket.orderId);
      setHistory(res.data || []);
    } catch (err) {
      toast.error(errorMessage(err, "Could not load history."));
    }
  };

  const list = summary.tickets || [];

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Complimentary tickets</h3>
          <p className={styles.subtitle}>
            Privately issue free entry — artist +1, guest list, crew. Counts towards capacity, not revenue.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={openIssue}
          disabled={types.length === 0}
          title={types.length === 0 ? "Save at least one ticket type first" : undefined}
        >
          <FiGift aria-hidden="true" /> Issue complimentary ticket
        </button>
      </div>

      {types.length === 0 && (
        <p className={styles.hint}>Add and save a ticket type above before issuing complimentary tickets.</p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Active entries</span>
          <span className={styles.statValue}>{summary.activeEntries || 0}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Checked in</span>
          <span className={styles.statValue}>{summary.checkedInEntries || 0}</span>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.muted}>Loading…</p>
      ) : loadError ? (
        <p className={styles.errorText}>{loadError}</p>
      ) : list.length === 0 ? (
        <p className={styles.muted}>No complimentary tickets issued yet.</p>
      ) : (
        <ul className={styles.list}>
          {list.map((t) => {
            const revoked = t.status === "REVOKED";
            const busy = busyOrderId === t.orderId;
            return (
              <li key={t.orderId} className={`${styles.row} ${revoked ? styles.rowRevoked : ""}`}>
                <div className={styles.recipient}>
                  <span className={styles.name}>{t.recipientName}</span>
                  <span className={styles.email}>{t.recipientEmail}</span>
                </div>
                <div className={styles.meta}>
                  <span className={styles.typeTag}>{t.complimentaryType}</span>
                  <span>
                    {t.checkedIn}/{t.entries} {t.entries === 1 ? "entry" : "entries"} · {t.ticketTypeName}
                  </span>
                  <span className={styles.issued}>
                    {t.issuedByName ? `${t.issuedByName} · ` : ""}
                    {formatDateTime(t.issuedAt)}
                  </span>
                  {t.internalNote && <span className={styles.note}>Note: {t.internalNote}</span>}
                </div>
                <span className={`${styles.status} ${styles[`status_${t.status}`] || ""}`}>
                  {STATUS_LABEL[t.status] || t.status}
                </span>
                <div className={styles.actions}>
                  <button type="button" className={styles.linkButton} onClick={() => openHistory(t)}>
                    <FiClock aria-hidden="true" /> History
                  </button>
                  {!revoked && (
                    <button type="button" className={styles.linkButton} disabled={busy} onClick={() => resend(t)}>
                      <FiMail aria-hidden="true" /> {busy ? "Sending…" : "Resend"}
                    </button>
                  )}
                  {t.status === "ACTIVE" && (
                    <button
                      type="button"
                      className={`${styles.linkButton} ${styles.danger}`}
                      disabled={busy}
                      onClick={() => setRevokeTarget(t)}
                    >
                      <FiSlash aria-hidden="true" /> Revoke
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {isIssueOpen && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Issue complimentary ticket">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h4>{step === "details" ? "Issue complimentary ticket" : "Confirm ticket"}</h4>
              <button type="button" className={styles.iconButton} onClick={closeIssue} aria-label="Close">
                <FiX />
              </button>
            </div>

            {step === "details" ? (
              <form onSubmit={goToConfirm} className={styles.form} noValidate>
                <label className={styles.field}>
                  <span>Recipient name *</span>
                  <input
                    value={form.recipientName}
                    maxLength={120}
                    onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                    autoFocus
                  />
                </label>
                <label className={styles.field}>
                  <span>Recipient email *</span>
                  <input
                    type="email"
                    value={form.recipientEmail}
                    maxLength={254}
                    onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                  />
                </label>
                <div className={styles.fieldRow}>
                  <label className={styles.field}>
                    <span>Entries *</span>
                    <input
                      type="number"
                      min={1}
                      max={MAX_ENTRIES}
                      value={form.entries}
                      onChange={(e) => setForm({ ...form, entries: e.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Description *</span>
                    <select
                      value={form.typeChoice}
                      onChange={(e) => setForm({ ...form, typeChoice: e.target.value })}
                    >
                      {COMPLIMENTARY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {form.typeChoice === "Other" && (
                  <label className={styles.field}>
                    <span>Describe it *</span>
                    <input
                      value={form.otherType}
                      maxLength={50}
                      placeholder="e.g. Media pass"
                      onChange={(e) => setForm({ ...form, otherType: e.target.value })}
                    />
                  </label>
                )}
                <label className={styles.field}>
                  <span>Counts against ticket type *</span>
                  <select
                    value={form.ticketStructureId}
                    onChange={(e) => setForm({ ...form, ticketStructureId: e.target.value })}
                  >
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.unlimited ? "(no limit)" : `(${t.remaining} left)`}
                      </option>
                    ))}
                  </select>
                  <small>Uses this type's capacity. Public sales being closed doesn't block issuing.</small>
                </label>
                <label className={styles.field}>
                  <span>Internal note (optional)</span>
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={form.internalNote}
                    placeholder="Only visible to your team"
                    onChange={(e) => setForm({ ...form, internalNote: e.target.value })}
                  />
                </label>

                {formError && <p className={styles.errorText}>{formError}</p>}

                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={closeIssue}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryButton}>
                    Continue
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.form}>
                <dl className={styles.confirmList}>
                  <dt>Recipient</dt>
                  <dd>
                    {form.recipientName.trim()}
                    <br />
                    <span className={styles.email}>{form.recipientEmail.trim()}</span>
                  </dd>
                  <dt>Entries</dt>
                  <dd>{form.entries}</dd>
                  <dt>Description</dt>
                  <dd>{description}</dd>
                  <dt>Counts against</dt>
                  <dd>{selectedType?.name}</dd>
                  {form.internalNote.trim() && (
                    <>
                      <dt>Internal note</dt>
                      <dd>{form.internalNote.trim()}</dd>
                    </>
                  )}
                </dl>
                <p className={styles.muted}>
                  The recipient will be emailed a ticket with a QR code. No price or payment details are shown.
                </p>
                {formError && <p className={styles.errorText}>{formError}</p>}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setStep("details")}
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                  <button type="button" className={styles.primaryButton} onClick={issue} disabled={isSubmitting}>
                    {isSubmitting ? "Issuing…" : "Issue ticket"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {revokeTarget && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Revoke ticket">
          <div className={`${styles.modal} ${styles.modalSmall}`}>
            <div className={styles.modalHeader}>
              <h4>Revoke ticket?</h4>
              <button type="button" className={styles.iconButton} onClick={() => setRevokeTarget(null)} aria-label="Close">
                <FiX />
              </button>
            </div>
            <p className={styles.bodyText}>
              <strong>{revokeTarget.recipientName}</strong>'s {revokeTarget.complimentaryType} ticket (
              {revokeTarget.entries} {revokeTarget.entries === 1 ? "entry" : "entries"}) will stop working at
              the door and its {revokeTarget.entries === 1 ? "place returns" : "places return"} to{" "}
              {revokeTarget.ticketTypeName}. This can't be undone.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setRevokeTarget(null)}>
                Keep ticket
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={revoke}
                disabled={busyOrderId === revokeTarget.orderId}
              >
                {busyOrderId === revokeTarget.orderId ? "Revoking…" : "Revoke ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {historyFor && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Ticket history">
          <div className={`${styles.modal} ${styles.modalSmall}`}>
            <div className={styles.modalHeader}>
              <h4>History · {historyFor.recipientName}</h4>
              <button type="button" className={styles.iconButton} onClick={() => setHistoryFor(null)} aria-label="Close">
                <FiX />
              </button>
            </div>
            {history.length === 0 ? (
              <p className={styles.muted}>Loading…</p>
            ) : (
              <ol className={styles.history}>
                {history.map((h, i) => (
                  <li key={i}>
                    <span className={styles.historyAction}>{ACTION_LABEL[h.action] || h.action}</span>
                    <span className={styles.historyMeta}>
                      {h.actorName} · {formatDateTime(h.at)}
                    </span>
                    {h.detail && <span className={styles.historyDetail}>{h.detail}</span>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ComplimentaryTicketsPanel;
