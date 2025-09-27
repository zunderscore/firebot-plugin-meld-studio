import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { EventManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import { EffectManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/effect-manager";
import { PluginLogger } from "./plugin-logger";
import { MeldRemote } from "./meld/meld-remote";

import {
    PLUGIN_ID,
    PLUGIN_NAME,
    EVENT_SOURCE_ID
} from "./constants";

import { MeldEventSource } from "./events";
import { MeldEffects } from "./effects";

const packageInfo = require("../package.json");

let eventManager: EventManager;
let effectManager: EffectManager;

const script: Firebot.CustomScript<{
    ipAddress: string;
    port: number;
}> = {
    getScriptManifest: () => ({
        name: PLUGIN_NAME,
        description: packageInfo.description,
        author: packageInfo.author,
        version: packageInfo.version,
        firebotVersion: "5",
        startupOnly: true
    }),
    getDefaultParameters: () => ({
        ipAddress: {
            type: "string",
            title: "IP Address",
            description: "IP address for the computer where Meld Studio is running. If it's running on the same computer as Firebot, leave this as `127.0.0.1`.",
            default: "127.0.0.1"
        },
        port: {
            type: "number",
            title: "Port",
            description: "Port that Meld Studio is listening on. Default is `13376`.",
            default: 13376
        }
    }),
    parametersUpdated: (params) => {
        MeldRemote.updateParams(params);
    },
    run: ({ modules, parameters }) => {
        PluginLogger.setupLogger(modules.logger);
        ({ eventManager, effectManager } = modules);

        PluginLogger.logDebug("Registering events...");
        eventManager.registerEventSource(MeldEventSource);
        
        PluginLogger.logDebug("Registering effects...");
        for (const effect of MeldEffects) {
            effectManager.registerEffect(effect);
        }
        
        PluginLogger.logDebug("Setting up Meld connection...");
        MeldRemote.setupRemote(eventManager, parameters);
            
        PluginLogger.logInfo("Plugin ready. Listening for events.");
    },
    stop: (uninstalling) => {
        PluginLogger.logDebug(`Stopping ${PLUGIN_NAME} plugin...`);

        PluginLogger.logDebug("Unregistering events...");
        eventManager.unregisterEventSource(EVENT_SOURCE_ID);

        if (uninstalling === true) {
            PluginLogger.logInfo("Plugin uninstalled");
        } else {
            PluginLogger.logInfo("Plugin stopped");
        }
    }
};

export default script;