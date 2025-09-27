import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import {
    PLUGIN_NAME,
    EVENT_SOURCE_ID,
    STREAMING_STARTED_EVENT_ID,
    STREAMING_STOPPED_EVENT_ID,
    RECORDING_STARTED_EVENT_ID,
    RECORDING_STOPPED_EVENT_ID,
} from "../constants";

export const MeldEventSource: EventSource = {
    id: EVENT_SOURCE_ID,
    name: PLUGIN_NAME,
    events: [
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
    ]
}