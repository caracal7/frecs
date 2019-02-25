import State from './State.js';

const removeDuplicates = arr => [...(new Set(arr))];

//------------------------------------------------------------------------------

export default function Entity($states, ecs) {
    //  ===== private properties

    const states = {};
    var tags = [];
    var activeState = undefined;

    //  ===== private methods

    const removeState = state => {
        var key = Object.keys(states)
                        .find(k => states[k] === state);
        if (!key) throw new Error("State doen't exists");
        if (activeState === key) deactivateState(activeState);
        delete states[key];
    };

    const deactivateState = state => {
        ecs.main.TESTremoveFromSystems(this); //?????
        activeState = undefined;
    };

    //  ===== public properties

    Object.defineProperty(this, 'states', {
        get: () => states,
        enumerable: true
    });

    Object.defineProperty(this, 'tags', {
        get: () => tags,
        set: $tags => tags = ecs.rebuildTags(this, tags, removeDuplicates($tags)),
        enumerable: true
    });

    Object.defineProperty(this, 'activeState', {
        get: () => activeState,
        set: newState => {
            if(!newState) {//undefined
                // DEACTIVATE
                return deactivateState(newState);
            }
            if(!states[newState]) throw new Error(`State "${newState}" doesn't exists`);

            let oldState = activeState;
            activeState = newState;
            // заменить на PROCESSaddState
            if(!oldState) ecs.main.TESTsystems(this); // Add new if state change from undefined
            else ecs.main.PROCESSchangeState(this, oldState, newState);
            // activateState???
            // deactivateState???
        },
        enumerable: true
    });

    //  ===== public methods

    this.addState = name => {
        if (states[name]) throw new Error(`State "${name}" already exists`);
        var instance = new State(name, {main: ecs.main, entity : this, removeState});
        states[name] = instance;
        return instance;
    };

    this.hasComponents = (...names) => {
        if(!activeState) return false;
        //  TODO:: array support
        return names.every(elem => states[activeState].components[elem]);
    };

    this.destroy = () => {
        ecs.removeEntity(this);
    }

    //  ===== constructor

    void (() => {

        $states && Object.keys($states)
                         .forEach(state => this.addState(state)
                                               .addComponents($states[state]));

    })();
};
