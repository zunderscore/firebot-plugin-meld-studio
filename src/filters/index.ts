import { FilterEvent } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { MeldEventSource } from "../events";
import { EVENT_SOURCE_ID } from "../constants";
import { SceneNameFilter } from "./scene-name";
import { TrackNameFilter } from "./track-name";

export const MeldFilters = [
    SceneNameFilter,
    TrackNameFilter
]

export function getAllEventFilters(): FilterEvent[] {
    return MeldEventSource.events.reduce((out, e) => {
        out.push({ eventSourceId: EVENT_SOURCE_ID, eventId: e.id });
        return out;
    }, [] as FilterEvent[]);
}

export function getEventFiltersMatchingPrefix(prefix: string): FilterEvent[] {
    return MeldEventSource.events.reduce((out, e) => {
        if (e.id.startsWith(prefix)) {
            out.push({ eventSourceId: EVENT_SOURCE_ID, eventId: e.id });
        }
        return out;
    }, [] as FilterEvent[]);
}