import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const DismissReplayEffect: Effects.EffectType<{}> = {
    definition: {
        id: `${PLUGIN_ID}:dismiss-replay`,
        name: `${PLUGIN_NAME}: Dismiss Replay`,
        description: "Dismisses a replay in Meld Studio",
        icon: "fad fa-video-slash",
        categories: ["common"]
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info">
                This will dismiss a replay in Meld Studio
            </div>
        </eos-container>
    `,
    onTriggerEvent: async () => {
        MeldRemote.dismissReplay();
        return true;
    }
}