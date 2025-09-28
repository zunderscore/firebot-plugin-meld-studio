import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import {
    PLUGIN_ID,
    PLUGIN_NAME
} from "../constants";
import { MeldRemote } from "../meld/meld-remote";

interface EffectSource {
    trackName: string;
    trackId: string;
    action: boolean | "toggle";
}

export const ToggleTrackMuteEffect: Effects.EffectType<{
    selectedSources: Array<EffectSource>
}> = {
    definition: {
        id: `${PLUGIN_ID}:toggle-track-mute`,
        name: `${PLUGIN_NAME}: Toggle Audio Track Mute`,
        description: "Toggle an audio track's muted status in Meld Studio",
        icon: "fad fa-volume-mute",
        categories: ["common"]
    },
    optionsTemplate: `
        <eos-container ng-show="missingSources.length > 0">
            <div class="effect-info alert alert-warning">
                <p><b>Warning!</b> 
                    Cannot find {{missingSources.length}} sources in this effect. Ensure that Meld Studio is running.
                </p>
            </div>
        </eos-container>

        <setting-container ng-show="missingSources.length > 0" header="Missing Audio Sources ({{missingSources.length}})" collapsed="true">
            <div ng-repeat="tracks in missingSources track by $index">
                <div class="list-item" style="display: flex;border: 2px solid #3e4045;box-shadow: none;border-radius: 8px;padding: 5px 5px;">
                    <div class="pl-5">
                        <span>Audio Track: {{tracks.trackName}}</span>
                    </div>   
                    <div>
                        <button class="btn btn-danger" ng-click="deleteSceneAtIndex($index)"><i class="far fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </setting-container>

        <eos-container header="Audio Sources" pad-top="missingSources.length > 0">
            <firebot-input model="searchText" input-title="Filter" disable-variables="true"></firebot-input>
            <div>
                <button class="btn btn-link" ng-click="getTracks()">Refresh Sources</button>
            </div>
            <div ng-if="tracks != null && tracks.length > 0" ng-repeat="track in tracks | filter: {displayName: searchText}">
                <label class="control-fb control--checkbox">{{track.displayName}}
                    <input type="checkbox" ng-click="toggleSourceSelected(track)" ng-checked="sourceIsSelected(track)"  aria-label="..." >
                    <div class="control__indicator"></div>
                </label>
                <div ng-show="sourceIsSelected(track)" style="margin-bottom: 15px;">
                    <div class="btn-group" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                            {{getSourceActionDisplay(track)}} <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-click="setSourceAction(track, true)"><a href>Mute</a></li>
                            <li role="menuitem" ng-click="setSourceAction(track, false)"><a href>Unmute</a></li>
                            <li role="menuitem" ng-click="setSourceAction(track, 'toggle')"><a href>Toggle</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div ng-if="tracks != null && tracks.length < 1" class="muted">
                No tracks found.
            </div>
            <div ng-if="meldConnected === false" class="muted">
                Is Meld Studio running?
            </div>
        </eos-container>
    `,
    optionsController: ($scope: any, backendCommunicator: any) => {
        $scope.meldConnected = false;
        $scope.tracks = null;
        $scope.missingSources = [];

        if ($scope.effect.selectedSources == null) {
            $scope.effect.selectedSources = [];
        }

        $scope.sourceIsSelected = (track: MeldStudioSessionTrackWithId) => {
            return $scope.effect.selectedSources.some(
                (s: EffectSource) => s.trackId === track.id
            );
        };

        $scope.toggleSourceSelected = (track: MeldStudioSessionTrackWithId) => {
            if ($scope.sourceIsSelected(track)) {
                $scope.effect.selectedSources = $scope.effect.selectedSources.filter(
                    (s: EffectSource) => !(s.trackId === track.id)
                );
            } else {
                $scope.effect.selectedSources.push({
                    trackName: track.name,
                    trackId: track.id,
                    action: true
                });
            }
        };
        
        $scope.setSourceAction = (
            track: MeldStudioSessionTrackWithId,
            action: "toggle" | boolean
        ) => {
            const selectedSource = $scope.effect.selectedSources.find(
                (s: EffectSource) => s.trackId === track.id
            );
            if (selectedSource != null) {
                selectedSource.action = action;
            }
        };

        $scope.getSourceActionDisplay = (track: MeldStudioSessionTrackWithId) => {
            const selectedSource = $scope.effect.selectedSources.find(
                (s: EffectSource) => s.trackId === track.id
            );

            $scope.missingSources = $scope.missingSources
                .filter((i: EffectSource) => i.trackId !== selectedSource.trackId);

            if (selectedSource == null) {
                return "";
            }

            if (selectedSource.action === "toggle") {
                return "Toggle";
            }
            if (selectedSource.action === true) {
                return "Mute";
            }
            return "Unmute";
        };

        $scope.deleteSourceAtIndex = (index: number) => {
            $scope.effect.selectedSources = $scope.effect.selectedSources.filter(
                (s: EffectSource) => s.trackId !== $scope.missingSources[index].id
            );
            $scope.missingSources.splice(index, 1);
        };

        $scope.getStoredData = () => {
            for (const track of $scope.effect.selectedSources) {
                $scope.missingSources.push(track);
            }
        };

        $scope.getTracks = () => {
            $scope.meldConnected = backendCommunicator.fireEventSync("meld:get-connected");
            $scope.tracks = backendCommunicator.fireEventSync("meld:get-track-list");

            const layers: MeldStudioSessionLayerWithId[] = backendCommunicator.fireEventSync("meld:get-layer-list")
            const scenes: MeldStudioSessionSceneWithId[] = backendCommunicator.fireEventSync("meld:get-scene-list");

            for (const track of $scope.tracks) {
                if (track.parent) {
                    const layer = layers.find(l => l.id === track.parent);
                    track.sceneName = scenes.find(s => s.id === track.parent || s.id === layer?.parent)?.name;
                }

                track.displayName = track.sceneName
                    ? `${track.name} (Scene: ${track.sceneName})`
                    : track.name;
            }

            let selected = $scope.tracks.find((s: MeldStudioSessionTrackWithId) => 
                s.id === $scope.effect.trackId
            );

            if (selected == null) {
                selected = $scope.tracks.find((s: MeldStudioSessionTrackWithId) =>
                    s.name === $scope.effect.trackName
                );
            }

            $scope.selected = selected;
        };
        
        $scope.getTracks();
        $scope.getStoredData();
    },
    onTriggerEvent: async ({ effect }) => {
        if (effect.selectedSources == null) {
            return true;
        }

        for (const { trackId, trackName, action } of effect.selectedSources) {
            if (trackId) {
                MeldRemote.setTrackMuteById(trackId, action);
            } else {
                MeldRemote.setTrackMuteByName(trackName, action);
            }
        }
        return true;
    }
}