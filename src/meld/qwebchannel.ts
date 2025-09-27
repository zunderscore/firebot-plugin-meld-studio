// Based on qwebchannel.js
// Original can be found here:
// https://github.com/MeldStudio/streamdeck/blob/fdc69eeb026c175ff449b763d02495d82c2bbf3d/co.meldstudio.streamdeck.sdPlugin/libs/js/qwebchannel.js

import ReconnectingWebSocket from "reconnecting-websocket";
import { PluginLogger } from "../plugin-logger";

enum QWebChannelMessageTypes {
    signal = 1,
    propertyUpdate = 2,
    init = 3,
    idle = 4,
    debug = 5,
    invokeMethod = 6,
    connectToSignal = 7,
    disconnectFromSignal = 8,
    setProperty = 9,
    response = 10,
};

export class QWebChannel {
    transport: WebSocket | ReconnectingWebSocket;
    usedConverters: any[] = [];
    execCallbacks: any = {};
    execId = 0;
    objects: any = {};

    private converterRegistry: Record<string, (response: any) => any> = {
        Date: (response: any): Date => {
            if (typeof response === "string"
                && response.match(
                    /^-?\d+-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?([-+\u2212](\d{2}):(\d{2})|Z)?$/)) {
                let date = new Date(response);
                if (!isNaN(date?.getTime()))
                    return date;
            }
            return undefined; // Return undefined if current converter is not applicable
        }
    };

    constructor(
        transport: WebSocket | ReconnectingWebSocket,
        initCallback: (channel: QWebChannel) => void,
        converters?: any
    ) {
        if (typeof transport !== "object" || typeof transport.send !== "function") {
            PluginLogger.logError("The QWebChannel expects a transport object with a send function and onmessage callback property." +
                " Given is: transport: " + typeof (transport) + ", transport.send: " + typeof (transport.send));
            return;
        }

        this.transport = transport;

        if (Array.isArray(converters)) {
            for (const converter of converters)
                this.addConverter(converter);
        } else if (converters !== undefined) {
            this.addConverter(converters);
        }

        this.transport.onmessage = (message) => {
            let data = message.data;
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            switch (data.type) {
                case QWebChannelMessageTypes.signal:
                    this.handleSignal(data);
                    break;
                case QWebChannelMessageTypes.response:
                    this.handleResponse(data);
                    break;
                case QWebChannelMessageTypes.propertyUpdate:
                    this.handlePropertyUpdate(data);
                    break;
                default:
                    PluginLogger.logError("invalid message received:", message.data);
                    break;
            }
        };

        this.exec({ type: QWebChannelMessageTypes.init }, (data) => {
            for (const objectName of Object.keys(data)) {
                new QObject(objectName, data[objectName], this);
            }

            // now unwrap properties, which might reference other registered objects
            for (const objectName of Object.keys(this.objects)) {
                this.objects[objectName].unwrapProperties();
            }

            if (initCallback) {
                initCallback(this);
            }
            this.exec({ type: QWebChannelMessageTypes.idle });
        });
    }

    addConverter(converter: any) {
        if (typeof converter === "string") {
            if (this.converterRegistry.hasOwnProperty(converter))
                this.usedConverters.push(this.converterRegistry[converter]);

            else
                PluginLogger.logError("Converter '" + converter + "' not found");
        } else if (typeof converter === "function") {
            this.usedConverters.push(converter);
        } else {
            PluginLogger.logError("Invalid converter object type " + typeof converter);
        }
    }

    send(data: any) {
        if (typeof (data) !== "string") {
            data = JSON.stringify(data);
        }
        this.transport.send(data);
    }

    exec(data: any, callback?: (data: any) => void) {
        if (!callback) {
            // if no callback is given, send directly
            this.send(data);
            return;
        }
        if (this.execId === Number.MAX_VALUE) {
            // wrap
            this.execId = Number.MIN_VALUE;
        }
        if (data.hasOwnProperty("id")) {
            PluginLogger.logError("Cannot exec message with property id: " + JSON.stringify(data));
            return;
        }
        data.id = this.execId++;
        this.execCallbacks[data.id] = callback;
        this.send(data);
    }

    handleSignal(message: any) {
        let object = this.objects[message.object];
        if (object) {
            object.signalEmitted(message.signal, message.args);
        } else {
            PluginLogger.logWarn("Unhandled signal: " + message.object + "::" + message.signal);
        }
    }

