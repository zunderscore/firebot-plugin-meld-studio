import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import ReconnectingWebSocket from "reconnecting-websocket";
import { PluginLogger } from "../plugin-logger";
import { QWebChannel } from "./qwebchannel";
import {
    EVENT_SOURCE_ID,
    CONNECTED_EVENT_ID,
    DISCONNECTED_EVENT_ID,
    STREAMING_STARTED_EVENT_ID,
    STREAMING_STOPPED_EVENT_ID,
    RECORDING_STARTED_EVENT_ID,
    RECORDING_STOPPED_EVENT_ID,
    SCENE_CHANGED_EVENT_ID,
    STAGED_SCENE_CHANGED_EVENT_ID,
    TRACK_MUTED_EVENT_ID,
    TRACK_UNMUTED_EVENT_ID,
    TRACK_VOLUME_CHANGED_EVENT_ID,
    TRACK_MONITORING_CHANGED_EVENT_ID,
} from "../constants";

interface RemoteParams {
    ipAddress: string;
    port: number;
}

class MeldRemote {
    private _ipAddress: string = "127.0.0.1";
    private _port: number = 13376;
    private _connected = false;
    private _ws: ReconnectingWebSocket;
    private _webChannel: QWebChannel;
    private _eventManager: ScriptModules["eventManager"];
    private _cachedSessionItems: MeldStudioSessionItemWithId[];
    private _shuttingDown = false;
    
    meld: MeldStudio;

    private buildSessionItemObject(items: Record<string, MeldStudioSessionItem>): MeldStudioSessionItemWithId[] {
        const newItems = Object.entries(items ?? {})
            .map(i => ({
                id: i[0],
                ...i[1]
            }))

        return JSON.parse(JSON.stringify(newItems));
    }

    setupRemote(
        eventManager: ScriptModules["eventManager"],
        { ipAddress, port }: RemoteParams
    ): void {
        this._eventManager = eventManager;
        this._ipAddress = ipAddress;
        this._port = port;

        this._ws = new ReconnectingWebSocket(() => `ws://${this._ipAddress}:${this._port}`);

        this._ws.onclose = () => {
            if (this._shuttingDown !== true && this._connected === true) {
                this._connected = false;
                this._eventManager.triggerEvent(
                    EVENT_SOURCE_ID,
                    DISCONNECTED_EVENT_ID,
                    { }
                );
            }
        }
        
        this._ws.onopen = () => {
            this._webChannel = new QWebChannel(this._ws, (channel) => {
                PluginLogger.logDebug("Connected to Meld Studio");
                this.meld = channel.objects.meld;
                this._cachedSessionItems = this.buildSessionItemObject(this.meld.session.items);

                this.setupListeners();

                this._connected = true;
                this._eventManager.triggerEvent(
                    EVENT_SOURCE_ID,
                    CONNECTED_EVENT_ID,
                    { }
                );
            });
        };
    }

    shutdown(): void {
        this._shuttingDown = true;
        this._webChannel = undefined;
        this._ws.close();
        this._ws = undefined;
        this.meld = undefined;
    }

