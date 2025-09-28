import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import {
    FILTER_PREFIX,
    EVENT_SOURCE_ID,
    SCENE_CHANGED_EVENT_ID,
} from "../constants";

export const SceneNameFilter: EventFilter = {
    id: `${FILTER_PREFIX}:scene-name`,
    name: "Meld Studio Scene Name",
    description: "Filter on the name of the Meld Studio scene that triggered the event",
    events: [
        { eventSourceId: EVENT_SOURCE_ID, eventId: SCENE_CHANGED_EVENT_ID },
    ],
    comparisonTypes: [ "is", "is not" ],
    valueType: "text",
    predicate: async (filterSettings, eventData) => {
        const sceneName = (eventData.eventMeta.scene as MeldStudioSessionSceneWithId).name.toLowerCase();
        const value = (filterSettings.value as string).toLowerCase();

        return filterSettings.comparisonType === "is"
            ? sceneName === value
            : sceneName !== value;
    }
}