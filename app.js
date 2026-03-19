let CONTRACT_ADDRESS = null; // chargé depuis /contract-address.json au démarrage

const ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"teacher","type":"address"}],"name":"TeacherAdded","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"teacher","type":"address"}],"name":"TeacherRemoved","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"classId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":true,"internalType":"address","name":"teacher","type":"address"}],"name":"ClassCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"student","type":"address"},{"indexed":true,"internalType":"uint256","name":"classId","type":"uint256"}],"name":"StudentRegistered","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"classId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"SessionCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"classId","type":"uint256"}],"name":"ClassDeleted","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"}],"name":"SessionClosed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"student","type":"address"},{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"AttendanceSigned","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"student","type":"address"},{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"byTeacher","type":"address"}],"name":"AttendanceInvalidated","type":"event"},
  {"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"byAdmin","type":"address"}],"name":"ContractPaused","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"byAdmin","type":"address"}],"name":"ContractUnpaused","type":"event"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"teachers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"teacherList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"classes","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"teacher","type":"address"},{"internalType":"bool","name":"exists","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"students","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"bool","name":"isRegistered","type":"bool"},{"internalType":"uint256","name":"classId","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"studentList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"sessions","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"classId","type":"uint256"},{"internalType":"bytes32","name":"secretHash","type":"bytes32"},{"internalType":"bool","name":"isOpen","type":"bool"},{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"uint256","name":"lateThreshold","type":"uint256"},{"internalType":"uint256","name":"presentCount","type":"uint256"},{"internalType":"string","name":"note","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"attendance","outputs":[{"internalType":"bool","name":"hasSigned","type":"bool"},{"internalType":"bool","name":"isValidated","type":"bool"},{"internalType":"bool","name":"isLate","type":"bool"},{"internalType":"uint256","name":"signedAt","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_teacher","type":"address"}],"name":"addTeacher","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_teacher","type":"address"}],"name":"removeTeacher","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_classId","type":"uint256"}],"name":"deleteClass","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"createClass","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_student","type":"address"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint256","name":"_classId","type":"uint256"}],"name":"registerStudent","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_classId","type":"uint256"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"bytes32","name":"_secretHash","type":"bytes32"},{"internalType":"uint256","name":"_duration","type":"uint256"},{"internalType":"uint256","name":"_lateThreshold","type":"uint256"}],"name":"createSession","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"}],"name":"closeSession","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"},{"internalType":"address","name":"_student","type":"address"}],"name":"markAbsent","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"},{"internalType":"string","name":"_secret","type":"string"}],"name":"signAttendance","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"}],"name":"isSessionActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getClassCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getSessionCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"}],"name":"getSessionAttendees","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"},{"internalType":"address","name":"_student","type":"address"}],"name":"getStudentAttendanceForSession","outputs":[{"components":[{"internalType":"bool","name":"hasSigned","type":"bool"},{"internalType":"bool","name":"isValidated","type":"bool"},{"internalType":"bool","name":"isLate","type":"bool"},{"internalType":"uint256","name":"signedAt","type":"uint256"}],"internalType":"struct AttendanceSystem.AttendanceRecord","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getTeacherCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getStudentCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"justifications","outputs":[{"internalType":"string","name":"reason","type":"string"},{"internalType":"bool","name":"submitted","type":"bool"},{"internalType":"bool","name":"accepted","type":"bool"},{"internalType":"bool","name":"reviewed","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"},{"internalType":"string","name":"_reason","type":"string"}],"name":"submitJustification","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"},{"internalType":"address","name":"_student","type":"address"},{"internalType":"bool","name":"_accept","type":"bool"}],"name":"reviewJustification","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_student","type":"address"}],"name":"unregisterStudent","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_classId","type":"uint256"},{"internalType":"address","name":"_newTeacher","type":"address"}],"name":"transferClass","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"},{"internalType":"uint256","name":"_newDuration","type":"uint256"}],"name":"reopenSession","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"},{"internalType":"bytes32","name":"_newHash","type":"bytes32"}],"name":"updateSessionCode","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_sessionId","type":"uint256"},{"internalType":"string","name":"_note","type":"string"}],"name":"setSessionNote","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"student","type":"address"},{"indexed":true,"internalType":"uint256","name":"classId","type":"uint256"}],"name":"StudentUnregistered","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"classId","type":"uint256"},{"indexed":true,"internalType":"address","name":"fromTeacher","type":"address"},{"indexed":true,"internalType":"address","name":"toTeacher","type":"address"}],"name":"ClassTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newDuration","type":"uint256"}],"name":"SessionReopened","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"sessionId","type":"uint256"},{"indexed":false,"internalType":"string","name":"note","type":"string"}],"name":"SessionNoteUpdated","type":"event"}
];

