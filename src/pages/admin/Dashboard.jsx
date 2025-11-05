import React, { useState } from "react";
import OrganizationList from "./OrganizationList";
import EventList from "./EventList";
import EventDetails from "./EventDetails";

export default function Dashboard() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (selectedEvent) {
    return (
      <EventDetails
        eventId={selectedEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  if (selectedOrg) {
    return (
      <EventList
        orgId={selectedOrg}
        onSelectEvent={setSelectedEvent}
        onBack={() => setSelectedOrg(null)}
      />
    );
  }

  return <OrganizationList onSelectOrg={setSelectedOrg} />;
}