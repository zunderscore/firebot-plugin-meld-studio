type MeldCommand = 
    | "meld.screenshot"
    | "meld.screenshot.vertical"
    | "meld.startStreamingAction"
    | "meld.stopStreamingAction"
    | "meld.toggleStreamingAction"
    | "meld.startRecordingAction"
    | "meld.stopRecordingAction"
    | "meld.toggleRecordingAction"
    | "meld.toggleVirtualCameraAction"
    | "meld.recordClip"
    | "meld.replay.show"
    | "meld.replay.dismiss"

type MeldStudioSessionItemType =
    | "scene"
    | "track"
    | "layer"
    | "effect";

type MeldStudioSessionItemBase = {
    type: MeldStudioSessionItemType;
    name: string;
}

type MeldStudioSessionScene = MeldStudioSessionItemBase & {
    type: "scene";
    index: number;
    current: boolean;
    staged: boolean;
    vertical: boolean;
    parent: never;
}

type MeldStudioSessionTrack = MeldStudioSessionItemBase & {
    type: "track";
    parent?: string;
    monitoring: boolean;
    muted: boolean;
}

type MeldStudioSessionLayer = MeldStudioSessionItemBase & {
    type: "layer";
    parent: string;
    index: number;
    visible: boolean;
    height: number;
    width: number;
    x: number;
    y: number;
    source: string;
    url: string;
    mediaSource: string;
}

type MeldStudioSessionEffect = MeldStudioSessionItemBase & {
    type: "effect";
    parent: string;
    enabled: boolean;
}

type MeldStudioSessionItem =
    | MeldStudioSessionScene
    | MeldStudioSessionTrack
    | MeldStudioSessionLayer
    | MeldStudioSessionEffect

type MeldStudioSessionSceneWithId = MeldStudioSessionScene & {
    id: string;
}

type MeldStudioSessionTrackWithId = MeldStudioSessionTrack & {
    id: string;
}

type MeldStudioSessionLayerWithId = MeldStudioSessionLayer & {
    id: string;
}

type MeldStudioSessionEffectWithId = MeldStudioSessionEffect & {
    id: string;
}

type MeldStudioSessionItemWithId =
    | MeldStudioSessionSceneWithId
    | MeldStudioSessionTrackWithId
    | MeldStudioSessionLayerWithId
    | MeldStudioSessionEffectWithId

type MeldStudioSession = {
    items: Record<string, MeldStudioSessionItem>;
}

type MeldStudio = {
    /**
     * Meld Studio API version
     */
    version: number;

    /**
     * Whether or not Meld Studio is currently recording
     */
    isRecording: boolean;

    /**
     * Whether or not Meld Studio is currently streaming
     */
    isStreaming: boolean;

    /**
     * Represents the current session state detailing scenes, tracks, layers, and effects
     */
    session: MeldStudioSession;

    /**
     * Toggle the current recording state
     */
    toggleRecord: () => void;

    /**
     * Toggle the current streaming state
     */
    toggleStream: () => void;

    /**
     * Switches to the specified scene
     * @param sceneId ID of the scene to show
     */
    showScene: (sceneId: string) => void;

    /**
     * Prepares a scene for switching without making it live
     * @param sceneId ID of the scene to stage
     */
    setStagedScene: (sceneId: string) => void;

    /**
     * Switches to the prepared staged scene
     */
    showStagedScene: () => void;

    /**
     * Toggles visibility of a layer within a scene
     * @param sceneId ID of the scene
     * @param layerId ID of the layer
     * @returns 
     */
    toggleLayer: (sceneId: string, layerId: string) => void;

    /**
     * Toggles the enabled status of an effect within a layer
     * @param sceneId ID of the scene
     * @param layerId ID of the layer
     * @param effectId ID of the effect
     */
    toggleEffect: (sceneId: string, layerId: string, effectId: string) => void;

    /**
     * Mutes/unmutes the given track
     * @param trackId ID of the track to mute/unmute
     * @param mute `true` to mute the track, `false` to unmute
     */
    setMuted: (trackId: string, mute: boolean) => void;

    /**
     * Toggles mute status of an audio track
     * @param trackId ID of the track to toggle mute
     */
    toggleMute: (trackId: string) => void;

    /**
     * Adjusts the gain/volume for an audio track
     * @param trackId ID of the track
     * @param level Gain/volume level
     */
    setGain: (trackId: string, level: number) => void;

    /**
     * Toggles monitoring status of an audio track
     * @param trackId 
     * @returns 
     */
    toggleMonitor: (trackId: string) => void;

    /**
     * Sends a custom command
     * @param command Command to send
     */
    sendCommand: (command: MeldCommand) => void;

    /**
     * Sends a custom command to a layer
     * @param layerId ID of the layer
     * @param command Command to send
     */
    callFunction: (layerId: string, command: string) => void;

    /**
     * Sends a custom command to a layer with the given arguments
     * @param layerId ID of the layer
     * @param command Command to send
     * @param args Arguments to send
     */
    callFunctionWithArgs: (layerId: string, command: string, args: any[]) => void;

    /**
     * Sets the value of the given property
     * @param objectId ID of the object to update
     * @param propertyName Name of the property to update
     * @param value New value for the property
     */
    setProperty: (objectId: string, propertyName: string, value: any) => void;

    /**
     * Triggered any time the contents of `session` change
     */
    sessionChanged: {
        connect: (callback: () => void) => void;
    }

    /**
     * When the recording state has changed
     */
    isRecordingChanged: {
        connect: (callback: () => void) => void
    };

    /**
     * When the streaming state has changed
     */
    isStreamingChanged: {
        /**
         * Start listening for the event
         * @param callback Callback function to execute when the event triggers
         */
        connect: (callback: () => void) => void
    };

    /**
     * When the gain/volume or mute status of a track has changed
     */
    gainUpdated: {
        /**
         * Start listening for the event
         * @param callback Callback function to execute when the event triggers
         */
        connect: (callback: (trackId: string, gain: number, muted: boolean) => void) => void;
    }
}