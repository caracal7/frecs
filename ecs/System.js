import getArguments from 'es-arguments';

// TODO:: enter/exit/tick & etc systems cache

export default function System($components, ecs) {

    //  ===== private properties

    const context = {};
    var components = [];
    var entities = [];
    var states = [];

    //  ===== private methods

    const callIfExists = name => {
        //  только для create/destroy
        let system = $components && typeof $components === 'function' ? $components() : {};
        if(system[name] && typeof system[name] === 'function') system[name](context);
    }

    const callIfExists2 = (name, args, entity) => {
        let system = $components && typeof $components === 'function' ? $components(...args) : {};
        if(system[name] && typeof system[name] === 'function') system[name](context, entity);
    }

    const callFn = (name, entity, index, _state) => {
        let args = [];  // TODO:: array.map
        let state = entity.states[_state ? _state : entity.activeState];

        components.forEach(comp => {

            args.push(
                state.components[comp].value
            )

        });
        callIfExists2(name, args, states[index]);
    }

    const enterOnCreate = () => {
        ecs.entities.forEach(entity => {
            if(entity.activeState && entity.hasComponents(...components)) {
                entities.push(entity);
                states.push({});
            }
        });

        entities.forEach((entity, index) => {
            callFn('enter', entity, index)
        });
    };

    const exitOnDestroy = () => {
        entities.forEach((entity, index) => {
            callFn('exit', entity, index)
        });
    };

    //  ===== public properties

    Object.defineProperty(this, 'components', {
        get: () => components,
        enumerable: true
    });

    Object.defineProperty(this, 'entities', {
        get: () => entities,
        enumerable: true
    });

    //  ===== public methods

    this.tick = () => entities.forEach((entity, index) => callFn('tick', entity, index));


    this.destroy = () => {
        exitOnDestroy();
        callIfExists('destroy');
        ecs.removeSystem(this);
    }
    /// -----------------------

    this.PROCESSdeleteComponent = (entity , deletedComponent) => {
        if(entity.activeState && entity.hasComponents(...components) &&
        ~components.indexOf(deletedComponent)) {
            // Remove if exists
            var index = entities.indexOf(entity);
            if (~index) {
                callFn('exit', entity, index);
                entities.splice(index, 1);
                states.splice(index, 1);
            }
        }
    }

    this.PROCESSchangeState = (entity, oldState, newState) => {
        var index = entities.indexOf(entity);
        if (!~index) { // if not exists
            if(entity.states[newState].hasComponents(...components)) {
                index = entities.push(entity);
                states.push({});
                callFn('enter', entity, index-1);
            }
        } else { // if exists
            if(!entity.states[newState].hasComponents(...components)) {
                callFn('exit', entity, index, oldState);
                entities.splice(index, 1);
                states.splice(index, 1);
            }
        }
    }

    this.TESTentity = entity => {
        if(entity.activeState && entity.hasComponents(...components)) {
            // Add if not exists
            var index = entities.indexOf(entity);
            if (!~index) {
                index = entities.push(entity);
                states.push({});
                callFn('enter', entity, index-1);
            }
        } else {
            // Remove if exists
            var index = entities.indexOf(entity);
            if (~index) {
                callFn('exit', entity, index);
                entities.splice(index, 1);
                states.splice(index, 1);
            }
        }
    }

    this.TESTremoveentity = entity => {
        // Remove if exists
        var index = entities.indexOf(entity);
        if (~index) {
            callFn('exit', entity, index);
            entities.splice(index, 1);
            states.splice(index, 1);
        }

    }


    //  ===== constructor

    void (() => {
        callIfExists('create');
        if($components) {
            components = getArguments($components);
            enterOnCreate();
        }
    })();
}
