import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const StopRecordingEffect: Effects.EffectType<{}> = {
    definition: {
        id: `${PLUGIN_ID}:stop-recording`,
        name: `${PLUGIN_NAME}: Stop Recording`,
        description: "Stop recording in Meld Studio",
        icon: "fad fa-video-slash",
        categories: ["common"]
    },
    optionsTemplate: `
    <eos-container>
        <div class="effect-info alert alert-warning">
            <b>Warning!</b> When this effect is activated, Firebot will tell Meld Studio to stop recording.
        </div>
    </eos-container>
    `,
    onTriggerEvent: async () => {
        MeldRemote.stopRecording();
        return true;
    }
}