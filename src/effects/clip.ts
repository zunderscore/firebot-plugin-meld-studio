import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const ClipEffect: Effects.EffectType<{}> = {
    definition: {
        id: `${PLUGIN_ID}:clip`,
        name: `${PLUGIN_NAME}: Record Clip`,
        description: "Record a clip in Meld Studio",
        icon: "fad fa-film",
        categories: ["common"]
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info">
                This will record a clip in Meld Studio
            </div>
        </eos-container>
    `,
    onTriggerEvent: async () => {
        MeldRemote.recordClip();
        return true;
    }
}