let web3, contract, account;

async function connect() {
    if (!window.ethereum) {
        alert("MetaMask n'est pas installé.");
        return;
    }
    try {
        const data = await fetch('/contract-address.json').then(r => r.json());
        CONTRACT_ADDRESS = data.address;

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

        document.getElementById('infoCompte').classList.remove('hidden');
        document.getElementById('spanCompte').textContent = account.slice(0,6) + '…' + account.slice(-4);

        await detectRole();

        window.ethereum.on('accountsChanged', (accs) => {
            if (accs.length === 0) resetUI();
            else location.reload();
        });
    } catch (e) {
        alert("Connexion MetaMask refusée.");
    }
}

async function resetUI() {
    if (_countdownInterval) { clearInterval(_countdownInterval); _countdownInterval = null; }
    try {
        await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
        });
    } catch (_) {}
    web3 = null; contract = null; account = null;
    document.getElementById('infoCompte').classList.add('hidden');
    document.getElementById('spanRole').textContent = '';
    document.getElementById('spanCompte').textContent = '';
    ['vueAdmin','vueProf','vueEtudiant','vueNonEnregistre']
        .forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('bannerPause').classList.add('hidden');
    document.getElementById('accueil').classList.remove('hidden');
}

async function detectRole() {
    ['vueAdmin','vueProf','vueEtudiant','vueNonEnregistre']
        .forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('accueil').classList.add('hidden');

    try {
        const adminAddr = await contract.methods.admin().call();
        if (account.toLowerCase() === adminAddr.toLowerCase()) {
            showRole('Super-Admin');
            document.getElementById('vueAdmin').classList.remove('hidden');
            await loadAdminView();
            return;
        }
        if (await contract.methods.teachers(account).call()) {
            showRole('Professeur');
            document.getElementById('vueProf').classList.remove('hidden');
            const isPaused = await contract.methods.paused().call();
            if (isPaused) document.getElementById('bannerPause').classList.remove('hidden');
            await loadTeacherView();
            return;
        }
        const student = await contract.methods.students(account).call();
        if (student.isRegistered) {
            showRole('Étudiant');
            document.getElementById('vueEtudiant').classList.remove('hidden');
            const isPaused = await contract.methods.paused().call();
            if (isPaused) document.getElementById('bannerPause').classList.remove('hidden');
            await loadStudentView(student);
            return;
        }
        document.getElementById('vueNonEnregistre').classList.remove('hidden');
    } catch (e) {
        console.error(e);
        alert("Erreur de connexion au contrat. Vérifiez l'adresse du contrat et le réseau Ganache.");
    }
}

function showRole(text) {
    const el = document.getElementById('spanRole');
    el.textContent = text;
    el.classList.remove('hidden');
}

