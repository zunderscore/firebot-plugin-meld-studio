import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import {
    VARIABLE_PREFIX,
    EVENT_SOURCE_ID,
    TRACK_VOLUME_CHANGED_EVENT_ID,
} from "../constants";

export const TrackVolumeVariable: ReplaceVariable = {
    definition: {
        handle: `${VARIABLE_PREFIX}TrackVolume`,
        description: "The new volume level of the track in Meld Studio.",
        possibleDataOutput: [ "number" ],
        categories: [ "common" ],
        triggers: {
            event: [
                `${EVENT_SOURCE_ID}:${TRACK_VOLUME_CHANGED_EVENT_ID}`,
            ],
            manual: true
        }
    },
    evaluator: async (trigger) => {
        return trigger.metadata.eventData.volume ?? 0;
    }
};