    handleResponse(message: any) {
        if (!message.hasOwnProperty("id")) {
            PluginLogger.logError("Invalid response message received: ", JSON.stringify(message));
            return;
        }
        this.execCallbacks[message.id](message.data);
        delete this.execCallbacks[message.id];
    }

    handlePropertyUpdate(message: any) {
        message.data.forEach((data: any) => {
            let object = this.objects[data.object];
            if (object) {
                object.propertyUpdate(data.signals, data.properties);
            } else {
                PluginLogger.logWarn("Unhandled property update: " + data.object + "::" + data.signal);
            }
        });
        this.exec({ type: QWebChannelMessageTypes.idle });
    }

    debug(message: string) {
        this.send({ type: QWebChannelMessageTypes.debug, data: message });
    }
}

class QObject {
    private __id__: string;
    private __objectSignals__: Record<string, any> = {};
    private __propertyCache__: Record<string, any> = {};
    private webChannel: QWebChannel;

    [key: string]: any;

    constructor(name: string, data: any, webChannel: QWebChannel) {
        this.__id__ = name;
        this.webChannel = webChannel;
        webChannel.objects[name] = this;

        data.methods.forEach((methodData: any) => {
            let methodName = methodData[0];
            let methodIdx = methodData[1];

            // Fully specified methods are invoked by id, others by name for host-side overload resolution
            let invokedMethod = methodName[methodName.length - 1] === ')' ? methodIdx : methodName;

            this[methodName] = (...rawArgs: any[]): any => {
                let args = [];
                let callback: (value: unknown) => void;
                let errCallback: (reason?: any) => void;
                for (let i = 0; i < rawArgs.length; ++i) {
                    let argument = rawArgs[i];
                    if (typeof argument === "function")
                        callback = argument;

                    else
                        args.push(argument);
                }

                let result;
                // during test, webChannel.exec synchronously calls the callback
                // therefore, the promise must be constucted before calling
                // webChannel.exec to ensure the callback is set up
                if (!callback && (typeof (Promise) === 'function')) {
                    result = new Promise((resolve, reject) => {
                        callback = resolve;
                        errCallback = reject;
                    });
                }

                this.webChannel.exec({
                    "type": QWebChannelMessageTypes.invokeMethod,
                    "object": this.__id__,
                    "method": invokedMethod,
                    "args": args
                }, (response: any) => {
                    if (response !== undefined) {
                        let result = this.unwrapQObject(response);
                        if (callback) {
                            (callback)(result);
                        }
                    } else if (errCallback) {
                        (errCallback)();
                    }
                });

                return result;
            };
        });

        data.properties.forEach((propertyInfo: any) => {
            let propertyIndex = propertyInfo[0];
            let propertyName = propertyInfo[1];
            let notifySignalData = propertyInfo[2];
            // initialize property cache with current value
            // NOTE: if this is an object, it is not directly unwrapped as it might
            // reference other QObject that we do not know yet
            this.__propertyCache__[propertyIndex] = propertyInfo[3];

            if (notifySignalData) {
                if (notifySignalData[0] === 1) {
                    // signal name is optimized away, reconstruct the actual name
                    notifySignalData[0] = propertyName + "Changed";
                }
                this.addSignal(notifySignalData, true);
            }

            Object.defineProperty(this, propertyName, {
                configurable: true,
                get: () => {
                    let propertyValue = this.__propertyCache__[propertyIndex];
                    if (propertyValue === undefined) {
                        // This shouldn't happen
                        PluginLogger.logWarn("Undefined value in property cache for property \"" + propertyName + "\" in object " + this.__id__);
                    }

                    return propertyValue;
                },
                set: (value) => {
                    if (value === undefined) {
                        PluginLogger.logWarn("Property setter for " + propertyName + " called with undefined value!");
                        return;
                    }
                    this.__propertyCache__[propertyIndex] = value;
                    let valueToSend = value;
                    this.webChannel.exec({
                        "type": QWebChannelMessageTypes.setProperty,
                        "object": this.__id__,
                        "property": propertyIndex,
                        "value": valueToSend
                    });
                }
            });
        });

        data.signals.forEach((signal: any) => { this.addSignal(signal, false); });

        Object.assign(this, data.enums);
    }

    unwrapProperties() {
            for (const propertyIdx of Object.keys(this.__propertyCache__)) {
                this.__propertyCache__[propertyIdx] = this.unwrapQObject(this.__propertyCache__[propertyIdx]);
            }
        }