// Vue Admin
async function loadAdminView() {
    const isPaused = await contract.methods.paused().call();
    const banner = document.getElementById('bannerPause');
    if (isPaused) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
    const btnPause = document.getElementById('btnPause');
    if (isPaused) {
        btnPause.textContent = 'Réactiver le contrat';
        btnPause.className = '';
        btnPause.onclick = unpauseContract;
    } else {
        btnPause.textContent = 'Mettre en pause';
        btnPause.className = 'danger';
        btnPause.onclick = pauseContract;
    }
    const tbody = document.getElementById('corpsTableProfs');
    tbody.innerHTML = '';
    const total = await contract.methods.getTeacherCount().call();
    for (let i = 0; i < total; i++) {
        const addr = await contract.methods.teacherList(i).call();
        if (!await contract.methods.teachers(addr).call()) continue;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${addr}</td>
            <td><button class="danger" onclick="removeTeacher('${addr}')">Retirer</button></td>`;
        tbody.appendChild(tr);
    }
}

async function addTeacher(e) {
    e.preventDefault();
    const addr = document.getElementById('inputAdresseProf').value.trim();
    const msg  = document.getElementById('msgAdmin');
    if (!web3.utils.isAddress(addr)) { showMsg(msg, 'Adresse invalide.', false); return; }
    try {
        await contract.methods.addTeacher(addr).send({ from: account });
        showMsg(msg, 'Professeur ajouté.', true);
        document.getElementById('inputAdresseProf').value = '';
        await loadAdminView();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function removeTeacher(addr) {
    const msg = document.getElementById('msgAdmin');
    try {
        await contract.methods.removeTeacher(addr).send({ from: account });
        showMsg(msg, 'Professeur retiré.', true);
        await loadAdminView();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function pauseContract() {
    const msg = document.getElementById('msgAdmin');
    try {
        await contract.methods.pause().send({ from: account });
        showMsg(msg, 'Contrat mis en pause.', true);
        await detectRole();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function unpauseContract() {
    const msg = document.getElementById('msgAdmin');
    try {
        await contract.methods.unpause().send({ from: account });
        showMsg(msg, 'Contrat réactivé.', true);
        await detectRole();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

// Vue Professeur
async function loadTeacherView() {
    await loadClasses();
    await loadStudents();
    await loadSessions();
    const selHis = document.getElementById('selectSessionHistorique');
    if (selHis.options.length > 0) await refreshAttendance(selHis.value);
}

// Classes
async function loadClasses() {
    const tbody  = document.getElementById('corpsTableClasses');
    const selEtu = document.getElementById('selectClasseEtudiant');
    const selSes = document.getElementById('selectClasseSession');
    const selHis = document.getElementById('selectSessionHistorique');
    tbody.innerHTML = '';
    selEtu.innerHTML = '';
    selSes.innerHTML = '';
    selHis.innerHTML = '';

    const totalCl = await contract.methods.getClassCount().call();
    for (let i = 0; i < totalCl; i++) {
        const cl = await contract.methods.classes(i).call();
        if (!cl.exists || cl.teacher.toLowerCase() !== account.toLowerCase()) continue;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i}</td><td>${cl.name}</td>
            <td><button class="danger" onclick="deleteClass(${i})">Supprimer</button>
            <button class="secondary" onclick="promptTransferClass(${i})">Transférer</button></td>`;
        tbody.appendChild(tr);
        selEtu.appendChild(new Option(`[${i}] ${cl.name}`, i));
        selSes.appendChild(new Option(`[${i}] ${cl.name}`, i));
    }
    // Peupler le sélecteur de sessions pour l'historique
    const totalSes = await contract.methods.getSessionCount().call();
    for (let i = 0; i < totalSes; i++) {
        const s  = await contract.methods.sessions(i).call();
        const cl = await contract.methods.classes(s.classId).call();
        if (cl.teacher.toLowerCase() !== account.toLowerCase()) continue;
        selHis.appendChild(new Option(`[${i}] ${s.name}`, i));
    }
}

