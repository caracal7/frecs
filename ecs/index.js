import System from './System.js';
import Entity from './Entity.js';

export default function ECS() {

    //  ===== private properties

    const tags = {};
    var entities = [];
    var systems = [];

    //  ===== private methods

    const rebuildTags = (entity, oldTags, newTags) => {
        oldTags.forEach(tag => { // exit
            if (!~newTags.indexOf(tag)) {
                let T = tags[tag];
                T.splice(T.indexOf(entity), 1);
                if (!T.length) delete tags[tag];
            }
        });
        newTags.forEach(tag => { // enter
            if (!tags[tag]) {
                tags[tag] = [entity];
                return;
            }
            if (~tags[tag].indexOf(entity)) return;
            tags[tag].push(entity);
        });
        return newTags;
    };

    const removeEntity = entity => {
        var index = entities.indexOf(entity);
        if (!~index) throw new Error('Entity does not exists');
        rebuildTags(entity, entity.tags, []);
        entities.splice(index, 1);

        //  Удаляем из систем
        systems.forEach(system => system.TESTremoveentity(entity));
    };

    const removeSystem = system => {
        var index = systems.indexOf(system);
        if (!~index) throw new Error('System does not exists');
        systems.splice(index, 1);
    };

    //  ===== public properties

    Object.defineProperty(this, 'entities', {
        get: () => entities,
        enumerable: true
    });

    Object.defineProperty(this, 'systems', {
        get: () => systems,
        enumerable: true
    });

    //  ===== public methods

    this.addEntity = states => {
        var instance = new Entity(states, {main : this, removeEntity, rebuildTags});
        entities.push(instance);
        return instance;
    };

    this.queryTags = $tags =>   //  TODO:: Возможно заменить на более быструю? !!!
        Array.isArray($tags) ?
            entities.filter(e => $tags.every(t => e.tags.includes(t))) : //  tags array
            tags[$tags] || [];                                           //  single tag

    this.addSystem = components => {
        var instance = new System(components, {removeSystem, entities});
        systems.push(instance);
        return instance;
    };

    this.tick = () => systems.forEach(system => system.tick());


    //  make private!!!!!!!!!!!
    this.TESTsystems = entity => {
        systems.forEach(system => system.TESTentity(entity));
    };

    this.PROCESSchangeState = (entity, oldState, newState) => {
        systems.forEach(system => system.PROCESSchangeState(entity, oldState, newState));
    };

    this.PROCESSdeleteComponent = (entity, deletedComponent) => {
        systems.forEach(system => system.PROCESSdeleteComponent(entity, deletedComponent));
    };

    this.TESTremoveFromSystems = entity => {
        systems.forEach(system => system.TESTremoveentity(entity));
    };

};
