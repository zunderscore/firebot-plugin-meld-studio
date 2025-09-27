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

type MeldStudioSessionItemWithId = MeldStudioSessionItem & {
    id: string;
}

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
     * Adjusts the gain for an audio track
     * @param trackId ID of the track
     * @param level Gain level
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
     * When the gain or mute status of a track has changed
     */
    gainUpdated: {
        /**
         * Start listening for the event
         * @param callback Callback function to execute when the event triggers
         */
        connect: (callback: (trackId: string, gain: number, muted: boolean) => void) => void;
    }
}