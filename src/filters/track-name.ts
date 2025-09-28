import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import {
    FILTER_PREFIX,
    EVENT_SOURCE_ID,
    TRACK_MUTED_EVENT_ID,
    TRACK_UNMUTED_EVENT_ID,
    TRACK_VOLUME_CHANGED_EVENT_ID,
} from "../constants";

export const TrackNameFilter: EventFilter = {
    id: `${FILTER_PREFIX}:track-name`,
    name: "Meld Studio Track Name",
    description: "Filter on the name of the Meld Studio track that triggered the event",
    events: [
        { eventSourceId: EVENT_SOURCE_ID, eventId: TRACK_MUTED_EVENT_ID },
        { eventSourceId: EVENT_SOURCE_ID, eventId: TRACK_UNMUTED_EVENT_ID },
        { eventSourceId: EVENT_SOURCE_ID, eventId: TRACK_VOLUME_CHANGED_EVENT_ID },
    ],
    comparisonTypes: [ "is", "is not" ],
    valueType: "text",
    predicate: async (filterSettings, eventData) => {
        const trackName = (eventData.eventMeta.trackName as string).toLowerCase();
        const value = (filterSettings.value as string).toLowerCase();

        return filterSettings.comparisonType === "is"
            ? trackName === value
            : trackName !== value;
    }
}