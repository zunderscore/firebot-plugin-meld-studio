import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import {
    VARIABLE_PREFIX,
    EVENT_SOURCE_ID,
    TRACK_GAIN_CHANGED_EVENT_ID,
} from "../constants";

export const TrackGainVariable: ReplaceVariable = {
    definition: {
        handle: `${VARIABLE_PREFIX}TrackGain`,
        description: "The new gain (volume) level of the track in Meld Studio.",
        possibleDataOutput: [ "number" ],
        categories: [ "common" ],
        triggers: {
            event: [
                `${EVENT_SOURCE_ID}:${TRACK_GAIN_CHANGED_EVENT_ID}`,
            ],
            manual: true
        }
    },
    evaluator: async (trigger) => {
        return trigger.metadata.eventData.gain ?? 0;
    }
};