    setupListeners(): void {
        this.meld.sessionChanged.connect(() => {
            PluginLogger.logDebug("Received SessionChanged event from Meld");

            // Build new session object
            const newSessionObject = this.buildSessionItemObject(this.meld.session.items);

            // Check for new active scene
            const newActiveScene = this.getActiveScene();
            const previousActiveScene = this._cachedSessionItems
                .find(i => i.type === "scene" && i.current === true);
            if (newActiveScene.id !== previousActiveScene?.id
            ) {
                this._eventManager.triggerEvent(
                    EVENT_SOURCE_ID,
                    SCENE_CHANGED_EVENT_ID,
                    {
                        scene: newActiveScene
                    }
                )
            }

            // Check for new staged scene
            const newStagedScene = this.getStagedScene();
            const previousStagedScene = this._cachedSessionItems
                .find(i => i.type === "scene" && i.staged === true);

            if ((newStagedScene && !previousStagedScene)
                || (!newStagedScene && previousStagedScene)
                && newStagedScene?.id !== previousStagedScene?.id
            ) {
                this._eventManager.triggerEvent(
                    EVENT_SOURCE_ID,
                    STAGED_SCENE_CHANGED_EVENT_ID,
                    {
                        scene: newStagedScene
                    }
                )
            }

            // Check for track updates
            for (const track of newSessionObject.filter(t => t.type === "track"))
            {
                const existingTrack = this._cachedSessionItems
                    .find(t => t.id === track.id) as MeldStudioSessionTrackWithId;
                
                if (existingTrack) {
                    if (existingTrack.muted !== track.muted) {
                        this._eventManager.triggerEvent(
                            EVENT_SOURCE_ID,
                            track.muted === true ? TRACK_MUTED_EVENT_ID : TRACK_UNMUTED_EVENT_ID,
                            {
                                trackName: track.name,
                                trackId: track.id
                            }
                        );
                    }

                    if (existingTrack.monitoring !== track.monitoring) {
                        this._eventManager.triggerEvent(
                            EVENT_SOURCE_ID,
                            TRACK_MONITORING_CHANGED_EVENT_ID,
                            {
                                trackName: track.name,
                                trackId: track.id,
                                trackMonitoring: track.monitoring
                            }
                        );
                    }
                }
            }

            // Copy session data to the cache
            this._cachedSessionItems = newSessionObject;
        });

        this.meld.isStreamingChanged.connect(() => {
            PluginLogger.logDebug("Received IsStreamingChanged event from Meld");
            this._eventManager.triggerEvent(
                EVENT_SOURCE_ID,
                this.meld.isStreaming === true ? STREAMING_STARTED_EVENT_ID : STREAMING_STOPPED_EVENT_ID,
                { }
            );
        });
        
        this.meld.isRecordingChanged.connect(() => {
            PluginLogger.logDebug("Received IsRecordingChanged event from Meld");
            this._eventManager.triggerEvent(
                EVENT_SOURCE_ID,
                this.meld.isRecording === true ? RECORDING_STARTED_EVENT_ID : RECORDING_STOPPED_EVENT_ID,
                { }
            );
        });

        this.meld.gainUpdated.connect((trackId, gain, muted) => {
            PluginLogger.logDebug("Received GainUpdated event from Meld");
            const track = this.getAllTracks().find(t => t.id === trackId);

            this._eventManager.triggerEvent(
                EVENT_SOURCE_ID,
                TRACK_VOLUME_CHANGED_EVENT_ID,
                {
                    trackName: track?.name,
                    trackId,
                    volume: gain
                }
            );
        });
    }

    isConnected(): boolean {
        return this._connected;
    }

    updateParams({ ipAddress, port }: { ipAddress: string, port: number }): void {
        this._ipAddress = ipAddress;
        this._port = port;
    }

    // ------------- STREAM ---------------

    startStreaming(): void {
        PluginLogger.logDebug("Starting streaming");
        this.meld.sendCommand("meld.startStreamingAction");
    }

    stopStreaming(): void {
        PluginLogger.logDebug("Stopping streaming");
        this.meld.sendCommand("meld.stopStreamingAction");
    }

    toggleStream(): void {
        PluginLogger.logDebug("Toggling streaming state");
        this.meld.sendCommand("meld.toggleStreamingAction");
    }

    // ------------- RECORD ---------------

    startRecording(): void {
        PluginLogger.logDebug("Starting recording");
        this.meld.sendCommand("meld.startRecordingAction");
    }

    stopRecording(): void {
        PluginLogger.logDebug("Stopping recording");
        this.meld.sendCommand("meld.stopRecordingAction");
    }

    toggleRecord(): void {
        PluginLogger.logDebug("Toggling recording state");
        this.meld.sendCommand("meld.toggleRecordingAction");
    }

    // ------------- SCENES ---------------

    showSceneById(sceneId: string): void {
        PluginLogger.logDebug(`Showing scene with ID ${sceneId}`);
        const scene = this.getAllScenes().find(s => s.id === sceneId);

        if (!scene) {
            PluginLogger.logWarn(`Cannot find scene with ID ${sceneId}`);
            return;
        }

        this.meld.showScene(scene.id);
    }

