import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const StartRecordingEffect: Effects.EffectType<{}> = {
    definition: {
        id: `${PLUGIN_ID}:start-recording`,
        name: `${PLUGIN_NAME}: Start Recording`,
        description: "Start recording in Meld Studio",
        icon: "fad fa-video",
        categories: ["integrations", "scripting"]
    },
    optionsTemplate: `
    <eos-container>
      <div class="effect-info alert alert-warning">
        <b>Warning!</b> When this effect is activated, Firebot will tell Meld Studio to start recording.
      </div>
    </eos-container>
    `,
    onTriggerEvent: async () => {
        MeldRemote.startRecording();
        return true;
    }
}