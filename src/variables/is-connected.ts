import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { VARIABLE_PREFIX } from "../constants";
import { getAllEvents } from "../events";
import { MeldRemote } from "../meld/meld-remote";

export const IsConnectedVariable: ReplaceVariable = {
    definition: {
        handle: `${VARIABLE_PREFIX}IsConnected`,
        description: "`true` if Meld Studio is currently connected, or `false` otherwise.",
        possibleDataOutput: [ "text" ],
        categories: [ "advanced" ],
        triggers: {
            event: [
                ...getAllEvents()
            ],
            manual: true
        }
    },
    evaluator: async (trigger) => {
        return MeldRemote.isConnected() ?? false;
    }
};