// Lance Ganache, compile, déploie, seed, puis sert le frontend sur http://localhost:8080
process.setMaxListeners(0);
const { execSync, spawn } = require('child_process');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const net    = require('net');

const PORT         = 8080;
const GANACHE_PORT = 7545;
const ROOT         = path.join(__dirname, '..');
const COMPILED          = path.join(__dirname, 'compiled.json');
const CONTRACT_ADDRESS  = path.join(__dirname, '../contract-address.json');

const MIME = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
};

// Attend que Ganache soit prêt (polling TCP)
function waitForGanache(port, tentatives, delai) {
    return new Promise((resolve, reject) => {
        let essais = 0;
        function tenter() {
            const sock = net.createConnection(port, '127.0.0.1');
            sock.once('connect', () => { sock.destroy(); resolve(); });
            sock.once('error', () => {
                sock.destroy();
                essais++;
                if (essais >= tentatives) { reject(new Error('Ganache injoignable après ' + tentatives + ' tentatives')); return; }
                setTimeout(tenter, delai);
            });
        }
        tenter();
    });
}

async function main() {
    // 0. Nettoyer un éventuel Ganache résiduel sur le port
    try {
        execSync('fuser -k ' + GANACHE_PORT + '/tcp ' + PORT + '/tcp', { stdio: 'ignore' });
        await new Promise(r => setTimeout(r, 500));
    } catch (_) {}

    // 1. Lancer Ganache
    console.log('=== Démarrage de Ganache ===');
    const ganache = spawn('node', [
        path.join(ROOT, 'node_modules/.bin/ganache'),
        '--mnemonic', 'link gate remind scout swim concert labor organ arena ripple net notable',
        '--port', String(GANACHE_PORT),
        '--chain.chainId', '1337',
        '--chain.networkId', '1337',
        '--chain.allowUnlimitedContractSize',
    ], { stdio: 'inherit' });

    ganache.on('exit', code => {
        if (code !== null) { console.error('Ganache s\'est arrêté (code ' + code + ')'); process.exit(1); }
    });

    // 2. Attendre que Ganache soit prêt
    console.log('En attente de Ganache sur le port ' + GANACHE_PORT + '...');
    await waitForGanache(GANACHE_PORT, 30, 500);
    console.log('Ganache prêt.\n');

    // 3. Compiler
    console.log('=== Compilation ===');
    execSync('node ' + path.join(__dirname, 'compile.js'), { stdio: 'inherit' });

    // 4. Déployer
    console.log('\n=== Déploiement ===');
    execSync('node ' + path.join(__dirname, 'deploy.js'), { stdio: 'inherit' });

    // 5. Seed
    console.log('\n=== Initialisation des données de test ===');
    const Web3 = require('web3');
    const { abi } = JSON.parse(fs.readFileSync(COMPILED, 'utf8'));

    const adresse = JSON.parse(fs.readFileSync(CONTRACT_ADDRESS, 'utf8')).address;

    const web3     = new Web3('http://127.0.0.1:' + GANACHE_PORT);
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi, adresse);

    const admin    = accounts[0];
    const prof1    = accounts[1];
    const prof2    = accounts[2];
    const etu1     = accounts[3];
    const etu2     = accounts[4];
    const etu3     = accounts[5];

    // Ajouter les profs
    await contract.methods.addTeacher(prof1).send({ from: admin, gas: 100000 });
    console.log('Prof1 ajouté :', prof1);
    await contract.methods.addTeacher(prof2).send({ from: admin, gas: 100000 });
    console.log('Prof2 ajouté :', prof2);

    // Créer les classes
    await contract.methods.createClass('Classe A').send({ from: prof1, gas: 200000 });
    console.log('Classe A créée (Prof1)');
    await contract.methods.createClass('Classe B').send({ from: prof2, gas: 200000 });
    console.log('Classe B créée (Prof2)');

    // Inscrire les étudiants (classId 0 = Classe A, classId 1 = Classe B)
    await contract.methods.registerStudent(etu1, 'Etudiant1', 0).send({ from: prof1, gas: 200000 });
    console.log('Etudiant1 inscrit en Classe A :', etu1);
    await contract.methods.registerStudent(etu2, 'Etudiant2', 0).send({ from: prof1, gas: 200000 });
    console.log('Etudiant2 inscrit en Classe A :', etu2);
    await contract.methods.registerStudent(etu3, 'Etudiant3', 1).send({ from: prof2, gas: 200000 });
    console.log('Etudiant3 inscrit en Classe B :', etu3);

    console.log('\nDonnées de test initialisées.');

    // 6. Serveur statique
    console.log('\n=== Démarrage du serveur ===');
    const server = http.createServer((req, res) => {
        const filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
        const ext  = path.extname(filePath);
        const mime = MIME[ext] || 'application/octet-stream';
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(404); res.end('404'); return; }
            res.writeHead(200, { 'Content-Type': mime });
            res.end(data);
        });
    });

    server.setMaxListeners(0);
    server.listen(PORT, () => {
        console.log('Ouvrez : http://localhost:' + PORT);
        console.log('\nComptes de test :');
        console.log('  [0] Admin     :', admin);
        console.log('  [1] Prof1     :', prof1);
        console.log('  [2] Prof2     :', prof2);
        console.log('  [3] Etudiant1 :', etu1);
        console.log('  [4] Etudiant2 :', etu2);
        console.log('  [5] Etudiant3 :', etu3);
    });

    // Arrêter Ganache proprement à la fermeture
    process.on('SIGINT', () => { ganache.kill(); process.exit(0); });
    process.on('SIGTERM', () => { ganache.kill(); process.exit(0); });
}

main().catch(e => { console.error(e.message); process.exit(1); });