    showSceneByName(sceneName: string): void {
        PluginLogger.logDebug(`Showing scene ${sceneName}`);
        const scene = this.getAllScenes().find(s => s.name === sceneName);

        if (!scene) {
            PluginLogger.logWarn(`Cannot find scene named ${sceneName}`);
            return;
        }

        this.meld.showScene(scene.id);
    }

    stageSceneById(sceneId: string): void {
        PluginLogger.logDebug(`Staging scene with ID ${sceneId}`);
        const scene = this.getAllScenes().find(s => s.id === sceneId);

        if (!scene) {
            PluginLogger.logWarn(`Cannot find scene with ID ${sceneId}`);
            return;
        }

        this.meld.setStagedScene(scene.id);
    }

    stageSceneByName(sceneName: string): void {
        PluginLogger.logDebug(`Staging scene ${sceneName}`);
        const scene = this.getAllScenes().find(s => s.name === sceneName);

        if (!scene) {
            PluginLogger.logWarn(`Cannot find scene named ${sceneName}`);
            return;
        }

        this.meld.setStagedScene(scene.id);
    }

    showStagedScene(): void {
        PluginLogger.logDebug("Showing staged scene");
        this.meld.showStagedScene();
    }
    
    // ------------- LAYERS ---------------

    toggleLayerVisibility(sceneId: string, layerId: string): void {
        PluginLogger.logDebug(`Toggling visibility for layer ID ${layerId} in scene ID ${sceneId}`);
        this.meld.toggleLayer(sceneId, layerId);
    }

    setLayerVisibility(layerId: string, visible = true): void {
        PluginLogger.logDebug(`${visible === true  ? "Showing" : "Hiding"} layer ID ${layerId}`);
        this.meld.setProperty(layerId, "visible", visible);
    }

    playMediaLayer(layerId: string): void {
        PluginLogger.logDebug(`Playing media on layer ID ${layerId}`);
        this.meld.callFunction(layerId, "play");
    }

    pauseMediaLayer(layerId: string): void {
        PluginLogger.logDebug(`Pausing media on layer ID ${layerId}`);
        this.meld.callFunction(layerId, "pause");
    }

    seekMediaLayer(layerId: string, seconds: number): void {
        PluginLogger.logDebug(`Seeking media on layer ID ${layerId} to ${seconds} seconds`);
        this.meld.callFunctionWithArgs(layerId, "seek", [seconds]);
    }

    // ------------- AUDIO TRACKS ---------------

    private _setTrackMute(
        track: MeldStudioSessionTrackWithId,
        mute: boolean | "toggle"
    ): void {
        if (mute === "toggle") {
            this.meld.toggleMute(track.id);
        } else {
            this.meld.setMuted(track.id, mute);
        }
    }

    setTrackMuteById(trackId: string, mute: boolean | "toggle" = true): void {
        PluginLogger.logDebug(`${mute === "toggle"
            ? "Toggling mute for"
            : (mute === true ? "Muting" : "Unmuting")} track with ID ${trackId}`);
        const track = this.getAllTracks().find(s => s.id === trackId);

        if (!track) {
            PluginLogger.logWarn(`Cannot find track with ID ${trackId}`);
            return;
        }

        this._setTrackMute(track, mute);
    }

    setTrackMuteByName(trackName: string, mute: boolean | "toggle" = true): void {
        PluginLogger.logDebug(`${mute === "toggle"
            ? "Toggling mute for"
            : (mute === true ? "Muting" : "Unmuting")} track ${trackName}`);
        const track = this.getAllTracks().find(s => s.name === trackName);

        if (!track) {
            PluginLogger.logWarn(`Cannot find track named ${trackName}`);
            return;
        }

        this._setTrackMute(track, mute);
    }

    private _setTrackMonitor(
        track: MeldStudioSessionTrackWithId,
        monitor: boolean | "toggle"
    ): void {
        if (monitor === "toggle") {
            this.meld.toggleMonitor(track.id);
        } else {
            this._setObjectProperty(track.id, "monitoring", monitor);
        }
    }

