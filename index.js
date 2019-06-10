#! /usr/bin/env node
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { Container, ContainerManager } = require('./components/containers');
const manager = new ContainerManager();

async function ps(format) {
    var psCmd = 'docker ps';
    if ( format ) {
        psCmd += ' --format \'' + format + '\'';
    }
    var { stdout, stderr } = await exec(psCmd);
    if (stderr) {
        console.log('`' + psCmd + '` returned an error:');
        console.log(stderr);
        process.exit(1);
    }
    return stdout;
}

async function main() {
    var psResult = await ps('{{.Names}}|{{.ID}}')
    psResult.split('\n')
        .filter((v) => {return v;})
        .map((v) => {
            return v.split('|');
        })
        .map((v) => {
            manager.put(v[1], v[0]);
        });
    // console.log(manager);

    const fuzz = require('fuzzball');
    const options = { scorer: fuzz.partial_ratio };
    var matches = bestMatches = fuzz.extract(target, manager.listNames(), options);
    // console.log(matches);

    if (matches[0][1] == 100) {
        bestMatches = matches.filter((v) => {
            return v[1] >= matches[0][1];
        });
    }

    if (bestMatches.length == 1) {
        var match = bestMatches[0];
        if ( match[1] != 100 ) {
            const prompts = require('prompts');

            let desc = manager.getByName(match[0]).getDescription();
            const response = await prompts({
                type: 'confirm',
                name: 'connect',
                message: 'Connect to: ' + desc,
                initial: true,
            });
            if (!response.connect) return;

            manager.getByName(match[0]).bash();
        } else {
            manager.getByName(match[0]).bash();;
        }
    } else if (bestMatches.length > 1) {
        const prompts = require('prompts');

        var choicifiedBestMatches = bestMatches.reduce((acc, item, i) => {
            var c = manager.getByName(item[0]);
            acc.push({
                title: c.getDescription(),
                value: c,
            })
            return acc;
        }, []);

        const response = await prompts({
            type: 'select',
            name: 'container',
            message: 'Multiple matches, choose container',
            choices: choicifiedBestMatches,
        });
        if (!response.container) return;
        response.container.bash();
    }
}

const args = process.argv.slice(2);
if (!args[0]) {
    (async () => {
        var psResult = await ps();
        psResult = psResult.split('\n')
            .filter((v) => { return v; })
            .slice(1)
            .map((v) => {
                var array = v.split(/\s{2,}/);
                manager.put(array[0], array[1]);
            });

        const prompts = require('prompts');

        const response = await prompts({
            type: 'select',
            name: 'container',
            message: 'No filter. Choose container',
            choices: manager.listChoices(),
        });
        if (!response.container) return;
        response.container.bash();
    })();
    return;
}
const target = args[0];

main();