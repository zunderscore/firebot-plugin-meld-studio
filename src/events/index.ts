import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import {
    PLUGIN_NAME,
    EVENT_SOURCE_ID,
    CONNECTED_EVENT_ID,
    DISCONNECTED_EVENT_ID,
    STREAMING_STARTED_EVENT_ID,
    STREAMING_STOPPED_EVENT_ID,
    RECORDING_STARTED_EVENT_ID,
    RECORDING_STOPPED_EVENT_ID,
    SCENE_CHANGED_EVENT_ID,
    STAGED_SCENE_CHANGED_EVENT_ID,
    TRACK_MUTED_EVENT_ID,
    TRACK_UNMUTED_EVENT_ID,
    TRACK_VOLUME_CHANGED_EVENT_ID,
    TRACK_MONITORING_CHANGED_EVENT_ID,
} from "../constants";

export const MeldEventSource: EventSource = {
    id: EVENT_SOURCE_ID,
    name: PLUGIN_NAME,
    events: [
        {
            id: CONNECTED_EVENT_ID,
            name: `${PLUGIN_NAME}: Connected`,
            description: "When Firebot connects to Meld Studio"
        },
        {
            id: DISCONNECTED_EVENT_ID,
            name: `${PLUGIN_NAME}: Disconnected`,
            description: "When Firebot is disconnected from Meld Studio"
        },
        {
            id: STREAMING_STARTED_EVENT_ID,
            name: `${PLUGIN_NAME}: Streaming Started`,
            description: "When streaming has started in Meld Studio"
        },
        {
            id: STREAMING_STOPPED_EVENT_ID,
            name: `${PLUGIN_NAME}: Streaming Stopped`,
            description: "When streaming has stopped in Meld Studio"
        },
        {
            id: RECORDING_STARTED_EVENT_ID,
            name: `${PLUGIN_NAME}: Recording Started`,
            description: "When recording has started in Meld Studio"
        },
        {
            id: RECORDING_STOPPED_EVENT_ID,
            name: `${PLUGIN_NAME}: Recording Stopped`,
            description: "When recording has stopped in Meld Studio"
        },
        {
            id: SCENE_CHANGED_EVENT_ID,
            name: `${PLUGIN_NAME}: Scene Changed`,
            description: "When the scene is changed in Meld Studio"
        },
        {
            id: STAGED_SCENE_CHANGED_EVENT_ID,
            name: `${PLUGIN_NAME}: Staged Scene Changed`,
            description: "When the staged scene is changed in Meld Studio"
        },
        {
            id: TRACK_MUTED_EVENT_ID,
            name: `${PLUGIN_NAME}: Audio Track Muted`,
            description: "When an audio track is muted in Meld Studio"
        },
        {
            id: TRACK_UNMUTED_EVENT_ID,
            name: `${PLUGIN_NAME}: Audio Track Unmuted`,
            description: "When an audio track is unmuted in Meld Studio"
        },
        {
            id: TRACK_VOLUME_CHANGED_EVENT_ID,
            name: `${PLUGIN_NAME}: Audio Track Volume Changed`,
            description: "When an audio track's volume changes in Meld Studio"
        },
        {
            id: TRACK_MONITORING_CHANGED_EVENT_ID,
            name: `${PLUGIN_NAME}: Audio Track Monitoring Changed`,
            description: "When an audio track's monitoring state changes in Meld Studio"
        },
    ]
}

export function getAllEvents(): string[] {
    return MeldEventSource.events.reduce((out, e) => {
        out.push(`${EVENT_SOURCE_ID}:${e.id}`);
        return out;
    }, [] as string[]);
}

export function getEventsMatchingPrefix(prefix: string): string[] {
    return MeldEventSource.events.reduce((out, e) => {
        if (e.id.startsWith(prefix)) {
            out.push(`${EVENT_SOURCE_ID}:${e.id}`);
        }
        return out;
    }, [] as string[]);
}