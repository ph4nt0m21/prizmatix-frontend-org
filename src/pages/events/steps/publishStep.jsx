import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ART_PLACEHOLDER_BANNER,
  ART_PLACEHOLDER_THUMBNAIL,
  applyArtImageFallback,
} from '../../../constants/artImagePlaceholders';
import styles from './publishStep.module.scss';
import { getEventData } from '../../../utils/eventUtil';
import {
  buildMapEmbedUrl,
  buildMapExternalUrl,
  displayVenueName,
  formatEventLocationSummary,
  formatPhysicalAddressLines,
  formatSidebarDate,
  formatSidebarTime,
  formatTicketPriceLabel,
  mapOrgLocationToPreviewFields,
  normalizeLocationType,
  venueSectionTitle,
} from '../../../utils/eventPreviewUtil';
import calendarIcon from '../../../assets/icons/event-preview-calendar.svg';
import locationIcon from '../../../assets/icons/event-preview-location.svg';

const PUBLIC_EVENT_BASE_URL = 'https://www.prizmatix.nz/events';

const DummyBuyButton = ({ className, children }) => (
  <button type="button" className={className} disabled aria-disabled="true" tabIndex={-1}>
    {children}
  </button>
);

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
          {locationFields.eventLocationMeetingUrl?.trim() && (
            <div className={styles.venueDetailBlock}>
              <span className={styles.venueDetailLabel}>Meeting link</span>
              <div className={styles.venueDetailValue}>
                <span className={styles.venueLinkPreview}>
                  {locationFields.eventLocationMeetingUrl.trim()}
                </span>
              </div>
            </div>
          )}
          {locationFields.eventLocationJoinNotes?.trim() && (
            <div className={styles.venueDetailBlock}>
              <span className={styles.venueDetailLabel}>How to join</span>
              <p className={styles.venueText}>{locationFields.eventLocationJoinNotes.trim()}</p>
            </div>
          )}
          {locationFields.eventLocationAdditionalInfo?.trim() && (
            <div className={styles.venueDetailBlock}>
              <span className={styles.venueDetailLabel}>Additional information</span>
              <p className={styles.venueText}>
                {locationFields.eventLocationAdditionalInfo.trim()}
              </p>
            </div>
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
              <span>Open in Google Maps</span>
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
          ) : (
            <div className={styles.venueMapPlaceholder}>Map preview unavailable</div>
          )}

          {(locationFields.eventLocationMeetingUrl?.trim() ||
            locationFields.eventLocationAdditionalInfo?.trim()) && (
            <div className={styles.venueExtraDetails}>
              {locationFields.eventLocationMeetingUrl?.trim() && (
                <div className={styles.venueDetailBlock}>
                  <span className={styles.venueDetailLabel}>Virtual meeting link (hybrid)</span>
                  <span className={styles.venueLinkPreview}>
                    {locationFields.eventLocationMeetingUrl.trim()}
                  </span>
                </div>
              )}
              {locationFields.eventLocationAdditionalInfo?.trim() && (
                <div className={styles.venueDetailBlock}>
                  <span className={styles.venueDetailLabel}>Additional information</span>
                  <p className={styles.venueText}>
                    {locationFields.eventLocationAdditionalInfo.trim()}
                  </p>
                </div>
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
  const startDate = localEventData.dateTime?.startDate;
  const startTime = localEventData.dateTime?.startTime;
  const descriptionHtml =
    localEventData.description ||
    localEventData.shortDescription ||
    '<p>No description provided.</p>';
  const publicEventUrl = localEventData.slug
    ? `${PUBLIC_EVENT_BASE_URL}/${localEventData.slug}`
    : null;

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
              thumbnailUrl ? styles.eventContainerWithThumb : ''
            }`}
          >
            <div className={styles.eventHeader}>
              <div className={styles.bannerWrapper}>
                <div className={styles.bannerWrapperCover}>
                  <img
                    src={bannerUrl}
                    alt="Event banner"
                    className={styles.bannerImage}
                    onError={(e) => applyArtImageFallback(e, ART_PLACEHOLDER_BANNER)}
                  />
                </div>
                {thumbnailUrl && (
                  <div className={styles.mobileCoverThumbnail}>
                    <img
                      src={thumbnailUrl}
                      alt={localEventData.name || 'Event thumbnail'}
                      className={styles.mobileCoverThumbnailImg}
                      onError={(e) => applyArtImageFallback(e, ART_PLACEHOLDER_THUMBNAIL)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.eventDetailLayout}>
              <aside className={styles.eventSidebar}>
                <div className={styles.eventSidebarPoster}>
                  <img
                    src={thumbnailUrl}
                    alt={localEventData.name || 'Event thumbnail'}
                    onError={(e) => applyArtImageFallback(e, ART_PLACEHOLDER_THUMBNAIL)}
                  />
                </div>

                <div className={styles.sidebarMeta}>
                  <div className={styles.metaItem}>
                    <img src={calendarIcon} alt="" aria-hidden="true" />
                    <span>
                      {startDate ? (
                        <>
                          {formatSidebarDate(startDate)}
                          {startTime ? `, ${formatSidebarTime(startTime)}` : ''}
                        </>
                      ) : (
                        'Date and time not set'
                      )}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <img src={locationIcon} alt="" aria-hidden="true" />
                    <span>{locationSummary}</span>
                  </div>
                </div>

                <DummyBuyButton className={styles.buyBtn}>Buy Tickets</DummyBuyButton>
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
            <DummyBuyButton className={styles.mobileBuyBtn}>Buy Tickets</DummyBuyButton>
          </div>
        </div>
      </div>
    </div>
  );
};

PublishStep.propTypes = {
  eventData: PropTypes.object,
};

export default PublishStep;
