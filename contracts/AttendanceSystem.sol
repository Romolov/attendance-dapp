// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Système de présence décentralisé - 3 rôles : Admin, Professeur, Étudiant
contract AttendanceSystem {

    struct Student {
        string name;
        bool isRegistered;
        uint256 classId;
    }

    struct Class {
        string name;
        address teacher;
        bool exists; // nécessaire pour que classId=0 soit un ID valide
    }

    struct Session {
        string name;
        uint256 classId;
        bytes32 secretHash; // keccak256 du code secret, jamais stocké en clair
        bool isOpen;
        uint256 createdAt;
        uint256 duration;
        uint256 lateThreshold; // secondes après lesquelles c'est un retard (0 = pas de retard)
        uint256 presentCount;
        string note; // note/commentaire du prof sur la session
    }

    struct AttendanceRecord {
        bool hasSigned;
        bool isValidated; // false si invalidée par le prof après signature
        bool isLate;
        uint256 signedAt;
    }

    struct Justification {
        string reason;
        bool submitted;
        bool accepted;
        bool reviewed;
    }

    address public admin;
    bool public paused;

    mapping(address => bool) public teachers;
    address[] public teacherList;

    Class[] public classes;
    mapping(address => Student) public students;
    address[] public studentList;

    Session[] public sessions;
    mapping(uint256 => mapping(address => AttendanceRecord)) public attendance;
    mapping(uint256 => address[]) public sessionAttendees;
    mapping(uint256 => mapping(address => Justification)) public justifications;

    event TeacherAdded(address indexed teacher);
    event TeacherRemoved(address indexed teacher);
    event ClassCreated(uint256 indexed classId, string name, address indexed teacher);
    event StudentRegistered(address indexed student, uint256 indexed classId);
    event SessionCreated(uint256 indexed sessionId, uint256 indexed classId, string name);
    event ClassDeleted(uint256 indexed classId);
    event SessionClosed(uint256 indexed sessionId);
    event AttendanceSigned(address indexed student, uint256 indexed sessionId, uint256 timestamp);
    event AttendanceInvalidated(address indexed student, uint256 indexed sessionId, address indexed byTeacher);
    event JustificationSubmitted(address indexed student, uint256 indexed sessionId, string reason);
    event JustificationReviewed(address indexed student, uint256 indexed sessionId, bool accepted);
    event StudentUnregistered(address indexed student, uint256 indexed classId);
    event ClassTransferred(uint256 indexed classId, address indexed fromTeacher, address indexed toTeacher);
    event SessionReopened(uint256 indexed sessionId, uint256 newDuration);
    event SessionNoteUpdated(uint256 indexed sessionId, string note);
    event ContractPaused(address indexed byAdmin);
    event ContractUnpaused(address indexed byAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Acces refuse : vous n'etes pas l'administrateur");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Le contrat est en pause");
        _;
    }

    modifier onlyTeacher() {
        require(teachers[msg.sender], "Acces refuse : vous n'etes pas un professeur");
        _;
    }

    modifier onlyRegisteredStudent() {
        require(students[msg.sender].isRegistered, "Acces refuse : vous n'etes pas un etudiant enregistre");
        _;
    }

    modifier sessionExists(uint256 sessionId) {
        require(sessionId < sessions.length, "Session inexistante");
        _;
    }

    modifier onlySessionTeacher(uint256 sessionId) {
        require(sessionId < sessions.length, "Session inexistante");
        require(
            classes[sessions[sessionId].classId].teacher == msg.sender,
            "Acces refuse : vous n'etes pas le professeur de cette session"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function pause() external onlyAdmin {
        require(!paused, "Deja en pause");
        paused = true;
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyAdmin {
        require(paused, "Pas en pause");
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    function addTeacher(address _teacher) external onlyAdmin {
        require(_teacher != address(0), "Adresse invalide");
        require(!teachers[_teacher], "Ce professeur est deja enregistre");
        teachers[_teacher] = true;
        teacherList.push(_teacher);
        emit TeacherAdded(_teacher);
    }

    // teacherList conserve l'adresse mais teachers[addr] passe à false
    function removeTeacher(address _teacher) external onlyAdmin {
        require(teachers[_teacher], "Ce professeur n'est pas enregistre");
        teachers[_teacher] = false;
        emit TeacherRemoved(_teacher);
    }

    function deleteClass(uint256 _classId) external whenNotPaused {
        require(_classId < classes.length && classes[_classId].exists, "Classe inexistante");
        require(
            msg.sender == admin || classes[_classId].teacher == msg.sender,
            "Acces refuse : vous n'etes pas le proprietaire de cette classe"
        );
        classes[_classId].exists = false;
        emit ClassDeleted(_classId);
    }

    function createClass(string calldata _name) external onlyTeacher whenNotPaused {
        require(bytes(_name).length > 0, "Le nom de la classe est vide");
        classes.push(Class({ name: _name, teacher: msg.sender, exists: true }));
        emit ClassCreated(classes.length - 1, _name, msg.sender);
    }

    function registerStudent(address _student, string calldata _name, uint256 _classId) external onlyTeacher whenNotPaused {
        require(_student != address(0), "Adresse invalide");
        require(_classId < classes.length && classes[_classId].exists, "Classe inexistante");
        require(classes[_classId].teacher == msg.sender, "Acces refuse : vous n'etes pas le professeur de cette classe");
        require(!students[_student].isRegistered, "Cet etudiant est deja enregistre");
        require(bytes(_name).length > 0, "Le nom de l'etudiant est vide");

        students[_student] = Student({ name: _name, isRegistered: true, classId: _classId });
        studentList.push(_student);
        emit StudentRegistered(_student, _classId);
    }

    function createSession(uint256 _classId, string calldata _name, bytes32 _secretHash, uint256 _duration, uint256 _lateThreshold) external onlyTeacher whenNotPaused {
        require(_classId < classes.length && classes[_classId].exists, "Classe inexistante");
        require(classes[_classId].teacher == msg.sender, "Acces refuse : vous n'etes pas le professeur de cette classe");
        require(bytes(_name).length > 0, "Le nom de la session est vide");
        require(_secretHash != bytes32(0), "Hash du code secret invalide");
        require(_duration >= 60 && _duration <= 7200, "Duree entre 1 min et 2h");
        require(_lateThreshold < _duration, "Le seuil de retard doit etre inferieur a la duree");

        sessions.push(Session({
            name: _name,
            classId: _classId,
            secretHash: _secretHash,
            isOpen: true,
            createdAt: block.timestamp,
            duration: _duration,
            lateThreshold: _lateThreshold,
            presentCount: 0,
            note: ""
        }));
        emit SessionCreated(sessions.length - 1, _classId, _name);
    }

    function closeSession(uint256 _sessionId) external onlySessionTeacher(_sessionId) whenNotPaused {
        require(sessions[_sessionId].isOpen, "La session est deja fermee");
        sessions[_sessionId].isOpen = false;
        emit SessionClosed(_sessionId);
    }

    function markAbsent(uint256 _sessionId, address _student) external onlySessionTeacher(_sessionId) whenNotPaused {
        require(attendance[_sessionId][_student].hasSigned, "Cet etudiant n'a pas signe cette session");
        require(attendance[_sessionId][_student].isValidated, "La presence est deja invalidee ou non signee");
        attendance[_sessionId][_student].isValidated = false;
        sessions[_sessionId].presentCount -= 1;
        emit AttendanceInvalidated(_student, _sessionId, msg.sender);
    }

    function signAttendance(uint256 _sessionId, string calldata _secret)
        external
        onlyRegisteredStudent
        sessionExists(_sessionId)
        whenNotPaused
    {
        require(isSessionActive(_sessionId), "La session est fermee ou expiree");
        require(
            students[msg.sender].classId == sessions[_sessionId].classId,
            "Vous n'appartenez pas a la classe de cette session"
        );
        require(!attendance[_sessionId][msg.sender].hasSigned, "Vous avez deja signe cette session");
        require(
            keccak256(abi.encodePacked(_secret)) == sessions[_sessionId].secretHash,
            "Code secret incorrect"
        );

        Session storage s = sessions[_sessionId];
        bool late = (s.lateThreshold > 0 && block.timestamp > s.createdAt + s.lateThreshold);

        attendance[_sessionId][msg.sender] = AttendanceRecord({
            hasSigned: true,
            isValidated: true,
            isLate: late,
            signedAt: block.timestamp
        });
        sessionAttendees[_sessionId].push(msg.sender);
        sessions[_sessionId].presentCount += 1;
        emit AttendanceSigned(msg.sender, _sessionId, block.timestamp);
    }

    // L'étudiant justifie une absence pour une session donnée
    function submitJustification(uint256 _sessionId, string calldata _reason)
        external
        onlyRegisteredStudent
        sessionExists(_sessionId)
        whenNotPaused
    {
        require(!attendance[_sessionId][msg.sender].hasSigned, "Vous avez signe cette session, pas besoin de justifier");
        require(!justifications[_sessionId][msg.sender].submitted, "Justification deja soumise");
        require(bytes(_reason).length > 0, "Le motif est vide");

        justifications[_sessionId][msg.sender] = Justification({
            reason: _reason,
            submitted: true,
            accepted: false,
            reviewed: false
        });
        emit JustificationSubmitted(msg.sender, _sessionId, _reason);
    }

    // Le prof accepte ou refuse une justification
    function reviewJustification(uint256 _sessionId, address _student, bool _accept)
        external
        onlySessionTeacher(_sessionId)
    {
        require(justifications[_sessionId][_student].submitted, "Aucune justification soumise");
        require(!justifications[_sessionId][_student].reviewed, "Justification deja traitee");

        justifications[_sessionId][_student].reviewed = true;
        justifications[_sessionId][_student].accepted = _accept;
        emit JustificationReviewed(_student, _sessionId, _accept);
    }

    function unregisterStudent(address _student) external onlyTeacher whenNotPaused {
        require(students[_student].isRegistered, "Cet etudiant n'est pas enregistre");
        require(
            classes[students[_student].classId].teacher == msg.sender,
            "Acces refuse : vous n'etes pas le professeur de cet etudiant"
        );
        uint256 classId = students[_student].classId;
        students[_student].isRegistered = false;
        emit StudentUnregistered(_student, classId);
    }

    function transferClass(uint256 _classId, address _newTeacher) external onlyTeacher whenNotPaused {
        require(_classId < classes.length && classes[_classId].exists, "Classe inexistante");
        require(classes[_classId].teacher == msg.sender, "Acces refuse : vous n'etes pas le proprietaire de cette classe");
        require(teachers[_newTeacher], "Le destinataire n'est pas un professeur enregistre");
        require(_newTeacher != msg.sender, "Vous etes deja le proprietaire de cette classe");
        classes[_classId].teacher = _newTeacher;
        emit ClassTransferred(_classId, msg.sender, _newTeacher);
    }

    function reopenSession(uint256 _sessionId, uint256 _newDuration) external onlySessionTeacher(_sessionId) whenNotPaused {
        require(!isSessionActive(_sessionId), "La session est deja active");
        require(_newDuration >= 60 && _newDuration <= 7200, "Duree entre 1 min et 2h");
        sessions[_sessionId].isOpen = true;
        sessions[_sessionId].createdAt = block.timestamp;
        sessions[_sessionId].duration = _newDuration;
        emit SessionReopened(_sessionId, _newDuration);
    }

    function updateSessionCode(uint256 _sessionId, bytes32 _newHash) external onlySessionTeacher(_sessionId) whenNotPaused {
        require(isSessionActive(_sessionId), "La session est fermee ou expiree");
        require(_newHash != bytes32(0), "Hash du code secret invalide");
        sessions[_sessionId].secretHash = _newHash;
    }

    function setSessionNote(uint256 _sessionId, string calldata _note) external onlySessionTeacher(_sessionId) whenNotPaused {
        sessions[_sessionId].note = _note;
        emit SessionNoteUpdated(_sessionId, _note);
    }

    function isSessionActive(uint256 _sessionId) public view sessionExists(_sessionId) returns (bool) {
        Session storage s = sessions[_sessionId];
        return s.isOpen && (block.timestamp <= s.createdAt + s.duration);
    }

    function getClassCount() external view returns (uint256) { return classes.length; }
    function getSessionCount() external view returns (uint256) { return sessions.length; }
    function getTeacherCount() external view returns (uint256) { return teacherList.length; }
    function getStudentCount() external view returns (uint256) { return studentList.length; }

    function getSessionAttendees(uint256 _sessionId) external view sessionExists(_sessionId) returns (address[] memory) {
        return sessionAttendees[_sessionId];
    }

    function getStudentAttendanceForSession(uint256 _sessionId, address _student)
        external view sessionExists(_sessionId) returns (AttendanceRecord memory)
    {
        return attendance[_sessionId][_student];
    }
}
