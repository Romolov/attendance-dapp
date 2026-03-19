// Compile AttendanceSystem.sol avec solc et écrit le résultat dans scripts/compiled.json
const solc = require('solc');
const fs   = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../contracts/AttendanceSystem.sol');
const outputFile = path.join(__dirname, 'compiled.json');

console.log('Compilation de AttendanceSystem.sol...');

const source = fs.readFileSync(sourceFile, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'AttendanceSystem.sol': { content: source }
    },
    settings: {
        evmVersion: 'shanghai',
        optimizer: { enabled: true, runs: 200 },
        outputSelection: {
            '*': { '*': ['abi', 'evm.bytecode'] }
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Afficher les erreurs/warnings éventuels
if (output.errors) {
    output.errors.forEach(err => {
        if (err.severity === 'error') {
            console.error('ERREUR :', err.formattedMessage);
            process.exit(1);
        } else {
            console.warn('Warning :', err.formattedMessage);
        }
    });
}

const contract = output.contracts['AttendanceSystem.sol']['AttendanceSystem'];
const compiled = {
    abi:      contract.abi,
    bytecode: contract.evm.bytecode.object
};

fs.writeFileSync(outputFile, JSON.stringify(compiled, null, 2));
console.log('Compilation réussie → scripts/compiled.json');
