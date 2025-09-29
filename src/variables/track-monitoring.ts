import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import {
    VARIABLE_PREFIX,
    EVENT_SOURCE_ID,
    TRACK_MONITORING_CHANGED_EVENT_ID,
} from "../constants";

export const TrackMonitoringVariable: ReplaceVariable = {
    definition: {
        handle: `${VARIABLE_PREFIX}TrackMonitoring`,
        description: "`true` if the audio track is being monitored in Meld Studio, or `false` otherwise.",
        possibleDataOutput: [ "text" ],
        categories: [ "common" ],
        triggers: {
            event: [
                `${EVENT_SOURCE_ID}:${TRACK_MONITORING_CHANGED_EVENT_ID}`,
            ],
            manual: true
        }
    },
    evaluator: async (trigger) => {
        return trigger.metadata.eventData.trackMonitoring ?? false;
    }
};