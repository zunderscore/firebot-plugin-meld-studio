import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const ToggleVirtualCameraEffect: Effects.EffectType<{}> = {
    definition: {
        id: `${PLUGIN_ID}:toggle-virtual-camera`,
        name: `${PLUGIN_NAME}: Toggle Virtual Camera`,
        description: "Toggles the virtual camera in Meld Studio",
        icon: "fad fa-camera",
        categories: ["common"]
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info">
                This will toggle the virtual camera state in Meld Studio.
            </div>
            <div class="effect-info alert alert-warning">
                <strong>NOTE</strong>: The Virtual Camera must be installed in Meld Studio in order for this to work.
            </div>
        </eos-container>
    `,
    onTriggerEvent: async () => {
        MeldRemote.toggleVirtualCamera();
        return true;
    }
}