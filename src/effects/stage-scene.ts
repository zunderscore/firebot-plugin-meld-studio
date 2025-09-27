import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

export const StageSceneEffect: Effects.EffectType<{
    sceneName: string,
    sceneId: string
}> = {
    definition: {
        id: `${PLUGIN_ID}:stage-scene`,
        name: `${PLUGIN_NAME}: Stage Scene`,
        description: "Stages a scene in Meld Studio without making it active",
        icon: "fad fa-th-large",
        categories: ["common"]
    },
    optionsTemplate: `
        <eos-container header="Meld Studio Scene">
            <div>
                <button class="btn btn-link" ng-click="getScenes()">Refresh Scenes</button>
            </div>
            <ui-select ng-if="meldConnected === true" ng-model="selected" on-select="selectScene($select.selected)">
                <ui-select-match placeholder="Select a scene...">{{$select.selected.name}}</ui-select-match>
                <ui-select-choices repeat="scene in scenes | filter: {name: $select.search}">
                    <div ng-bind-html="scene.name | highlight: $select.search"></div>
                </ui-select-choices>
                <ui-select-no-choice>
                    <b>No scenes found.</b>
                </ui-select-no-choice>
            </ui-select>

            <div ng-if="meldConnected !== true" class="muted">
                Meld Studio is not connected.
            </div>
        </eos-container>
    `,
    optionsController: ($scope: any, backendCommunicator: any) => {
        $scope.meldConnected = false;
        $scope.scenes = [];

        $scope.selectScene = (scene: MeldStudioSessionSceneWithId) => {
            $scope.effect.sceneName = scene.name;
            $scope.effect.sceneId = scene.id;
        };

        $scope.getScenes = () => {
            $scope.meldConnected = backendCommunicator.fireEventSync("meld:get-connected");
            $scope.scenes = backendCommunicator.fireEventSync("meld:get-scene-list");

            let selected = $scope.scenes.find((s: MeldStudioSessionSceneWithId) => 
                s.id === $scope.effect.sceneId
            );

            if (selected == null) {
                selected = $scope.scenes.find((s: MeldStudioSessionSceneWithId) =>
                    s.name === $scope.effect.sceneName
                );
            }

            $scope.selected = selected;
        };

        $scope.getScenes();
    },
    optionsValidator: (effect) => {
        if (effect.sceneName == null) {
            return ["Please select a scene."];
        }
        return [];
    },
    getDefaultLabel: (effect) => {
        return effect.sceneName;
    },
    onTriggerEvent: async (event) => {
        if (event.effect.sceneId) {
            MeldRemote.stageSceneById(event.effect.sceneId);
        } else {
            MeldRemote.stageSceneByName(event.effect.sceneName);
        }
        return true;
    }
}