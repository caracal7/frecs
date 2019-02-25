import Component from './Component.js';

export default function State($name, entity) {

    //  ===== private properties

    var name = $name;
    const components = {};

    //  ===== private methods

    const removeComponent = component => {
        var key = Object.keys(components)
                        .find(k => components[k] === component);
        if (!key) throw new Error("Component doesn't exists");
        // тестируем систем !!!!!!!!!!!!!!!!!!
        entity.main.PROCESSdeleteComponent(entity.entity, key); //xxxxxxxxxxx

        delete components[key];
    };

    const addComponent = (name, value) => {
        if (components[name]) throw new Error(`Component "${name}" already exists`);
        var instance = new Component(name, value, {removeComponent});
        components[name] = instance;
        return instance;
    };

    //  ===== public properties

    Object.defineProperty(this, 'name', {
        get: () => name,
        enumerable: true
    });

    Object.defineProperty(this, 'components', {
        get: () => components,
        enumerable: true
    });

    //  ===== public methods

    this.addComponents = (name, value) => {
        if (typeof name === 'object') {
            Object.keys(name).forEach(component => addComponent(component, name[component]));
            // тестируем систем !!!!!!!!!!!!!!!!!!
            entity.main.TESTsystems(entity.entity);
        } else {
            let component = addComponent(name, value);
            // тестируем систем !!!!!!!!!!!!!!!!!!
            entity.main.TESTsystems(entity.entity);
            return component;
        }
    };

    this.hasComponents = (...names) => {
        //  TODO:: array support
        return names.every(elem => components[elem]);
    };

    this.destroy = () => entity.removeState(this);

};

// TODO:: rename state
