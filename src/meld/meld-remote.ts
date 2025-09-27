import { EventManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import ReconnectingWebSocket from "reconnecting-websocket";
import { PluginLogger } from "../plugin-logger";
import { QWebChannel } from "./qwebchannel";
import {
    EVENT_SOURCE_ID,
    STREAMING_STARTED_EVENT_ID,
    STREAMING_STOPPED_EVENT_ID,
    RECORDING_STARTED_EVENT_ID,
    RECORDING_STOPPED_EVENT_ID,
} from "../constants";

interface RemoteParams {
    ipAddress: string;
    port: number;
}

class MeldRemote {
    private _ipAddress: string = "127.0.0.1";
    private _port: number = 13376;
    private _ws: ReconnectingWebSocket;
    private _webChannel: QWebChannel;
    private _meld: MeldStudio;
    private _eventManager: EventManager;

    setupRemote(
        eventManager: EventManager,
        { ipAddress, port }: RemoteParams
    ): void {
        this._eventManager = eventManager;
        this._ipAddress = ipAddress;
        this._port = port;

        this._ws = new ReconnectingWebSocket(() => `ws://${this._ipAddress}:${this._port}`);
        
        this._ws.onopen = () => {
            this._webChannel = new QWebChannel(this._ws, (channel) => {
                PluginLogger.logDebug("Connected to Meld Studio");
                this._meld = channel.objects.meld;

                this.setupListeners();
            });
        };
    }

    setupListeners(): void {
        this._meld.isStreamingChanged.connect(() => {
            PluginLogger.logDebug("Received IsStreamingChanged event from Meld");
            this._eventManager.triggerEvent(
                EVENT_SOURCE_ID,
                this._meld.isStreaming === true ? STREAMING_STARTED_EVENT_ID : STREAMING_STOPPED_EVENT_ID,
                { }
            );
        });
        
        this._meld.isRecordingChanged.connect(() => {
            PluginLogger.logDebug("Received IsRecordingChanged event from Meld");
            this._eventManager.triggerEvent(
                EVENT_SOURCE_ID,
                this._meld.isRecording === true ? RECORDING_STARTED_EVENT_ID : RECORDING_STOPPED_EVENT_ID,
                { }
            );
        });
    }

    updateParams({ ipAddress, port }: { ipAddress: string, port: number }): void {
        this._ipAddress = ipAddress;
        this._port = port;
    }

    startStreaming(): void {
        PluginLogger.logDebug("Starting streaming");
        this._meld.sendCommand("meld.startStreamingAction");
    }

    stopStreaming(): void {
        PluginLogger.logDebug("Stopping streaming");
        this._meld.sendCommand("meld.stopStreamingAction");
    }

    toggleStream(): void {
        PluginLogger.logDebug("Toggling streaming state");
        this._meld.sendCommand("meld.toggleStreamingAction");
    }

    startRecording(): void {
        PluginLogger.logDebug("Starting recording");
        this._meld.sendCommand("meld.startRecordingAction");
    }

    stopRecording(): void {
        PluginLogger.logDebug("Stopping recording");
        this._meld.sendCommand("meld.stopRecordingAction");
    }

    toggleRecord(): void {
        PluginLogger.logDebug("Toggling recording state");
        this._meld.sendCommand("meld.toggleRecordingAction");
    }
}

const meldRemote = new MeldRemote();

export { meldRemote as MeldRemote };