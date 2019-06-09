#! /usr/bin/env node
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { Container, ContainerManager } = require('./components/containers');

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
    const manager = new ContainerManager();
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
    const options = { scorer: fuzz.token_set_ratio };
    var matches = fuzz.extract(target, manager.listNames(), options);
    // console.log(matches);

    var bestMatches = matches.filter((v) => {
        return v[1] >= matches[0][1];
    });
    // console.log(bestMatches);

    if ( bestMatches.length == 1 ) {
        var match = bestMatches[0];
        if ( match[1] != 100 ) {
            const Confirm = require('prompt-confirm');
            let desc = manager.getByName(match[0]).getDescription();
            const prompt = new Confirm('Inexact match, do you wanna connect to: ' + desc);
            prompt.run()
            .then(function (answer) {
                if (!answer) return;
                manager.getByName(match[0]).bash();
            });
        } else {
            manager.getByName(match[0]).bash();;
        }
    } else {
        // TODO: Multiple match handling
        console.log("Multiple matches! Select:");
    }
}

const args = process.argv.slice(2);
if (!args[0]) {
    console.log('Missing required container name argument, choose from the following IMAGE names:\n');
    consele.log(ps());
    process.exit(1);
}
const target = args[0];

main();