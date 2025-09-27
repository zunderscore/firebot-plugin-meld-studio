import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const ShowStagedSceneEffect: Effects.EffectType<{}> = {
    definition: {
        id: `${PLUGIN_ID}:show-staged-scene`,
        name: `${PLUGIN_NAME}: Show Staged Scene`,
        description: "Immediately switches to the staged scene in Meld Studio, if one is staged",
        icon: "fad fa-tv",
        categories: ["common"]
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info alert alert-warning">
                <b>Warning!</b> When this effect is activated, Firebot will tell Meld Studio to immediately switch to the currently staged scene.
            </div>
        </eos-container>
    `,
    onTriggerEvent: async () => {
        MeldRemote.showStagedScene();
        return true;
    }
}