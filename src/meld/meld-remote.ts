import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import ReconnectingWebSocket from "reconnecting-websocket";
import { PluginLogger } from "../plugin-logger";
import { QWebChannel } from "./qwebchannel";
import {
    EVENT_SOURCE_ID,
    STREAMING_STARTED_EVENT_ID,
    STREAMING_STOPPED_EVENT_ID,
    RECORDING_STARTED_EVENT_ID,
    RECORDING_STOPPED_EVENT_ID,
    SCENE_CHANGED_EVENT_ID,
    CONNECTED_EVENT_ID,
    DISCONNECTED_EVENT_ID,
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
            if (this._connected === true) {
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

    setupListeners(): void {
        this.meld.sessionChanged.connect(() => {
            PluginLogger.logDebug("Received SessionChanged event from Meld");

            // Build new session object
            const newSessionObject = this.buildSessionItemObject(this.meld.session.items);

            // Check for new scene
            const newCurrentScene = this.getCurrentScene();
            const previousCurrentScene = this._cachedSessionItems
                .find(i => i.type === "scene" && i.current === true);
            if (newCurrentScene.id !== previousCurrentScene?.id
            ) {
                this._eventManager.triggerEvent(
                    EVENT_SOURCE_ID,
                    SCENE_CHANGED_EVENT_ID,
                    { }
                )
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
    }

    isConnected(): boolean {
        return this._connected;
    }

    updateParams({ ipAddress, port }: { ipAddress: string, port: number }): void {
        this._ipAddress = ipAddress;
        this._port = port;
    }

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

    takeScreenshot(vertical = false): void {
        if (vertical === true) {
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

    showSceneById(sceneId: string): void {
        PluginLogger.logDebug(`Showing scene with ID ${sceneId}`);
        const scene = this.getSessionItems("scene").find(s => s.id === sceneId);

        if (!scene) {
            PluginLogger.logWarn(`Cannot find scene with ID ${sceneId}`);
            return;
        }

        this.meld.showScene(scene.id);
    }

    showSceneByName(sceneName: string): void {
        PluginLogger.logDebug(`Showing scene ${sceneName}`);
        const scene = this.getSessionItems("scene").find(s => s.name === sceneName);

        if (!scene) {
            PluginLogger.logWarn(`Cannot find scene named ${sceneName}`);
            return;
        }

        this.meld.showScene(scene.id);
    }

    stageSceneById(sceneId: string): void {
        PluginLogger.logDebug(`Staging scene with ID ${sceneId}`);
        const scene = this.getSessionItems("scene").find(s => s.id === sceneId);

        if (!scene) {
            PluginLogger.logWarn(`Cannot find scene with ID ${sceneId}`);
            return;
        }

        this.meld.setStagedScene(scene.id);
    }

    stageSceneByName(sceneName: string): void {
        PluginLogger.logDebug(`Staging scene ${sceneName}`);
        const scene = this.getSessionItems("scene").find(s => s.name === sceneName);

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

    playMediaLayer(layerId: string) {
        PluginLogger.logDebug(`Playing media on layer ID ${layerId}`);
        this.meld.callFunction(layerId, "play");
    }

    pauseMediaLayer(layerId: string) {
        PluginLogger.logDebug(`Pausing media on layer ID ${layerId}`);
        this.meld.callFunction(layerId, "pause");
    }

    seekMediaLayer(layerId: string, seconds: number) {
        PluginLogger.logDebug(`Seeking media on layer ID ${layerId} to ${seconds} seconds`);
        this.meld.callFunctionWithArgs(layerId, "seek", [seconds]);
    }

    setObjectVisibility(objectId: string, visible = true) {
        PluginLogger.logDebug(`${visible === true  ? "Showing" : "Hiding"} object ${objectId}`);
        this.meld.setProperty(objectId, "visible", visible);
    }

    setProperty(objectId: string, propertyName: string, value: any) {
        PluginLogger.logDebug(`Setting object ${objectId} property ${propertyName} to ${value}`);
        this.meld.setProperty(objectId, propertyName, value);
    }

    getSessionItems(type?: MeldStudioSessionItemType): MeldStudioSessionItemWithId[] {
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

    getImageSources(): MeldStudioSessionItemWithId[] {
        return this.getSessionItems("layer")
            .filter(i => (i as MeldStudioSessionLayer).source != null);
    }

    getMediaSources(): MeldStudioSessionItemWithId[] {
        return this.getSessionItems("layer")
            .filter(i => (i as MeldStudioSessionLayer).mediaSource != null);
    }

    getBrowserSources(): MeldStudioSessionItemWithId[] {
        return this.getSessionItems("layer")
            .filter(i => (i as MeldStudioSessionLayer).url != null);
    }

    getCurrentScene(): MeldStudioSessionSceneWithId {
        return this.getSessionItems("scene")
            .find(s => (s as MeldStudioSessionSceneWithId).current === true) as MeldStudioSessionSceneWithId;
    }

    getSceneLayers(sceneId: string): MeldStudioSessionLayerWithId[] {
        return this.getSessionItems("layer")
            .filter(l => l.parent === sceneId) as MeldStudioSessionLayerWithId[];
    }
}

const meldRemote = new MeldRemote();

export { meldRemote as MeldRemote };