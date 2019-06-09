const { spawn } = require('child_process');

class Container {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    };
    getDescription() {
        return 'ID ' + this.id + ' (' + this.name + ')';
    };
    bash() {
        console.log("Executing bash on " + this.getDescription());
        spawn('docker', ['exec', '-it', this.id, 'bash'], {
            stdio: 'inherit' // Will use process .stdout, .stdin, .stderr
        });
    }
}

class ContainerManager {
    constructor() {
        this.results = [];
    };
    put(id, name) {
        this.results.push(new Container(id, name));
        return this;
    };
    get(id) {
        return this.results.reduce((acc, item) => {
            if (item.id == id) {
                return item;
            }
            return acc;
        }, {});
    };
    getByName(name) {
        return this.results.reduce((acc, item) => {
            if (item.name == name) {
                return item;
            }
            return acc;
        }, {});
    };
    listNames() {
        return this.results.reduce((acc, item) => {
            acc.push(item.name);
            return acc;
        }, []);
    }
    listChoices() {
        return this.results.reduce((acc, item) => {
            acc.push({
                title: item.getDescription(),
                value: item,
            })
            return acc;
        }, []);
    }
}

exports.Container = Container;
exports.ContainerManager = ContainerManager;
