import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import {
    VARIABLE_PREFIX,
    EVENT_SOURCE_ID,
    TRACK_MUTED_EVENT_ID,
    TRACK_UNMUTED_EVENT_ID,
} from "../constants";

export const TrackNameVariable: ReplaceVariable = {
    definition: {
        handle: `${VARIABLE_PREFIX}TrackName`,
        description: "The name of the track that triggered the event in Meld Studio.",
        possibleDataOutput: [ "text" ],
        categories: [ "common" ],
        triggers: {
            event: [
                `${EVENT_SOURCE_ID}:${TRACK_MUTED_EVENT_ID}`,
                `${EVENT_SOURCE_ID}:${TRACK_UNMUTED_EVENT_ID}`,
            ],
            manual: true
        }
    },
    evaluator: async (trigger) => {
        return trigger.metadata.eventData.trackName;
    }
};