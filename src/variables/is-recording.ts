import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { VARIABLE_PREFIX } from "../constants";
import { getAllEvents } from "../events";
import { MeldRemote } from "../meld/meld-remote";

export const IsRecordingVariable: ReplaceVariable = {
    definition: {
        handle: `${VARIABLE_PREFIX}IsRecording`,
        description: "`true` if Meld Studio is currently recording, or `false` otherwise.",
        possibleDataOutput: [ "text" ],
        categories: [ "common" ],
        triggers: {
            event: [
                ...getAllEvents()
            ],
            manual: true
        }
    },
    evaluator: async (trigger) => {
        return MeldRemote.meld?.isRecording ?? false;
    }
};