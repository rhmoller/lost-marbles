let nextEntityId = 0;

export function createEntity() {
    return nextEntityId++;
}

export interface Component {
    entity: number;
}

interface Registry {
    [id: string]: object[];
}

let registry: Registry = {};

export function getComponentList<T>(componentType: string): T[] {
    let list = registry[componentType];
    if (!list) {
        list = [];
        registry[componentType] = list;
    }
    return list as any as T[];
}

export function addComponent(entity: number, componentType: string, component: object) {
    (component as Component).entity = entity;
    getComponentList(componentType)[entity] = component;
}

export function getComponent(entity: number, componentType: string): any {
    return getComponentList(componentType)[entity];
}

export function destroyEntity(entity: number) {
    for (const key in registry) {
        if (registry.hasOwnProperty(key)) {
            delete getComponentList(key)[entity];
        }
    }
}

export function clearComponents() {
    registry = {};
}
