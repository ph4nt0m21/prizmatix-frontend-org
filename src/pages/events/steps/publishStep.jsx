import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ART_PLACEHOLDER_BANNER,
  ART_PLACEHOLDER_THUMBNAIL,
  applyArtImageFallback,
} from '../../../constants/artImagePlaceholders';
import EventImagePreviewModal from '../../../components/eventPreview/EventImagePreviewModal';
import styles from './publishStep.module.scss';
import { getEventData } from '../../../utils/eventUtil';
import { formatEventScheduleFromFormDateTime } from '../../../utils/datetimeUtil';
import {
  buildMapEmbedUrl,
  buildMapExternalUrl,
  displayVenueName,
  formatEventLocationSummary,
  formatPhysicalAddressLines,
  formatTicketPriceLabel,
  mapOrgLocationToPreviewFields,
  normalizeLocationType,
  venueSectionTitle,
} from '../../../utils/eventPreviewUtil';
import calendarIcon from '../../../assets/icons/event-preview-calendar.svg';
import locationIcon from '../../../assets/icons/event-preview-location.svg';

const PUBLIC_EVENT_BASE_URL = 'https://www.prizmatix.nz/events';

const PreviewBuyButton = ({ className, children }) => (
  <button
    type="button"
    className={className}
    disabled
    aria-disabled="true"
    title="Ticket purchase is disabled in preview"
  >
    {children}
  </button>
);

const DetailBlock = ({ label, children }) => {
  if (!children) return null;
  return (
    <div className={styles.venueDetailBlock}>
      <span className={styles.venueDetailLabel}>{label}</span>
      <div className={styles.venueDetailValue}>{children}</div>
    </div>
  );
};

DetailBlock.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const MeetingLink = ({ url, label }) => {
  const trimmed = String(url || '').trim();
  if (!trimmed) return null;

  return (
    <DetailBlock label={label}>
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.venueLink}
      >
        {trimmed}
      </a>
    </DetailBlock>
  );
};

MeetingLink.propTypes = {
  url: PropTypes.string,
  label: PropTypes.string.isRequired,
};

