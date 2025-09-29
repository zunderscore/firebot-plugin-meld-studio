import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const TakeScreenshotEffect: Effects.EffectType<{
    vertical: boolean
}> = {
    definition: {
        id: `${PLUGIN_ID}:take-screenshot`,
        name: `${PLUGIN_NAME}: Take Screenshot`,
        description: "Take a screenshot in Meld Studio",
        icon: "fad fa-camera-retro",
        categories: ["common"]
    },
    optionsTemplate: `
    <eos-container header="Screenshot Options">
        <firebot-checkbox
            model="effect.vertical"
            label="Vertical"
            tooltip="Whether or not you want to take a screenshot of the vertical canvas."
        />
        <div ng-if="effect.vertical === true" class="muted">
            Note: If there are no vertical scenes, the screenshot will be standard landscape orientation.
        </div>
    </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.effect.vertical = $scope.effect.vertical === true;
    },
    getDefaultLabel: (effect) => {
        return effect.vertical === true ? "Vertical" : "Standard";
    },
    onTriggerEvent: async (event) => {
        MeldRemote.takeScreenshot(event.effect.vertical === true);
        return true;
    }
}