


export default function Component($name, $value = true, state) {

    //  ===== private properties

    var name = $name;
    var value = $value;

    //  ===== private methods

    //  ===== public properties

    Object.defineProperty(this, 'name', {
        get: () => name,
        enumerable: true
    });

    Object.defineProperty(this, 'value', {
        get: () => value,
        //  TODO:: convert to prototype
        set: $value => value = $value,
        enumerable: true
    });

    //  ===== public methods

    this.destroy = () => state.removeComponent(this);
}
