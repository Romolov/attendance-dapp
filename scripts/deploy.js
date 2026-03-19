// Déploie AttendanceSystem sur Ganache local et écrit l'adresse dans contract-address.json
const Web3 = require('web3');
const fs   = require('fs');
const path = require('path');

const GANACHE_URL      = 'http://127.0.0.1:7545';
const COMPILED         = path.join(__dirname, 'compiled.json');
const CONTRACT_ADDRESS = path.join(__dirname, '../contract-address.json');

// Compte déployeur = compte[0] de Ganache (dérivé du mnemonic fixe)
// mnemonic: "link gate remind scout swim concert labor organ arena ripple net notable"
const DEPLOYER = '0x63e55069cf4e3b326152721ba3d42bdbb7774bc5';

async function deploy() {
    if (!fs.existsSync(COMPILED)) {
        console.error('compiled.json introuvable. Lancez d\'abord : npm run compile');
        process.exit(1);
    }

    const { abi, bytecode } = JSON.parse(fs.readFileSync(COMPILED, 'utf8'));
    const web3 = new Web3(GANACHE_URL);

    // Vérifier la connexion à Ganache
    try {
        await web3.eth.getBlockNumber();
    } catch (e) {
        console.error('Impossible de se connecter à Ganache sur', GANACHE_URL);
        console.error('Assurez-vous que Ganache est lancé : npm run ganache');
        process.exit(1);
    }

    console.log('Déploiement depuis :', DEPLOYER);

    const contract = new web3.eth.Contract(abi);
    const instance = await contract.deploy({ data: '0x' + bytecode })
        .send({ from: DEPLOYER, gas: 5000000 });

    const deployedAddress = instance.options.address;
    console.log('Contrat déployé à :', deployedAddress);

    fs.writeFileSync(CONTRACT_ADDRESS, JSON.stringify({ address: deployedAddress }, null, 2));
    console.log('Adresse écrite dans contract-address.json.');
}

deploy().catch(e => { console.error(e.message); process.exit(1); });