async function deleteClass(classId) {
    const msg = document.getElementById('msgClasse');
    try {
        await contract.methods.deleteClass(classId).send({ from: account });
        showMsg(msg, `Classe ${classId} supprimée.`, true);
        await loadTeacherView();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function promptTransferClass(classId) {
    const addr = prompt('Adresse Ethereum du nouveau professeur :');
    if (!addr || !addr.trim()) return;
    const msg = document.getElementById('msgClasse');
    if (!web3.utils.isAddress(addr.trim())) { showMsg(msg, 'Adresse invalide.', false); return; }
    try {
        await contract.methods.transferClass(classId, addr.trim()).send({ from: account });
        showMsg(msg, `Classe ${classId} transférée.`, true);
        await loadTeacherView();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function createClass(e) {
    e.preventDefault();
    const name = document.getElementById('inputNomClasse').value.trim();
    const msg  = document.getElementById('msgClasse');
    if (!name) { showMsg(msg, 'Nom vide.', false); return; }
    try {
        await contract.methods.createClass(name).send({ from: account });
        showMsg(msg, `Classe "${name}" créée.`, true);
        document.getElementById('inputNomClasse').value = '';
        await loadTeacherView();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

// Étudiants
async function loadStudents() {
    const tbody = document.getElementById('corpsTableEtudiants');
    tbody.innerHTML = '';
    const totalCl  = await contract.methods.getClassCount().call();
    const totalEtu = await contract.methods.getStudentCount().call();
    const myClasses = {};
    for (let i = 0; i < totalCl; i++) {
        const cl = await contract.methods.classes(i).call();
        if (cl.teacher.toLowerCase() === account.toLowerCase()) myClasses[i] = cl.name;
    }
    for (let i = 0; i < totalEtu; i++) {
        const addr    = await contract.methods.studentList(i).call();
        const student = await contract.methods.students(addr).call();
        if (!student.isRegistered || !(student.classId in myClasses)) continue;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${addr}</td><td>${student.name}</td><td>${myClasses[student.classId]}</td>
            <td><button class="danger" onclick="unregisterStudent('${addr}')">Désinscrire</button></td>`;
        tbody.appendChild(tr);
    }
}

async function registerStudent(e) {
    e.preventDefault();
    const addr    = document.getElementById('inputAdresseEtudiant').value.trim();
    const name    = document.getElementById('inputNomEtudiant').value.trim();
    const classId = document.getElementById('selectClasseEtudiant').value;
    const msg     = document.getElementById('msgEtudiant');
    if (!web3.utils.isAddress(addr)) { showMsg(msg, 'Adresse invalide.', false); return; }
    if (!name) { showMsg(msg, 'Nom vide.', false); return; }
    try {
        await contract.methods.registerStudent(addr, name, classId).send({ from: account });
        showMsg(msg, `Étudiant "${name}" inscrit.`, true);
        document.getElementById('inputAdresseEtudiant').value = '';
        document.getElementById('inputNomEtudiant').value = '';
        await loadStudents();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function unregisterStudent(addr) {
    const msg = document.getElementById('msgEtudiant');
    try {
        await contract.methods.unregisterStudent(addr).send({ from: account });
        showMsg(msg, 'Étudiant désinscrit.', true);
        await loadStudents();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

// Sessions
async function loadSessions() {
    const tbody = document.getElementById('corpsTableSessions');
    tbody.innerHTML = '';
    const total = await contract.methods.getSessionCount().call();
    for (let i = 0; i < total; i++) {
        const s  = await contract.methods.sessions(i).call();
        const cl = await contract.methods.classes(s.classId).call();
        if (cl.teacher.toLowerCase() !== account.toLowerCase()) continue;
        const active = await contract.methods.isSessionActive(i).call();
        let statut, cls;
        if (active)        { statut = 'Ouverte'; cls = 'ouvert'; }
        else if (s.isOpen) { statut = 'Expirée'; cls = 'expire'; }
        else               { statut = 'Fermée';  cls = 'ferme';  }
        let actions = '';
        if (active)
            actions = `<button class="secondary" onclick="closeSession(${i})">Fermer</button>
                <button class="secondary" onclick="promptUpdateCode(${i})">Changer code</button>`;
        else
            actions = `<button class="secondary" onclick="promptReopenSession(${i})">Rouvrir</button>`;
        actions += ` <button onclick="promptSessionNote(${i})">Note</button>`;
        const noteText = s.note ? ` — ${s.note}` : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i}</td><td>${s.name}${noteText}</td><td>${cl.name}</td>
            <td class="${cls}">${statut}</td>
            <td>${s.presentCount}</td>
            <td>${actions}</td>`;
        tbody.appendChild(tr);
    }
}

async function openSession(e) {
    e.preventDefault();
    const classId  = document.getElementById('selectClasseSession').value;
    const name     = document.getElementById('inputNomSession').value.trim();
    const code     = document.getElementById('inputCodeSecret').value.trim();
    const duration = parseInt(document.getElementById('inputDuree').value) || 15;
    const late     = parseInt(document.getElementById('inputRetard').value) || 0;
    const msg      = document.getElementById('msgSession');
    if (!name) { showMsg(msg, 'Nom de session vide.', false); return; }
    if (!code) { showMsg(msg, 'Code secret vide.', false); return; }
    try {
        const hash = web3.utils.soliditySha3(code);
        await contract.methods.createSession(classId, name, hash, duration * 60, late * 60).send({ from: account });
        const info = late > 0 ? ` Retard après ${late} min.` : '';
        showMsg(msg, `Session "${name}" ouverte (${duration} min).${info}`, true);
        document.getElementById('inputNomSession').value = '';
        document.getElementById('inputCodeSecret').value = '';
        await loadTeacherView();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function closeSession(sessionId) {
    const msg = document.getElementById('msgSession');
    try {
        await contract.methods.closeSession(sessionId).send({ from: account });
        showMsg(msg, `Session ${sessionId} fermée.`, true);
        await loadTeacherView();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function promptReopenSession(sessionId) {
    const minutes = prompt('Nouvelle durée en minutes :');
    if (!minutes) return;
    const duration = parseInt(minutes);
    if (!duration || duration < 1) return;
    const msg = document.getElementById('msgSession');
    try {
        await contract.methods.reopenSession(sessionId, duration * 60).send({ from: account });
        showMsg(msg, `Session ${sessionId} rouverte (${duration} min).`, true);
        await loadTeacherView();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function promptUpdateCode(sessionId) {
    const code = prompt('Nouveau code secret :');
    if (!code || !code.trim()) return;
    const msg = document.getElementById('msgSession');
    try {
        const hash = web3.utils.soliditySha3(code.trim());
        await contract.methods.updateSessionCode(sessionId, hash).send({ from: account });
        showMsg(msg, 'Code secret mis à jour.', true);
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function promptSessionNote(sessionId) {
    const note = prompt('Note pour cette session :');
    if (note === null) return;
    const msg = document.getElementById('msgSession');
    try {
        await contract.methods.setSessionNote(sessionId, note.trim()).send({ from: account });
        showMsg(msg, 'Note enregistrée.', true);
        await loadTeacherView();
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

// Historique de présence
async function loadAttendance(e) {
    e.preventDefault();
    await refreshAttendance(document.getElementById('selectSessionHistorique').value);
}

async function refreshAttendance(sessionId) {
    const tbody = document.getElementById('corpsTableHistorique');
    const msg   = document.getElementById('msgHistorique');
    tbody.innerHTML = '';
    try {
        const s        = await contract.methods.sessions(sessionId).call();
        const active   = await contract.methods.isSessionActive(sessionId).call();
        const totalEtu = await contract.methods.getStudentCount().call();
        for (let i = 0; i < totalEtu; i++) {
            const addr    = await contract.methods.studentList(i).call();
            const student = await contract.methods.students(addr).call();
            if (!student.isRegistered || student.classId.toString() !== s.classId.toString()) continue;
            const rec = await contract.methods.attendance(sessionId, addr).call();
            const just = await contract.methods.justifications(sessionId, addr).call();
            const { text: statut, cls } = attendanceStatus(rec, just, active);
            const heure = rec.hasSigned
                ? new Date(rec.signedAt * 1000).toLocaleTimeString('fr-FR')
                : '—';
            let actions = '';
            if (rec.hasSigned && rec.isValidated)
                actions = `<button class="danger" onclick="invalidateAttendance(${sessionId},'${addr}')">Invalider</button>`;
            else if (just.submitted && !just.reviewed)
                actions = `<button onclick="reviewJustification(${sessionId},'${addr}',true)">Accepter</button>
                    <button class="danger" onclick="reviewJustification(${sessionId},'${addr}',false)">Refuser</button>`;
            const justCol = just.submitted ? just.reason : '—';
            const tr = document.createElement('tr');
            tr.innerHTML = `<td title="${addr}">${addr.slice(0,8)}…</td>
                <td>${student.name}</td>
                <td class="${cls}">${statut}</td>
                <td>${heure}</td>
                <td>${justCol}</td>
                <td>${actions}</td>`;
            tbody.appendChild(tr);
        }
        showMsg(msg, '', true);
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function reviewJustification(sessionId, addr, accept) {
    const msg = document.getElementById('msgHistorique');
    try {
        await contract.methods.reviewJustification(sessionId, addr, accept).send({ from: account });
        showMsg(msg, accept ? 'Justification acceptée.' : 'Justification refusée.', true);
        await refreshAttendance(sessionId);
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function invalidateAttendance(sessionId, addr) {
    const msg = document.getElementById('msgHistorique');
    try {
        await contract.methods.markAbsent(sessionId, addr).send({ from: account });
        showMsg(msg, 'Présence invalidée.', true);
        await refreshAttendance(sessionId);
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

// Vue Étudiant
async function loadStudentView(student) {
    document.getElementById('infoEtudiant').textContent =
        `Connecté en tant que : ${student.name} — Classe ID : ${student.classId}`;
    await loadOpenSessions(student.classId);
    await loadHistory(student.classId);
}

let _countdownInterval = null;

async function loadOpenSessions(classId) {
    if (_countdownInterval) { clearInterval(_countdownInterval); _countdownInterval = null; }
    const tbody = document.getElementById('corpsSessionsOuvertes');
    const total = await contract.methods.getSessionCount().call();

    const activeSessions = [];
    for (let i = 0; i < total; i++) {
        const s = await contract.methods.sessions(i).call();
        if (s.classId.toString() !== classId.toString()) continue;
        if (!await contract.methods.isSessionActive(i).call()) continue;
        activeSessions.push({ id: i, name: s.name, endsAt: parseInt(s.createdAt) + parseInt(s.duration) });
    }

    function renderCountdowns() {
        const now = Math.floor(Date.now() / 1000);
        const stillActive = activeSessions.filter(s => s.endsAt > now);
        if (stillActive.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Aucune session ouverte pour votre classe.</td></tr>';
            if (_countdownInterval) { clearInterval(_countdownInterval); _countdownInterval = null; }
            return;
        }
        tbody.innerHTML = stillActive.map(s => {
            const remaining = s.endsAt - now;
            const min = Math.floor(remaining / 60);
            const sec = remaining % 60;
            return `<tr><td>${s.id}</td><td>${s.name}</td>
                <td class="ouvert">${min}m ${sec < 10 ? '0' : ''}${sec}s</td></tr>`;
        }).join('');
    }

    renderCountdowns();
    if (activeSessions.length > 0)
        _countdownInterval = setInterval(renderCountdowns, 1000);
}

async function signAttendance(e) {
    e.preventDefault();
    const sessionId = document.getElementById('inputIdSession').value.trim();
    const code      = document.getElementById('inputCodeEtudiant').value.trim();
    const msg       = document.getElementById('msgSignature');
    if (sessionId === '' || isNaN(sessionId) || !code) { showMsg(msg, 'ID de session (numérique) et code secret requis.', false); return; }
    try {
        await contract.methods.signAttendance(sessionId, code).send({ from: account });
        showMsg(msg, 'Présence signée avec succès !', true);
        document.getElementById('inputIdSession').value = '';
        document.getElementById('inputCodeEtudiant').value = '';
        const student = await contract.methods.students(account).call();
        await loadOpenSessions(student.classId);
        await loadHistory(student.classId);
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

async function loadHistory(classId) {
    const tbody = document.getElementById('corpsHistoriqueEtudiant');
    tbody.innerHTML = '';
    const total = await contract.methods.getSessionCount().call();
    for (let i = 0; i < total; i++) {
        const s = await contract.methods.sessions(i).call();
        if (s.classId.toString() !== classId.toString()) continue;
        const rec = await contract.methods.attendance(i, account).call();
        const just = await contract.methods.justifications(i, account).call();
        const active = await contract.methods.isSessionActive(i).call();
        const { text: statut, cls } = attendanceStatus(rec, just, active);
        const date = rec.hasSigned
            ? new Date(rec.signedAt * 1000).toLocaleString('fr-FR')
            : '—';
        let action = '';
        if (!rec.hasSigned && !just.submitted && !active)
            action = `<button class="secondary" onclick="promptJustification(${i})">Justifier</button>`;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i}</td><td>${s.name}</td>
            <td>${date}</td><td class="${cls}">${statut}</td><td>${action}</td>`;
        tbody.appendChild(tr);
    }
}

async function promptJustification(sessionId) {
    const reason = prompt('Motif de justification :');
    if (!reason || !reason.trim()) return;
    const msg = document.getElementById('msgSignature');
    try {
        await contract.methods.submitJustification(sessionId, reason.trim()).send({ from: account });
        showMsg(msg, 'Justification envoyée.', true);
        const student = await contract.methods.students(account).call();
        await loadHistory(student.classId);
    } catch (e) { showMsg(msg, 'Erreur lors de la transaction.', false); console.error(e); }
}

// Utilitaires
function attendanceStatus(rec, just, active) {
    if (rec.hasSigned && rec.isValidated && rec.isLate)  return { text: 'En retard', cls: 'retard' };
    if (rec.hasSigned && rec.isValidated)  return { text: 'Présent',  cls: 'present' };
    if (rec.hasSigned && !rec.isValidated) return { text: 'Invalidé', cls: 'invalide' };
    if (just && just.submitted && just.reviewed && just.accepted) return { text: 'Justifié', cls: 'justifie' };
    if (just && just.submitted && just.reviewed && !just.accepted) return { text: 'Refusé', cls: 'absent' };
    if (just && just.submitted && !just.reviewed) return { text: 'En attente', cls: 'attente' };
    if (active) return { text: 'En cours', cls: 'encours' };
    return { text: 'Absent', cls: 'absent' };
}

function showMsg(el, text, success) {
    el.textContent = text;
    el.className = success ? 'msg-ok' : 'msg-err';
}

// Auto-connexion si MetaMask est déjà connecté (ex: après changement de compte)
window.addEventListener('load', async () => {
    if (!window.ethereum) return;
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) await connect();
    } catch (_) {}
});

