import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { MeldRemote } from "./meld/meld-remote";
import {
    GET_SCENE_LIST_FRONTEND_COMMAND,
    GET_LAYER_LIST_FRONTEND_COMMAND,
    GET_LAYER_LIST_FOR_SCENE_FRONTEND_COMMAND,
    GET_IMAGE_LAYERS_FRONTEND_COMMAND,
    GET_MEDIA_LAYERS_FRONTEND_COMMAND,
    GET_BROWSER_LAYERS_FRONTEND_COMMAND,
    GET_AUDIO_TRACKS_FRONTEND_COMMAND,
    GET_CONNECTED_FRONTEND_COMMAND,
} from "./constants";

const registeredFrontendListeners: { id: string, eventName: string }[] = [];

function registerFrontendListener(
    frontendCommunicator: ScriptModules["frontendCommunicator"],
    eventName: string,
    handler: (...args: any[]) => void
): void {
    const id = frontendCommunicator.on(eventName, handler);
    registeredFrontendListeners.push({ id, eventName });
}

function registerAsyncFrontendListener(
    frontendCommunicator: ScriptModules["frontendCommunicator"],
    eventName: string,
    handler: (...args: any[]) => Promise<void>
) {

}

export function registerFrontendListeners(
    frontendCommunicator: ScriptModules["frontendCommunicator"]
) {
    registerFrontendListener(frontendCommunicator, GET_CONNECTED_FRONTEND_COMMAND,
        () => MeldRemote.isConnected()
    );

    registerFrontendListener(frontendCommunicator, GET_SCENE_LIST_FRONTEND_COMMAND,
        () => MeldRemote.getSessionItems("scene")
    );

    registerFrontendListener(frontendCommunicator, GET_LAYER_LIST_FRONTEND_COMMAND,
        () => MeldRemote.getSessionItems("layer")
    );

    registerFrontendListener(frontendCommunicator, GET_LAYER_LIST_FOR_SCENE_FRONTEND_COMMAND,
        (sceneId) => MeldRemote.getSessionItems("layer").filter(l => l.parent === sceneId)
    );

    registerFrontendListener(frontendCommunicator, GET_IMAGE_LAYERS_FRONTEND_COMMAND,
        () => MeldRemote.getImageSources()
    );
    
    registerFrontendListener(frontendCommunicator, GET_MEDIA_LAYERS_FRONTEND_COMMAND,
        () => MeldRemote.getMediaSources()
    );
    
    registerFrontendListener(frontendCommunicator, GET_BROWSER_LAYERS_FRONTEND_COMMAND,
        () => MeldRemote.getBrowserSources()
    );
    
    registerFrontendListener(frontendCommunicator, GET_AUDIO_TRACKS_FRONTEND_COMMAND,
        () => MeldRemote.getSessionItems("track")
    );
}

export function unregisterFrontendListeners(
    frontendCommunicator: ScriptModules["frontendCommunicator"]
) {
    for (const listener of registeredFrontendListeners) {
        frontendCommunicator.off(listener.eventName, listener.id);
    }
}