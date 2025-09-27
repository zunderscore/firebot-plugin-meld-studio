import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const ShowReplayEffect: Effects.EffectType<{}> = {
    definition: {
        id: `${PLUGIN_ID}:show-replay`,
        name: `${PLUGIN_NAME}: Show Replay`,
        description: "Shows a replay in Meld Studio",
        icon: "fad fa-redo",
        categories: ["common"]
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info">
                This will show a replay in Meld Studio
            </div>
        </eos-container>
    `,
    onTriggerEvent: async () => {
        MeldRemote.showReplay();
        return true;
    }
}