    propertyUpdate(signals: any, propertyMap: any) {
        // update property cache
        for (const propertyIndex of Object.keys(propertyMap)) {
            let propertyValue = propertyMap[propertyIndex];
            this.__propertyCache__[propertyIndex] = this.unwrapQObject(propertyValue);
        }

        for (const signalName of Object.keys(signals)) {
            // Invoke all callbacks, as signalEmitted() does not. This ensures the
            // property cache is updated before the callbacks are invoked.
            this.invokeSignalCallbacks(signalName, signals[signalName]);
        }
    }

    private addSignal(signalData: any, isPropertyNotifySignal: boolean) {
            let signalName = signalData[0];
            let signalIndex = signalData[1];
            this[signalName] = {
                connect: (callback: any) => {
                    if (typeof (callback) !== "function") {
                        PluginLogger.logError("Bad callback given to connect to signal " + signalName);
                        return;
                    }

                    this.__objectSignals__[signalIndex] = this.__objectSignals__[signalIndex] || [];
                    this.__objectSignals__[signalIndex].push(callback);

                    // only required for "pure" signals, handled separately for properties in propertyUpdate
                    if (isPropertyNotifySignal)
                        return;

                    // also note that we always get notified about the destroyed signal
                    if (signalName === "destroyed" || signalName === "destroyed()" || signalName === "destroyed(QObject*)")
                        return;

                    // and otherwise we only need to be connected only once
                    if (this.__objectSignals__[signalIndex].length == 1) {
                        this.webChannel.exec({
                            type: QWebChannelMessageTypes.connectToSignal,
                            object: this.__id__,
                            signal: signalIndex
                        });
                    }
                },
                disconnect: (callback: any) => {
                    if (typeof (callback) !== "function") {
                        PluginLogger.logError("Bad callback given to disconnect from signal " + signalName);
                        return;
                    }
                    // This makes a new list. This is important because it won't interfere with
                    // signal processing if a disconnection happens while emittig a signal
                    this.__objectSignals__[signalIndex] = (this.__objectSignals__[signalIndex] || []).filter((c: any) => {
                        return c != callback;
                    });
                    if (!isPropertyNotifySignal && this.__objectSignals__[signalIndex].length === 0) {
                        // only required for "pure" signals, handled separately for properties in propertyUpdate
                        this.webChannel.exec({
                            type: QWebChannelMessageTypes.disconnectFromSignal,
                            object: this.__id__,
                            signal: signalIndex
                        });
                    }
                }
            };
        }

    unwrapQObject(response: any): any {
            for (const converter of this.webChannel.usedConverters) {
                let result = converter(response);
                if (result !== undefined)
                    return result;
            }

            if (response instanceof Array) {
                // support list of objects
                return response.map(qobj => this.unwrapQObject(qobj));
            }
            if (!(response instanceof Object))
                return response;

            if (!response["__QObject*__"] || response.id === undefined) {
                let jObj: any = {};
                for (const propName of Object.keys(response)) {
                    jObj[propName] = this.unwrapQObject(response[propName]);
                }
                return jObj;
            }

            let objectId = response.id;
            if (this.webChannel.objects[objectId])
                return this.webChannel.objects[objectId];

            if (!response.data) {
                PluginLogger.logError("Cannot unwrap unknown QObject " + objectId + " without data.");
                return;
            }

            let qObject = new QObject(objectId, response.data, this.webChannel);
            qObject.destroyed.connect(() => {
                if (this.webChannel.objects[objectId] === qObject) {
                    delete this.webChannel.objects[objectId];
                    // reset the now deleted QObject to an empty {} object
                    // just assigning {} though would not have the desired effect, but the
                    // below also ensures all external references will see the empty map
                    // NOTE: this detour is necessary to workaround QTBUG-40021
                    Object.keys(qObject).forEach(name => delete qObject[name]);
                }
            });
            // here we are already initialized, and thus must directly unwrap the properties
            qObject.unwrapProperties();
            return qObject;
        }

    /**
     * Invokes all callbacks for the given signalname. Also works for property notify callbacks.
     */
    private invokeSignalCallbacks(signalName: string, ...signalArgs: any[]) {
        let connections = this.__objectSignals__[signalName];
        if (connections) {
            connections.forEach((callback: { apply: (...args: any[]) => void; }) => {
                callback.apply(callback, signalArgs);
            });
        }
    }

    signalEmitted(signalName: string, ...signalArgs: any[]) {
        this.invokeSignalCallbacks(signalName, this.unwrapQObject(signalArgs));
    }

    toJSON() {
        if (this.__id__ === undefined) return {};
        return {
            id: this.__id__,
            "__QObject*__": true
        };
    }
}