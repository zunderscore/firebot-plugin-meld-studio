import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const StopStreamingEffect: Effects.EffectType<{}> = {
    definition: {
        id: `${PLUGIN_ID}:stop-streaming`,
        name: `${PLUGIN_NAME}: Stop Streaming`,
        description: "Stop streaming in Meld Studio",
        icon: "fad fa-stop-circle",
        categories: ["integrations", "scripting"]
    },
    optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>Warning!</b> When this effect is activated, Firebot will tell Meld Studio to stop streaming.
      </div>
    </eos-container>
    `,
    onTriggerEvent: async () => {
        MeldRemote.stopStreaming();
        return true;
    }
}