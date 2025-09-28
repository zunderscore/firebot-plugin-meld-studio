export const PLUGIN_ID = "meld";
export const PLUGIN_NAME = "Meld Studio";

export const VARIABLE_PREFIX = PLUGIN_ID;

export const FILTER_PREFIX = PLUGIN_ID;

export const EVENT_SOURCE_ID = PLUGIN_ID;

export const CONNECTED_EVENT_ID = "connected";
export const DISCONNECTED_EVENT_ID = "disconnected";
export const STREAMING_STARTED_EVENT_ID = "streaming-started";
export const STREAMING_STOPPED_EVENT_ID = "streaming-stopped";
export const RECORDING_STARTED_EVENT_ID = "recording-started";
export const RECORDING_STOPPED_EVENT_ID = "recording-stopped";
export const SCENE_CHANGED_EVENT_ID = "scene-changed";
export const STAGED_SCENE_CHANGED_EVENT_ID = "staged-scene-changed";
export const TRACK_MUTED_EVENT_ID = "track-muted";
export const TRACK_UNMUTED_EVENT_ID = "track-unmuted";
export const TRACK_VOLUME_CHANGED_EVENT_ID = "track-volume-changed";

export const GET_CONNECTED_FRONTEND_COMMAND = `${PLUGIN_ID}:get-connected`;
export const GET_SCENE_LIST_FRONTEND_COMMAND = `${PLUGIN_ID}:get-scene-list`;
export const GET_SCENE_LIST_WITH_LAYERS_FRONTEND_COMMAND = `${PLUGIN_ID}:get-scene-list-with-layers`;
export const GET_LAYER_LIST_FRONTEND_COMMAND = `${PLUGIN_ID}:get-layer-list`;
export const GET_LAYER_LIST_FOR_SCENE_FRONTEND_COMMAND = `${PLUGIN_ID}:get-layer-list-for-scene`;
export const GET_TRACK_LIST_FRONTEND_COMMAND = `${PLUGIN_ID}:get-track-list`;
export const GET_IMAGE_LAYERS_FRONTEND_COMMAND = `${PLUGIN_ID}:get-image-layers`;
export const GET_MEDIA_LAYERS_FRONTEND_COMMAND = `${PLUGIN_ID}:get-media-layers`;
export const GET_BROWSER_LAYERS_FRONTEND_COMMAND = `${PLUGIN_ID}:get-browser-layers`;
export const GET_AUDIO_TRACKS_FRONTEND_COMMAND = `${PLUGIN_ID}:get-audio-tracks`;