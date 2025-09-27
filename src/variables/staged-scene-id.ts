import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { VARIABLE_PREFIX } from "../constants";
import { getAllEvents } from "../events";
import { MeldRemote } from "../meld/meld-remote";

export const StagedSceneIdVariable: ReplaceVariable = {
    definition: {
        handle: `${VARIABLE_PREFIX}StagedSceneId`,
        description: "The ID of the currently staged scene in Meld Studio, or 'Unknown' if there isn't one or Meld Studio isn't running/connected.",
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
        return MeldRemote.getStagedScene()?.id ?? "Unknown";
    }
};