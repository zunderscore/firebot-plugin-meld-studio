import { Logger } from "@crowbartools/firebot-custom-scripts-types/types/modules/logger";
import { PLUGIN_NAME } from "./constants";

class PluginLogger {
    private _logger: Logger;

    constructor() { }

    setupLogger(logger: Logger) {
        this._logger = logger;
    }

    logDebug = (msg: string, ...meta: any[]) => this._logger?.debug(`[${PLUGIN_NAME}] ${msg}`, ...meta);
    logInfo = (msg: string, ...meta: any[]) => this._logger?.info(`[${PLUGIN_NAME}] ${msg}`, ...meta);
    logWarn = (msg: string, ...meta: any[]) => this._logger?.warn(`[${PLUGIN_NAME}] ${msg}`, ...meta);
    logError = (msg: string, ...meta: any[]) => this._logger?.error(`[${PLUGIN_NAME}] ${msg}`, ...meta);
}

const pluginLogger = new PluginLogger();

export { pluginLogger as PluginLogger };