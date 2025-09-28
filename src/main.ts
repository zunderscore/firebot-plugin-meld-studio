import { Firebot, ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { PluginLogger } from "./plugin-logger";
import { MeldRemote } from "./meld/meld-remote";
import { registerFrontendListeners, unregisterFrontendListeners } from "./communicator";

import {
    PLUGIN_NAME,
    EVENT_SOURCE_ID
} from "./constants";

import { MeldEventSource } from "./events";
import { MeldVariables } from "./variables";
import { MeldEffects } from "./effects";
import { MeldFilters } from "./filters";

const packageInfo = require("../package.json");

let eventManager: ScriptModules["eventManager"];
let replaceVariableManager: ScriptModules["replaceVariableManager"];
let effectManager: ScriptModules["effectManager"];
let eventFilterManager: ScriptModules["eventFilterManager"]
let frontendCommunicator: ScriptModules["frontendCommunicator"];

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
        ({
            effectManager,
            eventManager,
            eventFilterManager,
            frontendCommunicator,
            replaceVariableManager
        } = modules);

        PluginLogger.logInfo(`Starting ${PLUGIN_NAME} plugin...`);

        PluginLogger.logDebug("Registering variables...");
        for (const variable of MeldVariables) {
            replaceVariableManager.registerReplaceVariable(variable);
        }

        PluginLogger.logDebug("Registering frontend listeners...");
        registerFrontendListeners(frontendCommunicator);
        
        PluginLogger.logDebug("Registering effects...");
        for (const effect of MeldEffects) {
            effectManager.registerEffect(effect);
        }

        PluginLogger.logDebug("Registering events...");
        eventManager.registerEventSource(MeldEventSource);

        PluginLogger.logDebug("Registering filters...");
        for (const filter of MeldFilters) {
            eventFilterManager.registerFilter(filter);
        }
        
        PluginLogger.logDebug("Setting up Meld connection...");
        MeldRemote.setupRemote(eventManager, parameters);
            
        PluginLogger.logInfo("Plugin ready. Listening for events.");
    },
    stop: (uninstalling) => {
        PluginLogger.logDebug(`Stopping ${PLUGIN_NAME} plugin...`);

        PluginLogger.logDebug("Shutting down Meld connection...");
        MeldRemote.shutdown();

        PluginLogger.logDebug("Unregistering filters...");
        for (const filter of MeldFilters) {
            eventFilterManager.unregisterFilter(filter.id);
        }

        PluginLogger.logDebug("Unregistering events...");
        eventManager.unregisterEventSource(EVENT_SOURCE_ID);
        
        PluginLogger.logDebug("Unegistering effects...");
        for (const effect of MeldEffects) {
            effectManager.unregisterEffect(effect.definition.id);
        }

        PluginLogger.logDebug("Unregistering frontend listeners...");
        unregisterFrontendListeners(frontendCommunicator);

        PluginLogger.logDebug("Unegistering variables...");
        for (const variable of MeldVariables) {
            replaceVariableManager.unregisterReplaceVariable(variable.definition.handle);
        }

        if (uninstalling === true) {
            PluginLogger.logInfo("Plugin uninstalled");
        } else {
            PluginLogger.logInfo("Plugin stopped");
        }
    }
};

export default script;