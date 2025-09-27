import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { VARIABLE_PREFIX } from "../constants";
import { getAllEvents } from "../events";
import { MeldRemote } from "../meld/meld-remote";

export const SceneNameVariable: ReplaceVariable = {
    definition: {
        handle: `${VARIABLE_PREFIX}SceneName`,
        description: "The name of the current scene in Meld Studio, or 'Unknown' if Meld Studio isn't running/connected.",
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
        return MeldRemote.getCurrentScene()?.name ?? "Unknown";
    }
};