const VenuePreviewSection = ({ locationFields }) => {
  const type = normalizeLocationType(locationFields.eventLocationType);
  const isTba = type === 'tba';
  const isPrivate = type === 'private';
  const isOnline = type === 'online';
  const venueName = displayVenueName(locationFields);
  const addressLines = formatPhysicalAddressLines(locationFields);
  const mapEmbedUrl = buildMapEmbedUrl(locationFields);
  const mapExternalUrl = buildMapExternalUrl(locationFields);

  return (
    <section className={styles.eventVenue}>
      <h3>{venueSectionTitle(locationFields.eventLocationType)}</h3>

      {isTba ? (
        <p className={styles.tbaMessage}>Venue details will be announced soon.</p>
      ) : isPrivate ? (
        <p className={styles.tbaMessage}>
          Location details will be shared with ticket holders after purchase.
        </p>
      ) : isOnline ? (
        <div className={styles.venueDetails}>
          <MeetingLink url={locationFields.eventLocationMeetingUrl} label="Meeting link" />
          {locationFields.eventLocationJoinNotes?.trim() && (
            <DetailBlock label="How to join">
              <p className={styles.venueText}>{locationFields.eventLocationJoinNotes.trim()}</p>
            </DetailBlock>
          )}
          {locationFields.eventLocationAdditionalInfo?.trim() && (
            <DetailBlock label="Additional information">
              <p className={styles.venueText}>
                {locationFields.eventLocationAdditionalInfo.trim()}
              </p>
            </DetailBlock>
          )}
        </div>
      ) : (
        <>
          {venueName && (
            <p className={styles.venueName}>
              <strong>{venueName}</strong>
            </p>
          )}

          {addressLines.length > 0 && (
            <div className={styles.venueAddress}>
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}

          {mapExternalUrl && (
            <p className={styles.venueMapLink}>
              <a href={mapExternalUrl} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
              </a>
            </p>
          )}

          {mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              title="Event location map"
              className={styles.venueMapFrame}
            />
          ) : null}

          {(locationFields.eventLocationMeetingUrl?.trim() ||
            locationFields.eventLocationAdditionalInfo?.trim()) && (
            <div className={styles.venueExtraDetails}>
              {locationFields.eventLocationMeetingUrl?.trim() && (
                <MeetingLink
                  url={locationFields.eventLocationMeetingUrl}
                  label="Virtual meeting link (hybrid)"
                />
              )}
              {locationFields.eventLocationAdditionalInfo?.trim() && (
                <DetailBlock label="Additional information">
                  <p className={styles.venueText}>
                    {locationFields.eventLocationAdditionalInfo.trim()}
                  </p>
                </DetailBlock>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

VenuePreviewSection.propTypes = {
  locationFields: PropTypes.object.isRequired,
};

const PublishStep = ({ eventData = {} }) => {
  const [localEventData, setLocalEventData] = useState(eventData);
  const [previewView, setPreviewView] = useState(null);

  useEffect(() => {
    const storedEventData = getEventData();
    setLocalEventData({
      ...storedEventData,
      ...eventData,
    });
  }, [eventData]);

  const bannerUrl = localEventData.art?.bannerUrl || ART_PLACEHOLDER_BANNER;
  const thumbnailUrl = localEventData.art?.thumbnailUrl || ART_PLACEHOLDER_THUMBNAIL;
  const locationFields = useMemo(
    () => mapOrgLocationToPreviewFields(localEventData.location || {}),
    [localEventData.location]
  );
  const locationSummary = formatEventLocationSummary(locationFields);
  const ticketPriceLabel = formatTicketPriceLabel(localEventData.tickets || []);
  const scheduleLabel = formatEventScheduleFromFormDateTime(
    localEventData.dateTime || {}
  );
  const descriptionHtml =
    localEventData.description ||
    localEventData.shortDescription ||
    '<p>No description provided.</p>';
  const publicEventUrl = localEventData.slug
    ? `${PUBLIC_EVENT_BASE_URL}/${localEventData.slug}`
    : null;
  const hasThumbnail = Boolean(thumbnailUrl);

  const handleOpenPreview = () => {
    if (publicEventUrl) {
      window.open(publicEventUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.previewHeader}>
        <div className={styles.previewLabel}>Customer event page preview</div>
        {publicEventUrl ? (
          <button type="button" className={styles.openNewTabButton} onClick={handleOpenPreview}>
            Open in new tab
          </button>
        ) : (
          <span className={styles.previewHint}>Publish to get a public event link</span>
        )}
      </div>

      <div className={styles.eventPageWrapper}>
        <div className={styles.bannerBg} aria-hidden="true">
          <img
            src={bannerUrl}
            alt=""
            className={styles.bannerBgImage}
            onError={(e) => applyArtImageFallback(e, ART_PLACEHOLDER_BANNER)}
          />
        </div>

        <div className={styles.eventBlurOverlay}>
          <div
            className={`${styles.eventContainer} ${
              hasThumbnail ? styles.eventContainerWithThumb : ''
            }`}
          >
            <div className={styles.eventHeader}>
              <div className={styles.bannerWrapper}>
                <button
                  type="button"
                  className={`${styles.bannerWrapperCover} ${styles.imagePreviewTrigger}`}
                  onClick={() => setPreviewView('banner')}
                  aria-label="View full banner image"
                >
                  <img
                    src={bannerUrl}
                    alt="Event banner"
                    className={styles.bannerImage}
                    onError={(e) => applyArtImageFallback(e, ART_PLACEHOLDER_BANNER)}
                  />
                </button>
                {hasThumbnail ? (
                  <button
                    type="button"
                    className={`${styles.mobileCoverThumbnail} ${styles.imagePreviewTrigger}`}
                    onClick={() => setPreviewView('thumbnail')}
                    aria-label="View full thumbnail image"
                  >
                    <img
                      src={thumbnailUrl}
                      alt={localEventData.name || 'Event thumbnail'}
                      className={styles.mobileCoverThumbnailImg}
                      onError={(e) => applyArtImageFallback(e, ART_PLACEHOLDER_THUMBNAIL)}
                    />
                  </button>
                ) : null}
              </div>
            </div>

            <div className={styles.eventDetailLayout}>
              <aside className={styles.eventSidebar}>
                <button
                  type="button"
                  className={`${styles.eventSidebarPoster} ${styles.imagePreviewTrigger}`}
                  onClick={() => setPreviewView('thumbnail')}
                  aria-label={`View full image for ${localEventData.name || 'event'}`}
                >
                  <img
                    src={thumbnailUrl}
                    alt={localEventData.name || 'Event thumbnail'}
                    onError={(e) => applyArtImageFallback(e, ART_PLACEHOLDER_THUMBNAIL)}
                  />
                </button>

                <div className={styles.sidebarMeta}>
                  <div className={styles.metaItem}>
                    <img src={calendarIcon} alt="" aria-hidden="true" />
                    <span>{scheduleLabel}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <img src={locationIcon} alt="" aria-hidden="true" />
                    <span>{locationSummary}</span>
                  </div>
                </div>

                <PreviewBuyButton className={styles.buyBtn}>Buy Tickets</PreviewBuyButton>
                <p className={styles.priceHint}>
                  Ticket rate starting from ${ticketPriceLabel}
                </p>
              </aside>

              <div className={styles.eventContent}>
                <section className={styles.eventAbout}>
                  <h1 className={styles.eventTitle}>{localEventData.name || 'Untitled Event'}</h1>
                  <div className={styles.underline} />
                  <h3>About</h3>
                  <div
                    className={styles.eventDescription}
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                </section>

                <VenuePreviewSection locationFields={locationFields} />
              </div>
            </div>

          </div>
        </div>

        <div className={styles.mobileBuyBar}>
          <div className={styles.buyBarInner}>
            <span>
              Ticket rate starting from <strong>${ticketPriceLabel}</strong>
            </span>
            <PreviewBuyButton className={styles.mobileBuyBtn}>Buy Tickets</PreviewBuyButton>
          </div>
        </div>
      </div>

      {previewView ? (
        <EventImagePreviewModal
          bannerHref={bannerUrl}
          thumbnailHref={thumbnailUrl}
          initialView={previewView}
          onClose={() => setPreviewView(null)}
        />
      ) : null}
    </div>
  );
};

PublishStep.propTypes = {
  eventData: PropTypes.object,
};

export default PublishStep;