    setTrackMonitoringById(trackId: string, monitor: boolean | "toggle"): void {
        PluginLogger.logDebug(`${monitor === "toggle"
            ? "Toggling"
            : (monitor === true ? "Enabling" : "Disabling")} monitoring on track with ID ${trackId}`);
        const track = this.getAllTracks().find(s => s.id === trackId);

        if (!track) {
            PluginLogger.logWarn(`Cannot find track with ID ${trackId}`);
            return;
        }

        this._setTrackMonitor(track, monitor);
    }

    setTrackMonitoringByName(trackName: string, monitor: boolean | "toggle"): void {
        PluginLogger.logDebug(`${monitor === "toggle"
            ? "Toggling"
            : (monitor === true ? "Enabling" : "Disabling")} monitoring on track ${trackName}`);
        const track = this.getAllTracks().find(s => s.name === trackName);

        if (!track) {
            PluginLogger.logWarn(`Cannot find track named ${trackName}`);
            return;
        }

        this._setTrackMonitor(track, monitor);
    }

    // ------------- MISC ACTIONS ---------------

    takeScreenshot(vertical = false): void {
        if (vertical === true && this.getAllScenes().some(s => s.vertical === true)) {
            PluginLogger.logDebug("Taking vertical screenshot");
            this.meld.sendCommand("meld.screenshot.vertical");
        } else {
            PluginLogger.logDebug("Taking screenshot");
            this.meld.sendCommand("meld.screenshot");
        }
    }

    recordClip(): void {
        PluginLogger.logDebug("Recording clip");
        this.meld.sendCommand("meld.recordClip");
    }

    toggleVirtualCamera(): void {
        PluginLogger.logDebug("Toggling virtual camera");
        this.meld.sendCommand("meld.toggleVirtualCameraAction");
    }

    showReplay(): void {
        PluginLogger.logDebug("Showing replay");
        this.meld.sendCommand("meld.replay.show");
    }

    dismissReplay(): void {
        PluginLogger.logDebug("Dismissing replay");
        this.meld.sendCommand("meld.replay.dismiss");
    }

    private _setObjectProperty(objectId: string, propertyName: string, value: any): void {
        PluginLogger.logDebug(`Setting object ${objectId} property ${propertyName} to ${value}`);
        this.meld.setProperty(objectId, propertyName, value);
    }

    // ------------- GETTERS ---------------

    private _getSessionItems(type?: MeldStudioSessionItemType): MeldStudioSessionItemWithId[] {
        const items = Object.entries(this.meld?.session?.items ?? {})
            .map((item) => ({
                id: item[0],
                ...item[1]
            }));

        if (type != null) {
            return items.filter(i => i.type === type);
        }

        return items;
    }

    getAllScenes(): MeldStudioSessionSceneWithId[] {
        return this._getSessionItems("scene") as MeldStudioSessionSceneWithId[];
    }

    getActiveScene(): MeldStudioSessionSceneWithId {
        return this.getAllScenes().find(s => s.current === true);
    }

    getStagedScene(): MeldStudioSessionSceneWithId {
        return this.getAllScenes().find(s => s.staged === true);
    }

    getScenesWithLayers(): MeldStudioSceneWithLayers[] {
        const scenes = this.getAllScenes() as MeldStudioSceneWithLayers[];

        for (const scene of scenes) {
            scene.layers = this.getLayersForScene(scene.id);
        }

        return scenes;
    }

    getAllLayers(): MeldStudioSessionLayerWithId[] {
        return this._getSessionItems("layer") as MeldStudioSessionLayerWithId[];
    }

    getLayersForScene(sceneId: string): MeldStudioSessionLayerWithId[] {
        return this.getAllLayers().filter(l => l.parent === sceneId);
    }

    getImageSources(): MeldStudioSessionItemWithId[] {
        return this.getAllLayers().filter(l => l.source != null);
    }

    getMediaSources(): MeldStudioSessionItemWithId[] {
        return this.getAllLayers().filter(l => l.mediaSource != null);
    }

    getBrowserSources(): MeldStudioSessionItemWithId[] {
        return this.getAllLayers().filter(l => l.url != null);
    }

    getAllTracks(): MeldStudioSessionTrackWithId[] {
        return this._getSessionItems("track") as MeldStudioSessionTrackWithId[];
    }
}

const meldRemote = new MeldRemote();

export { meldRemote as MeldRemote };