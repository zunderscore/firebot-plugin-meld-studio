import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { VARIABLE_PREFIX } from "../constants";
import { getAllEvents } from "../events";
import { MeldRemote } from "../meld/meld-remote";

export const IsStreamingVariable: ReplaceVariable = {
    definition: {
        handle: `${VARIABLE_PREFIX}IsStreaming`,
        description: "`true` if Meld Studio is currently streaming, or `false` otherwise.",
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
        return MeldRemote.meld?.isStreaming ?? false;
    }
};