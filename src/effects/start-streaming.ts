import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const StartStreamingEffect: Effects.EffectType<{}> = {
    definition: {
        id: `${PLUGIN_ID}:start-streaming`,
        name: `${PLUGIN_NAME}: Start Streaming`,
        description: "Start streaming in Meld Studio",
        icon: "fad fa-play-circle",
        categories: ["common"]
    },
    optionsTemplate: `
    <eos-container>
        <div class="effect-info alert alert-warning">
            <b>Warning!</b> When this effect is activated, Firebot will tell Meld Studio to start streaming.
        </div>
    </eos-container>
    `,
    onTriggerEvent: async () => {
        MeldRemote.startStreaming();
        return true;
    }
}