const API_BASE_URL = window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:3000";

const SUBJECTS = [
  // 1st Sem Core, Languages & Labs
  { id: "kannada", name: "Kannada", short: "Kannada", icon: "", semester: "1st Semester" },
  { id: "hindi", name: "Hindi", short: "Hindi", icon: "", semester: "1st Semester" },
  { id: "english", name: "English", short: "English", icon: "", semester: "1st Semester" },
  { id: "maths", name: "Mathematics", short: "Maths", icon: "", semester: "1st Semester" },
  { id: "accountancy", name: "Accountancy", short: "Acc", icon: "", semester: "1st Semester" },
  { id: "cprog", name: "C Programming", short: "C Prog", icon: "", semester: "1st Semester" },
  { id: "dbms", name: "DBMS", short: "DBMS", icon: "", semester: "1st Semester" },
  { id: "ic", name: "Indian Constitution", short: "IC", icon: "", semester: "1st Semester" },
  { id: "clab", name: "C Lab", short: "C Lab", icon: "", semester: "1st Semester" },
  { id: "dbmslab", name: "DBMS Lab", short: "DBMS Lab", icon: "", semester: "1st Semester" },
  { id: "oalab", name: "OA Lab", short: "OA Lab", icon: "", semester: "1st Semester" },

  // 2nd Sem Core, Languages & Labs
  { id: "kannada_sem2", name: "Kannada", short: "Kannada", icon: "", semester: "2nd Semester" },
  { id: "hindi_sem2", name: "Hindi", short: "Hindi", icon: "", semester: "2nd Semester" },
  { id: "english_sem2", name: "English", short: "English", icon: "", semester: "2nd Semester" },
  { id: "nsm", name: "Numerical & Statistical Methods", short: "NSM", icon: "", semester: "2nd Semester" },
  { id: "ds", name: "Data Structure", short: "DS", icon: "", semester: "2nd Semester" },
  { id: "java", name: "Java", short: "Java", icon: "", semester: "2nd Semester" },
  { id: "nsmlab", name: "NSM Lab", short: "NSM Lab", icon: "", semester: "2nd Semester" },
  { id: "dslab", name: "DS Lab", short: "DS Lab", icon: "", semester: "2nd Semester" },
  { id: "javalab", name: "Java Lab", short: "Java Lab", icon: "", semester: "2nd Semester" },

  // 3rd Sem Core, Languages & Labs
  { id: "kannada_sem3", name: "Kannada", short: "Kannada", icon: "", semester: "3rd Semester" },
  { id: "hindi_sem3", name: "Hindi", short: "Hindi", icon: "", semester: "3rd Semester" },
  { id: "english_sem3", name: "English", short: "English", icon: "", semester: "3rd Semester" },
  { id: "python", name: "Python", short: "Python", icon: "", semester: "3rd Semester" },
  { id: "os", name: "Operating System", short: "OS", icon: "", semester: "3rd Semester" },
  { id: "advjava", name: "Advance Java", short: "Adv.Java", icon: "", semester: "3rd Semester" },
  { id: "ost", name: "Open Source Tool", short: "OST", icon: "", semester: "3rd Semester" },
  { id: "evs", name: "Environmental Studies", short: "EVS", icon: "", semester: "3rd Semester" },
  { id: "oslab", name: "OS Lab", short: "OS Lab", icon: "", semester: "3rd Semester" },
  { id: "pythonlab", name: "Python Lab", short: "Python Lab", icon: "", semester: "3rd Semester" },
  { id: "advjavalab", name: "Adv.Java Lab", short: "Adv.Java Lab", icon: "", semester: "3rd Semester" },

  // 4th Sem Core, Languages & Labs
  { id: "kannada_sem4", name: "Kannada", short: "Kannada", icon: "", semester: "4th Semester" },
  { id: "hindi_sem4", name: "Hindi", short: "Hindi", icon: "", semester: "4th Semester" },
  { id: "english_sem4", name: "English", short: "English", icon: "", semester: "4th Semester" },
  { id: "cn", name: "Computer Networks", short: "CN", icon: "", semester: "4th Semester" },
  { id: "se", name: "Software Engineering", short: "SE", icon: "", semester: "4th Semester" },
  { id: "webtech", name: "Web Technology", short: "Web Tech", icon: "", semester: "4th Semester" },
  { id: "cnlab", name: "CN Lab", short: "CN Lab", icon: "", semester: "4th Semester" },
  { id: "weblab", name: "Web Lab", short: "Web Lab", icon: "", semester: "4th Semester" },

  // 5th Sem Core, Languages & Labs
  { id: "kannada_sem5", name: "Kannada", short: "Kannada", icon: "", semester: "5th Semester" },
  { id: "hindi_sem5", name: "Hindi", short: "Hindi", icon: "", semester: "5th Semester" },
  { id: "english_sem5", name: "English", short: "English", icon: "", semester: "5th Semester" },
  { id: "ai", name: "Artificial Intelligence", short: "AI", icon: "", semester: "5th Semester" },
  { id: "cloud", name: "Cloud Computing", short: "Cloud", icon: "", semester: "5th Semester" },
  { id: "cyber", name: "Cyber Security", short: "Cyber", icon: "", semester: "5th Semester" },
  { id: "ailab", name: "AI Lab", short: "AI Lab", icon: "", semester: "5th Semester" },
  { id: "cloudlab", name: "Cloud Lab", short: "Cloud Lab", icon: "", semester: "5th Semester" },

  // 6th Sem Core, Languages & Labs
  { id: "kannada_sem6", name: "Kannada", short: "Kannada", icon: "", semester: "6th Semester" },
  { id: "hindi_sem6", name: "Hindi", short: "Hindi", icon: "", semester: "6th Semester" },
  { id: "english_sem6", name: "English", short: "English", icon: "", semester: "6th Semester" },
  { id: "ml", name: "Machine Learning", short: "ML", icon: "", semester: "6th Semester" },
  { id: "iot", name: "Internet of Things", short: "IoT", icon: "", semester: "6th Semester" },
  { id: "majorproject", name: "Major Project", short: "Project", icon: "", semester: "6th Semester" },
  { id: "mllab", name: "ML Lab", short: "ML Lab", icon: "", semester: "6th Semester" },
  { id: "iotlab", name: "IoT Lab", short: "IoT Lab", icon: "", semester: "6th Semester" }
];

const subjectById = id => (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length ? ACADEMIC.subjects : SUBJECTS).find(s => s.id === id);

function getSemesterForSubject(subjectId) {
  const s = subjectById(subjectId);
  if (s && s.semester) return s.semester;
  if (["cprog", "dbms", "ic", "clab", "dbmslab", "oalab", "maths", "accountancy", "kannada", "english", "hindi"].includes(subjectId)) return "1st Semester";
  if (["nsm", "ds", "java", "nsmlab", "dslab", "javalab", "kannada_sem2", "english_sem2", "hindi_sem2"].includes(subjectId)) return "2nd Semester";
  if (["python", "os", "advjava", "ost", "evs", "oslab", "pythonlab", "advjavalab", "kannada_sem3", "english_sem3", "hindi_sem3"].includes(subjectId)) return "3rd Semester";
  if (["cn", "se", "webtech", "cnlab", "weblab", "kannada_sem4", "english_sem4", "hindi_sem4"].includes(subjectId)) return "4th Semester";
  if (["ai", "cloud", "cyber", "ailab", "cloudlab", "kannada_sem5", "english_sem5", "hindi_sem5"].includes(subjectId)) return "5th Semester";
  if (["ml", "iot", "majorproject", "mllab", "iotlab", "kannada_sem6", "english_sem6", "hindi_sem6"].includes(subjectId)) return "6th Semester";
  return "1st Semester";
}

function getCourseYearForSemester(sem) {
  if (sem === "1st Semester" || sem === "2nd Semester") return "1st Year";
  if (sem === "3rd Semester" || sem === "4th Semester") return "2nd Year";
  if (sem === "5th Semester" || sem === "6th Semester") return "3rd Year";
  return "1st Year";
}

function getSemestersForCourseYear(courseYear) {
  if (courseYear === "1st Year") {
    return ["1st Semester", "2nd Semester"];
  } else if (courseYear === "2nd Year") {
    return ["3rd Semester", "4th Semester"];
  } else if (courseYear === "3rd Year") {
    return ["5th Semester", "6th Semester"];
  }
  return ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester"];
}

function updateEditProfileSemesterOptions(courseYear, selectedSem) {
  const semSelect = $("editProfileSemester");
  if (!semSelect) return;

  const validSemesters = getSemestersForCourseYear(courseYear);
  semSelect.innerHTML = `<option value="">Select Semester</option>` +
    validSemesters.map(sem => `<option value="${sem}">${sem}</option>`).join("");

  if (selectedSem && validSemesters.includes(selectedSem)) {
    semSelect.value = selectedSem;
  } else if (validSemesters.length) {
    semSelect.value = validSemesters[0];
  } else {
    semSelect.value = "";
  }

  const is1stSem = semSelect.value === "1st Semester";
  if ($("editProfileMathWrap")) {
    $("editProfileMathWrap").style.display = is1stSem ? "block" : "none";
  }
}

function getSubjectsForStudent(student) {
  const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
  if (!student) return subjectsSource;
  const sem = student.semester || "1st Semester";
  const lang = student.languageChoice || "Kannada";
  const mathOpt = student.mathChoice || "Mathematics";

  return subjectsSource.filter(s => {
    if (s.semester !== sem) return false;

    // Language filtering
    const isKannada = s.name.toLowerCase().includes("kannada") || s.id.toLowerCase().includes("kannada");
    const isHindi = s.name.toLowerCase().includes("hindi") || s.id.toLowerCase().includes("hindi");
    if (isKannada && lang !== "Kannada") return false;
    if (isHindi && lang !== "Hindi") return false;

    // Math/Accountancy filtering (only applies to 1st Semester math options)
    if (sem === "1st Semester") {
      const isMath = s.name.toLowerCase().includes("math") || s.id.toLowerCase().includes("math");
      const isAcc = s.name.toLowerCase().includes("account") || s.id.toLowerCase().includes("account");
      if (isMath && mathOpt !== "Mathematics") return false;
      if (isAcc && mathOpt !== "Accountancy") return false;
    }

    return true;
  });
}

function getStudentsForSubject(subjectId, division = null) {
  if (!subjectId) return [];
  const facultySem = getSemesterForSubject(subjectId);

  return (USERS.student || []).filter(s => {
    const studentSem = s.semester || "1st Semester";
    if (studentSem !== facultySem) return false;
    const studentDiv = s.division || "Div A";
    if (division && division !== "All Divisions" && division !== "Both Divisions" && studentDiv !== division) return false;
    const studentSubjects = getSubjectsForStudent(s);
    return studentSubjects.some(sub => sub && sub.id === subjectId);
  });
}

function getFacultySubjectDivision(faculty, subjectId) {
  if (!faculty) return "Both Divisions";
  const sid = subjectId || faculty.subject;
  if (faculty.subjectDivisions && sid) {
    const d = (typeof faculty.subjectDivisions.get === "function")
      ? faculty.subjectDivisions.get(sid)
      : faculty.subjectDivisions[sid];
    if (d) return d;
  }
  return faculty.division || "Both Divisions";
}

function getFacultyForSubject(subjectId, division = null) {
  if (!subjectId) return [];
  const facultyList = (USERS && Array.isArray(USERS.faculty)) ? USERS.faculty : [];
  return facultyList.filter(f => {
    const facSubs = Array.isArray(f.subjects) && f.subjects.length ? f.subjects : (f.subject ? [f.subject] : []);
    if (!facSubs.includes(subjectId)) return false;
    const facDiv = getFacultySubjectDivision(f, subjectId);
    const isBoth = facDiv === "Both Divisions" || facDiv === "All Divisions" || !facDiv;
    if (isBoth) return true; // Faculty teaches both Div A & Div B for this subject
    if (!division || division === "All Divisions" || division === "Both Divisions") return true;
    return facDiv === division;
  });
}

const DEFAULT_USERS = typeof DB_USERS !== "undefined" ? DB_USERS : {
  student: [],
  faculty: [],
  admin: [{ username: "admin", name: "Administrator", role: "admin", email: "" }]
};

let USERS = loadUsers();

function normalizeClientUsers(data) {
  return {
    student: Array.isArray(data?.student) ? data.student.map(sanitizeClientUser) : [],
    faculty: Array.isArray(data?.faculty) ? data.faculty.map(sanitizeClientUser) : [],
    admin: Array.isArray(data?.admin) ? data.admin.map(sanitizeClientUser) : []
  };
}

function sanitizeClientUser(user) {
  const { password, passwordHash, ...safe } = user || {};
  if (safe && safe.role === "student") {
    safe.course = safe.course || "Bachelor of Computer Applications (BCA)";
    safe.courseYear = safe.courseYear || "";
    safe.semester = safe.semester || "";
    safe.division = safe.division ? (safe.division === "Section A" || safe.division === "Division A" ? "Div A" : (safe.division === "Section B" || safe.division === "Division B" ? "Div B" : safe.division)) : "";
    safe.languageChoice = safe.languageChoice || "";
    safe.mathChoice = safe.mathChoice || "";
    safe.profilePic = safe.profilePic || "";
  }
  if (safe && safe.role === "faculty") {
    safe.department = safe.department || "Department of Computer Science & Applications";
    if (Array.isArray(safe.subjects)) {
      safe.subjects = safe.subjects.map(s => String(s).trim()).filter(Boolean);
    } else if (safe.subject) {
      safe.subjects = [String(safe.subject).trim()];
    } else {
      safe.subjects = [];
    }
    if (!safe.subject && safe.subjects.length > 0) {
      safe.subject = safe.subjects[0];
    } else if (safe.subject && !safe.subjects.includes(safe.subject)) {
      safe.subjects.unshift(safe.subject);
    }
    if (!safe.subjectDivisions || typeof safe.subjectDivisions !== "object") {
      safe.subjectDivisions = {};
    }
    safe.division = safe.division || "Both Divisions";
    safe.email = safe.email || (safe.username ? `${safe.username}@smartportal.edu` : "faculty@smartportal.edu");
    safe.profilePic = safe.profilePic || "";
  }
  if (safe && safe.role === "admin") {
    safe.email = safe.email || "";
    safe.profilePic = safe.profilePic || "";
  }
  return safe;
}

let pendingProfilePic = "";

function getStudentPresetAvatars(nameStr = "S") {
  const initial = (nameStr || "S").charAt(0).toUpperCase();
  const createSvg = (c1, c2, accent) => `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}" />
          <stop offset="100%" stop-color="${c2}" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#g)" />
      <circle cx="60" cy="46" r="22" fill="#ffffff" opacity="0.92" />
      <path d="M 24 104 C 24 76, 38 68, 60 68 C 82 68, 96 76, 96 104 Z" fill="#ffffff" opacity="0.92" />
      <text x="60" y="53" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="${accent}" text-anchor="middle">${initial}</text>
    </svg>
  `)}`;

  return [
    { id: "indigo", name: "Indigo Student", url: createSvg("#4f46e5", "#7c3aed", "#4f46e5") },
    { id: "emerald", name: "Emerald Tech", url: createSvg("#059669", "#0d9488", "#059669") },
    { id: "rose", name: "Rose Creative", url: createSvg("#e11d48", "#c026d3", "#e11d48") },
    { id: "amber", name: "Amber Scholar", url: createSvg("#d97706", "#ea580c", "#d97706") }
  ];
}

function getProfilePicUrl(user) {
  if (user && user.profilePic) return user.profilePic;
  const presets = getStudentPresetAvatars(user ? user.name : "U");
  return presets[0].url;
}

function updateUserAvatarUI() {
  const avatarEl = $("userAvatar");
  if (!avatarEl || !currentUser) return;
  const picUrl = getProfilePicUrl(currentUser);
  avatarEl.innerHTML = `<img src="${picUrl}" alt="User Avatar" style="width:34px; height:34px; object-fit:cover; border-radius:50%; display:block;">`;
  avatarEl.style.padding = "0";
  avatarEl.style.background = "none";
}

function setPendingProfilePic(dataUrl) {
  pendingProfilePic = dataUrl || "";
  const previewImgs = document.querySelectorAll("#credentialsPreviewImg, .credentials-preview-img");
  const fallbackUrl = getProfilePicUrl(currentUser || { name: "User" });
  previewImgs.forEach(img => {
    img.src = pendingProfilePic || fallbackUrl;
  });
}

function bindCredentialsPhotoEvents() {
  const picInput = $("credentialsPicInput");
  const avatarTrigger = $("credentialsAvatarTrigger");
  const photoSection = $("credentialsPhotoSection") || document.querySelector(".credentials-photo-section");

  const processImageFile = (file) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("File size should be less than 20MB");
      if (picInput) picInput.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = evt => {
      const fileData = evt.target.result;
      const testImg = new Image();
      testImg.onload = () => {
        openCropModal(fileData);
        if (picInput) picInput.value = "";
      };
      testImg.onerror = () => {
        alert("The selected file could not be previewed as an image. Please choose an image file (such as PNG, JPG, JPEG, WebP, GIF, SVG, BMP, AVIF, TIFF, ICO, etc.).");
        if (picInput) picInput.value = "";
      };
      testImg.src = fileData;
    };
    reader.onerror = () => {
      alert("Failed to read the selected file. Please try again.");
      if (picInput) picInput.value = "";
    };
    reader.readAsDataURL(file);
  };

  if (picInput) {
    picInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (file) processImageFile(file);
    });
  }

  if (avatarTrigger && picInput) {
    avatarTrigger.addEventListener("click", () => {
      picInput.click();
    });
  }

  if (photoSection) {
    const highlight = (e) => {
      e.preventDefault();
      e.stopPropagation();
      photoSection.classList.add("drag-over");
    };
    const unhighlight = (e) => {
      e.preventDefault();
      e.stopPropagation();
      photoSection.classList.remove("drag-over");
    };
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      photoSection.classList.remove("drag-over");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processImageFile(e.dataTransfer.files[0]);
      }
    };

    photoSection.addEventListener("dragenter", highlight, false);
    photoSection.addEventListener("dragover", highlight, false);
    photoSection.addEventListener("dragleave", unhighlight, false);
    photoSection.addEventListener("drop", handleDrop, false);
  }

  const adjustCropBtn = $("credentialsAdjustCropBtn");
  if (adjustCropBtn) {
    adjustCropBtn.addEventListener("click", () => {
      const currentPic = pendingProfilePic || getProfilePicUrl(currentUser);
      openCropModal(currentPic);
    });
  }

  const removePicBtn = $("credentialsRemovePicBtn");
  if (removePicBtn) {
    removePicBtn.addEventListener("click", () => {
      setPendingProfilePic("");
    });
  }
}

function loadUsers() {
  return normalizeClientUsers(DEFAULT_USERS);
}

function saveUsers() {
  const data = normalizeClientUsers(USERS);
  syncUsersToServer(data);
}

function syncUsersToServer(data) {
  if (!data) return;
  fetch(`${API_BASE_URL}/api/users/migrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ users: data })
  }).catch(() => { });
}

async function hydrateUsersFromServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/public`);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load database users.");
    USERS = normalizeClientUsers({
      student: data.users.filter(u => u.role === "student"),
      faculty: data.users.filter(u => u.role === "faculty"),
      admin: data.users.filter(u => u.role === "admin")
    });
    USERS.student.forEach(s => ensureStudentRecord(s.username));

    // If currentUser is logged in, sync currentUser with latest database user state
    if (currentUser && currentUser.role) {
      const allUsers = [...(USERS.student || []), ...(USERS.faculty || []), ...(USERS.admin || [])];
      const matched = allUsers.find(u => (currentUser.id && u.id && u.id === currentUser.id) || u.username.toLowerCase() === currentUser.username.toLowerCase());
      if (matched) {
        currentUser = { ...currentUser, ...matched };
        sessionStorage.setItem("portalUser", JSON.stringify(currentUser));
        if ($("userName")) $("userName").textContent = currentUser.name;
        if (typeof updateUserAvatarUI === "function") updateUserAvatarUI();
      }
    }

    if (typeof syncAssignmentsForStudents === "function") syncAssignmentsForStudents();
    if (typeof render === "function") render();
  } catch (error) {
    console.warn("Database sync unavailable:", error.message);
  }
}

async function createUserOnServer(userData) {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || "Unable to save account to MongoDB.");
  try {
    localStorage.setItem("campussphere_stats_trigger", String(Date.now()));
    if (typeof window.CampusSphereSyncCounts === "function") window.CampusSphereSyncCounts(true);
    if (typeof window.loadHomeStatsCount === "function") window.loadHomeStatsCount(true);
  } catch (_) {}
  return data.user;
}

async function updateUserOnServer(role, oldUsername, userData) {
  const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(role)}/${encodeURIComponent(oldUsername)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || "Unable to update account in MongoDB.");
  return data.user;
}

async function deleteUserOnServer(role, username) {
  const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(role)}/${encodeURIComponent(username)}`, {
    method: "DELETE"
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || "Unable to delete account from MongoDB.");
  try {
    localStorage.setItem("campussphere_stats_trigger", String(Date.now()));
    if (typeof window.CampusSphereSyncCounts === "function") window.CampusSphereSyncCounts(true);
    if (typeof window.loadHomeStatsCount === "function") window.loadHomeStatsCount(true);
  } catch (_) {}
  return data;
}

async function loginOnServer(role, username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, username, password })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Invalid username or password.");
    return data.user;
  } catch (error) {
    if (error.message && error.message !== "Failed to fetch" && !error.message.includes("fetch")) {
      throw error;
    }
    throw new Error("Unable to connect to portal server. Please ensure the backend server is running.");
  }
}

async function removeUserAccount(role, username) {
  const target = role === "student" ? "student" : "faculty";
  const normUser = String(username || "").trim().toLowerCase();
  const user = USERS[target].find(item => item.username.toLowerCase() === normUser);
  if (!user) return false;

  await deleteUserOnServer(role, username);

  USERS[target] = USERS[target].filter(item => item.username.toLowerCase() !== normUser);

  if (target === "student") {
    if (ACADEMIC.students[username]) delete ACADEMIC.students[username];
    if (ACADEMIC.students) {
      Object.keys(ACADEMIC.students).forEach(key => {
        if (key.toLowerCase() === normUser) delete ACADEMIC.students[key];
      });
    }

    if (Array.isArray(ACADEMIC.assignments)) {
      ACADEMIC.assignments = ACADEMIC.assignments.filter(entry => (entry.student || "").toLowerCase() !== normUser);
    }

    if (Array.isArray(ACADEMIC.deletedAssignments)) {
      ACADEMIC.deletedAssignments = ACADEMIC.deletedAssignments.filter(key => !String(key || "").toLowerCase().startsWith(`${normUser}___`));
    }

    if (Array.isArray(ACADEMIC.dailyAttendance)) {
      ACADEMIC.dailyAttendance.forEach(log => {
        if (log && log.records) {
          Object.keys(log.records).forEach(key => {
            if (key.toLowerCase() === normUser) {
              delete log.records[key];
            }
          });
        }
      });
    }
  }

  saveUsers();
  saveAcademicData();

  if (currentUser && currentUser.role === target && (currentUser.username || "").toLowerCase() === normUser) {
    logout();
  }

  return true;
}


function validateUserInput({ username, password, email, role, subject, currentUsername }) {
  if (role !== "admin" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) {
    return "Enter a valid email address.";
  }
  if (!/^[A-Za-z0-9_.-]{4,30}$/.test(username)) {
    const field = "Username";
    return `${field} must be 4–30 letters, numbers, dot, dash or underscore.`;
  }
  if (password && password.length < 6) {
    return "Password must contain at least 6 characters.";
  }
  if (role === "faculty" && !subject) {
    return "Please select a subject for the faculty member.";
  }

  const duplicateCheck = USERS[role].some(u => {
    if (currentUsername && u.username.toLowerCase() === currentUsername.toLowerCase()) return false;
    return u.username.toLowerCase() === username.toLowerCase();
  });

  if (duplicateCheck ||
    USERS[(role === "student" ? "faculty" : "student")].some(u => u.username.toLowerCase() === username.toLowerCase()) ||
    USERS.admin.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return "That username is already in use.";
  }

  if (email) {
    const normEmail = email.trim().toLowerCase();
    const emailCheck = ["student", "faculty", "admin"].some(r =>
      USERS[r].some(u => {
        if (currentUsername && u.username.toLowerCase() === currentUsername.toLowerCase()) return false;
        return (u.email || "").trim().toLowerCase() === normEmail;
      })
    );
    if (emailCheck) return "That email address is already registered.";
  }
  return "";
}

let adminNotice = { text: "", type: "success" };
let adminNoticeTimer = null;

function getAdminNoticeMarkup() {
  if (!adminNotice.text) return "";
  return `<div class="admin-feedback ${adminNotice.type}">${adminNotice.text}</div>`;
}

function setAdminNotice(text, type = "success") {
  adminNotice = { text, type };
  if (adminNoticeTimer) clearTimeout(adminNoticeTimer);
  adminNoticeTimer = setTimeout(() => {
    resetAdminNotice();
    const feedbackEl = document.querySelector(".admin-feedback");
    if (feedbackEl) {
      feedbackEl.style.transition = "opacity 0.4s ease, max-height 0.4s ease, margin 0.4s ease, padding 0.4s ease";
      feedbackEl.style.opacity = "0";
      feedbackEl.style.maxHeight = "0";
      feedbackEl.style.margin = "0";
      feedbackEl.style.padding = "0";
      setTimeout(() => {
        if (feedbackEl && feedbackEl.parentNode) {
          feedbackEl.remove();
        }
      }, 400);
    }
  }, 1000);
}

function resetAdminNotice() {
  adminNotice = { text: "", type: "success" };
}

const DEFAULT_COURSE_YEAR_DIVISIONS = {
  "1st Year": ["Div A", "Div B"],
  "2nd Year": ["Div A", "Div B"],
  "3rd Year": ["Div A", "Div B"]
};

const DEFAULT_ACADEMIC = {
  students: {},
  notices: [],
  timetable: [],
  timetableHeader: {},
  customBreakRows: {},
  assignments: [],
  notes: [],
  deletedAssignments: [],
  dailyAttendance: [],
  subjectMarksConfig: {},
  subjects: [],
  divisions: JSON.parse(JSON.stringify(DEFAULT_COURSE_YEAR_DIVISIONS))
};

function normalizeAcademicDivisions(divisions) {
  const def = JSON.parse(JSON.stringify(DEFAULT_COURSE_YEAR_DIVISIONS));
  if (!divisions) return def;
  if (Array.isArray(divisions)) {
    const list = divisions.length ? divisions : ["Div A", "Div B"];
    return {
      "1st Year": [...list],
      "2nd Year": [...list],
      "3rd Year": [...list]
    };
  }
  if (typeof divisions === "object") {
    return {
      "1st Year": Array.isArray(divisions["1st Year"]) && divisions["1st Year"].length ? divisions["1st Year"] : ["Div A", "Div B"],
      "2nd Year": Array.isArray(divisions["2nd Year"]) && divisions["2nd Year"].length ? divisions["2nd Year"] : ["Div A", "Div B"],
      "3rd Year": Array.isArray(divisions["3rd Year"]) && divisions["3rd Year"].length ? divisions["3rd Year"] : ["Div A", "Div B"]
    };
  }
  return def;
}

function normalizeAcademicData(parsed) {
  if (!parsed || typeof parsed !== "object") return JSON.parse(JSON.stringify(DEFAULT_ACADEMIC));
  return {
    students: parsed.students && typeof parsed.students === "object" ? parsed.students : {},
    notices: Array.isArray(parsed.notices) ? parsed.notices : [],
    timetable: Array.isArray(parsed.timetable) ? parsed.timetable : [],
    timetableHeader: parsed.timetableHeader && typeof parsed.timetableHeader === "object" ? parsed.timetableHeader : {},
    customBreakRows: parsed.customBreakRows && typeof parsed.customBreakRows === "object" ? parsed.customBreakRows : {},
    assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    deletedAssignments: Array.isArray(parsed.deletedAssignments) ? parsed.deletedAssignments : [],
    dailyAttendance: Array.isArray(parsed.dailyAttendance) ? parsed.dailyAttendance : [],
    subjectMarksConfig: parsed.subjectMarksConfig && typeof parsed.subjectMarksConfig === "object" ? parsed.subjectMarksConfig : {},
    subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
    divisions: normalizeAcademicDivisions(parsed.divisions)
  };
}

let ACADEMIC = loadAcademicData();

function loadAcademicData() {
  const def = JSON.parse(JSON.stringify(DEFAULT_ACADEMIC));
  def.subjects = JSON.parse(JSON.stringify(SUBJECTS));
  def.divisions = JSON.parse(JSON.stringify(DEFAULT_COURSE_YEAR_DIVISIONS));
  return def;
}

function getAvailableDivisions(courseYear = null) {
  const divsObj = (ACADEMIC && ACADEMIC.divisions) ? normalizeAcademicDivisions(ACADEMIC.divisions) : DEFAULT_COURSE_YEAR_DIVISIONS;
  if (courseYear && divsObj[courseYear] && Array.isArray(divsObj[courseYear])) {
    return divsObj[courseYear];
  }
  const allDivs = Object.values(divsObj).flat();
  return [...new Set(allDivs.length ? allDivs : ["Div A", "Div B"])];
}

function renderDivisionSelectOptions(selectedDiv = "", includeAllOption = false, allLabel = "All Divisions", courseYear = null) {
  const divs = getAvailableDivisions(courseYear);
  let html = "";
  if (includeAllOption) {
    html += `<option value="" ${!selectedDiv ? "selected" : ""}>${escapeHtml(allLabel)}</option>`;
  }
  divs.forEach(div => {
    html += `<option value="${escapeHtml(div)}" ${selectedDiv === div ? "selected" : ""}>${escapeHtml(div)}</option>`;
  });
  return html;
}

function renderFacultyDivisionSelectOptions(currentDiv = "Both Divisions", courseYear = null) {
  const divs = getAvailableDivisions(courseYear);
  const allLabel = divs.length === 2 ? `Both ${divs.join(" & ")}` : "All Divisions";
  let html = `<option value="Both Divisions" ${currentDiv === "Both Divisions" || !currentDiv ? "selected" : ""}>${escapeHtml(allLabel)}</option>`;
  divs.forEach(div => {
    html += `<option value="${escapeHtml(div)}" ${currentDiv === div ? "selected" : ""}>${escapeHtml(div)}</option>`;
  });
  return html;
}

function populateSignupDivisionSelect(selectedDiv = "", courseYear = null) {
  const el = $("signupDivision");
  if (!el) return;
  const currentVal = (selectedDiv !== undefined && selectedDiv !== null && selectedDiv !== "") ? selectedDiv : el.value;
  const yr = courseYear || ($("signupCourseYear") ? $("signupCourseYear").value : null);
  const divs = getAvailableDivisions(yr);
  let html = `<option value="">-- Select Division --</option>`;
  divs.forEach(d => {
    html += `<option value="${escapeHtml(d)}" ${currentVal === d ? "selected" : ""}>${escapeHtml(d)}</option>`;
  });
  el.innerHTML = html;
  if (currentVal && divs.includes(currentVal)) {
    el.value = currentVal;
  }
}

function getSubjectMarksConfig(subjectId) {
  if (!ACADEMIC.subjectMarksConfig) ACADEMIC.subjectMarksConfig = {};
  if (!ACADEMIC.subjectMarksConfig[subjectId]) {
    ACADEMIC.subjectMarksConfig[subjectId] = { maxInternal1: 20, maxInternal2: 20 };
  }
  return ACADEMIC.subjectMarksConfig[subjectId];
}

let attendanceFilterDivision = "";
let attendanceFilterSemester = "";
let attendanceFilterCourseYear = "";
let attendanceFilterDate = getTodayISODate();
let isAttendanceDetailsEntered = false;
let activeAttendanceMap = {};
let isAttendanceReadOnly = false;
let attendanceSaveSuccessMessage = "";
let currentPage = "dashboard";
let assignmentFilterDivision = "All Divisions";
let assignmentSearchQuery = "";
let editingTimetableIndex = -1;
let activeTimetableDivision = "";
let activeTimetableSemester = "";
let isTimetableEditMode = false;

function resetAttendanceFilters() {
  if (currentUser && currentUser.role === "faculty") {
    if (currentUser.subject) {
      const facultySem = getSemesterForSubject(currentUser.subject);
      const facultyYear = getCourseYearForSemester(facultySem);
      attendanceFilterSemester = facultySem;
      attendanceFilterCourseYear = facultyYear;
    }
    const activeSubDiv = getFacultySubjectDivision(currentUser, currentUser.subject);
    const isBoth = !activeSubDiv || activeSubDiv === "Both Divisions" || activeSubDiv === "All Divisions";
    attendanceFilterDivision = !isBoth ? activeSubDiv : "";
  } else {
    attendanceFilterSemester = "";
    attendanceFilterCourseYear = "";
    attendanceFilterDivision = "";
  }
  attendanceFilterDate = getTodayISODate();
  isAttendanceDetailsEntered = false;
  isAttendanceReadOnly = false;
  activeAttendanceMap = {};
  attendanceSaveSuccessMessage = "";
}

function formatDateDDMMYY(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    const yy = yyyy.length === 4 ? yyyy.slice(-2) : yyyy;
    return `${dd}-${mm}-${yy}`;
  }
  return dateStr;
}

function formatTime12h(time24) {
  if (!time24) return "";
  const parts = String(time24).split(":");
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function getOrdinalSuffix(day) {
  const d = parseInt(day, 10);
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatDateDDOrdinalMonth(dateStr) {
  if (!dateStr) return "";
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const str = String(dateStr).trim();
  const parts = str.split(/[-/.]/);

  if (parts.length === 3) {
    let yyyy, mm, dd;
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      [yyyy, mm, dd] = parts;
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      [dd, mm, yyyy] = parts;
    } else {
      const p0 = parseInt(parts[0], 10);
      if (p0 > 12) {
        [dd, mm, yyyy] = parts;
      } else {
        [yyyy, mm, dd] = parts;
      }
    }
    const dayNum = parseInt(dd, 10);
    const monthIdx = parseInt(mm, 10) - 1;
    if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31 && monthIdx >= 0 && monthIdx < 12) {
      return `${dayNum}${getOrdinalSuffix(dayNum)} ${monthNames[monthIdx]}`;
    }
  }

  const cleanStr = str.includes("T") ? str : str.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1");
  const d = new Date(cleanStr);
  if (!isNaN(d.getTime())) {
    const dayNum = d.getDate();
    const monthName = monthNames[d.getMonth()];
    return `${dayNum}${getOrdinalSuffix(dayNum)} ${monthName}`;
  }

  return dateStr;
}

function getTodayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function updateStudentOverallAttendance(subjectId) {
  if (!subjectId) return;
  const dailyLogs = ACADEMIC.dailyAttendance || [];
  const subjectLogs = dailyLogs.filter(log => log.subject === subjectId);

  USERS.student.forEach(student => {
    let totalClasses = 0;
    let presentClasses = 0;

    subjectLogs.forEach(log => {
      if (log.records && typeof log.records[student.username] === "string") {
        totalClasses++;
        if (log.records[student.username] === "P") {
          presentClasses++;
        }
      }
    });

    if (totalClasses > 0) {
      const record = ensureStudentRecord(student.username);
      record.attendance[subjectId] = Math.round((presentClasses / totalClasses) * 100);
    }
  });

  saveAcademicData();
}

function saveAcademicData() {
  window.dispatchEvent(new CustomEvent("academicDataUpdated"));
  updateNoticeBadges();
  updateNotesBadges();
  if (typeof syncAcademicDataToBackend === "function") {
    syncAcademicDataToBackend();
  }
}

function renameStudentAcademicData(oldUsername, newUsername) {
  if (!oldUsername || !newUsername || oldUsername.toLowerCase() === newUsername.toLowerCase()) return;
  const existing = ACADEMIC.students[oldUsername];
  if (existing) {
    ACADEMIC.students[newUsername] = existing;
    delete ACADEMIC.students[oldUsername];
  }
  ACADEMIC.assignments = ACADEMIC.assignments.map(entry => entry.student.toLowerCase() === oldUsername.toLowerCase() ? { ...entry, student: newUsername } : entry);
  saveAcademicData();
}

function getStudentRecord(username) {
  if (!ACADEMIC || !ACADEMIC.students || !ACADEMIC.students[username]) {
    return { attendance: {}, marks: {}, assignments: [] };
  }
  const s = ACADEMIC.students[username];
  if (!s.marks || typeof s.marks !== "object") s.marks = {};
  if (!s.attendance || typeof s.attendance !== "object") s.attendance = {};
  if (!Array.isArray(s.assignments)) s.assignments = [];
  return s;
}

function getSubjectClassesSummary(username, subjectId) {
  const dailyLogs = ACADEMIC.dailyAttendance || [];
  const subjectLogs = dailyLogs.filter(log => log.subject === subjectId);

  let classesTaken = 0;
  let classesAttended = 0;

  subjectLogs.forEach(log => {
    if (log.records && typeof log.records[username] === "string") {
      classesTaken++;
      if (log.records[username] === "P") {
        classesAttended++;
      }
    }
  });

  const record = getStudentRecord(username);
  let overallPct = 0;

  if (classesTaken > 0) {
    overallPct = Math.round((classesAttended / classesTaken) * 100);
  } else if (record && typeof record.attendance[subjectId] === "number") {
    overallPct = record.attendance[subjectId];
    classesTaken = 20;
    classesAttended = Math.round((overallPct / 100) * 20);
  }

  return { classesTaken, classesAttended, overallPct };
}

function ensureStudentRecord(username) {
  if (!ACADEMIC) ACADEMIC = {};
  if (!ACADEMIC.students) ACADEMIC.students = {};
  if (!ACADEMIC.students[username]) {
    ACADEMIC.students[username] = { attendance: {}, marks: {}, assignments: [] };
  }
  const s = ACADEMIC.students[username];
  if (!s.marks || typeof s.marks !== "object") s.marks = {};
  if (!s.attendance || typeof s.attendance !== "object") s.attendance = {};
  if (!Array.isArray(s.assignments)) s.assignments = [];
  return s;
}

function buildStudentOptions() {
  if (!USERS.student.length) return "";
  return USERS.student.map(s => `<option value="${s.username}">${s.name} (${s.username})</option>`).join("");
}

let currentUser = null;
let currentRole = "student";



const $ = id => document.getElementById(id);

function updateLoginUsernameLabel(role) {
  const label = $("loginUsernameLabel");
  const input = $("username");
  if (label && input) {
    label.textContent = "Username";
    input.placeholder = "Enter your username";
    input.setAttribute("autocomplete", "username");
  }
}

const eyeOpenSVG = `<svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.2 12s3.5-6 9.8-6 9.8 6 9.8 6-3.5 6-9.8 6-9.8-6-9.8-6Z"></path><circle cx="12" cy="12" r="2.7"></circle></svg>`;
const eyeClosedSVG = `<svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"></path><path d="M10.6 6.2A10.9 10.9 0 0 1 12 6c6.3 0 9.8 6 9.8 6a18.4 18.4 0 0 1-3.3 4.1"></path><path d="M6.2 6.2A18.5 18.5 0 0 0 2.2 12s3.5 6 9.8 6c.5 0 1 0 1.5-.1"></path><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"></path></svg>`;

function resetLoginForm() {
  if ($("username")) $("username").value = "";
  if ($("password")) {
    $("password").value = "";
    if ($("password").type === "text") {
      $("password").type = "password";
      const toggleBtn = $("togglePassword");
      if (toggleBtn) {
        toggleBtn.classList.remove("is-visible");
        toggleBtn.innerHTML = eyeOpenSVG;
        toggleBtn.setAttribute("aria-label", "Show password");
        toggleBtn.setAttribute("title", "Show password");
      }
    }
  }
  if ($("loginMessage")) {
    $("loginMessage").textContent = "";
    $("loginMessage").className = "message";
  }
}

document.querySelectorAll(".role-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".role-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentRole = btn.dataset.role;
    resetLoginForm();
    updateLoginUsernameLabel(currentRole);
    if ($("username")) $("username").focus();
  });
});
updateLoginUsernameLabel(currentRole);

$("togglePassword").addEventListener("click", () => {
  const p = $("password");
  const button = $("togglePassword");
  const visible = p.type === "password";
  p.type = visible ? "text" : "password";
  button.classList.toggle("is-visible", visible);
  button.innerHTML = visible ? eyeClosedSVG : eyeOpenSVG;
  button.setAttribute("aria-label", visible ? "Hide password" : "Show password");
  button.setAttribute("title", visible ? "Hide password" : "Show password");
});

document.addEventListener("click", e => {
  const toggleBtn = e.target.closest("#toggleSignupPassword");
  if (toggleBtn) {
    const p = $("signupPassword");
    if (!p) return;
    const visible = p.type === "password";
    p.type = visible ? "text" : "password";
    toggleBtn.classList.toggle("is-visible", visible);
    toggleBtn.innerHTML = visible ? eyeClosedSVG : eyeOpenSVG;
    toggleBtn.setAttribute("aria-label", visible ? "Hide password" : "Show password");
    toggleBtn.setAttribute("title", visible ? "Hide password" : "Show password");
  }
});


function getAllSubjectsGroupedByYear() {
  const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
  const groups = [
    { label: "1st Year (1st & 2nd Semesters)", semesters: ["1st Semester", "2nd Semester"] },
    { label: "2nd Year (3rd & 4th Semesters)", semesters: ["3rd Semester", "4th Semester"] },
    { label: "3rd Year (5th & 6th Semesters)", semesters: ["5th Semester", "6th Semester"] }
  ];

  return groups.map(g => ({
    label: g.label,
    subjects: subjectsSource.filter(s => {
      const sem = s.semester || getSemesterForSubject(s.id);
      return g.semesters.includes(sem);
    })
  }));
}

function getGroupedSubjectOptionsHTML(selectedIds = [], query = "") {
  const q = (query || "").toLowerCase().trim();
  const groups = getAllSubjectsGroupedByYear();
  let html = `<option value="">-- Choose Subject / Lab to Add --</option>`;

  groups.forEach(g => {
    const filtered = g.subjects.filter(s => {
      if (selectedIds.includes(s.id)) return false;
      if (!q) return true;
      return (s.name && s.name.toLowerCase().includes(q)) ||
             (s.short && s.short.toLowerCase().includes(q)) ||
             (s.id && s.id.toLowerCase().includes(q));
    });

    if (filtered.length) {
      html += `<optgroup label="${g.label}">`;
      filtered.forEach(s => {
        const sem = s.semester || getSemesterForSubject(s.id);
        const yr = getCourseYearForSemester(sem);
        html += `<option value="${s.id}">${s.name} — ${sem} (${yr})</option>`;
      });
      html += `</optgroup>`;
    }
  });

  return html;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

function renderDirectSubjectSearchResults({ containerId, query, selectedIds, onAddFnName }) {
  const container = $(containerId);
  if (!container) return;

  const q = (query || "").trim().toLowerCase();
  if (!q) {
    container.innerHTML = "";
    return;
  }

  const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
  const matches = subjectsSource.filter(s => {
    const name = (s.name || "").toLowerCase();
    const short = (s.short || "").toLowerCase();
    const id = (s.id || "").toLowerCase();
    const sem = (s.semester || getSemesterForSubject(s.id) || "").toLowerCase();
    const yr = (getCourseYearForSemester(s.semester || getSemesterForSubject(s.id)) || "").toLowerCase();
    return name.includes(q) || short.includes(q) || id.includes(q) || sem.includes(q) || yr.includes(q);
  });

  if (!matches.length) {
    container.innerHTML = `
      <div style="padding: 12px; border-radius: 10px; background: #f8fafc; border: 1px dashed #cbd5e1; text-align: center; color: #64748b; font-size: 12px;">
        No subjects found matching "<strong>${escapeHtml(query)}</strong>". Try another keyword (e.g. Python, Java, DBMS, Web, Lab).
      </div>`;
    return;
  }

  container.innerHTML = matches.map(s => {
    const sem = s.semester || getSemesterForSubject(s.id);
    const yr = getCourseYearForSemester(sem);
    const isAdded = (selectedIds || []).includes(s.id);

    return `
      <div class="direct-subject-card ${isAdded ? 'is-added' : ''}">
        <div style="min-width: 0;">
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(s.name)}">
            ${s.name}
          </div>
          <div style="font-size: 11px; color: #64748b; display: flex; gap: 6px; align-items: center; margin-top: 2px;">
            <span style="background: #f1f5f9; color: #475569; padding: 1px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px;">${s.short || s.id}</span>
            <span>•</span>
            <span>${sem}</span>
            <span>•</span>
            <span style="color: #6366f1; font-weight: 600;">${yr}</span>
          </div>
        </div>
        <div style="flex-shrink: 0;">
          ${isAdded ? `
            <button type="button" disabled style="padding: 5px 12px; font-size: 11.5px; font-weight: 700; border-radius: 6px; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; cursor: default; white-space: nowrap;">
              ✓ Added
            </button>
          ` : `
            <button type="button" onclick="${onAddFnName}('${s.id}')" class="primary-btn" style="padding: 5px 14px; font-size: 12px; font-weight: 700; border-radius: 6px; white-space: nowrap; margin: 0; cursor: pointer;">
              + Add
            </button>
          `}
        </div>
      </div>
    `;
  }).join("");
}

let signupFacultySelectedSubjects = [];
let signupFacultySubjectDivisions = {};
let currentFacultySubjectSearchQuery = "";

function renderSignupDirectSubjectsList(query = currentFacultySubjectSearchQuery) {
  currentFacultySubjectSearchQuery = query;
  renderDirectSubjectSearchResults({
    containerId: "signupDirectSubjectsList",
    query,
    selectedIds: signupFacultySelectedSubjects,
    onAddFnName: "addSignupFacultySubject"
  });
}

function renderSignupFacultySubjectChips() {
  const container = $("signupSelectedSubjectsWrap");
  if (!container) return;
  if (!signupFacultySelectedSubjects.length) {
    container.innerHTML = "";
    container.style.display = "none";
    if ($("signupSubject")) $("signupSubject").value = "";
    return;
  }
  container.style.display = "flex";
  if ($("signupSubject")) $("signupSubject").value = signupFacultySelectedSubjects[0];
  container.innerHTML = signupFacultySelectedSubjects.map((id, idx) => {
    const s = subjectById(id) || { name: id, short: id };
    const sem = s.semester || getSemesterForSubject(id);
    const yr = getCourseYearForSemester(sem);
    const currentDiv = signupFacultySubjectDivisions[id] || "Both Divisions";
    return `
      <div class="assigned-subject-config-item" style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:6px 10px; margin:3px 0; width:100%;">
        <div style="min-width:0; flex:1; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span style="font-weight:700; color:#1e40af; font-size:12.5px;">${s.short || s.name}</span>
          <small style="color:#3b82f6; font-size:11px; font-weight:600;">(${sem})</small>
          ${idx === 0 ? `<span style="font-size:9.5px; background:#dbeafe; color:#1d4ed8; padding:1px 5px; border-radius:4px; font-weight:700;">Primary</span>` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          <select onchange="updateSignupFacultySubjectDivision('${id}', this.value)" title="Assigned division for this subject" style="padding:3px 6px; font-size:11px; font-weight:700; border-radius:6px; border:1px solid #93c5fd; background:#ffffff; color:#1e293b; cursor:pointer;">
            ${renderFacultyDivisionSelectOptions(currentDiv, yr)}
          </select>
          <button type="button" onclick="removeSignupFacultySubject('${id}')" style="border:none; background:transparent; color:#ef4444; font-size:14px; cursor:pointer; padding:0 3px; line-height:1; font-weight:bold;" title="Remove">✕</button>
        </div>
      </div>
    `;
  }).join("");
}

function updateSignupFacultySubjectDivision(id, val) {
  if (id) {
    signupFacultySubjectDivisions[id] = val || "Both Divisions";
    renderSignupFacultySubjectChips();
  }
}

function addSignupFacultySubject(subId) {
  const id = subId || "";
  if (!id) return;
  if (!signupFacultySelectedSubjects.includes(id)) {
    signupFacultySelectedSubjects.push(id);
  }
  if (!signupFacultySubjectDivisions[id]) {
    signupFacultySubjectDivisions[id] = "Both Divisions";
  }
  renderSignupFacultySubjectChips();
  renderSignupDirectSubjectsList();
  if ($("signupMessage")) $("signupMessage").textContent = "";
}

function removeSignupFacultySubject(id) {
  signupFacultySelectedSubjects = signupFacultySelectedSubjects.filter(item => item !== id);
  delete signupFacultySubjectDivisions[id];
  renderSignupFacultySubjectChips();
  renderSignupDirectSubjectsList();
}

function populateSignupSubjectSelect(query = "") {
  renderSignupDirectSubjectsList(query);
}

function populateFacultySubjectOptions(query = "") {
  renderSignupDirectSubjectsList(query);
}

const signupModal = document.createElement("div");
signupModal.id = "signupModal";
signupModal.className = "modal-backdrop hidden";
signupModal.innerHTML = `
  <div class="signup-modal">
    <button type="button" id="closeSignup" class="close-modal" aria-label="Close">×</button>
    <div class="modal-icon" id="modalIcon">🎓</div>
    <div class="modal-title">
      <span id="modalRoleLabel">STUDENT ACCOUNT</span>
      <h2 id="modalTitle">Student Signup</h2>
      <p>Create your own username and password to login.</p>
    </div>
    <form id="signupForm" autocomplete="off">
      <input type="hidden" id="signupRole">
      <input type="hidden" id="signupCurrentUsername">
      <label>Full Name</label>
      <div class="input-wrap"><span class="input-icon">👤</span><input id="signupName" required placeholder="Enter full name"></div>
      <label id="signupUsernameLabel">Username</label>
      <div class="input-wrap"><span class="input-icon">🪪</span><input id="signupUsername" required placeholder="Choose a username"></div>
      <label>Password</label>
      <div class="password-wrap">
        <span class="input-icon">🔒</span>
        <input id="signupPassword" type="password" required minlength="6" placeholder="Create a password" autocomplete="new-password">
        <button type="button" id="toggleSignupPassword" class="eye-btn" aria-label="Show password" title="Show password">
          <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.2 12s3.5-6 9.8-6 9.8 6 9.8 6-3.5 6-9.8 6-9.8-6Z"></path>
            <circle cx="12" cy="12" r="2.7"></circle>
          </svg>
        </button>
      </div>
      <label>Email Address</label>
      <div class="input-wrap"><span class="input-icon">✉️</span><input id="signupEmail" type="email" required placeholder="Enter your email address" autocomplete="email"></div>
      
      <div id="studentDetailsFields">
        <label>Course</label>
        <div class="input-wrap"><span class="input-icon">🎓</span><input id="signupCourse" readonly value="Bachelor of Computer Applications (BCA)" style="color: #0A2540; font-weight: 700;"></div>
        <label>Course Year</label>
        <div class="input-wrap">
          <select id="signupCourseYear" required>
            <option value="">-- Select Course Year --</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
          </select>
        </div>
        <label>Semester</label>
        <div class="input-wrap">
          <select id="signupSemester" required>
            <option value="">Select Semester</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
          </select>
        </div>
        <label>Division</label>
        <div class="input-wrap">
          <select id="signupDivision" required>
            <option value="">-- Select Division --</option>
            ${renderDivisionSelectOptions()}
          </select>
        </div>
        <label>Language Subject Choice</label>
        <div class="input-wrap">
          <select id="signupLanguage" required>
            <option value="">-- Select Language Subject --</option>
            <option value="Kannada">Kannada</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
        <div id="signupMathWrap">
          <label>Mathematics / Accountancy Choice (1st Semester)</label>
          <div class="input-wrap">
            <select id="signupMathChoice">
              <option value="">-- Select Subject Choice --</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Accountancy">Accountancy</option>
            </select>
          </div>
        </div>
      </div>

      <div id="facultyDeptField" class="hidden">
        <label>Faculty Department</label>
        <div class="input-wrap"><span class="input-icon">🏛️</span><input id="signupDepartment" value="Department of Computer Science & Applications" placeholder="Enter department"></div>
      </div>

      <div id="facultySubjectField" class="hidden">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <label style="margin: 0; font-weight: 700; color: #334155;">Assigned Subjects / Classes <span style="color:#e11d48;">*</span></label>
        </div>
        <div id="signupSelectedSubjectsWrap" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:6px 10px; margin-bottom:8px; display:none; flex-wrap:wrap; align-items:center; gap:4px;">
        </div>
        <div class="subject-search-wrap" style="margin-bottom:6px;">
          <input type="text" id="facultySubjectSearch" placeholder="Filter subjects by name or code..." class="search-input">
          <button type="button" id="btnSearchFacultySubject" class="search-btn"><span>Filter</span></button>
        </div>
        <div id="signupDirectSubjectsList" class="direct-subjects-list"></div>
        <input type="hidden" id="signupSubject" name="signupSubject">
      </div>

      <button class="primary-btn" type="submit"><span class="submit-label">Create Account</span><span class="arrow">→</span></button>
      <p id="signupMessage" class="message"></p>
      </form>
  </div>`;
document.body.appendChild(signupModal);

function updateSignupSemesterOptions(courseYear, selectedSem) {
  const semSelect = $("signupSemester");
  if (!semSelect) return;
  if (!courseYear) {
    semSelect.innerHTML = `<option value="">Select Semester</option>`;
    semSelect.value = "";
    if ($("signupMathWrap")) $("signupMathWrap").style.display = "none";
    return;
  }
  const validSemesters = getSemestersForCourseYear(courseYear);
  let html = `<option value="">Select Semester</option>`;
  validSemesters.forEach(sem => {
    html += `<option value="${escapeHtml(sem)}" ${selectedSem === sem ? "selected" : ""}>${escapeHtml(sem)}</option>`;
  });
  semSelect.innerHTML = html;
  if (selectedSem && validSemesters.includes(selectedSem)) {
    semSelect.value = selectedSem;
  } else {
    semSelect.value = "";
  }
  const is1stSem = semSelect.value === "1st Semester";
  if ($("signupMathWrap")) {
    $("signupMathWrap").style.display = is1stSem ? "block" : "none";
  }
}

if ($("signupCourseYear")) {
  $("signupCourseYear").addEventListener("change", () => {
    updateSignupSemesterOptions($("signupCourseYear").value);
    populateSignupDivisionSelect("", $("signupCourseYear").value);
  });
}
if ($("signupSemester")) {
  $("signupSemester").addEventListener("change", () => {
    const is1stSem = $("signupSemester").value === "1st Semester";
    if ($("signupMathWrap")) {
      $("signupMathWrap").style.display = is1stSem ? "block" : "none";
    }
  });
}

const editProfileModal = document.createElement("div");
editProfileModal.id = "editProfileModal";
editProfileModal.className = "modal-backdrop hidden";
editProfileModal.innerHTML = `
  <div class="signup-modal edit-profile-modal-card">
    <button type="button" id="closeEditProfile" class="close-modal" aria-label="Close">×</button>
    <div class="modal-icon">⚙️</div>
    <div class="modal-title">
      <span>ACADEMIC SETUP</span>
      <h2>Edit Academic Setup</h2>
      <p>Configure your division, year, semester, and language choices below.</p>
    </div>
    <form id="editProfileForm">
      <label>1. Division</label>
      <div class="input-wrap">
        <select id="editProfileDivision" required>
          <option value="">Select Division</option>
          ${renderDivisionSelectOptions()}
        </select>
      </div>

      <label>2. Course Year</label>
      <div class="input-wrap">
        <select id="editProfileCourseYear" required>
          <option value="">Select Course Year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
        </select>
      </div>

      <label>3. Semester</label>
      <div class="input-wrap">
        <select id="editProfileSemester" required>
          <option value="">Select Semester</option>
          <option value="1st Semester">1st Semester</option>
          <option value="2nd Semester">2nd Semester</option>
          <option value="3rd Semester">3rd Semester</option>
          <option value="4th Semester">4th Semester</option>
          <option value="5th Semester">5th Semester</option>
          <option value="6th Semester">6th Semester</option>
        </select>
      </div>

      <label>4. Course / Degree Program</label>
      <div class="input-wrap"><span class="input-icon">🎓</span><input id="editProfileCourse" disabled readonly placeholder="Bachelor of Computer Applications (BCA)"></div>

      <label>5. Language Subject Choice</label>
      <div class="input-wrap">
        <select id="editProfileLanguage" required>
          <option value="">Select Language Subject</option>
          <option value="Kannada">Kannada</option>
          <option value="Hindi">Hindi</option>
        </select>
      </div>

      <div id="editProfileMathWrap">
        <label>6. Mathematics / Accountancy Choice (1st Semester Only)</label>
        <div class="input-wrap">
          <select id="editProfileMathChoice">
            <option value="Mathematics">Mathematics</option>
            <option value="Accountancy">Accountancy</option>
          </select>
        </div>
      </div>

      <button class="primary-btn" type="submit"><span>Save Academic Setup</span><span class="arrow">→</span></button>
      <p id="editProfileMessage" class="message"></p>
    </form>
  </div>`;
document.body.appendChild(editProfileModal);

// User-Friendly Profile Picture Cropper Modal
const cropImageModal = document.createElement("div");
cropImageModal.id = "cropImageModal";
cropImageModal.className = "modal-backdrop hidden";
cropImageModal.innerHTML = `
  <div class="signup-modal crop-modal-card">
    <button type="button" id="closeCropModal" class="close-modal" aria-label="Close">×</button>
    <div class="modal-icon">✂️</div>
    <div class="modal-title">
      <span>PROFILE PICTURE</span>
      <h2>Crop & Adjust Photo</h2>
      <p>Drag to reposition your photo and use the zoom controls for the perfect fit.</p>
    </div>

    <div class="crop-canvas-container" id="cropCanvasContainer">
      <canvas id="cropCanvas" width="320" height="320"></canvas>
      <div class="crop-hud-hint">🖐️ Drag to reposition • 🔍 Scroll to zoom</div>
    </div>

    <div class="crop-controls-wrap">
      <div class="crop-zoom-bar">
        <button type="button" id="cropZoomOutBtn" class="crop-zoom-step-btn" title="Zoom Out">➖</button>
        <input type="range" id="cropZoomRange" class="crop-zoom-slider" min="0.5" max="3" step="0.02" value="1">
        <button type="button" id="cropZoomInBtn" class="crop-zoom-step-btn" title="Zoom In">➕</button>
        <span id="cropZoomVal" class="crop-zoom-val">100%</span>
      </div>
      <div class="crop-btn-row">
        <button type="button" id="cropRotateBtn" class="crop-action-btn">🔄 Rotate 90°</button>
        <button type="button" id="cropResetBtn" class="crop-action-btn">↺ Reset View</button>
      </div>
    </div>

    <div style="display:flex; gap:12px; justify-content:flex-end;">
      <button type="button" id="cancelCropBtn" class="secondary-btn" style="padding:10px 18px; font-size:13px;">Cancel</button>
      <button type="button" id="applyCropBtn" class="primary-btn" style="padding:10px 22px; font-size:13px;">
        <span>✨ Apply & Save Photo</span>
      </button>
    </div>
  </div>`;
document.body.appendChild(cropImageModal);

let cropImg = null;
let cropScale = 1;
let cropOffsetX = 0;
let cropOffsetY = 0;
let cropRotation = 0;
let isDraggingCrop = false;
let dragStartX = 0;
let dragStartY = 0;

function drawCropCanvas() {
  const canvas = $("cropCanvas");
  if (!canvas || !cropImg || !cropImg.width) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = 120;

  ctx.clearRect(0, 0, w, h);

  // 1. Render Transformed Image
  ctx.save();
  ctx.translate(cx + cropOffsetX, cy + cropOffsetY);
  ctx.rotate((cropRotation * Math.PI) / 180);

  const minDim = Math.min(cropImg.width, cropImg.height);
  const baseScale = (radius * 2) / minDim;
  const currentScale = baseScale * cropScale;

  const drawW = cropImg.width * currentScale;
  const drawH = cropImg.height * currentScale;

  ctx.drawImage(cropImg, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // 2. Render Semi-transparent LinkedIn Dark Mask
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
  ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
  ctx.fill();
  ctx.restore();

  // 3. Render Circular Cutout Guide Ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffff";
  ctx.shadowColor = "rgba(99, 102, 241, 0.8)";
  ctx.shadowBlur = 10;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(99, 102, 241, 0.8)";
  ctx.stroke();
  ctx.restore();
}

function getCroppedResultDataUrl() {
  if (!cropImg || !cropImg.width) return "";

  const outCanvas = document.createElement("canvas");
  outCanvas.width = 250;
  outCanvas.height = 250;
  const outCtx = outCanvas.getContext("2d");

  const radius = 120;
  const outCx = 125;
  const outCy = 125;
  const scaleRatio = 250 / (radius * 2);

  const minDim = Math.min(cropImg.width, cropImg.height);
  const baseScale = (radius * 2) / minDim;
  const currentScale = baseScale * cropScale * scaleRatio;

  const drawW = cropImg.width * currentScale;
  const drawH = cropImg.height * currentScale;

  outCtx.beginPath();
  outCtx.arc(outCx, outCy, 125, 0, Math.PI * 2);
  outCtx.clip();

  outCtx.save();
  outCtx.translate(outCx + cropOffsetX * scaleRatio, outCy + cropOffsetY * scaleRatio);
  outCtx.rotate((cropRotation * Math.PI) / 180);
  outCtx.drawImage(cropImg, -drawW / 2, -drawH / 2, drawW, drawH);
  outCtx.restore();

  return outCanvas.toDataURL("image/jpeg", 0.90);
}

function openCropModal(imageSource) {
  const setupImage = (loadedImg) => {
    cropImg = loadedImg;
    cropScale = 1;
    cropOffsetX = 0;
    cropOffsetY = 0;
    cropRotation = 0;
    if ($("cropZoomRange")) $("cropZoomRange").value = 1;
    cropImageModal.classList.remove("hidden");
    setTimeout(drawCropCanvas, 50);
  };

  if (typeof imageSource === "string") {
    const tempImg = new Image();
    tempImg.crossOrigin = "Anonymous";
    tempImg.onload = () => setupImage(tempImg);
    tempImg.src = imageSource;
  } else if (imageSource instanceof HTMLImageElement) {
    setupImage(imageSource);
  }
}

function closeCropModal() {
  cropImageModal.classList.add("hidden");
}

function bindCropModalEvents() {
  const closeBtn = $("closeCropModal");
  const cancelBtn = $("cancelCropBtn");
  const applyBtn = $("applyCropBtn");
  const zoomRange = $("cropZoomRange");
  const zoomOutBtn = $("cropZoomOutBtn");
  const zoomInBtn = $("cropZoomInBtn");
  const zoomVal = $("cropZoomVal");
  const rotateBtn = $("cropRotateBtn");
  const resetBtn = $("cropResetBtn");
  const container = $("cropCanvasContainer");

  const updateZoomDisplay = () => {
    if (zoomVal) zoomVal.textContent = `${Math.round(cropScale * 100)}%`;
    if (zoomRange) zoomRange.value = cropScale;
  };

  if (closeBtn) closeBtn.addEventListener("click", closeCropModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeCropModal);
  cropImageModal.addEventListener("click", e => { if (e.target === cropImageModal) closeCropModal(); });

  if (zoomRange) {
    zoomRange.addEventListener("input", e => {
      cropScale = parseFloat(e.target.value) || 1;
      updateZoomDisplay();
      drawCropCanvas();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      cropScale = Math.max(0.5, parseFloat((cropScale - 0.1).toFixed(2)));
      updateZoomDisplay();
      drawCropCanvas();
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      cropScale = Math.min(3.0, parseFloat((cropScale + 0.1).toFixed(2)));
      updateZoomDisplay();
      drawCropCanvas();
    });
  }

  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      cropRotation = (cropRotation + 90) % 360;
      drawCropCanvas();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      cropScale = 1;
      cropOffsetX = 0;
      cropOffsetY = 0;
      cropRotation = 0;
      updateZoomDisplay();
      drawCropCanvas();
    });
  }

  if (container) {
    const handleStart = (clientX, clientY) => {
      isDraggingCrop = true;
      dragStartX = clientX - cropOffsetX;
      dragStartY = clientY - cropOffsetY;
    };

    const handleMove = (clientX, clientY) => {
      if (!isDraggingCrop) return;
      cropOffsetX = clientX - dragStartX;
      cropOffsetY = clientY - dragStartY;
      drawCropCanvas();
    };

    const handleEnd = () => {
      isDraggingCrop = false;
    };

    container.addEventListener("mousedown", e => handleStart(e.clientX, e.clientY));
    window.addEventListener("mousemove", e => { if (isDraggingCrop) handleMove(e.clientX, e.clientY); });
    window.addEventListener("mouseup", () => handleEnd());

    container.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener("touchmove", e => {
      if (isDraggingCrop && e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener("touchend", () => handleEnd());

    container.addEventListener("wheel", e => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      cropScale = Math.min(Math.max(0.5, parseFloat((cropScale + delta).toFixed(2))), 3);
      updateZoomDisplay();
      drawCropCanvas();
    }, { passive: false });
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const croppedDataUrl = getCroppedResultDataUrl();
      if (croppedDataUrl) {
        setPendingProfilePic(croppedDataUrl);
      }
      closeCropModal();
    });
  }
}

bindCropModalEvents();

const facultyEditProfileModal = document.createElement("div");
facultyEditProfileModal.id = "facultyEditProfileModal";
facultyEditProfileModal.className = "modal-backdrop hidden";
facultyEditProfileModal.innerHTML = `
  <div class="signup-modal edit-profile-modal-card">
    <button type="button" id="closeFacultyEditProfile" class="close-modal" aria-label="Close">×</button>
    <div class="modal-icon">🧑‍🏫</div>
    <div class="modal-title">
      <span>FACULTY PROFILE</span>
      <h2>Edit Profile Details</h2>
      <p>Update your full name, email address, and assigned division below.</p>
    </div>
    <form id="facultyEditProfileForm">
      <label>1. Full Name</label>
      <div class="input-wrap"><span class="input-icon">👤</span><input id="facultyEditName" type="text" required placeholder="Full Name"></div>

      <label>2. Username</label>
      <div class="input-wrap"><span class="input-icon">🪪</span><input id="facultyEditUsername" disabled readonly placeholder="Username"></div>

      <label>3. Email Address</label>
      <div class="input-wrap"><span class="input-icon">✉️</span><input id="facultyEditEmail" type="email" required placeholder="Email address"></div>

      <label>4. Assigned Division</label>
      <div class="input-wrap">
        <select id="facultyEditDivision" style="padding:10px 12px; border-radius:10px; border:1px solid #cbd5e1; font-weight:600; width:100%;">
          <option value="Both Divisions">Both Divisions (Div A & Div B)</option>
          <option value="Div A">Div A</option>
          <option value="Div B">Div B</option>
        </select>
      </div>

      <div style="margin-top:12px; margin-bottom:14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <label style="margin: 0; font-weight: 700; color: #334155;">5. Managed Classes & Subjects</label>
          <span style="font-size: 11px; color: #64748b; font-weight: 600;">(Add/remove subjects across any year)</span>
        </div>
        <div id="facultyEditSelectedSubjectsWrap" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:6px 10px; margin-bottom:8px; min-height:40px; display:flex; flex-wrap:wrap; align-items:center; gap:4px;">
        </div>
        <div class="subject-search-wrap" style="margin-bottom:6px;">
          <input type="text" id="facultyEditSubjectSearch" placeholder="Filter subjects by name or code..." class="search-input">
          <button type="button" id="btnSearchFacultyEditSubject" class="search-btn"><span>Filter</span></button>
        </div>
        <div id="facultyEditDirectSubjectsList" class="direct-subjects-list"></div>
      </div>

      <button class="primary-btn" type="submit"><span>Save Faculty Profile</span><span class="arrow">→</span></button>
      <p id="facultyEditMessage" class="message"></p>
    </form>
  </div>`;
document.body.appendChild(facultyEditProfileModal);
// API_BASE_URL hoisted to top of file


function closeSignupModal() {
  signupModal.classList.add("hidden");
  signupModal.querySelectorAll(".signup-modal").forEach(m => m.classList.remove("hidden"));
  if ($("signupForm")) $("signupForm").reset();
  if ($("signupName")) $("signupName").value = "";
  if ($("signupUsername")) $("signupUsername").value = "";
  if ($("signupPassword")) {
    $("signupPassword").value = "";
    $("signupPassword").type = "password";
  }
  const signupToggleBtn = $("toggleSignupPassword");
  if (signupToggleBtn) {
    signupToggleBtn.classList.remove("is-visible");
    signupToggleBtn.innerHTML = eyeOpenSVG;
  }
  if ($("signupEmail")) $("signupEmail").value = "";
  if ($("signupRole")) $("signupRole").value = "";
  if ($("signupCurrentUsername")) $("signupCurrentUsername").value = "";
  if ($("signupMessage")) {
    $("signupMessage").textContent = "";
    $("signupMessage").className = "message";
  }
  if ($("signupCourseYear")) $("signupCourseYear").value = "";
  if ($("signupSemester")) {
    $("signupSemester").innerHTML = `<option value="">Select Semester</option>`;
    $("signupSemester").value = "";
  }
  if ($("signupDivision")) $("signupDivision").value = "";
  if ($("signupLanguage")) $("signupLanguage").value = "";
  if ($("signupMathChoice")) $("signupMathChoice").value = "";
  if ($("signupMathWrap")) $("signupMathWrap").style.display = "none";
  if ($("signupDepartment")) $("signupDepartment").value = "Department of Computer Science & Applications";
  if ($("facultySubjectSearch")) $("facultySubjectSearch").value = "";
  currentFacultySubjectSearchQuery = "";
  renderSignupDirectSubjectsList("");
  signupFacultySelectedSubjects = [];
  if ($("signupSelectedSubjectsWrap")) {
    $("signupSelectedSubjectsWrap").innerHTML = "";
    $("signupSelectedSubjectsWrap").style.display = "none";
  }
  if ($("signupSubject")) $("signupSubject").value = "";
}

function openSignup(role, user = null) {
  if ($("signupForm")) $("signupForm").reset();
  if ($("facultySubjectSearch")) $("facultySubjectSearch").value = "";
  currentFacultySubjectSearchQuery = "";
  renderSignupDirectSubjectsList("");
  $("signupRole").value = role;
  $("signupCurrentUsername").value = user ? user.username : "";
  $("modalIcon").textContent = role === "student" ? "🎓" : "👨‍🏫";
  $("modalRoleLabel").textContent = role === "student" ? "STUDENT ACCOUNT" : "FACULTY ACCOUNT";
  $("modalTitle").textContent = user ? (role === "student" ? "Edit Student" : "Edit Faculty") : (role === "student" ? "Student Signup" : "Faculty Signup");

  const isStudent = role === "student";
  if ($("studentDetailsFields")) $("studentDetailsFields").classList.toggle("hidden", !isStudent);
  if ($("facultyDeptField")) $("facultyDeptField").classList.toggle("hidden", isStudent);
  if ($("facultySubjectField")) $("facultySubjectField").classList.toggle("hidden", isStudent);

  if ($("signupCourseYear")) $("signupCourseYear").required = isStudent;
  if ($("signupSemester")) $("signupSemester").required = isStudent;
  if ($("signupDivision")) $("signupDivision").required = isStudent;
  if ($("signupLanguage")) $("signupLanguage").required = isStudent;

  $("signupMessage").textContent = "";
  $("signupMessage").className = "message";
  const usernameLabel = $("signupUsernameLabel");
  const usernameInput = $("signupUsername");
  if (usernameLabel && usernameInput) {
    usernameLabel.textContent = "Username";
    usernameInput.placeholder = "Choose a username";
  }
  const signupIntro = signupModal.querySelector('.modal-title p');
  if (signupIntro) {
    signupIntro.textContent = "Create your own username and password to login.";
  }
  $("signupName").value = user ? user.name : "";
  $("signupUsername").value = user ? user.username : "";
  $("signupPassword").value = "";
  $("signupPassword").type = "password";
  $("signupPassword").placeholder = user ? "Leave blank to keep current password" : "Create a password";
  const signupToggleBtn = $("toggleSignupPassword");
  if (signupToggleBtn) {
    signupToggleBtn.classList.remove("is-visible");
    signupToggleBtn.innerHTML = eyeOpenSVG;
    signupToggleBtn.setAttribute("aria-label", "Show password");
    signupToggleBtn.setAttribute("title", "Show password");
  }
  $("signupEmail").value = user ? (user.email || "") : "";

  if (isStudent) {
    const courseYear = user ? (user.courseYear || "") : "";
    const sem = user ? (user.semester || "") : "";
    if ($("signupCourseYear")) $("signupCourseYear").value = courseYear;
    updateSignupSemesterOptions(courseYear, sem);
    populateSignupDivisionSelect(user ? (user.division || "") : "", courseYear);
    if ($("signupLanguage")) $("signupLanguage").value = user ? (user.languageChoice || "") : "";
    if ($("signupMathChoice")) $("signupMathChoice").value = user ? (user.mathChoice || "") : "";
    if ($("signupCourse")) $("signupCourse").value = user ? (user.course || "Bachelor of Computer Applications (BCA)") : "Bachelor of Computer Applications (BCA)";
    signupFacultySelectedSubjects = [];
  } else {
    if ($("signupDepartment")) $("signupDepartment").value = user ? (user.department || "Department of Computer Science & Applications") : "Department of Computer Science & Applications";
    signupFacultySelectedSubjects = user ? (Array.isArray(user.subjects) && user.subjects.length ? [...user.subjects] : (user.subject ? [user.subject] : [])) : [];
    signupFacultySubjectDivisions = user ? { ...(user.subjectDivisions || {}) } : {};
    signupFacultySelectedSubjects.forEach(id => {
      if (!signupFacultySubjectDivisions[id]) {
        signupFacultySubjectDivisions[id] = user ? getFacultySubjectDivision(user, id) : "Both Divisions";
      }
    });
    renderSignupFacultySubjectChips();
    currentFacultySubjectSearchQuery = "";
    if ($("facultySubjectSearch")) $("facultySubjectSearch").value = "";
    renderSignupDirectSubjectsList("");
  }

  signupModal.querySelectorAll(".signup-modal").forEach(m => m.classList.remove("hidden"));
  signupModal.classList.remove("hidden");
  const submitLabel = signupModal.querySelector(".submit-label");
  if (submitLabel) {
    submitLabel.textContent = user ? "Save Changes" : "Create Account";
  }
  setTimeout(() => $("signupName").focus(), 50);
}

if ($("studentSignupBtn")) $("studentSignupBtn").addEventListener("click", () => openSignup("student"));
if ($("facultySignupBtn")) $("facultySignupBtn").addEventListener("click", () => openSignup("faculty"));
if ($("closeSignup")) $("closeSignup").addEventListener("click", closeSignupModal);
if (signupModal) signupModal.addEventListener("click", e => { if (e.target === signupModal) closeSignupModal(); });

const facultySearchInput = $("facultySubjectSearch");
const facultySearchBtn = $("btnSearchFacultySubject");
if (facultySearchInput && facultySearchBtn) {
  const runFacultySubjectSearch = () => {
    renderSignupDirectSubjectsList(facultySearchInput.value);
  };
  facultySearchBtn.addEventListener("click", runFacultySubjectSearch);
  facultySearchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      runFacultySubjectSearch();
    }
  });
}

$("signupForm").addEventListener("submit", async e => {
  e.preventDefault();
  const role = $("signupRole").value;
  const name = $("signupName").value.trim();
  const username = $("signupUsername").value.trim();
  const password = $("signupPassword").value;
  const email = $("signupEmail").value.trim().toLowerCase();
  const department = role === "faculty" ? ($("signupDepartment") ? $("signupDepartment").value.trim() : "Department of Computer Science & Applications") : null;

  const subjects = role === "faculty" ? (signupFacultySelectedSubjects.length ? signupFacultySelectedSubjects : ($("signupSubject").value ? [$("signupSubject").value] : [])) : null;
  const subject = role === "faculty" ? (subjects && subjects.length ? subjects[0] : null) : null;
  const primarySubjectDivision = (role === "faculty" && subject && signupFacultySubjectDivisions[subject]) ? signupFacultySubjectDivisions[subject] : "Both Divisions";
  const facultyDivision = role === "faculty" ? primarySubjectDivision : null;
  const subjectDivisions = role === "faculty" ? signupFacultySubjectDivisions : null;

  const course = role === "student" ? ($("signupCourse") ? $("signupCourse").value.trim() : "Bachelor of Computer Applications (BCA)") : null;
  const courseYear = role === "student" ? ($("signupCourseYear") ? $("signupCourseYear").value : "") : null;
  const semester = role === "student" ? ($("signupSemester") ? $("signupSemester").value : "") : null;
  const division = role === "student" ? ($("signupDivision") ? $("signupDivision").value : "") : facultyDivision;
  const languageChoice = role === "student" ? ($("signupLanguage") ? $("signupLanguage").value : "") : null;
  const mathChoice = role === "student" ? ($("signupMathChoice") ? $("signupMathChoice").value : "") : null;

  const currentUsername = $("signupCurrentUsername").value || null;

  if (role === "faculty" && (!subjects || !subjects.length)) {
    $("signupMessage").textContent = "Please select and add at least one subject/class for the faculty member.";
    $("signupMessage").className = "message error";
    return;
  }

  if (role === "student" && !currentUsername) {
    if (!courseYear || !semester || !division || !languageChoice) {
      $("signupMessage").textContent = "Please select all required academic details (Course Year, Semester, Division, Language Choice).";
      $("signupMessage").className = "message error";
      return;
    }
  }

  if (!currentUsername && !password) {
    $("signupMessage").textContent = "Password is required.";
    $("signupMessage").className = "message error";
    return;
  }

  const error = validateUserInput({ username, password, email, role, subject, currentUsername });
  if (error) {
    $("signupMessage").textContent = error;
    $("signupMessage").className = "message error";
    return;
  }

  const submitButton = signupModal.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  try {
    if (currentUsername) {
      const existing = USERS[role].find(u => u.username.toLowerCase() === currentUsername.toLowerCase());
      if (!existing) throw new Error("Could not find the user to update.");

      const updated = await updateUserOnServer(role, currentUsername, {
        name, newUsername: username, email, subject, subjects, subjectDivisions, department, password,
        division, semester, courseYear, course, languageChoice, mathChoice
      });

      if (role === "student") {
        if (currentUsername.toLowerCase() !== username.toLowerCase()) {
          renameStudentAcademicData(currentUsername, username);
        }
        ensureStudentRecord(username);
        saveAcademicData();
      }
      USERS[role] = USERS[role].map(u => u.id === existing.id || u.username.toLowerCase() === currentUsername.toLowerCase() ? updated : u);
      saveUsers();
      await hydrateUsersFromServer();
      await hydrateAcademicDataFromServer();
      if (typeof render === "function") render();
      $("signupMessage").textContent = "Account updated successfully.";
      $("signupMessage").className = "message success";
    } else {
      const created = await createUserOnServer({
        name, username, password, email, role, subject, subjects, subjectDivisions, department,
        division, semester, courseYear, course, languageChoice, mathChoice
      });
      USERS[role].push(created);
      if (role === "student") {
        ensureStudentRecord(username);
        saveAcademicData();
      }
      saveUsers();
      await hydrateUsersFromServer();
      await hydrateAcademicDataFromServer();
      if (typeof render === "function") render();
      $("username").value = username;
      $("password").value = "";
      document.querySelectorAll(".role-tab").forEach(b => b.classList.toggle("active", b.dataset.role === role));
      currentRole = role;
      $("signupMessage").textContent = "Account created successfully. You can now sign in.";
      $("signupMessage").className = "message success";
    }

    setTimeout(() => {
      closeSignupModal();
    }, 900);
  } catch (error) {
    console.error("Account save error:", error);
    $("signupMessage").textContent = error.message || "Unable to save account.";
    $("signupMessage").className = "message error";
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const username = $("username").value.trim();
  const password = $("password").value;
  const submitButton = $("loginForm").querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  try {
    const user = await loginOnServer(currentRole, username, password);
    currentUser = user;
    const roleList = USERS[currentRole] || [];
    const knownIndex = roleList.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    if (knownIndex >= 0) roleList[knownIndex] = user;
    else roleList.push(user);
    saveUsers();
    sessionStorage.setItem("portalUser", JSON.stringify(user));

    try {
      await hydrateUsersFromServer();
      await hydrateAcademicDataFromServer();
    } catch (hErr) {
      console.warn("Pre-portal hydration warning:", hErr);
    }

    openPortal();
  } catch (error) {
    $("loginMessage").textContent = error.message || "Unable to sign in.";
    $("loginMessage").className = "message error";
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

if ($("logoutBtn")) $("logoutBtn").addEventListener("click", logout);

// ====================================================
// AI MARKS & ATTENDANCE ANALYTICS ENGINE & MODAL LOGIC
// ====================================================

let aiBarChartInstance = null;
let aiPieChartInstance = null;
let currentAiAnalysisUsername = null;
let currentAiAnalysisMode = "marks";

function calculateStudentAnalytics(username) {
  const normUser = String(username || "").trim();
  const studentObj = (USERS.student || []).find(s => s.username.toLowerCase() === normUser.toLowerCase()) || currentUser;
  const targetUser = studentObj ? studentObj.username : normUser;
  const record = getStudentRecord(targetUser);

  let enrolledSubjects = getSubjectsForStudent(studentObj);
  if (!enrolledSubjects || !enrolledSubjects.length) {
    const targetSem = (studentObj && studentObj.semester) ? studentObj.semester : "1st Semester";
    const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
    enrolledSubjects = subjectsSource.filter(s => s.semester === targetSem);
    if (!enrolledSubjects.length) enrolledSubjects = subjectsSource.slice(0, 8);
  }

  let totalMarksPct = 0;
  let totalObtainedMarks = 0;
  let totalMaxMarks = 0;
  let totalI1Obtained = 0;
  let totalI1Max = 0;
  let totalI1Pct = 0;
  let validI1Count = 0;
  let validMarksCount = 0;
  let totalAttPct = 0;
  let validAttCount = 0;

  let hasAnyI1 = false;
  let hasAnyI2 = false;

  const subjectData = enrolledSubjects.map(s => {
    const isLab = s.name.toLowerCase().includes("lab") || s.id.toLowerCase().includes("lab");

    // Calculate marks
    const m = record.marks ? record.marks[s.id] : null;
    let markPct = 0;
    let markObtained = 0;
    let markMax = 100;
    let isMarkSet = false;

    let i1Val = null;
    let i1Max = 20;
    let i1Pct = null;

    let i2Val = null;
    let i2Max = 20;
    let i2Pct = null;

    let assignVal = null;

    if (m && typeof m === "object") {
      if (typeof m.internal1 === "number") {
        i1Val = m.internal1;
        i1Max = m.maxInternal1 || 20;
        i1Pct = i1Max > 0 ? Math.min(100, Math.max(0, Math.round((i1Val / i1Max) * 100))) : 0;
        totalI1Obtained += i1Val;
        totalI1Max += i1Max;
        totalI1Pct += i1Pct;
        validI1Count++;
        hasAnyI1 = true;
      }
      if (typeof m.internal2 === "number") {
        i2Val = m.internal2;
        i2Max = m.maxInternal2 || 20;
        i2Pct = i2Max > 0 ? Math.min(100, Math.max(0, Math.round((i2Val / i2Max) * 100))) : 0;
        hasAnyI2 = true;
      }
      if (typeof m.assignment === "number") {
        assignVal = m.assignment;
      }

      markObtained = (i1Val || 0) + (i2Val || 0) + (assignVal || 0);
      markMax = (i1Val !== null ? i1Max : 0) + (i2Val !== null ? i2Max : 0) + (assignVal !== null ? 10 : 0);
      if (markMax === 0) markMax = i1Max + i2Max + 10;
      if (i1Val !== null || i2Val !== null || assignVal !== null) {
        isMarkSet = true;
      }
    } else if (typeof m === "number") {
      markObtained = m;
      markMax = 100;
      isMarkSet = true;
    }

    if (isMarkSet && markMax > 0) {
      markPct = Math.min(100, Math.max(0, Math.round((markObtained / markMax) * 100)));
      totalMarksPct += markPct;
      totalObtainedMarks += markObtained;
      totalMaxMarks += markMax;
      validMarksCount++;
    }

    // Calculate attendance
    const attVal = (record.attendance && typeof record.attendance[s.id] === "number") ? record.attendance[s.id] : 0;
    totalAttPct += attVal;
    validAttCount++;

    return {
      id: s.id,
      name: s.name,
      short: s.short || s.name,
      icon: s.icon || (isLab ? "🧪" : "📖"),
      isLab: isLab,
      markObtained: markObtained,
      markMax: markMax,
      markPct: markPct,
      isMarkSet: isMarkSet,
      i1Val: i1Val,
      i1Max: i1Max,
      i1Pct: i1Pct,
      i2Val: i2Val,
      i2Max: i2Max,
      i2Pct: i2Pct,
      assignVal: assignVal,
      attPct: attVal
    };
  });

  let internalsMode = "none";
  if (hasAnyI2) internalsMode = "both";
  else if (hasAnyI1) internalsMode = "i1_only";

  const avgMarksPct = validMarksCount > 0 ? Math.round(totalMarksPct / validMarksCount) : 0;
  const avgI1Pct = validI1Count > 0 ? Math.round(totalI1Pct / validI1Count) : 0;
  const avgAttPct = validAttCount > 0 ? Math.round(totalAttPct / validAttCount) : 0;

  // Separate Theory vs Labs
  const theorySubjects = subjectData.filter(s => !s.isLab);
  const labSubjects = subjectData.filter(s => s.isLab);

  // Theory Marks Top/Low
  const sortedTheoryByMarks = [...theorySubjects].sort((a, b) => {
    if (internalsMode === "i1_only") return (b.i1Pct || 0) - (a.i1Pct || 0);
    return b.markPct - a.markPct;
  });
  const topTheoryMarks = sortedTheoryByMarks.length ? sortedTheoryByMarks[0] : null;
  const lowTheoryMarks = sortedTheoryByMarks.length ? sortedTheoryByMarks[sortedTheoryByMarks.length - 1] : null;

  // Lab Marks Top/Low
  const sortedLabByMarks = [...labSubjects].sort((a, b) => {
    if (internalsMode === "i1_only") return (b.i1Pct || 0) - (a.i1Pct || 0);
    return b.markPct - a.markPct;
  });
  const topLabMarks = sortedLabByMarks.length ? sortedLabByMarks[0] : null;
  const lowLabMarks = sortedLabByMarks.length ? sortedLabByMarks[sortedLabByMarks.length - 1] : null;

  // Theory Attendance Top/Low
  const sortedTheoryByAtt = [...theorySubjects].sort((a, b) => b.attPct - a.attPct);
  const topTheoryAtt = sortedTheoryByAtt.length ? sortedTheoryByAtt[0] : null;
  const lowTheoryAtt = sortedTheoryByAtt.length ? sortedTheoryByAtt[sortedTheoryByAtt.length - 1] : null;

  // Lab Attendance Top/Low
  const sortedLabByAtt = [...labSubjects].sort((a, b) => b.attPct - a.attPct);
  const topLabAtt = sortedLabByAtt.length ? sortedLabByAtt[0] : null;
  const lowLabAtt = sortedLabByAtt.length ? sortedLabByAtt[sortedLabByAtt.length - 1] : null;

  const lowAttendanceSubjects = subjectData.filter(s => s.attPct < 75);
  const highAttendanceSubjects = subjectData.filter(s => s.attPct >= 85);

  return {
    student: studentObj,
    subjectData: subjectData,
    theorySubjects: theorySubjects,
    labSubjects: labSubjects,
    internalsMode: internalsMode,
    avgMarksPct: avgMarksPct,
    avgI1Pct: avgI1Pct,
    avgAttPct: avgAttPct,
    totalObtainedMarks: totalObtainedMarks,
    totalMaxMarks: totalMaxMarks,
    totalI1Obtained: totalI1Obtained,
    totalI1Max: totalI1Max,
    topTheoryMarks: topTheoryMarks,
    lowTheoryMarks: lowTheoryMarks,
    topLabMarks: topLabMarks,
    lowLabMarks: lowLabMarks,
    topTheoryAtt: topTheoryAtt,
    lowTheoryAtt: lowTheoryAtt,
    topLabAtt: topLabAtt,
    lowLabAtt: lowLabAtt,
    lowAttendanceSubjects: lowAttendanceSubjects,
    highAttendanceSubjects: highAttendanceSubjects
  };
}

function getGradeStatus(marksPct) {
  if (typeof marksPct !== "number" || isNaN(marksPct)) return "Pending";
  if (marksPct >= 85) return "Distinction";
  if (marksPct >= 70) return "First Class";
  if (marksPct >= 50) return "Second Class";
  if (marksPct >= 35) return "Third Class";
  if (marksPct > 0) return "Needs Improvement";
  return "Evaluation Pending";
}

function generateAiInsights(analytics, mode = "marks") {
  const { student, avgMarksPct, avgAttPct, topTheoryMarks, lowTheoryMarks, topLabMarks, lowLabMarks, topTheoryAtt, lowTheoryAtt, topLabAtt, lowLabAtt, lowAttendanceSubjects } = analytics;
  const studentName = student ? student.name : "Student";

  if (mode === "marks") {
    const isI1Only = analytics.internalsMode === "i1_only";
    const isBoth = analytics.internalsMode === "both";
    const evalTarget = isI1Only ? "(1st Internal Test Evaluation)" : (isBoth ? "(1st & 2nd Internals Evaluation)" : "");
    const totalScoreText = isI1Only
      ? `${analytics.totalI1Obtained} / ${analytics.totalI1Max} Marks (${analytics.avgI1Pct}% Aggregate)`
      : `${analytics.totalObtainedMarks} / ${analytics.totalMaxMarks} Marks (${analytics.avgMarksPct}% Aggregate)`;

    let html = `
      <div style="background: rgba(255,255,255,0.75); border:1px solid #c7d2fe; padding:14px 18px; border-radius:14px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <p style="margin:0; font-size:14px; font-weight:600; color:#1e1b4b; line-height:1.5;">
          🤖 <strong>AI Marks Diagnosis for ${studentName} ${evalTarget}:</strong>
          Based on internal test & assignment evaluation across theory & practical lab courses, ${studentName} has scored total real marks of <strong>${totalScoreText}</strong>.
        </p>
      </div>

      <div class="insights-section-title">📌 Marks Performance Breakdown & Strategy</div>
      <ul class="ai-recommendation-list">
    `;

    if (topTheoryMarks) {
      const topScoreStr = isI1Only ? `${topTheoryMarks.i1Val} / ${topTheoryMarks.i1Max} Marks` : `${topTheoryMarks.markObtained} / ${topTheoryMarks.markMax} Marks`;
      html += `
        <li class="ai-recommendation-item good-item">
          <span style="font-size:18px;">🏆</span>
          <div>
            <strong>Top Performing Subject (Theory):</strong> <b>${topTheoryMarks.name} (${topTheoryMarks.short})</b> is your highest-scoring theory course at <strong>${topScoreStr}</strong>. Great academic mastery!
          </div>
        </li>
      `;
    }

    if (lowTheoryMarks) {
      const lowScoreStr = isI1Only ? `${lowTheoryMarks.i1Val} / ${lowTheoryMarks.i1Max} Marks` : `${lowTheoryMarks.markObtained} / ${lowTheoryMarks.markMax} Marks`;
      html += `
        <li class="ai-recommendation-item ${(isI1Only ? lowTheoryMarks.i1Pct : lowTheoryMarks.markPct) < 50 ? 'alert-item' : ''}">
          <span style="font-size:18px;">🎯</span>
          <div>
            <strong>Low Performing Subject (Theory):</strong> <b>${lowTheoryMarks.name} (${lowTheoryMarks.short})</b> currently stands at <strong>${lowScoreStr}</strong>. Focus on previous internal test blueprints to boost your score.
          </div>
        </li>
      `;
    }

    if (topLabMarks) {
      const topLabStr = isI1Only ? `${topLabMarks.i1Val} / ${topLabMarks.i1Max} Marks` : `${topLabMarks.markObtained} / ${topLabMarks.markMax} Marks`;
      html += `
        <li class="ai-recommendation-item good-item">
          <span style="font-size:18px;">🧪</span>
          <div>
            <strong>Top Performing Practical Lab:</strong> <b>${topLabMarks.name} (${topLabMarks.short})</b> leads practical performance at <strong>${topLabStr}</strong>.
          </div>
        </li>
      `;
    }

    if (lowLabMarks) {
      const lowLabStr = isI1Only ? `${lowLabMarks.i1Val} / ${lowLabMarks.i1Max} Marks` : `${lowLabMarks.markObtained} / ${lowLabMarks.markMax} Marks`;
      html += `
        <li class="ai-recommendation-item">
          <span style="font-size:18px;">🔬</span>
          <div>
            <strong>Low Performing Practical Lab:</strong> <b>${lowLabMarks.name} (${lowLabMarks.short})</b> stands at <strong>${lowLabStr}</strong>. Complete all pending lab manual submissions.
          </div>
        </li>
      `;
    }

    html += `
      </ul>
      <div style="margin-top:14px; font-size:12px; color:#475569; font-weight:600; display:flex; align-items:center; gap:6px;">
        <span>💡 Pro Tip:</span> Scoring above 75% in internal assessments significantly improves overall final semester GPA.
      </div>
    `;
    return html;

  } else {
    // Attendance mode
    let attStatusText = "Satisfactory";
    if (avgAttPct >= 85) attStatusText = "Excellent Attendance";
    else if (avgAttPct >= 75) attStatusText = "Good Standing";
    else attStatusText = "At-Risk (< 75%)";

    let html = `
      <div style="background: rgba(255,255,255,0.75); border:1px solid #c7d2fe; padding:14px 18px; border-radius:14px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <p style="margin:0; font-size:14px; font-weight:600; color:#1e1b4b; line-height:1.5;">
          🤖 <strong>AI Attendance Diagnosis for ${studentName}:</strong>
          Your overall attendance rate is <strong>${avgAttPct}% (${attStatusText})</strong> across all theory lectures and practical lab sessions.
        </p>
      </div>

      <div class="insights-section-title">📌 Attendance Tracking & Mandatory Cutoff</div>
      <ul class="ai-recommendation-list">
    `;

    if (topTheoryAtt) {
      html += `
        <li class="ai-recommendation-item good-item">
          <span style="font-size:18px;">🌟</span>
          <div>
            <strong>Top Attendance Subject (Theory):</strong> <b>${topTheoryAtt.name} (${topTheoryAtt.short})</b> has your highest theory attendance at <strong>${topTheoryAtt.attPct}%</strong>.
          </div>
        </li>
      `;
    }

    if (lowTheoryAtt) {
      const isRisk = lowTheoryAtt.attPct < 75;
      html += `
        <li class="ai-recommendation-item ${isRisk ? 'alert-item' : ''}">
          <span style="font-size:18px;">⚠️</span>
          <div>
            <strong>Low Attendance Subject (Theory):</strong> <b>${lowTheoryAtt.name} (${lowTheoryAtt.short})</b> is at <strong>${lowTheoryAtt.attPct}%</strong>${isRisk ? ' — <strong style="color:#ef4444;">Below mandatory 75% cutoff!</strong>' : ''}.
          </div>
        </li>
      `;
    }

    if (topLabAtt) {
      html += `
        <li class="ai-recommendation-item good-item">
          <span style="font-size:18px;">🧪</span>
          <div>
            <strong>Top Attendance Lab:</strong> <b>${topLabAtt.name} (${topLabAtt.short})</b> leads lab attendance at <strong>${topLabAtt.attPct}%</strong>.
          </div>
        </li>
      `;
    }

    if (lowLabAtt) {
      const isRisk = lowLabAtt.attPct < 75;
      html += `
        <li class="ai-recommendation-item ${isRisk ? 'alert-item' : ''}">
          <span style="font-size:18px;">🔬</span>
          <div>
            <strong>Low Attendance Lab:</strong> <b>${lowLabAtt.name} (${lowLabAtt.short})</b> stands at <strong>${lowLabAtt.attPct}%</strong>${isRisk ? ' — <strong style="color:#ef4444;">Below mandatory 75% cutoff!</strong>' : ''}.
          </div>
        </li>
      `;
    }

    if (lowAttendanceSubjects.length > 0) {
      const names = lowAttendanceSubjects.map(s => `${s.name} (${s.attPct}%)`).join(", ");
      html += `
        <li class="ai-recommendation-item alert-item">
          <span style="font-size:18px;">🚨</span>
          <div>
            <strong>Action Required (${lowAttendanceSubjects.length} Subject/Lab${lowAttendanceSubjects.length > 1 ? 's' : ''} < 75%):</strong>
            <strong>${names}</strong> require immediate lecture/practical attendance to avoid hall ticket locks.
          </div>
        </li>
      `;
    }

    html += `
      </ul>
      <div style="margin-top:14px; font-size:12px; color:#475569; font-weight:600; display:flex; align-items:center; gap:6px;">
        <span>💡 Pro Tip:</span> Mandatory attendance of 75% is required by the university to sit for semester end examinations.
      </div>
    `;
    return html;
  }
}

function renderAiCharts(analytics, mode = "marks") {
  const { subjectData } = analytics;
  const labels = subjectData.map(s => s.short || s.name);
  const marksValues = subjectData.map(s => s.markPct);
  const attValues = subjectData.map(s => s.attPct);

  const canvasMarks = document.getElementById("aiMarksBarChart");
  const canvasAtt = document.getElementById("aiAttendancePieChart");

  if (!canvasMarks || !canvasAtt) return;

  if (aiBarChartInstance) {
    aiBarChartInstance.destroy();
    aiBarChartInstance = null;
  }
  if (aiPieChartInstance) {
    aiPieChartInstance.destroy();
    aiPieChartInstance = null;
  }

  if (mode === "marks") {
    const isI1Only = analytics.internalsMode === "i1_only";
    const isBoth = analytics.internalsMode === "both";

    if (isI1Only) {
      const i1Values = subjectData.map(s => s.i1Val !== null ? s.i1Val : 0);
      const i1Maxes = subjectData.map(s => s.i1Max || 20);
      const maxScale = Math.max(20, ...i1Maxes);

      const barColors = subjectData.map(s => (s.i1Pct || 0) >= 75 ? 'rgba(34, 197, 94, 0.85)' : ((s.i1Pct || 0) >= 50 ? 'rgba(59, 130, 246, 0.85)' : ((s.i1Pct || 0) >= 35 ? 'rgba(245, 158, 11, 0.85)' : 'rgba(239, 68, 68, 0.85)')));
      const barBorderColors = subjectData.map(s => (s.i1Pct || 0) >= 75 ? '#16a34a' : ((s.i1Pct || 0) >= 50 ? '#2563eb' : ((s.i1Pct || 0) >= 35 ? '#d97706' : '#dc2626')));

      const distinctionCount = subjectData.filter(s => (s.i1Pct || 0) >= 85).length;
      const firstClassCount = subjectData.filter(s => (s.i1Pct || 0) >= 70 && (s.i1Pct || 0) < 85).length;
      const secondClassCount = subjectData.filter(s => (s.i1Pct || 0) >= 50 && (s.i1Pct || 0) < 70).length;
      const thirdClassCount = subjectData.filter(s => (s.i1Pct || 0) >= 35 && (s.i1Pct || 0) < 50).length;
      const failCount = subjectData.filter(s => (s.i1Pct || 0) < 35).length;

      if (typeof Chart !== "undefined") {
        const ctxBar = canvasMarks.getContext("2d");
        aiBarChartInstance = new Chart(ctxBar, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "1st Internal Marks",
              data: i1Values,
              backgroundColor: barColors,
              borderColor: barBorderColors,
              borderWidth: 1.5,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const s = subjectData[ctx.dataIndex];
                    return `${s.short || s.name}: ${s.i1Val || 0} / ${s.i1Max || 20} Marks (${s.i1Pct || 0}%)`;
                  }
                }
              }
            },
            scales: {
              y: { beginAtZero: true, max: maxScale, ticks: { callback: (val) => val + " Marks" }, grid: { color: "#f1f5f9" } },
              x: { grid: { display: false } }
            }
          }
        });

        const ctxPie = canvasAtt.getContext("2d");
        aiPieChartInstance = new Chart(ctxPie, {
          type: "doughnut",
          data: {
            labels: ["Distinction (≥85%)", "First Class (70-84%)", "Second Class (50-69%)", "Third Class (35-49%)", "Fail (<35%)"],
            datasets: [{
              data: [distinctionCount, firstClassCount, secondClassCount, thirdClassCount, failCount],
              backgroundColor: [
                "rgba(34, 197, 94, 0.85)",
                "rgba(59, 130, 246, 0.85)",
                "rgba(168, 85, 247, 0.85)",
                "rgba(245, 158, 11, 0.85)",
                "rgba(239, 68, 68, 0.85)"
              ],
              borderColor: ["#16a34a", "#2563eb", "#7e22ce", "#d97706", "#dc2626"],
              borderWidth: 1.5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom", labels: { font: { size: 11, weight: '600' } } } }
          }
        });
      } else {
        renderCanvasFallbackBar(canvasMarks, labels, i1Values);
        renderCanvasFallbackPie(canvasAtt, [distinctionCount, firstClassCount, secondClassCount, thirdClassCount, failCount]);
      }
    } else if (isBoth) {
      const i1Values = subjectData.map(s => s.i1Val !== null ? s.i1Val : 0);
      const i2Values = subjectData.map(s => s.i2Val !== null ? s.i2Val : 0);
      const maxScale = Math.max(20, ...subjectData.map(s => Math.max(s.i1Max || 20, s.i2Max || 20)));

      const distinctionCount = subjectData.filter(s => s.markPct >= 85).length;
      const firstClassCount = subjectData.filter(s => s.markPct >= 70 && s.markPct < 85).length;
      const secondClassCount = subjectData.filter(s => s.markPct >= 50 && s.markPct < 70).length;
      const thirdClassCount = subjectData.filter(s => s.markPct >= 35 && s.markPct < 50).length;
      const failCount = subjectData.filter(s => s.markPct < 35).length;

      if (typeof Chart !== "undefined") {
        const ctxBar = canvasMarks.getContext("2d");
        aiBarChartInstance = new Chart(ctxBar, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "1st Internal Marks",
                data: i1Values,
                backgroundColor: "rgba(59, 130, 246, 0.85)",
                borderColor: "#2563eb",
                borderWidth: 1.5,
                borderRadius: 6
              },
              {
                label: "2nd Internal Marks",
                data: i2Values,
                backgroundColor: "rgba(168, 85, 247, 0.85)",
                borderColor: "#7e22ce",
                borderWidth: 1.5,
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: "top", labels: { font: { size: 11, weight: '700' } } },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const s = subjectData[ctx.dataIndex];
                    const label = ctx.dataset.label || "";
                    const val = ctx.raw;
                    const max = label.includes("1st") ? (s.i1Max || 20) : (s.i2Max || 20);
                    return `${s.short || s.name} (${label}): ${val} / ${max} Marks`;
                  }
                }
              }
            },
            scales: {
              y: { beginAtZero: true, max: maxScale, ticks: { callback: (val) => val + " Marks" }, grid: { color: "#f1f5f9" } },
              x: { grid: { display: false } }
            }
          }
        });

        const ctxPie = canvasAtt.getContext("2d");
        aiPieChartInstance = new Chart(ctxPie, {
          type: "doughnut",
          data: {
            labels: ["Distinction (≥85%)", "First Class (70-84%)", "Second Class (50-69%)", "Third Class (35-49%)", "Fail (<35%)"],
            datasets: [{
              data: [distinctionCount, firstClassCount, secondClassCount, thirdClassCount, failCount],
              backgroundColor: [
                "rgba(34, 197, 94, 0.85)",
                "rgba(59, 130, 246, 0.85)",
                "rgba(168, 85, 247, 0.85)",
                "rgba(245, 158, 11, 0.85)",
                "rgba(239, 68, 68, 0.85)"
              ],
              borderColor: ["#16a34a", "#2563eb", "#7e22ce", "#d97706", "#dc2626"],
              borderWidth: 1.5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom", labels: { font: { size: 11, weight: '600' } } } }
          }
        });
      } else {
        renderCanvasFallbackBar(canvasMarks, labels, i1Values);
        renderCanvasFallbackPie(canvasAtt, [distinctionCount, firstClassCount, secondClassCount, thirdClassCount, failCount]);
      }
    } else {
      const realMarksValues = subjectData.map(s => s.markObtained);
      const maxMarksValues = subjectData.map(s => s.markMax);
      const maxScale = Math.max(50, ...maxMarksValues);

      const barColors = subjectData.map(s => s.markPct >= 75 ? 'rgba(34, 197, 94, 0.85)' : (s.markPct >= 50 ? 'rgba(59, 130, 246, 0.85)' : (s.markPct >= 35 ? 'rgba(245, 158, 11, 0.85)' : 'rgba(239, 68, 68, 0.85)')));
      const barBorderColors = subjectData.map(s => s.markPct >= 75 ? '#16a34a' : (s.markPct >= 50 ? '#2563eb' : (s.markPct >= 35 ? '#d97706' : '#dc2626')));

      const distinctionCount = subjectData.filter(s => s.markPct >= 85).length;
      const firstClassCount = subjectData.filter(s => s.markPct >= 70 && s.markPct < 85).length;
      const secondClassCount = subjectData.filter(s => s.markPct >= 50 && s.markPct < 70).length;
      const thirdClassCount = subjectData.filter(s => s.markPct >= 35 && s.markPct < 50).length;
      const failCount = subjectData.filter(s => s.markPct < 35).length;

      if (typeof Chart !== "undefined") {
        const ctxBar = canvasMarks.getContext("2d");
        aiBarChartInstance = new Chart(ctxBar, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Subject & Lab Real Marks",
              data: realMarksValues,
              backgroundColor: barColors,
              borderColor: barBorderColors,
              borderWidth: 1.5,
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const s = subjectData[ctx.dataIndex];
                    return `${s.short || s.name}: ${s.markObtained} / ${s.markMax} Marks (${s.markPct}%)`;
                  }
                }
              }
            },
            scales: {
              y: { beginAtZero: true, max: maxScale, ticks: { callback: (val) => val + " Marks" }, grid: { color: "#f1f5f9" } },
              x: { grid: { display: false } }
            }
          }
        });

        const ctxPie = canvasAtt.getContext("2d");
        aiPieChartInstance = new Chart(ctxPie, {
          type: "doughnut",
          data: {
            labels: ["Distinction (≥85%)", "First Class (70-84%)", "Second Class (50-69%)", "Third Class (35-49%)", "Fail (<35%)"],
            datasets: [{
              data: [distinctionCount, firstClassCount, secondClassCount, thirdClassCount, failCount],
              backgroundColor: [
                "rgba(34, 197, 94, 0.85)",
                "rgba(59, 130, 246, 0.85)",
                "rgba(168, 85, 247, 0.85)",
                "rgba(245, 158, 11, 0.85)",
                "rgba(239, 68, 68, 0.85)"
              ],
              borderColor: ["#16a34a", "#2563eb", "#7e22ce", "#d97706", "#dc2626"],
              borderWidth: 1.5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom", labels: { font: { size: 11, weight: '600' } } } }
          }
        });
      } else {
        renderCanvasFallbackBar(canvasMarks, labels, realMarksValues);
        renderCanvasFallbackPie(canvasAtt, [distinctionCount, firstClassCount, secondClassCount, thirdClassCount, failCount]);
      }
    }
  } else {
    // Attendance mode
    const barColors = attValues.map(v => v >= 85 ? 'rgba(16, 185, 129, 0.85)' : (v >= 75 ? 'rgba(59, 130, 246, 0.85)' : 'rgba(239, 68, 68, 0.85)'));
    const barBorderColors = attValues.map(v => v >= 85 ? '#059669' : (v >= 75 ? '#2563eb' : '#dc2626'));

    const highCount = attValues.filter(v => v >= 85).length;
    const goodCount = attValues.filter(v => v >= 75 && v < 85).length;
    const riskCount = attValues.filter(v => v < 75).length;

    if (typeof Chart !== "undefined") {
      const ctxBar = canvasMarks.getContext("2d");
      aiBarChartInstance = new Chart(ctxBar, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Subject & Lab Attendance %",
            data: attValues,
            backgroundColor: barColors,
            borderColor: barBorderColors,
            borderWidth: 1.5,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { callback: (val) => val + "%" }, grid: { color: "#f1f5f9" } },
            x: { grid: { display: false } }
          }
        }
      });

      const ctxPie = canvasAtt.getContext("2d");
      aiPieChartInstance = new Chart(ctxPie, {
        type: "doughnut",
        data: {
          labels: ["Excellent (≥85%)", "Good (75-84%)", "At Risk (<75%)"],
          datasets: [{
            data: [highCount, goodCount, riskCount],
            backgroundColor: ["rgba(16, 185, 129, 0.85)", "rgba(59, 130, 246, 0.85)", "rgba(239, 68, 68, 0.85)"],
            borderColor: ["#059669", "#2563eb", "#dc2626"],
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { font: { size: 11, weight: '600' } } } }
        }
      });
    } else {
      renderCanvasFallbackBar(canvasMarks, labels, attValues);
      renderCanvasFallbackPie(canvasAtt, [highCount, goodCount, riskCount]);
    }
  }
}

function renderCanvasFallbackBar(canvas, labels, values) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.parentElement.clientWidth || 400;
  const h = canvas.height = 220;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";

  const padding = 35;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;
  const barW = Math.max(10, (chartW / (values.length || 1)) - 10);

  values.forEach((val, i) => {
    const barH = (val / 100) * chartH;
    const x = padding + i * (barW + 10);
    const y = h - padding - barH;

    ctx.fillStyle = val >= 75 ? "#22c55e" : (val >= 50 ? "#3b82f6" : "#f59e0b");
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = "#334155";
    ctx.fillText(labels[i] || "", x, h - 10);
    ctx.fillText(`${val}%`, x, y - 5);
  });
}

function renderCanvasFallbackPie(canvas, counts) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.parentElement.clientWidth || 400;
  const h = canvas.height = 220;
  const total = counts.reduce((a, b) => a + b, 0) || 1;

  ctx.clearRect(0, 0, w, h);
  const colors = ["#10b981", "#3b82f6", "#ef4444"];
  let startAngle = 0;

  counts.forEach((cnt, i) => {
    const sliceAngle = (cnt / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    ctx.arc(w / 2, h / 2, 70, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    startAngle += sliceAngle;
  });
}

function openAiAnalysisModal(targetUsername, mode = "marks") {
  const username = targetUsername || (currentUser ? currentUser.username : "");
  if (!username) return;

  currentAiAnalysisUsername = username;
  currentAiAnalysisMode = mode;
  const analytics = calculateStudentAnalytics(username);

  const modal = $("aiAnalysisModal");
  if (!modal) return;

  const studentName = analytics.student ? analytics.student.name : username;
  const card6 = $("aiMetricCard6");

  if (mode === "marks") {
    const isI1Only = analytics.internalsMode === "i1_only";
    const isBoth = analytics.internalsMode === "both";
    const modeLabel = isI1Only ? "1st Int" : (isBoth ? "Both Int" : "Marks");

    if ($("aiModalHeaderIcon")) $("aiModalHeaderIcon").textContent = "📈";
    $("aiModalTitle").textContent = `AI Marks Analytics: ${studentName}`;
    $("aiModalSubtitle").textContent = isI1Only
      ? `1st Internal Test Real Marks Evaluation (${analytics.student ? (analytics.student.semester || 'Current Semester') : 'Student Portal'})`
      : (isBoth ? `1st & 2nd Internal Exams Real Marks Evaluation (${analytics.student ? (analytics.student.semester || 'Current Semester') : 'Student Portal'})` : `Academic Real Marks Evaluation`);

    // Card 1: Top Performing Subject (Theory)
    $("aiMetricIcon1").textContent = "🏆";
    $("aiMetricLabel1").textContent = `Top Subject (${modeLabel})`;
    $("aiMetricVal1").textContent = analytics.topTheoryMarks ? (analytics.topTheoryMarks.short || analytics.topTheoryMarks.name) : "--";
    if (analytics.topTheoryMarks) {
      if (isI1Only) $("aiMetricBadge1").textContent = `${analytics.topTheoryMarks.i1Val} / ${analytics.topTheoryMarks.i1Max} Marks`;
      else $("aiMetricBadge1").textContent = `${analytics.topTheoryMarks.markObtained} / ${analytics.topTheoryMarks.markMax} Marks`;
    } else {
      $("aiMetricBadge1").textContent = "--";
    }
    $("aiMetricBadge1").className = "metric-badge good";

    // Card 2: Low Performing Subject (Theory)
    $("aiMetricIcon2").textContent = "🎯";
    $("aiMetricLabel2").textContent = `Low Subject (${modeLabel})`;
    $("aiMetricVal2").textContent = analytics.lowTheoryMarks ? (analytics.lowTheoryMarks.short || analytics.lowTheoryMarks.name) : "--";
    if (analytics.lowTheoryMarks) {
      if (isI1Only) $("aiMetricBadge2").textContent = `${analytics.lowTheoryMarks.i1Val} / ${analytics.lowTheoryMarks.i1Max} Marks`;
      else $("aiMetricBadge2").textContent = `${analytics.lowTheoryMarks.markObtained} / ${analytics.lowTheoryMarks.markMax} Marks`;
    } else {
      $("aiMetricBadge2").textContent = "--";
    }
    $("aiMetricBadge2").className = "metric-badge warn";

    // Card 3: Top Performing Lab (Practical)
    $("aiMetricIcon3").textContent = "🧪";
    $("aiMetricLabel3").textContent = `Top Lab (${modeLabel})`;
    $("aiMetricVal3").textContent = analytics.topLabMarks ? (analytics.topLabMarks.short || analytics.topLabMarks.name) : "No Labs";
    if (analytics.topLabMarks) {
      if (isI1Only) $("aiMetricBadge3").textContent = `${analytics.topLabMarks.i1Val} / ${analytics.topLabMarks.i1Max} Marks`;
      else $("aiMetricBadge3").textContent = `${analytics.topLabMarks.markObtained} / ${analytics.topLabMarks.markMax} Marks`;
    } else {
      $("aiMetricBadge3").textContent = "--";
    }
    $("aiMetricBadge3").className = "metric-badge good";

    // Card 4: Low Performing Lab (Practical)
    $("aiMetricIcon4").textContent = "🔬";
    $("aiMetricLabel4").textContent = `Low Lab (${modeLabel})`;
    $("aiMetricVal4").textContent = analytics.lowLabMarks ? (analytics.lowLabMarks.short || analytics.lowLabMarks.name) : "No Labs";
    if (analytics.lowLabMarks) {
      if (isI1Only) $("aiMetricBadge4").textContent = `${analytics.lowLabMarks.i1Val} / ${analytics.lowLabMarks.i1Max} Marks`;
      else $("aiMetricBadge4").textContent = `${analytics.lowLabMarks.markObtained} / ${analytics.lowLabMarks.markMax} Marks`;
    } else {
      $("aiMetricBadge4").textContent = "--";
    }
    $("aiMetricBadge4").className = "metric-badge warn";

    // Card 5: Total Real Marks (Replaced Grade Status)
    $("aiMetricIcon5").textContent = "📊";
    $("aiMetricLabel5").textContent = `Total Marks (${modeLabel})`;
    if (isI1Only) {
      $("aiMetricVal5").textContent = analytics.totalI1Max > 0 ? `${analytics.totalI1Obtained} / ${analytics.totalI1Max}` : "--";
      $("aiMetricBadge5").textContent = `${analytics.avgI1Pct}% Aggregate`;
    } else {
      $("aiMetricVal5").textContent = analytics.totalMaxMarks > 0 ? `${analytics.totalObtainedMarks} / ${analytics.totalMaxMarks}` : "--";
      $("aiMetricBadge5").textContent = `${analytics.avgMarksPct}% Aggregate`;
    }
    $("aiMetricBadge5").className = (isI1Only ? analytics.avgI1Pct : analytics.avgMarksPct) >= 70 ? "metric-badge good" : ((isI1Only ? analytics.avgI1Pct : analytics.avgMarksPct) >= 35 ? "metric-badge warn" : "metric-badge danger");

    // Card 6: Hide for Marks Mode
    if (card6) card6.style.display = "none";

    // Chart titles
    if (isI1Only) {
      if ($("aiBarChartTitle")) $("aiBarChartTitle").textContent = "📊 1st Internal Real Marks Comparison (Bar Graph)";
      if ($("aiBarChartChip")) $("aiBarChartChip").textContent = "1st Internal";
      if ($("aiPieChartTitle")) $("aiPieChartTitle").textContent = "🥧 1st Internal Grade Tier Breakdown (Pie Chart)";
      if ($("aiPieChartChip")) $("aiPieChartChip").textContent = "1st Internal Tiers";
    } else if (isBoth) {
      if ($("aiBarChartTitle")) $("aiBarChartTitle").textContent = "📊 Both Internals Real Marks Comparison (1st vs 2nd Internal Bar Graph)";
      if ($("aiBarChartChip")) $("aiBarChartChip").textContent = "Both Internals";
      if ($("aiPieChartTitle")) $("aiPieChartTitle").textContent = "🥧 Both Internals Overall Grade Breakdown (Pie Chart)";
      if ($("aiPieChartChip")) $("aiPieChartChip").textContent = "Combined Tiers";
    } else {
      if ($("aiBarChartTitle")) $("aiBarChartTitle").textContent = "📊 Theory & Lab Real Marks Comparison (Bar Graph)";
      if ($("aiBarChartChip")) $("aiBarChartChip").textContent = "Real Marks";
      if ($("aiPieChartTitle")) $("aiPieChartTitle").textContent = "🥧 Marks Grade Tier Breakdown (Pie Chart)";
      if ($("aiPieChartChip")) $("aiPieChartChip").textContent = "Score Tiers";
    }

  } else {
    // Attendance mode
    if ($("aiModalHeaderIcon")) $("aiModalHeaderIcon").textContent = "📊";
    $("aiModalTitle").textContent = `AI Attendance Analytics: ${studentName}`;
    $("aiModalSubtitle").textContent = `Theory Subject & Practical Lab Attendance Diagnostics (${analytics.student ? (analytics.student.semester || 'Current Semester') : 'Student Portal'})`;

    // Card 1: Top Attendance Subject (Theory)
    $("aiMetricIcon1").textContent = "🌟";
    $("aiMetricLabel1").textContent = "Top Subject (Theory)";
    $("aiMetricVal1").textContent = analytics.topTheoryAtt ? (analytics.topTheoryAtt.short || analytics.topTheoryAtt.name) : "--";
    $("aiMetricBadge1").textContent = analytics.topTheoryAtt ? `${analytics.topTheoryAtt.attPct}% Att` : "--";
    $("aiMetricBadge1").className = "metric-badge good";

    // Card 2: Low Attendance Subject (Theory)
    $("aiMetricIcon2").textContent = "⚠️";
    $("aiMetricLabel2").textContent = "Low Subject (Theory)";
    $("aiMetricVal2").textContent = analytics.lowTheoryAtt ? (analytics.lowTheoryAtt.short || analytics.lowTheoryAtt.name) : "--";
    $("aiMetricBadge2").textContent = analytics.lowTheoryAtt ? `${analytics.lowTheoryAtt.attPct}% Att` : "--";
    $("aiMetricBadge2").className = analytics.lowTheoryAtt && analytics.lowTheoryAtt.attPct < 75 ? "metric-badge danger" : "metric-badge warn";

    // Card 3: Top Attendance Lab (Practical)
    $("aiMetricIcon3").textContent = "🧪";
    $("aiMetricLabel3").textContent = "Top Lab (Practical)";
    $("aiMetricVal3").textContent = analytics.topLabAtt ? (analytics.topLabAtt.short || analytics.topLabAtt.name) : "No Labs";
    $("aiMetricBadge3").textContent = analytics.topLabAtt ? `${analytics.topLabAtt.attPct}% Att` : "--";
    $("aiMetricBadge3").className = "metric-badge good";

    // Card 4: Low Attendance Lab (Practical)
    $("aiMetricIcon4").textContent = "🔬";
    $("aiMetricLabel4").textContent = "Low Lab (Practical)";
    $("aiMetricVal4").textContent = analytics.lowLabAtt ? (analytics.lowLabAtt.short || analytics.lowLabAtt.name) : "No Labs";
    $("aiMetricBadge4").textContent = analytics.lowLabAtt ? `${analytics.lowLabAtt.attPct}% Att` : "--";
    $("aiMetricBadge4").className = analytics.lowLabAtt && analytics.lowLabAtt.attPct < 75 ? "metric-badge danger" : "metric-badge warn";

    // Card 5: Overall Attendance (%)
    $("aiMetricIcon5").textContent = "📊";
    $("aiMetricLabel5").textContent = "Overall Attendance (%)";
    $("aiMetricVal5").textContent = `${analytics.avgAttPct}% Overall`;
    $("aiMetricBadge5").textContent = analytics.avgAttPct >= 75 ? "Eligible" : "At-Risk (<75%)";
    $("aiMetricBadge5").className = analytics.avgAttPct >= 75 ? "metric-badge good" : "metric-badge danger";

    // Card 6: Subjects < 75%
    if (card6) card6.style.display = "flex";
    $("aiMetricIcon6").textContent = "🚨";
    $("aiMetricLabel6").textContent = "Subjects < 75%";
    $("aiMetricVal6").textContent = `${analytics.lowAttendanceSubjects.length} Subject(s)`;
    $("aiMetricBadge6").textContent = analytics.lowAttendanceSubjects.length === 0 ? "Compliant" : "Low Att Warning";
    $("aiMetricBadge6").className = analytics.lowAttendanceSubjects.length === 0 ? "metric-badge good" : "metric-badge danger";

    // Chart titles
    if ($("aiBarChartTitle")) $("aiBarChartTitle").textContent = "📊 Theory & Lab Attendance Comparison (Bar Graph)";
    if ($("aiBarChartChip")) $("aiBarChartChip").textContent = "Attendance %";
    if ($("aiPieChartTitle")) $("aiPieChartTitle").textContent = "🥧 Attendance Status Ratio (Pie Chart)";
    if ($("aiPieChartChip")) $("aiPieChartChip").textContent = "Attendance Ratio";
  }

  $("aiInsightsContent").innerHTML = generateAiInsights(analytics, mode);

  setTimeout(() => {
    renderAiCharts(analytics, mode);
  }, 50);

  modal.classList.remove("hidden");
}

function closeAiAnalysisModal() {
  const modal = $("aiAnalysisModal");
  if (modal) modal.classList.add("hidden");
}

function bindAiAnalysisEvents() {
  const closeBtn = $("closeAiModalBtn");
  const closeFooterBtn = $("closeAiModalFooterBtn");
  const overlay = $("aiModalOverlay");
  const refreshBtn = $("refreshAiInsightsBtn");
  const topbarBtn = $("topbarAiBtn");

  if (closeBtn) closeBtn.onclick = closeAiAnalysisModal;
  if (closeFooterBtn) closeFooterBtn.onclick = closeAiAnalysisModal;
  if (overlay) overlay.onclick = closeAiAnalysisModal;

  if (topbarBtn) {
    topbarBtn.onclick = () => {
      if (currentUser && currentUser.role === "student") {
        openAiAnalysisModal(currentUser.username);
      }
    };
  }

  if (refreshBtn) {
    refreshBtn.onclick = () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = `<span>⏳ Analyzing...</span>`;
      setTimeout(() => {
        if (currentAiAnalysisUsername) {
          const analytics = calculateStudentAnalytics(currentAiAnalysisUsername);
          $("aiInsightsContent").innerHTML = generateAiInsights(analytics, currentAiAnalysisMode);
          renderAiCharts(analytics, currentAiAnalysisMode);
        }
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = `<span>🔄 Refresh AI Insights</span>`;
      }, 400);
    };
  }
}

function openPortal() {
  if (currentUser && currentUser.role === "faculty") {
    try { resetAttendanceFilters(); } catch (e) { console.warn("resetAttendanceFilters error:", e); }
  }
  if ($("loginPage")) $("loginPage").classList.add("hidden");
  if ($("app")) $("app").classList.remove("hidden");
  if (window.AnimatedBackground) {
    try { window.AnimatedBackground.ensure(); } catch (e) { console.warn("AnimatedBackground.ensure error:", e); }
  }
  if ($("userName")) $("userName").textContent = currentUser ? currentUser.name : "";
  if ($("userRole")) $("userRole").textContent = roleLabel(currentUser ? currentUser.role : "", currentUser ? currentUser.subject : "");
  try { updateUserAvatarUI(); } catch (e) { console.warn("updateUserAvatarUI error:", e); }

  try { bindAiAnalysisEvents(); } catch (e) { console.warn("bindAiAnalysisEvents error:", e); }
  try { bindSubjectEvents(); } catch (e) { console.warn("bindSubjectEvents error:", e); }
  try { bindDivisionEvents(); } catch (e) { console.warn("bindDivisionEvents error:", e); }


  buildNav();

  try { updateDesktopNotificationUI(); } catch (e) { console.warn("updateDesktopNotificationUI error:", e); }
  try { checkPromptDesktopNotifications(); } catch (e) { console.warn("checkPromptDesktopNotifications error:", e); }
  const initialRoute = getRouteFromHash();
  navigate(initialRoute, false);
}

function roleLabel(role, subject) {
  if (role === "admin") return "Administrator";
  if (role === "faculty") {
    const s = subjectById(subject);
    return `${s ? (s.short || s.name) : "BCA"} Faculty`;
  }
  return "Student";
}

function canDeleteNotice(notice, user) {
  if (!user || !notice) return false;
  if (notice.authorRole === "faculty") {
    return user.role === "faculty";
  }
  if (notice.authorRole === "admin") {
    return user.role === "admin";
  }
  if (user.role === "admin") return true;
  if (user.role === "faculty") return true;
  return false;
}

function isFacultyNotice(n) {
  if (!n) return false;
  return n.authorRole === "faculty" || (!n.authorRole && n.target === "student");
}

function getRelevantNoticesForUser(user) {
  if (!user || !ACADEMIC || !Array.isArray(ACADEMIC.notices)) return [];
  return ACADEMIC.notices.filter(n => {
    const target = n.target || "all";
    if (user.role === "admin") {
      return true;
    }
    if (user.role === "faculty") {
      return true;
    }
    if (user.role === "student") {
      return target === "student" || target === "all";
    }
    return true;
  });
}

function getUnreadNoticeCount() {
  if (!currentUser) return 0;
  const relevantNotices = getRelevantNoticesForUser(currentUser);
  const totalCount = relevantNotices.length;
  const key = `seenNoticeCount_${currentUser.username}`;
  const seenCount = parseInt(localStorage.getItem(key) || "0", 10);
  return Math.max(0, totalCount - seenCount);
}

function markNoticesAsSeen() {
  if (!currentUser) return;
  const relevantNotices = getRelevantNoticesForUser(currentUser);
  const totalCount = relevantNotices.length;
  const key = `seenNoticeCount_${currentUser.username}`;
  localStorage.setItem(key, totalCount.toString());
  updateNoticeBadges();
}

function updateNoticeBadges() {
  const unreadCount = getUnreadNoticeCount();
  const sidebarNoticeBtn = document.querySelector('.nav-item[data-page="notices"]');
  if (sidebarNoticeBtn) {
    let badge = sidebarNoticeBtn.querySelector(".nav-badge");
    if (unreadCount > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "nav-badge notice-badge";
        sidebarNoticeBtn.appendChild(badge);
      }
      badge.textContent = unreadCount;
    } else if (badge) {
      badge.remove();
    }
  }

  const topbarBadge = $("topbarNoticeBadge");
  if (topbarBadge) {
    topbarBadge.textContent = unreadCount;
    topbarBadge.classList.toggle("hidden", unreadCount === 0);
  }

  const topbarBtn = $("topbarNoticeBtn");
  if (topbarBtn) {
    topbarBtn.classList.remove("hidden");
  }
}

function getRelevantNotesForUser(user) {
  if (!user || !ACADEMIC || !Array.isArray(ACADEMIC.notes)) return [];
  if (user.role === "admin" || user.role === "faculty") {
    return ACADEMIC.notes;
  }
  if (user.role === "student") {
    const studentSubjects = getSubjectsForStudent(user).map(s => s.id);
    const studentDiv = user.division || "Div A";
    return ACADEMIC.notes.filter(n => {
      const matchSubject = !n.subject || studentSubjects.includes(n.subject) || n.subject === "general";
      const matchDiv = !n.division || n.division === "All Divisions" || n.division === studentDiv;
      return matchSubject && matchDiv;
    });
  }
  return [];
}

function getUnreadNotesCount() {
  if (!currentUser || currentUser.role !== "student") return 0;
  const relevantNotes = getRelevantNotesForUser(currentUser);
  const totalCount = relevantNotes.length;
  const key = `seenNotesCount_${currentUser.username}`;
  const seenCount = parseInt(localStorage.getItem(key) || "0", 10);
  return Math.max(0, totalCount - seenCount);
}

function markNotesAsSeen() {
  if (!currentUser || currentUser.role !== "student") return;
  const relevantNotes = getRelevantNotesForUser(currentUser);
  const totalCount = relevantNotes.length;
  const key = `seenNotesCount_${currentUser.username}`;
  localStorage.setItem(key, totalCount.toString());
  updateNotesBadges();
}

function updateNotesBadges() {
  const unreadCount = getUnreadNotesCount();
  const sidebarNotesBtn = document.querySelector('.nav-item[data-page="notes"]');
  if (sidebarNotesBtn) {
    let badge = sidebarNotesBtn.querySelector(".nav-badge");
    if (unreadCount > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "nav-badge notes-badge";
        sidebarNotesBtn.appendChild(badge);
      }
      badge.textContent = unreadCount;
    } else if (badge) {
      badge.remove();
    }
  }
}

// ============================================================================
// NATIVE LAPTOP DESKTOP PUSH NOTIFICATIONS ENGINE
// ============================================================================

function isDesktopNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

function getDesktopNotificationPermission() {
  if (!isDesktopNotificationSupported()) return "unsupported";
  return Notification.permission; // "default", "granted", "denied"
}

function updateDesktopNotificationUI() {
  const dot = $("desktopNotifDot");
  const btn = $("topbarDesktopNotifBtn");
  if (!btn) return;

  const perm = getDesktopNotificationPermission();
  if (dot) {
    dot.className = "desktop-notif-dot " + perm;
  }

  if (perm === "granted") {
    btn.title = "Desktop Notifications Active (Click to test)";
    btn.setAttribute("aria-label", "Desktop Notifications Active");
  } else if (perm === "denied") {
    btn.title = "Desktop Notifications Blocked (Click for help)";
    btn.setAttribute("aria-label", "Desktop Notifications Blocked");
  } else if (perm === "unsupported") {
    btn.title = "Desktop Notifications Not Supported by this Browser";
    btn.style.display = "none";
  } else {
    btn.title = "Click to Enable Native Laptop Desktop Notifications";
    btn.setAttribute("aria-label", "Enable Native Laptop Desktop Notifications");
  }
}

async function requestDesktopNotificationPermission(interactive = false) {
  if (!isDesktopNotificationSupported()) {
    if (interactive) alert("Your browser does not support native desktop notifications.");
    return false;
  }

  const currentPerm = Notification.permission;
  if (currentPerm === "granted") {
    if (interactive) {
      sendDesktopNotification({
        title: "CampusSphere • Desktop Alerts Active",
        body: "You will receive notifications for campus notices.",
        tag: "campussphere-test"
      });
    }
    updateDesktopNotificationUI();
    return true;
  }

  if (currentPerm === "denied") {
    if (interactive) {
      alert("Desktop notifications are currently blocked for this site.\n\nTo enable them:\n1. Click the site settings/tune icon in your browser's address bar.\n2. Set 'Notifications' to 'Allow'.\n3. Reload the page.");
    }
    updateDesktopNotificationUI();
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    updateDesktopNotificationUI();
    if (permission === "granted") {
      sendDesktopNotification({
        title: "CampusSphere • Alerts Enabled 🎉",
        body: "Native notifications are now enabled! You will be alerted whenever new messages or notices arrive.",
        tag: "campussphere-enabled"
      });
      return true;
    }
  } catch (err) {
    console.warn("Notification permission request error:", err);
  }
  return false;
}

function handleDesktopNotifButtonClick() {
  const perm = getDesktopNotificationPermission();
  if (perm === "default") {
    requestDesktopNotificationPermission(true);
  } else if (perm === "granted") {
    sendDesktopNotification({
      title: "CampusSphere • Laptop Alerts Working!",
      body: "Desktop alerts are active. You will be notified even when this window is minimized.",
      tag: "test-alert"
    });
  } else {
    requestDesktopNotificationPermission(true);
  }
}

function sendDesktopNotification({ title, body, icon, tag, onClick }) {
  if (!isDesktopNotificationSupported() || Notification.permission !== "granted") {
    return null;
  }

  try {
    const notif = new Notification(title || "CampusSphere Alert", {
      body: body || "",
      icon: icon || "/CampusSphere-logo.png?v=20260915_hq1",
      tag: tag || "campussphere-notification",
      badge: "/favicon.ico",
      renotify: true,
      silent: false
    });

    notif.onclick = function(event) {
      event.preventDefault();
      try {
        window.focus();
      } catch (e) {}
      if (typeof onClick === "function") {
        onClick();
      }
      notif.close();
    };

    return notif;
  } catch (err) {
    console.warn("sendDesktopNotification error:", err);
    return null;
  }
}

function handleIncomingNoticeBroadcast(notice) {
  if (!notice || !currentUser) return;

  if (Array.isArray(ACADEMIC.notices)) {
    const exists = ACADEMIC.notices.some(n => n.id === notice.id || (n.title === notice.title && n.date === notice.date));
    if (!exists) {
      ACADEMIC.notices.unshift(notice);
    }
  }

  updateNoticeBadges();

  if (currentPage === "notices") {
    render();
  }

  sendDesktopNotification({
    title: `📢 CampusSphere Notice: ${notice.title}`,
    body: `${notice.authorName ? notice.authorName + ": " : ""}${notice.text ? notice.text.slice(0, 100) : "New notice posted"}`,
    tag: `notice-${notice.id || notice.title}`,
    onClick: () => {
      navigate("notices");
    }
  });
}

function checkPromptDesktopNotifications() {
  if (!isDesktopNotificationSupported()) return;
  if (Notification.permission === "default") {
    if (sessionStorage.getItem("notifPromptShown")) return;
    sessionStorage.setItem("notifPromptShown", "1");

    setTimeout(() => {
      let toastContainer = $("notifToastContainer");
      if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "notifToastContainer";
        toastContainer.className = "notif-toast-container";
        document.body.appendChild(toastContainer);
      }

      const promptToast = document.createElement("div");
      promptToast.className = "notif-toast notif-permission-toast";
      promptToast.innerHTML = `
        <span style="font-size:24px; flex-shrink:0;">🖥️</span>
        <div class="notif-toast-body">
          <div class="notif-toast-header">
            <b>Enable Laptop Desktop Alerts?</b>
          </div>
          <p class="notif-toast-text" style="font-size:12px; margin-top:2px;">Get instant popups for campus notices even when minimized.</p>
          <div style="margin-top:6px; display:flex; gap:6px;">
            <button type="button" id="enableNotifPromptBtn" class="primary-btn" style="padding:4px 10px; font-size:11px; border-radius:8px;">Enable</button>
            <button type="button" class="notif-toast-close-btn secondary-btn" style="padding:4px 8px; font-size:11px; border-radius:8px;">Not Now</button>
          </div>
        </div>
        <button type="button" class="notif-toast-close" title="Dismiss">&times;</button>
      `;

      const enableBtn = promptToast.querySelector("#enableNotifPromptBtn");
      if (enableBtn) {
        enableBtn.onclick = (e) => {
          e.stopPropagation();
          promptToast.remove();
          requestDesktopNotificationPermission(true);
        };
      }

      promptToast.querySelectorAll(".notif-toast-close, .notif-toast-close-btn").forEach(b => {
        b.onclick = (e) => {
          e.stopPropagation();
          promptToast.remove();
        };
      });

      toastContainer.appendChild(promptToast);
    }, 1500);
  }
}

function buildNav() {
  const isStudentOrFaculty = currentUser && (currentUser.role === "student" || currentUser.role === "faculty");
  const items = isStudentOrFaculty
    ? [["dashboard", "🏠", "Dashboard"], ["profile", "👤", "Profile"], ["attendance", "📊", "Attendance"], ["marks", "📈", "Marks"], ["assignments", "📝", "Assignments"], ["notes", "📚", "Notes"], ["timetable", "🗓️", "Timetable"], ["notices", "📢", "Notices"]]
    : [["dashboard", "🏠", "Dashboard"], ["profile", "👤", "Admin Profile"], ["divisions", "🏫", "Divisions"], ["subjects", "📚", "Semester Subjects"], ["students", "👥", "Students"], ["faculty", "🧑‍🏫", "Faculty"], ["timetable", "🗓️", "Timetable"], ["notices", "📢", "Notices"]];

  const unreadNoticeCount = getUnreadNoticeCount();
  const unreadNotesCount = getUnreadNotesCount();

  $("sidebarNav").innerHTML = items.map(([id, icon, label]) => {
    let badgeMarkup = "";
    if (id === "notices" && unreadNoticeCount > 0) {
      badgeMarkup = `<span class="nav-badge notice-badge">${unreadNoticeCount}</span>`;
    } else if (id === "notes" && unreadNotesCount > 0) {
      badgeMarkup = `<span class="nav-badge notes-badge">${unreadNotesCount}</span>`;
    }
    return `<button class="nav-item" data-page="${id}"><span>${icon}</span><span>${label}</span>${badgeMarkup}</button>`;
  }).join("");

  document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => navigate(b.dataset.page)));

  const desktopNotifBtn = $("topbarDesktopNotifBtn");
  if (desktopNotifBtn) {
    desktopNotifBtn.onclick = () => handleDesktopNotifButtonClick();
  }
  updateDesktopNotificationUI();

  const topbarBtn = $("topbarNoticeBtn");
  if (topbarBtn) {
    topbarBtn.onclick = () => navigate("notices");
  }



  const topbarAiBtn = $("topbarAiBtn");
  if (topbarAiBtn) {
    topbarAiBtn.classList.toggle("hidden", !currentUser || currentUser.role !== "student");
  }

  const userChip = document.querySelector(".user-chip");
  if (userChip) {
    userChip.style.cursor = "pointer";
    userChip.title = "View Profile";
    userChip.onclick = () => navigate("profile");
  }

  const logoutBtn = $("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }

  const mobileToggle = $("sidebarMobileToggle");
  const sidebar = document.querySelector(".sidebar");
  const sidebarBackdrop = $("sidebarBackdrop");

  if (mobileToggle && !mobileToggle.dataset.bound) {
    mobileToggle.dataset.bound = "1";
    mobileToggle.onclick = () => {
      if (sidebar) sidebar.classList.toggle("open");
      if (sidebarBackdrop) sidebarBackdrop.classList.toggle("active");
    };
  }

  if (sidebarBackdrop && !sidebarBackdrop.dataset.bound) {
    sidebarBackdrop.dataset.bound = "1";
    sidebarBackdrop.onclick = () => {
      if (sidebar) sidebar.classList.remove("open");
      sidebarBackdrop.classList.remove("active");
    };
  }

  updateNoticeBadges();
  updateNotesBadges();
}

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "").trim().toLowerCase();
  if (hash === "chat") return "dashboard";
  if (hash && pages[hash]) return hash;
  return "dashboard";
}

function navigate(page, updateHash = true) {
  if (!pages[page]) page = "dashboard";
  currentPage = page;
  if (updateHash && window.location.hash.replace(/^#\/?/, "") !== page) {
    window.location.hash = page;
  }

  // Close mobile sidebar if open
  const sidebar = document.querySelector(".sidebar");
  const sidebarBackdrop = $("sidebarBackdrop");
  if (sidebar) sidebar.classList.remove("open");
  if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");

  // Self-healing check: guarantee sidebar buttons exist in all portals
  const sidebarNav = $("sidebarNav");
  if (sidebarNav && sidebarNav.children.length === 0 && currentUser) {
    buildNav();
  }

  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  const titles = {
    dashboard: "Dashboard", profile: (currentUser && currentUser.role === "admin") ? "Admin Profile & Credentials" : "My Profile", attendance: "Attendance", marks: "Marks",
    assignments: "Assignments", notes: "Subject Notes", timetable: "Timetable", notices: "Notices",
    students: "Students", faculty: "Faculty", subjects: "Semester-wise Subjects", divisions: "Class Divisions Management"
  };
  $("pageEyebrow").textContent = roleLabel(currentUser ? currentUser.role : "", currentUser ? currentUser.subject : "");
  $("pageTitle").textContent = titles[page] || "Dashboard";
  $("content").innerHTML = pages[page] ? pages[page]() : pages.dashboard();
  if (window.AnimatedBackground) {
    try { window.AnimatedBackground.ensure(); } catch (e) { console.warn("AnimatedBackground.ensure error:", e); }
  }
  updateFacultySubjectSwitcher();
  initPage(page);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("hashchange", () => {
  if (currentUser && $("app") && !$("app").classList.contains("hidden")) {
    const targetRoute = getRouteFromHash();
    if (targetRoute !== currentPage) {
      navigate(targetRoute, false);
    }
  }
});

function render() {
  if (currentUser && currentPage && pages[currentPage]) {
    const sidebarNav = $("sidebarNav");
    if (sidebarNav && sidebarNav.children.length === 0) {
      buildNav();
    }
    $("pageEyebrow").textContent = roleLabel(currentUser ? currentUser.role : "", currentUser ? currentUser.subject : "");
    $("content").innerHTML = pages[currentPage]();
    updateFacultySubjectSwitcher();
    initPage(currentPage);
  }
}

function initPage(page) {
  if (page === "dashboard" && currentUser && currentUser.role === "faculty") {
    initFacultyDashboardPage();
    hydrateUsersFromServer().then(() => {
      if (currentPage === "dashboard" && currentUser && currentUser.role === "faculty") {
        const content = $("content");
        if (content) {
          content.innerHTML = pages.dashboard();
          initFacultyDashboardPage();
        }
      }
    }).catch(e => console.warn("Background faculty dashboard hydration failed:", e));
  }
  if (page === "profile") initProfilePage();
  if (page === "attendance") initAttendancePage();
  if (page === "marks") initMarksPage();
  if (page === "assignments") initAssignmentsPage();
  if (page === "notes") initNotesPage();
  if (page === "notices") initNoticesPage();
  if (page === "timetable") initTimetablePage();
  if (page === "subjects") initAdminSubjectsPage();
  if (page === "divisions") initAdminDivisionsPage();
  if (page === "students") {
    initAdminUserManagement("student");
    hydrateUsersFromServer().then(() => {
      if (currentPage === "students") {
        const content = $("content");
        if (content) {
          content.innerHTML = pages.students();
          initAdminUserManagement("student");
        }
      }
    }).catch(e => console.warn("Background student list hydration failed:", e));
  }
  if (page === "faculty") {
    initAdminUserManagement("faculty");
    hydrateUsersFromServer().then(() => {
      if (currentPage === "faculty") {
        const content = $("content");
        if (content) {
          content.innerHTML = pages.faculty();
          initAdminUserManagement("faculty");
        }
      }
    }).catch(e => console.warn("Background faculty list hydration failed:", e));
  }
}

function initFacultyDashboardPage() {
  const btn = $("openFacultyEditProfileBtn");
  if (btn) {
    btn.onclick = () => {
      openFacultyEditProfileModal();
    };
  }
  document.querySelectorAll(".nav-action-btn").forEach(b => {
    b.addEventListener("click", () => {
      const target = b.dataset.navTarget;
      if (target) navigate(target);
    });
  });
}


function initProfilePage() {
  if (currentUser && currentUser.role === "admin") {
    initAdminProfilePage();
    return;
  }
  if (currentUser && currentUser.role === "student") {
    initStudentProfilePage();
    return;
  }
  if (currentUser && currentUser.role === "faculty") {
    initFacultyProfilePage();
    return;
  }
}

function initStudentProfilePage() {
  const form = $("studentProfileForm");
  const credentialsCard = $("studentCredentialsCard");
  const openBtn = $("openStudentCredentialsBtn");
  const closeBtn = $("closeStudentCredentialsBtn");
  const cancelBtn = $("studentCancelBtn");

  if (!form) return;

  bindCredentialsPhotoEvents();

  let feedbackTimer = null;
  const feedbackEl = $("studentProfileFeedback");
  const showFeedback = (msg, type = "success", autoHideMs = null) => {
    if (!feedbackEl) return;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackEl.textContent = msg;
    feedbackEl.className = `message ${type}`;
    feedbackEl.style.display = "block";
    feedbackEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

    if (autoHideMs) {
      feedbackTimer = setTimeout(() => {
        feedbackEl.style.display = "none";
        feedbackEl.textContent = "";
      }, autoHideMs);
    }
  };
  const hideFeedback = () => {
    if (feedbackTimer) clearTimeout(feedbackTimer);
    if (feedbackEl) feedbackEl.style.display = "none";
  };

  // Bind password eye toggles in Student Profile form
  document.querySelectorAll(".student-eye-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const targetInput = $(targetId);
      if (!targetInput) return;
      const visible = targetInput.type === "password";
      targetInput.type = visible ? "text" : "password";
      btn.classList.toggle("is-visible", visible);
      btn.innerHTML = visible ? eyeClosedSVG : eyeOpenSVG;
      btn.setAttribute("aria-label", visible ? "Hide password" : "Show password");
      btn.setAttribute("title", visible ? "Hide password" : "Show password");
    });
  });

  const studentBtn = $("openEditProfileBtn");
  if (studentBtn) {
    studentBtn.addEventListener("click", openEditProfileModal);
  }

  const resetStudentFormValues = () => {
    if ($("studentProfileName")) $("studentProfileName").value = currentUser.name || "";
    if ($("studentProfileUsername")) $("studentProfileUsername").value = currentUser.username || "";
    if ($("studentProfileEmail")) $("studentProfileEmail").value = currentUser.email || "";
    if ($("studentCurrentPassword")) $("studentCurrentPassword").value = "";
    if ($("studentNewPassword")) $("studentNewPassword").value = "";
    if ($("studentConfirmPassword")) $("studentConfirmPassword").value = "";
    setPendingProfilePic(currentUser.profilePic || "");
  };

  const openStudentCredentials = () => {
    if (credentialsCard) {
      setPendingProfilePic(currentUser.profilePic || "");
      credentialsCard.classList.remove("hidden");
      credentialsCard.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        if ($("studentProfileName")) $("studentProfileName").focus();
      }, 150);
    }
  };

  const closeStudentCredentials = () => {
    resetStudentFormValues();
    hideFeedback();
    if (credentialsCard) {
      credentialsCard.classList.add("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (openBtn) openBtn.addEventListener("click", openStudentCredentials);
  if (closeBtn) closeBtn.addEventListener("click", closeStudentCredentials);
  if (cancelBtn) cancelBtn.addEventListener("click", closeStudentCredentials);

  const statusEl = document.getElementById("profileStatusMessage");
  if (statusEl) {
    setTimeout(() => {
      statusEl.remove();
      clearProfileStatusMessage();
    }, 1500);
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    hideFeedback();

    const name = $("studentProfileName").value.trim();
    const username = $("studentProfileUsername").value.trim();
    const email = $("studentProfileEmail").value.trim().toLowerCase();
    const currentPassword = $("studentCurrentPassword") ? $("studentCurrentPassword").value : "";
    const newPassword = $("studentNewPassword") ? $("studentNewPassword").value : "";
    const confirmPassword = $("studentConfirmPassword") ? $("studentConfirmPassword").value : "";
    const submitBtn = $("studentSaveProfileBtn");

    if (!name) {
      showFeedback("Full Name is required.", "error");
      $("studentProfileName").focus();
      return;
    }

    if (!/^[A-Za-z0-9_.-]{4,30}$/.test(username)) {
      showFeedback("Username must be 4–30 letters, numbers, dot, dash or underscore.", "error");
      $("studentProfileUsername").focus();
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback("Please enter a valid email address.", "error");
      $("studentProfileEmail").focus();
      return;
    }

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        showFeedback("Please enter your current password to change password.", "error");
        if ($("studentCurrentPassword")) $("studentCurrentPassword").focus();
        return;
      }
      if (!newPassword) {
        showFeedback("Please enter your new password.", "error");
        if ($("studentNewPassword")) $("studentNewPassword").focus();
        return;
      }
      if (newPassword.length < 6) {
        showFeedback("New password must contain at least 6 characters.", "error");
        if ($("studentNewPassword")) $("studentNewPassword").focus();
        return;
      }
      if (newPassword !== confirmPassword) {
        showFeedback("New password and confirm password do not match.", "error");
        if ($("studentConfirmPassword")) $("studentConfirmPassword").focus();
        return;
      }
    }

    const oldUsername = currentUser.username;
    const isUsernameChanged = username.toLowerCase() !== oldUsername.toLowerCase();

    // Check duplicate username conflicts across all user roles
    if (isUsernameChanged) {
      const usernameConflict = (USERS.student || []).some(u => (u.id !== currentUser.id && u.username.toLowerCase() !== oldUsername.toLowerCase()) && u.username.toLowerCase() === username.toLowerCase()) ||
        (USERS.faculty || []).some(u => u.username.toLowerCase() === username.toLowerCase()) ||
        (USERS.admin || []).some(u => u.username.toLowerCase() === username.toLowerCase());

      if (usernameConflict) {
        showFeedback("That username is already taken by another account.", "error");
        $("studentProfileUsername").focus();
        return;
      }
    }

    // Check duplicate email conflicts
    if (email) {
      const emailConflict = (USERS.student || []).some(u => (u.id !== currentUser.id && u.username.toLowerCase() !== oldUsername.toLowerCase()) && (u.email || "").toLowerCase() === email) ||
        (USERS.faculty || []).some(u => (u.email || "").toLowerCase() === email) ||
        (USERS.admin || []).some(u => (u.email || "").toLowerCase() === email);

      if (emailConflict) {
        showFeedback("That email address is already in use by another account.", "error");
        $("studentProfileEmail").focus();
        return;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳ Saving Changes...</span>`;
    }

    try {
      const payload = {
        id: currentUser.id,
        name,
        newUsername: username,
        email,
        profilePic: pendingProfilePic
      };
      if (newPassword) {
        payload.password = newPassword;
        payload.currentPassword = currentPassword;
      }

      const updated = await updateUserOnServer("student", oldUsername, payload);

      if (isUsernameChanged) {
        renameStudentAcademicData(oldUsername, username);
      }

      // Update current user session state
      currentUser.id = updated?.id || currentUser.id;
      currentUser.name = updated?.name || name;
      currentUser.username = updated?.username || username;
      currentUser.email = updated?.email !== undefined ? updated.email : email;
      currentUser.profilePic = updated?.profilePic !== undefined ? updated.profilePic : pendingProfilePic;

      // Update USERS.student in local storage state
      if (!Array.isArray(USERS.student)) USERS.student = [];
      const studentIndex = USERS.student.findIndex(u => (u.id && currentUser.id && u.id === currentUser.id) || u.username.toLowerCase() === oldUsername.toLowerCase());
      if (studentIndex >= 0) {
        USERS.student[studentIndex] = {
          ...USERS.student[studentIndex],
          name: currentUser.name,
          username: currentUser.username,
          email: currentUser.email,
          profilePic: currentUser.profilePic
        };
      }

      saveUsers();
      saveAcademicData();
      sessionStorage.setItem("portalUser", JSON.stringify(currentUser));

      // Update topbar UI and profile avatar
      if ($("userName")) $("userName").textContent = currentUser.name;
      updateUserAvatarUI();
      document.querySelectorAll(".profile-picture-img, #credentialsPreviewImg").forEach(img => {
        img.src = getProfilePicUrl(currentUser);
      });

      // Clear password inputs
      if ($("studentCurrentPassword")) $("studentCurrentPassword").value = "";
      if ($("studentNewPassword")) $("studentNewPassword").value = "";
      if ($("studentConfirmPassword")) $("studentConfirmPassword").value = "";

      setProfileStatusMessage(
        `Profile, photo & username (@${currentUser.username}) updated successfully!`,
        "success"
      );
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showFeedback(err.message || "Failed to update profile.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>💾 Update Profile & Credentials</span>`;
      }
    }
  });
}

function initFacultyProfilePage() {
  const form = $("facultyProfileForm");
  const credentialsCard = $("facultyCredentialsCard");
  const openBtn = $("openFacultyCredentialsBtn");
  const closeBtn = $("closeFacultyCredentialsBtn");
  const cancelBtn = $("facultyCancelBtn");

  if (!form) return;

  bindCredentialsPhotoEvents();

  const statusEl = document.getElementById("profileStatusMessage");
  if (statusEl) {
    setTimeout(() => {
      statusEl.remove();
      clearProfileStatusMessage();
    }, 2500);
  }

  let feedbackTimer = null;
  const feedbackEl = $("facultyProfileFeedback");
  const showFeedback = (msg, type = "success", autoHideMs = null) => {
    if (!feedbackEl) return;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackEl.textContent = msg;
    feedbackEl.className = `message ${type}`;
    feedbackEl.style.display = "block";
    feedbackEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

    if (autoHideMs) {
      feedbackTimer = setTimeout(() => {
        feedbackEl.style.display = "none";
        feedbackEl.textContent = "";
      }, autoHideMs);
    }
  };
  const hideFeedback = () => {
    if (feedbackTimer) clearTimeout(feedbackTimer);
    if (feedbackEl) feedbackEl.style.display = "none";
  };

  // Bind password eye toggles in Faculty Profile form
  document.querySelectorAll(".faculty-eye-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const targetInput = $(targetId);
      if (!targetInput) return;
      const visible = targetInput.type === "password";
      targetInput.type = visible ? "text" : "password";
      btn.classList.toggle("is-visible", visible);
      btn.innerHTML = visible ? eyeClosedSVG : eyeOpenSVG;
      btn.setAttribute("aria-label", visible ? "Hide password" : "Show password");
      btn.setAttribute("title", visible ? "Hide password" : "Show password");
    });
  });

  const resetFacultyFormValues = () => {
    if ($("facultyProfileName")) $("facultyProfileName").value = currentUser.name || "";
    if ($("facultyProfileUsername")) $("facultyProfileUsername").value = currentUser.username || "";
    if ($("facultyProfileEmail")) $("facultyProfileEmail").value = currentUser.email || "";
    if ($("facultyProfileDepartment")) $("facultyProfileDepartment").value = currentUser.department || "Department of Computer Science & Applications";
    if ($("facultyProfileDivision")) {
      const currentDiv = currentUser.division || "Both Divisions";
      $("facultyProfileDivision").value = (currentDiv === "All Divisions") ? "Both Divisions" : currentDiv;
    }
    if ($("facultyAuthUsername")) $("facultyAuthUsername").value = "";
    if ($("facultyNewPassword")) $("facultyNewPassword").value = "";
    if ($("facultyConfirmPassword")) $("facultyConfirmPassword").value = "";
    setPendingProfilePic(currentUser.profilePic || "");
  };

  const openCredentialsSection = () => {
    if (credentialsCard) {
      resetFacultyFormValues();
      setPendingProfilePic(currentUser.profilePic || "");
      credentialsCard.classList.remove("hidden");
      credentialsCard.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        if ($("facultyProfileName")) $("facultyProfileName").focus();
      }, 150);
    }
  };

  const closeCredentialsSection = () => {
    resetFacultyFormValues();
    hideFeedback();
    if (credentialsCard) {
      credentialsCard.classList.add("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (openBtn) openBtn.addEventListener("click", openCredentialsSection);
  if (closeBtn) closeBtn.addEventListener("click", closeCredentialsSection);
  if (cancelBtn) cancelBtn.addEventListener("click", closeCredentialsSection);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    hideFeedback();

    const name = $("facultyProfileName").value.trim();
    const username = $("facultyProfileUsername").value.trim();
    const email = $("facultyProfileEmail").value.trim().toLowerCase();
    const department = $("facultyProfileDepartment") ? $("facultyProfileDepartment").value.trim() : "";
    const divisionSelect = $("facultyProfileDivision");
    const division = divisionSelect ? divisionSelect.value : (currentUser.division || "Both Divisions");
    const authUsername = $("facultyAuthUsername") ? $("facultyAuthUsername").value.trim() : "";
    const newPassword = $("facultyNewPassword") ? $("facultyNewPassword").value : "";
    const confirmPassword = $("facultyConfirmPassword") ? $("facultyConfirmPassword").value : "";
    const submitBtn = $("facultySaveProfileBtn");

    if (!name) {
      showFeedback("Full Name is required.", "error");
      $("facultyProfileName").focus();
      return;
    }

    if (!/^[A-Za-z0-9_.-]{4,30}$/.test(username)) {
      showFeedback("Username must be 4–30 letters, numbers, dot, dash or underscore.", "error");
      $("facultyProfileUsername").focus();
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback("Please enter a valid email address.", "error");
      $("facultyProfileEmail").focus();
      return;
    }

    if (newPassword || confirmPassword || authUsername) {
      if (!authUsername) {
        showFeedback("Please enter your Username to change password.", "error");
        if ($("facultyAuthUsername")) $("facultyAuthUsername").focus();
        return;
      }
      if (authUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
        showFeedback("Username does not match your current faculty account username.", "error");
        if ($("facultyAuthUsername")) $("facultyAuthUsername").focus();
        return;
      }
      if (!newPassword) {
        showFeedback("Please enter your new password.", "error");
        if ($("facultyNewPassword")) $("facultyNewPassword").focus();
        return;
      }
      if (newPassword.length < 6) {
        showFeedback("New password must contain at least 6 characters.", "error");
        if ($("facultyNewPassword")) $("facultyNewPassword").focus();
        return;
      }
      if (newPassword !== confirmPassword) {
        showFeedback("New password and confirm password do not match.", "error");
        if ($("facultyConfirmPassword")) $("facultyConfirmPassword").focus();
        return;
      }
    }

    const oldUsername = currentUser.username;
    const isUsernameChanged = username.toLowerCase() !== oldUsername.toLowerCase();

    // Check duplicate username conflicts across all user roles
    if (isUsernameChanged) {
      const usernameConflict = (USERS.student || []).some(u => u.username.toLowerCase() === username.toLowerCase()) ||
        (USERS.faculty || []).some(u => (u.id !== currentUser.id && u.username.toLowerCase() !== oldUsername.toLowerCase()) && u.username.toLowerCase() === username.toLowerCase()) ||
        (USERS.admin || []).some(u => u.username.toLowerCase() === username.toLowerCase());

      if (usernameConflict) {
        showFeedback("That username is already taken by another account.", "error");
        $("facultyProfileUsername").focus();
        return;
      }
    }

    // Check duplicate email conflicts
    if (email) {
      const emailConflict = (USERS.student || []).some(u => (u.email || "").toLowerCase() === email) ||
        (USERS.faculty || []).some(u => (u.id !== currentUser.id && u.username.toLowerCase() !== oldUsername.toLowerCase()) && (u.email || "").toLowerCase() === email) ||
        (USERS.admin || []).some(u => (u.email || "").toLowerCase() === email);

      if (emailConflict) {
        showFeedback("That email address is already in use by another account.", "error");
        $("facultyProfileEmail").focus();
        return;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳ Saving Changes...</span>`;
    }

    try {
      const payload = {
        id: currentUser.id,
        name,
        newUsername: username,
        email,
        department,
        division,
        profilePic: pendingProfilePic
      };
      if (newPassword) {
        payload.password = newPassword;
      }

      const updated = await updateUserOnServer("faculty", oldUsername, payload);

      // Update current user session state
      currentUser.id = updated?.id || currentUser.id;
      currentUser.name = updated?.name || name;
      currentUser.username = updated?.username || username;
      currentUser.email = updated?.email !== undefined ? updated.email : email;
      if (updated?.department !== undefined) currentUser.department = updated.department;
      currentUser.division = updated?.division !== undefined ? updated.division : division;
      currentUser.profilePic = updated?.profilePic !== undefined ? updated.profilePic : pendingProfilePic;

      // Update USERS.faculty in local storage state
      if (!Array.isArray(USERS.faculty)) USERS.faculty = [];
      const facultyIndex = USERS.faculty.findIndex(u => (u.id && currentUser.id && u.id === currentUser.id) || u.username.toLowerCase() === oldUsername.toLowerCase());
      if (facultyIndex >= 0) {
        USERS.faculty[facultyIndex] = {
          ...USERS.faculty[facultyIndex],
          name: currentUser.name,
          username: currentUser.username,
          email: currentUser.email,
          department: currentUser.department,
          division: currentUser.division,
          profilePic: currentUser.profilePic
        };
      }

      saveUsers();
      sessionStorage.setItem("portalUser", JSON.stringify(currentUser));

      // Update topbar UI and profile avatar
      if ($("userName")) $("userName").textContent = currentUser.name;
      updateUserAvatarUI();
      document.querySelectorAll(".profile-picture-img, #credentialsPreviewImg").forEach(img => {
        img.src = getProfilePicUrl(currentUser);
      });

      // Clear password inputs
      if ($("facultyAuthUsername")) $("facultyAuthUsername").value = "";
      if ($("facultyNewPassword")) $("facultyNewPassword").value = "";
      if ($("facultyConfirmPassword")) $("facultyConfirmPassword").value = "";

      setProfileStatusMessage(
        `Faculty profile, photo & username (@${currentUser.username}) updated successfully!`,
        "success"
      );
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showFeedback(err.message || "Failed to update faculty profile.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>💾 Update Profile & Credentials</span>`;
      }
    }
  });
}

function initAdminProfilePage() {
  const form = $("adminProfileForm");
  const credentialsCard = $("adminCredentialsCard");
  const openBtn = $("openAdminCredentialsBtn");
  const closeBtn = $("closeAdminCredentialsBtn");
  const cancelBtn = $("adminCancelBtn");

  if (!form) return;

  bindCredentialsPhotoEvents();

  const statusEl = document.getElementById("profileStatusMessage");
  if (statusEl) {
    setTimeout(() => {
      statusEl.remove();
      clearProfileStatusMessage();
    }, 2500);
  }

  let feedbackTimer = null;
  const feedbackEl = $("adminProfileFeedback");
  const showFeedback = (msg, type = "success", autoHideMs = null) => {
    if (!feedbackEl) return;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackEl.textContent = msg;
    feedbackEl.className = `message ${type}`;
    feedbackEl.style.display = "block";
    feedbackEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

    if (autoHideMs) {
      feedbackTimer = setTimeout(() => {
        feedbackEl.style.display = "none";
        feedbackEl.textContent = "";
      }, autoHideMs);
    }
  };
  const hideFeedback = () => {
    if (feedbackTimer) clearTimeout(feedbackTimer);
    if (feedbackEl) feedbackEl.style.display = "none";
  };

  // Bind password eye toggles in Admin Profile form
  document.querySelectorAll(".admin-eye-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const targetInput = $(targetId);
      if (!targetInput) return;
      const visible = targetInput.type === "password";
      targetInput.type = visible ? "text" : "password";
      btn.classList.toggle("is-visible", visible);
      btn.innerHTML = visible ? eyeClosedSVG : eyeOpenSVG;
      btn.setAttribute("aria-label", visible ? "Hide password" : "Show password");
      btn.setAttribute("title", visible ? "Hide password" : "Show password");
    });
  });

  const resetAdminFormValues = () => {
    if ($("adminProfileName")) $("adminProfileName").value = currentUser.name || "";
    if ($("adminProfileUsername")) $("adminProfileUsername").value = currentUser.username || "";
    if ($("adminProfileEmail")) $("adminProfileEmail").value = currentUser.email || "";
    if ($("adminAuthUsername")) $("adminAuthUsername").value = "";
    if ($("adminNewPassword")) $("adminNewPassword").value = "";
    if ($("adminConfirmPassword")) $("adminConfirmPassword").value = "";
    setPendingProfilePic(currentUser.profilePic || "");
  };

  const openAdminCredentials = () => {
    if (credentialsCard) {
      setPendingProfilePic(currentUser.profilePic || "");
      credentialsCard.classList.remove("hidden");
      credentialsCard.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        if ($("adminProfileName")) $("adminProfileName").focus();
      }, 150);
    }
  };

  const closeAdminCredentials = () => {
    resetAdminFormValues();
    hideFeedback();
    if (credentialsCard) {
      credentialsCard.classList.add("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (openBtn) openBtn.addEventListener("click", openAdminCredentials);
  if (closeBtn) closeBtn.addEventListener("click", closeAdminCredentials);
  if (cancelBtn) cancelBtn.addEventListener("click", closeAdminCredentials);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    hideFeedback();

    const name = $("adminProfileName").value.trim();
    const username = $("adminProfileUsername").value.trim();
    const email = $("adminProfileEmail").value.trim().toLowerCase();
    const authUsername = $("adminAuthUsername") ? $("adminAuthUsername").value.trim() : "";
    const newPassword = $("adminNewPassword") ? $("adminNewPassword").value : "";
    const confirmPassword = $("adminConfirmPassword") ? $("adminConfirmPassword").value : "";
    const submitBtn = $("adminSaveProfileBtn");

    if (!name) {
      showFeedback("Full Name is required.", "error");
      $("adminProfileName").focus();
      return;
    }

    if (!/^[A-Za-z0-9_.-]{4,30}$/.test(username)) {
      showFeedback("Username must be 4–30 letters, numbers, dot, dash or underscore.", "error");
      $("adminProfileUsername").focus();
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback("Please enter a valid email address.", "error");
      $("adminProfileEmail").focus();
      return;
    }

    if (newPassword || confirmPassword || authUsername) {
      if (!authUsername) {
        showFeedback("Please enter your Username to change password.", "error");
        if ($("adminAuthUsername")) $("adminAuthUsername").focus();
        return;
      }
      if (authUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
        showFeedback("Username does not match your current admin account username.", "error");
        if ($("adminAuthUsername")) $("adminAuthUsername").focus();
        return;
      }
      if (!newPassword) {
        showFeedback("Please enter your new password.", "error");
        if ($("adminNewPassword")) $("adminNewPassword").focus();
        return;
      }
      if (newPassword.length < 6) {
        showFeedback("New password must contain at least 6 characters.", "error");
        if ($("adminNewPassword")) $("adminNewPassword").focus();
        return;
      }
      if (newPassword !== confirmPassword) {
        showFeedback("New password and confirm password do not match.", "error");
        if ($("adminConfirmPassword")) $("adminConfirmPassword").focus();
        return;
      }
    }

    const oldUsername = currentUser.username;
    const isUsernameChanged = username.toLowerCase() !== oldUsername.toLowerCase();

    // Check duplicate username conflicts across all user roles
    if (isUsernameChanged) {
      const usernameConflict = (USERS.student || []).some(u => u.username.toLowerCase() === username.toLowerCase()) ||
        (USERS.faculty || []).some(u => u.username.toLowerCase() === username.toLowerCase()) ||
        (USERS.admin || []).some(u => (u.id !== currentUser.id && u.username.toLowerCase() !== oldUsername.toLowerCase()) && u.username.toLowerCase() === username.toLowerCase());

      if (usernameConflict) {
        showFeedback("That username is already taken by another account.", "error");
        $("adminProfileUsername").focus();
        return;
      }
    }

    // Check duplicate email conflicts
    if (email) {
      const emailConflict = (USERS.student || []).some(u => (u.email || "").toLowerCase() === email) ||
        (USERS.faculty || []).some(u => (u.email || "").toLowerCase() === email) ||
        (USERS.admin || []).some(u => (u.id !== currentUser.id && u.username.toLowerCase() !== oldUsername.toLowerCase()) && (u.email || "").toLowerCase() === email);

      if (emailConflict) {
        showFeedback("That email address is already in use by another account.", "error");
        $("adminProfileEmail").focus();
        return;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳ Saving Changes...</span>`;
    }

    try {
      const payload = {
        id: currentUser.id,
        name,
        newUsername: username,
        email,
        profilePic: pendingProfilePic
      };
      if (newPassword) {
        payload.password = newPassword;
      }

      const updated = await updateUserOnServer("admin", oldUsername, payload);

      // Update current user session state
      currentUser.id = updated?.id || currentUser.id;
      currentUser.name = updated?.name || name;
      currentUser.username = updated?.username || username;
      currentUser.email = updated?.email !== undefined ? updated.email : email;
      currentUser.profilePic = updated?.profilePic !== undefined ? updated.profilePic : pendingProfilePic;

      // Update USERS.admin in local storage state
      if (!Array.isArray(USERS.admin)) USERS.admin = [];
      const adminIndex = USERS.admin.findIndex(u => (u.id && currentUser.id && u.id === currentUser.id) || u.username.toLowerCase() === oldUsername.toLowerCase());
      if (adminIndex >= 0) {
        USERS.admin[adminIndex] = {
          ...USERS.admin[adminIndex],
          name: currentUser.name,
          username: currentUser.username,
          email: currentUser.email,
          profilePic: currentUser.profilePic
        };
      } else {
        USERS.admin.push({
          id: currentUser.id || "admin-001",
          role: "admin",
          name: currentUser.name,
          username: currentUser.username,
          email: currentUser.email,
          profilePic: currentUser.profilePic
        });
      }

      saveUsers();
      sessionStorage.setItem("portalUser", JSON.stringify(currentUser));

      // Update topbar UI and profile avatar
      if ($("userName")) $("userName").textContent = currentUser.name;
      updateUserAvatarUI();
      document.querySelectorAll(".profile-picture-img, #credentialsPreviewImg").forEach(img => {
        img.src = getProfilePicUrl(currentUser);
      });

      // Clear password inputs
      if ($("adminAuthUsername")) $("adminAuthUsername").value = "";
      if ($("adminNewPassword")) $("adminNewPassword").value = "";
      if ($("adminConfirmPassword")) $("adminConfirmPassword").value = "";

      setProfileStatusMessage(
        `Admin profile, photo & username (@${currentUser.username}) updated successfully!`,
        "success"
      );
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showFeedback(err.message || "Failed to update admin profile.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>💾 Update Profile & Credentials</span>`;
      }
    }
  });
}

function getProfileStatusMessage() {
  try {
    const raw = sessionStorage.getItem("profileStatusMessage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    sessionStorage.removeItem("profileStatusMessage");
    return parsed;
  } catch {
    sessionStorage.removeItem("profileStatusMessage");
    return null;
  }
}

function setProfileStatusMessage(message, type = "success") {
  sessionStorage.setItem("profileStatusMessage", JSON.stringify({ message, type }));
}

function clearProfileStatusMessage() {
  sessionStorage.removeItem("profileStatusMessage");
}

function openEditProfileModal() {
  if (!currentUser || currentUser.role !== "student") return;
  clearProfileStatusMessage();

  const userYr = currentUser.courseYear || "";
  $("editProfileCourseYear").value = userYr;

  if ($("editProfileDivision")) {
    $("editProfileDivision").innerHTML = `<option value="">Select Division</option>` + renderDivisionSelectOptions(currentUser.division || "", false, "All Divisions", userYr);
    $("editProfileDivision").value = currentUser.division || "";
  }

  updateEditProfileSemesterOptions($("editProfileCourseYear").value, currentUser.semester || "");

  if ($("editProfileCourse")) $("editProfileCourse").value = currentUser.course || "Bachelor of Computer Applications (BCA)";
  $("editProfileLanguage").value = currentUser.languageChoice || "";
  $("editProfileMathChoice").value = currentUser.mathChoice || "";

  $("editProfileMessage").textContent = "";
  $("editProfileMessage").className = "message";
  editProfileModal.querySelectorAll(".signup-modal").forEach(m => m.classList.remove("hidden"));
  editProfileModal.classList.remove("hidden");
  setTimeout(() => $("editProfileDivision").focus(), 50);
}

function closeEditProfileModal() {
  editProfileModal.classList.add("hidden");
}

function bindEditProfileEvents() {
  $("closeEditProfile").addEventListener("click", closeEditProfileModal);
  editProfileModal.addEventListener("click", e => { if (e.target === editProfileModal) closeEditProfileModal(); });

  const yearSelect = $("editProfileCourseYear");
  if (yearSelect) {
    yearSelect.addEventListener("change", e => {
      const yr = e.target.value;
      updateEditProfileSemesterOptions(yr, "");
      if ($("editProfileDivision")) {
        const curDiv = $("editProfileDivision").value;
        const available = getAvailableDivisions(yr);
        $("editProfileDivision").innerHTML = `<option value="">Select Division</option>` + renderDivisionSelectOptions(curDiv, false, "All Divisions", yr);
        if (available.includes(curDiv)) {
          $("editProfileDivision").value = curDiv;
        }
      }
    });
  }

  const semSelect = $("editProfileSemester");
  if (semSelect) {
    semSelect.addEventListener("change", e => {
      const is1st = e.target.value === "1st Semester";
      if ($("editProfileMathWrap")) {
        $("editProfileMathWrap").style.display = is1st ? "block" : "none";
      }
    });
  }

  $("editProfileForm").addEventListener("submit", async e => {
    e.preventDefault();
    const name = currentUser.name || "Student";
    const username = currentUser.username;
    const course = currentUser.course || "Bachelor of Computer Applications (BCA)";
    const email = currentUser.email || "";
    const division = $("editProfileDivision").value.trim();
    const semester = $("editProfileSemester").value.trim();
    const courseYear = $("editProfileCourseYear").value.trim();
    const languageChoice = $("editProfileLanguage").value || "";
    const mathChoice = $("editProfileMathChoice").value || "Mathematics";

    if (!division || !semester || !courseYear || !languageChoice) {
      $("editProfileMessage").textContent = "Please select Division, Semester, Course Year, and Language Subject Choice.";
      $("editProfileMessage").className = "message error";
      return;
    }

    const submitButton = editProfileModal.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const updated = await updateUserOnServer("student", username, {
        name,
        newUsername: username,
        email,
        course,
        courseYear,
        semester,
        division,
        languageChoice,
        mathChoice,
        profilePic: currentUser.profilePic || ""
      });

      // Explicitly guarantee language & math choices & profilePic on updated user object
      updated.languageChoice = languageChoice;
      updated.mathChoice = mathChoice;
      updated.profilePic = currentUser.profilePic || "";

      const index = USERS.student.findIndex(u => u.username.toLowerCase() === username.toLowerCase() || u.id === currentUser.id);
      if (index >= 0) USERS.student[index] = updated;
      else USERS.student.push(updated);

      saveUsers();
      currentUser = sanitizeClientUser(updated);
      sessionStorage.setItem("portalUser", JSON.stringify(currentUser));

      $("userName").textContent = currentUser.name;
      updateUserAvatarUI();

      setProfileStatusMessage("Academic setup updated successfully!", "success");
      $("editProfileMessage").textContent = "Academic setup updated successfully!";
      $("editProfileMessage").className = "message success";

      setTimeout(() => {
        closeEditProfileModal();
        navigate("profile");
      }, 500);
    } catch (error) {
      console.error("Profile update error:", error);
      $("editProfileMessage").textContent = error.message || "Unable to update academic setup.";
      $("editProfileMessage").className = "message error";
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

bindEditProfileEvents();

let facultyEditSelectedSubjects = [];
let facultyEditSubjectDivisions = {};

function renderFacultyEditSubjectChips() {
  const container = $("facultyEditSelectedSubjectsWrap");
  if (!container) return;
  if (!facultyEditSelectedSubjects.length) {
    container.innerHTML = `<small style="color:#94a3b8; font-style:italic;">No subjects selected. Please add at least one subject below.</small>`;
    return;
  }
  container.innerHTML = facultyEditSelectedSubjects.map((id, idx) => {
    const s = subjectById(id) || { name: id, short: id };
    const sem = s.semester || getSemesterForSubject(id);
    const yr = getCourseYearForSemester(sem);
    const isPrimary = id === currentUser.subject || (idx === 0 && !facultyEditSelectedSubjects.includes(currentUser.subject));
    const currentDiv = facultyEditSubjectDivisions[id] || "Both Divisions";
    return `
      <div class="assigned-subject-config-item" style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:6px 10px; margin:3px 0; width:100%;">
        <div style="min-width:0; flex:1; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span style="font-weight:700; color:#1e40af; font-size:12.5px;">${s.short || s.name}</span>
          <small style="color:#3b82f6; font-size:11px; font-weight:600;">(${sem} • ${yr})</small>
          ${isPrimary ? `<span style="font-size:9.5px; background:#dbeafe; color:#1d4ed8; padding:1px 5px; border-radius:4px; font-weight:700;">Active</span>` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          <select onchange="updateFacultyEditSubjectDivision('${id}', this.value)" title="Assigned division for this subject" style="padding:3px 6px; font-size:11px; font-weight:700; border-radius:6px; border:1px solid #93c5fd; background:#ffffff; color:#1e293b; cursor:pointer;">
            ${renderFacultyDivisionSelectOptions(currentDiv, yr)}
          </select>
          ${facultyEditSelectedSubjects.length > 1 ? `<button type="button" onclick="removeFacultyEditSubject('${id}')" style="border:none; background:transparent; color:#ef4444; font-size:14px; cursor:pointer; padding:0 3px; line-height:1; font-weight:bold;" title="Remove">✕</button>` : ''}
        </div>
      </div>
    `;
  }).join("");
}

function updateFacultyEditSubjectDivision(id, val) {
  if (id) {
    facultyEditSubjectDivisions[id] = val || "Both Divisions";
    renderFacultyEditSubjectChips();
  }
}

let currentFacultyEditSubjectSearchQuery = "";

function renderFacultyEditDirectSubjectsList(query = currentFacultyEditSubjectSearchQuery) {
  currentFacultyEditSubjectSearchQuery = query;
  renderDirectSubjectSearchResults({
    containerId: "facultyEditDirectSubjectsList",
    query,
    selectedIds: facultyEditSelectedSubjects,
    onAddFnName: "addFacultyEditSubject"
  });
}

function addFacultyEditSubject(subId) {
  const id = subId || "";
  if (!id) return;
  if (!facultyEditSelectedSubjects.includes(id)) {
    facultyEditSelectedSubjects.push(id);
  }
  if (!facultyEditSubjectDivisions[id]) {
    facultyEditSubjectDivisions[id] = "Both Divisions";
  }
  renderFacultyEditSubjectChips();
  renderFacultyEditDirectSubjectsList();
  if ($("facultyEditMessage")) $("facultyEditMessage").textContent = "";
}

function removeFacultyEditSubject(id) {
  if (facultyEditSelectedSubjects.length <= 1) {
    if ($("facultyEditMessage")) {
      $("facultyEditMessage").textContent = "You must have at least one assigned subject.";
      $("facultyEditMessage").className = "message error";
    }
    return;
  }
  facultyEditSelectedSubjects = facultyEditSelectedSubjects.filter(item => item !== id);
  delete facultyEditSubjectDivisions[id];
  renderFacultyEditSubjectChips();
  renderFacultyEditDirectSubjectsList();
}

function populateFacultyEditSubjectSelect(query = "") {
  renderFacultyEditDirectSubjectsList(query);
}

function openFacultyEditProfileModal() {
  if (!currentUser || currentUser.role !== "faculty") return;
  $("facultyEditName").value = currentUser.name || "";
  $("facultyEditUsername").value = currentUser.username || "";
  $("facultyEditEmail").value = currentUser.email || `${currentUser.username}@smartportal.edu`;
  if ($("facultyEditDivision")) $("facultyEditDivision").value = currentUser.division || "All Divisions";

  facultyEditSelectedSubjects = Array.isArray(currentUser.subjects) && currentUser.subjects.length
    ? [...currentUser.subjects]
    : (currentUser.subject ? [currentUser.subject] : []);
  if (currentUser.subject && !facultyEditSelectedSubjects.includes(currentUser.subject)) {
    facultyEditSelectedSubjects.unshift(currentUser.subject);
  }
  facultyEditSubjectDivisions = { ...(currentUser.subjectDivisions || {}) };
  facultyEditSelectedSubjects.forEach(id => {
    if (!facultyEditSubjectDivisions[id]) {
      facultyEditSubjectDivisions[id] = getFacultySubjectDivision(currentUser, id);
    }
  });

  renderFacultyEditSubjectChips();
  currentFacultyEditSubjectSearchQuery = "";
  if ($("facultyEditSubjectSearch")) $("facultyEditSubjectSearch").value = "";
  renderFacultyEditDirectSubjectsList("");

  $("facultyEditMessage").textContent = "";
  $("facultyEditMessage").className = "message";
  const modal = $("facultyEditProfileModal");
  if (modal) {
    modal.querySelectorAll(".signup-modal").forEach(m => m.classList.remove("hidden"));
    modal.classList.remove("hidden");
  }
  setTimeout(() => $("facultyEditName").focus(), 50);
}

function closeFacultyEditProfileModal() {
  const modal = $("facultyEditProfileModal");
  if (modal) modal.classList.add("hidden");
  currentFacultyEditSubjectSearchQuery = "";
  if ($("facultyEditSubjectSearch")) $("facultyEditSubjectSearch").value = "";
  renderFacultyEditDirectSubjectsList("");
}

function bindFacultyEditProfileEvents() {
  const closeBtn = $("closeFacultyEditProfile");
  const modal = $("facultyEditProfileModal");
  if (closeBtn) closeBtn.addEventListener("click", closeFacultyEditProfileModal);
  if (modal) modal.addEventListener("click", e => { if (e.target === modal) closeFacultyEditProfileModal(); });

  const editSearchInput = $("facultyEditSubjectSearch");
  const editSearchBtn = $("btnSearchFacultyEditSubject");
  if (editSearchInput && editSearchBtn) {
    const runEditSearch = () => {
      renderFacultyEditDirectSubjectsList(editSearchInput.value);
    };
    editSearchBtn.addEventListener("click", runEditSearch);
    editSearchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        runEditSearch();
      }
    });
  }

  const form = $("facultyEditProfileForm");
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const name = $("facultyEditName").value.trim();
      const email = $("facultyEditEmail").value.trim().toLowerCase();
      const division = $("facultyEditDivision") ? $("facultyEditDivision").value : (currentUser.division || "All Divisions");
      const submitBtn = form.querySelector("button[type='submit']");

      if (!name || !email) {
        $("facultyEditMessage").textContent = "Please fill in all profile fields.";
        $("facultyEditMessage").className = "message error";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $("facultyEditMessage").textContent = "Please enter a valid email address.";
        $("facultyEditMessage").className = "message error";
        return;
      }

      if (!facultyEditSelectedSubjects.length) {
        $("facultyEditMessage").textContent = "Please add at least one assigned subject/class.";
        $("facultyEditMessage").className = "message error";
        return;
      }

      const primarySubject = facultyEditSelectedSubjects.includes(currentUser.subject)
        ? currentUser.subject
        : facultyEditSelectedSubjects[0];

      if (submitBtn) submitBtn.disabled = true;

      try {
        const updated = await updateUserOnServer("faculty", currentUser.username, {
          name,
          email,
          division,
          department: currentUser.department || "Department of Computer Science & Applications",
          subject: primarySubject,
          subjects: facultyEditSelectedSubjects,
          subjectDivisions: facultyEditSubjectDivisions
        });

        currentUser = sanitizeClientUser(updated);
        currentUser.subjects = facultyEditSelectedSubjects;
        currentUser.subject = primarySubject;
        currentUser.subjectDivisions = facultyEditSubjectDivisions;

        const targetFacultyIndex = (USERS.faculty || []).findIndex(f => f.username.toLowerCase() === currentUser.username.toLowerCase());
        if (targetFacultyIndex >= 0) {
          USERS.faculty[targetFacultyIndex] = currentUser;
        } else {
          USERS.faculty.push(currentUser);
        }

        saveUsers();
        sessionStorage.setItem("portalUser", JSON.stringify(currentUser));

        closeFacultyEditProfileModal();
        $("userName").textContent = currentUser.name;
        $("userAvatar").textContent = currentUser.name.charAt(0).toUpperCase();

        updateFacultySubjectSwitcher();
        const activeItem = document.querySelector(".nav-item.active");
        const activePage = activeItem ? activeItem.dataset.page : "dashboard";
        navigate(activePage);
      } catch (err) {
        $("facultyEditMessage").textContent = err.message || "Failed to update faculty profile.";
        $("facultyEditMessage").className = "message error";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

bindFacultyEditProfileEvents();

// ============================================================================
// ADMIN FACULTY SUBJECT & CLASS MANAGEMENT MODAL
// ============================================================================

const adminFacultyEditModal = document.createElement("div");
adminFacultyEditModal.id = "adminFacultyEditModal";
adminFacultyEditModal.className = "modal-backdrop hidden";
adminFacultyEditModal.innerHTML = `
  <div class="modal" style="max-width: 540px;">
    <button class="close-btn" id="closeAdminFacultyEditModal" type="button">&times;</button>
    <div class="modal-header">
      <span class="modal-icon">👨‍🏫</span>
      <div>
        <span class="modal-role" style="color: #6366f1;">ADMIN FACULTY MANAGER</span>
        <h2 style="margin: 0; font-size: 19px; color: #1e293b;">Manage Faculty Classes</h2>
      </div>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong id="adminEditFacultyName" style="font-size: 15px; color: #1e293b;">Faculty Name</strong>
        <span id="adminEditFacultyUsername" style="font-size: 12px; color: #64748b; margin-left: 6px;">@username</span>
      </div>
      <span class="badge" style="background: #e0e7ff; color: #3730a3; font-weight: 700;">Faculty Member</span>
    </div>
    <form id="adminFacultyEditForm" class="modal-form">
      <div style="margin-bottom: 14px;">
        <label for="adminEditFacultyDivision" style="display: block; font-weight: 700; color: #334155; font-size: 12.5px; margin-bottom: 6px;">Assigned Division</label>
        <div class="input-wrap">
          <select id="adminEditFacultyDivision" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 600;">
            <option value="All Divisions">Both Divisions (Div A & Div B)</option>
            <option value="Div A">Div A Only</option>
            <option value="Div B">Div B Only</option>
          </select>
        </div>
      </div>

      <div style="margin-bottom: 14px;">
        <label style="display: block; font-weight: 700; color: #334155; font-size: 12.5px; margin-bottom: 6px;">Assigned Subjects & Classes (All Semesters / Years)</label>
        <div id="adminEditFacultySubjectsChips" style="display: flex; flex-wrap: wrap; gap: 6px; min-height: 44px; padding: 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; margin-bottom: 10px;"></div>
        <div class="subject-search-wrap" style="margin-bottom:6px;">
          <input type="text" id="adminEditFacultySubjectSearch" placeholder="Filter subjects by name or code..." class="search-input">
          <button type="button" id="btnSearchAdminEditFacultySubject" class="search-btn"><span>Filter</span></button>
        </div>
        <div id="adminEditDirectSubjectsList" class="direct-subjects-list"></div>
      </div>

      <button class="primary-btn" type="submit" style="margin-top: 10px;"><span>Save Faculty Classes</span><span class="arrow">→</span></button>
      <p id="adminFacultyEditMessage" class="message"></p>
    </form>
  </div>
`;
document.body.appendChild(adminFacultyEditModal);

let adminEditingFacultyUsername = "";
let adminEditingFacultySubjects = [];
let adminEditingFacultySubjectDivisions = {};
let currentAdminEditSubjectSearchQuery = "";

function renderAdminEditDirectSubjectsList(query = currentAdminEditSubjectSearchQuery) {
  currentAdminEditSubjectSearchQuery = query;
  renderDirectSubjectSearchResults({
    containerId: "adminEditDirectSubjectsList",
    query,
    selectedIds: adminEditingFacultySubjects,
    onAddFnName: "addAdminEditFacultySubject"
  });
}

function renderAdminEditFacultySubjectChips() {
  const container = $("adminEditFacultySubjectsChips");
  if (!container) return;
  if (!adminEditingFacultySubjects.length) {
    container.innerHTML = `<small style="color:#94a3b8; font-style:italic;">No subjects assigned yet. Filter subjects below and click "+ Add".</small>`;
    return;
  }
  container.innerHTML = adminEditingFacultySubjects.map((id, idx) => {
    const s = subjectById(id) || { name: id, short: id };
    const sem = s.semester || getSemesterForSubject(id);
    const yr = getCourseYearForSemester(sem);
    const currentDiv = adminEditingFacultySubjectDivisions[id] || "Both Divisions";
    return `
      <div class="assigned-subject-config-item" style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:#eff6ff; border:1px solid #c7d2fe; border-radius:8px; padding:6px 10px; margin:3px 0; width:100%;">
        <div style="min-width:0; flex:1; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <strong style="color:#3730a3; font-size:12.5px;">${s.short || s.name}</strong>
          <small style="color:#4f46e5; font-size:11px; font-weight:600;">(${sem} • ${yr})</small>
          ${idx === 0 ? `<span style="font-size:9.5px; background:#dbeafe; color:#1d4ed8; padding:1px 5px; border-radius:4px; font-weight:700;">Primary</span>` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          <select onchange="updateAdminEditFacultySubjectDivision('${id}', this.value)" title="Assigned division for this subject" style="padding:3px 6px; font-size:11px; font-weight:700; border-radius:6px; border:1px solid #a5b4fc; background:#ffffff; color:#1e293b; cursor:pointer;">
            ${renderFacultyDivisionSelectOptions(currentDiv, yr)}
          </select>
          <button type="button" onclick="removeAdminEditFacultySubject('${id}')" style="border:none; background:transparent; color:#ef4444; font-size:14px; cursor:pointer; padding:0 3px; line-height:1; font-weight:bold;" title="Remove subject">✕</button>
        </div>
      </div>
    `;
  }).join("");
}

function updateAdminEditFacultySubjectDivision(id, val) {
  if (id) {
    adminEditingFacultySubjectDivisions[id] = val || "Both Divisions";
    renderAdminEditFacultySubjectChips();
  }
}

function addAdminEditFacultySubject(subId) {
  const id = subId || "";
  if (!id || adminEditingFacultySubjects.includes(id)) return;
  adminEditingFacultySubjects.push(id);
  if (!adminEditingFacultySubjectDivisions[id]) {
    adminEditingFacultySubjectDivisions[id] = "Both Divisions";
  }
  renderAdminEditFacultySubjectChips();
  renderAdminEditDirectSubjectsList();
}

function removeAdminEditFacultySubject(id) {
  adminEditingFacultySubjects = adminEditingFacultySubjects.filter(subId => subId !== id);
  delete adminEditingFacultySubjectDivisions[id];
  renderAdminEditFacultySubjectChips();
  renderAdminEditDirectSubjectsList();
}

function populateAdminEditFacultySubjectSelect(query = "") {
  renderAdminEditDirectSubjectsList(query);
}

function openAdminFacultyEditModal(username) {
  const f = (USERS.faculty || []).find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!f) return;
  adminEditingFacultyUsername = username;
  adminEditingFacultySubjects = Array.isArray(f.subjects) && f.subjects.length ? [...f.subjects] : (f.subject ? [f.subject] : []);
  adminEditingFacultySubjectDivisions = { ...(f.subjectDivisions || {}) };
  adminEditingFacultySubjects.forEach(id => {
    if (!adminEditingFacultySubjectDivisions[id]) {
      adminEditingFacultySubjectDivisions[id] = getFacultySubjectDivision(f, id);
    }
  });

  if ($("adminEditFacultyName")) $("adminEditFacultyName").textContent = f.name;
  if ($("adminEditFacultyUsername")) $("adminEditFacultyUsername").textContent = `@${f.username}`;
  if ($("adminEditFacultyDivision")) {
    const activeDiv = (!f.division || f.division === "All Divisions") ? "Both Divisions" : f.division;
    $("adminEditFacultyDivision").innerHTML = renderFacultyDivisionSelectOptions(activeDiv);
    $("adminEditFacultyDivision").value = activeDiv;
  }
  if ($("adminFacultyEditMessage")) {
    $("adminFacultyEditMessage").textContent = "";
    $("adminFacultyEditMessage").className = "message";
  }

  renderAdminEditFacultySubjectChips();
  currentAdminEditSubjectSearchQuery = "";
  if ($("adminEditFacultySubjectSearch")) $("adminEditFacultySubjectSearch").value = "";
  renderAdminEditDirectSubjectsList("");

  const modal = $("adminFacultyEditModal");
  if (modal) {
    modal.querySelectorAll(".signup-modal").forEach(m => m.classList.remove("hidden"));
    modal.classList.remove("hidden");
  }
}

function closeAdminFacultyEditModal() {
  const modal = $("adminFacultyEditModal");
  if (modal) modal.classList.add("hidden");
  currentAdminEditSubjectSearchQuery = "";
  if ($("adminEditFacultySubjectSearch")) $("adminEditFacultySubjectSearch").value = "";
  renderAdminEditDirectSubjectsList("");
}

function bindAdminFacultyEditEvents() {
  const closeBtn = $("closeAdminFacultyEditModal");
  const modal = $("adminFacultyEditModal");
  if (closeBtn) closeBtn.addEventListener("click", closeAdminFacultyEditModal);
  if (modal) modal.addEventListener("click", e => { if (e.target === modal) closeAdminFacultyEditModal(); });

  const adminSearchInput = $("adminEditFacultySubjectSearch");
  const adminSearchBtn = $("btnSearchAdminEditFacultySubject");
  if (adminSearchInput && adminSearchBtn) {
    const runAdminSearch = () => {
      renderAdminEditDirectSubjectsList(adminSearchInput.value);
    };
    adminSearchBtn.addEventListener("click", runAdminSearch);
    adminSearchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        runAdminSearch();
      }
    });
  }

  const form = $("adminFacultyEditForm");
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!adminEditingFacultyUsername) return;
      if (!adminEditingFacultySubjects.length) {
        $("adminFacultyEditMessage").textContent = "Please assign at least one subject/class.";
        $("adminFacultyEditMessage").className = "message error";
        return;
      }
      const division = $("adminEditFacultyDivision") ? $("adminEditFacultyDivision").value : "All Divisions";
      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      try {
        const primarySubject = adminEditingFacultySubjects[0];
        const updated = await updateUserOnServer("faculty", adminEditingFacultyUsername, {
          division,
          subject: primarySubject,
          subjects: adminEditingFacultySubjects,
          subjectDivisions: adminEditingFacultySubjectDivisions
        });

        const targetIdx = (USERS.faculty || []).findIndex(f => f.username.toLowerCase() === adminEditingFacultyUsername.toLowerCase());
        if (targetIdx >= 0) {
          USERS.faculty[targetIdx] = sanitizeClientUser(updated);
          USERS.faculty[targetIdx].subjects = adminEditingFacultySubjects;
          USERS.faculty[targetIdx].subject = primarySubject;
          USERS.faculty[targetIdx].division = division;
          USERS.faculty[targetIdx].subjectDivisions = adminEditingFacultySubjectDivisions;
        }

        saveUsers();
        closeAdminFacultyEditModal();
        setAdminNotice(`Updated classes for Prof. ${updated.name || adminEditingFacultyUsername} successfully.`, "success");
        render();
      } catch (err) {
        $("adminFacultyEditMessage").textContent = err.message || "Failed to update faculty classes.";
        $("adminFacultyEditMessage").className = "message error";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

bindAdminFacultyEditEvents();

function recordAverage(values, ids) {
  const numbers = ids.map(id => values[id]).filter(v => typeof v === "number");
  if (!numbers.length) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function syncAssignmentsForStudents() {
  if (!ACADEMIC || !Array.isArray(ACADEMIC.assignments) || !ACADEMIC.assignments.length) return;
  if (!Array.isArray(ACADEMIC.deletedAssignments)) ACADEMIC.deletedAssignments = [];

  const groupMap = new Map();
  const assignmentGroups = [];

  ACADEMIC.assignments.forEach(a => {
    const key = `${a.subject}___${a.title}___${a.due}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, a);
      assignmentGroups.push(a);
    }
  });

  let added = false;
  assignmentGroups.forEach(group => {
    let targetStudents = getStudentsForSubject(group.subject);
    const targetDiv = group.targetDivision || "All Divisions";
    if (targetDiv && targetDiv !== "All Divisions") {
      targetStudents = targetStudents.filter(s => (s.division || "Div A") === targetDiv);
    }
    targetStudents.forEach(st => {
      if (!st || !st.username) return;
      const deleteKey = `${String(st.username).toLowerCase()}___${group.subject}___${group.title}___${group.due}`;
      if (ACADEMIC.deletedAssignments.includes(deleteKey)) return;

      const exists = ACADEMIC.assignments.some(
        a => a.subject === group.subject &&
          a.title === group.title &&
          a.due === group.due &&
          String(a.student).toLowerCase() === String(st.username).toLowerCase()
      );
      if (!exists) {
        ACADEMIC.assignments.push({
          id: group.id || ("assign_" + Date.now()),
          student: st.username,
          subject: group.subject,
          targetDivision: targetDiv,
          title: group.title,
          description: group.description || "",
          fileName: group.fileName || "",
          fileData: group.fileData || "",
          due: group.due,
          status: "Pending",
          submittedDate: ""
        });
        added = true;
      }
    });
  });

  if (added) {
    saveAcademicData();
  }
}

function getStudentAssignments(username) {
  syncAssignmentsForStudents();
  if (!username) return [];
  const normUser = String(username).toLowerCase();
  const st = (USERS.student || []).find(u => String(u.username).toLowerCase() === normUser);
  const studentDiv = st ? (st.division || "Div A") : "Div A";

  return ACADEMIC.assignments.filter(a => {
    if (String(a.student).toLowerCase() !== normUser) return false;
    const aDiv = a.targetDivision || "All Divisions";
    if (aDiv !== "All Divisions" && aDiv !== studentDiv) return false;
    return true;
  });
}

function getSubjectAssignments(subject) {
  syncAssignmentsForStudents();
  if (!ACADEMIC || !Array.isArray(ACADEMIC.assignments)) return [];
  const normSub = String(subject || "").trim().toLowerCase();

  return ACADEMIC.assignments.filter(a => {
    if (normSub) {
      const aSub = String(a.subject || "").trim().toLowerCase();
      if (aSub !== normSub) return false;
    }
    return true;
  });
}

function getNoticeList() {
  if (!ACADEMIC || !Array.isArray(ACADEMIC.notices)) return [];
  if (!currentUser) {
    return ACADEMIC.notices.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }
  return getRelevantNoticesForUser(currentUser)
    .slice()
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function parseTimeStartMinutes(timeStr) {
  if (!timeStr) return 0;
  const startPart = timeStr.split("-")[0].trim();
  const parts = startPart.split(":");
  let hours = parseInt(parts[0], 10) || 0;
  let minutes = parseInt(parts[1], 10) || 0;

  if (hours >= 1 && hours <= 7) {
    hours += 12;
  }
  return hours * 60 + minutes;
}

function sortTimingsSerialwise(timesArray) {
  return timesArray.slice().sort((a, b) => parseTimeStartMinutes(a) - parseTimeStartMinutes(b));
}

function isFacultyOwnEntry(entry, facultyUser) {
  if (!facultyUser || facultyUser.role !== "faculty") return true;
  if (!facultyUser.subject) return true;

  const facDiv = facultyUser.division || "Both Divisions";
  const isBoth = facDiv === "Both Divisions" || facDiv === "All Divisions" || !facultyUser.division;

  // Check division compatibility if entry has division and faculty teaches only a single division
  if (!isBoth && entry.division) {
    const entryDiv = (entry.division || "").replace("Section ", "Div ").replace("Division ", "Div ");
    const targetDiv = facDiv.replace("Section ", "Div ").replace("Division ", "Div ");
    if (entryDiv && targetDiv && entryDiv !== targetDiv) return false;
  }

  if (entry.faculty && entry.faculty === facultyUser.username) return true;
  if (entry.subject && entry.subject === facultyUser.subject) return true;

  const fSub = subjectById(facultyUser.subject);
  if (fSub) {
    const text = (entry.subjectText || "").toLowerCase();
    const subName = (fSub.name || "").toLowerCase();
    const subShort = (fSub.short || "").toLowerCase();
    if ((subName && text.includes(subName)) || (subShort && text.includes(subShort))) return true;
  }

  return false;
}

function getTimetableEntries(division = activeTimetableDivision, semester = activeTimetableSemester) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const targetDiv = (division || "").replace("Section ", "Div ").replace("Division ", "Div ");
  const targetSem = semester || "";

  if (!targetDiv || !targetSem) return [];

  return ACADEMIC.timetable
    .filter(e => {
      const entryDiv = (e.division || "Div A").replace("Section ", "Div ").replace("Division ", "Div ");
      if (entryDiv !== targetDiv) return false;

      const entrySem = e.semester || (subjectById(e.subject) ? subjectById(e.subject).semester : "") || "";
      if (entrySem && entrySem !== targetSem) return false;

      return true;
    })
    .slice()
    .sort((a, b) => {
      const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return parseTimeStartMinutes(a.time) - parseTimeStartMinutes(b.time);
    });
}

function initAttendancePage() {
  // Student view interactive date toggles
  document.querySelectorAll(".student-date-row").forEach(row => {
    row.addEventListener("click", e => {
      const targetId = row.dataset.target;
      if (!targetId) return;

      const detailRow = document.getElementById(targetId);
      if (!detailRow) return;

      const toggleBtn = row.querySelector(".btn-date-toggle");
      const isExpanded = detailRow.style.display !== "none";

      if (isExpanded) {
        detailRow.style.display = "none";
        row.classList.remove("expanded");
        if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
      } else {
        detailRow.style.display = "table-row";
        row.classList.add("expanded");
        if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true");
      }
    });
  });

  if (currentUser.role !== "faculty") return;

  const divSelect = $("attDivisionSelect");
  if (divSelect) {
    divSelect.addEventListener("change", e => {
      attendanceFilterDivision = e.target.value;
      isAttendanceDetailsEntered = false;
      activeAttendanceMap = {};
      attendanceSaveSuccessMessage = "";
      navigate("attendance");
    });
  }

  const semSelect = $("attSemesterSelect");
  if (semSelect) {
    semSelect.addEventListener("change", e => {
      attendanceFilterSemester = e.target.value;
      isAttendanceDetailsEntered = false;
      activeAttendanceMap = {};
      attendanceSaveSuccessMessage = "";
      navigate("attendance");
    });
  }

  const yearSelect = $("attCourseYearSelect");
  if (yearSelect) {
    yearSelect.addEventListener("change", e => {
      attendanceFilterCourseYear = e.target.value;
      const validSems = getSemestersForCourseYear(attendanceFilterCourseYear);
      if (!validSems.includes(attendanceFilterSemester)) {
        attendanceFilterSemester = "";
      }
      isAttendanceDetailsEntered = false;
      activeAttendanceMap = {};
      attendanceSaveSuccessMessage = "";
      const sSelect = $("attSemesterSelect");
      if (sSelect) {
        sSelect.innerHTML = `<option value="">-- Select Semester --</option>` +
          validSems.map(s => `<option value="${s}" ${attendanceFilterSemester === s ? "selected" : ""}>${s}</option>`).join("");
      }
      navigate("attendance");
    });
  }

  const dateInput = $("attDateInput");
  if (dateInput) {
    dateInput.addEventListener("change", e => {
      let selectedDate = e.target.value;
      const todayISO = getTodayISODate();
      if (selectedDate && selectedDate > todayISO) {
        selectedDate = todayISO;
      }
      attendanceFilterDate = selectedDate || todayISO;
      isAttendanceDetailsEntered = false;
      activeAttendanceMap = {};
      attendanceSaveSuccessMessage = "";
      navigate("attendance");
    });
  }

  const submitBtn = $("submitAttDetailsBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const err = $("attFilterErrorMsg");
      const todayISO = getTodayISODate();
      if (attendanceFilterDate > todayISO) {
        attendanceFilterDate = todayISO;
      }
      if (!attendanceFilterDivision || !attendanceFilterDate) {
        if (err) {
          err.textContent = "⚠️ Please select Division and Particular Date to view attendance.";
          err.style.display = "block";
        }
        return;
      }
      if (err) err.style.display = "none";
      attendanceSaveSuccessMessage = "";
      isAttendanceReadOnly = false;
      isAttendanceDetailsEntered = true;
      navigate("attendance");
    });
  }

  const resetBtn = $("resetAttDetailsBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetAttendanceFilters();
      navigate("attendance");
    });
  }

  // Handle P & A button clicks
  document.querySelectorAll(".btn-pa").forEach(btn => {
    btn.addEventListener("click", () => {
      if (isAttendanceReadOnly) return;
      const username = btn.dataset.username;
      const status = btn.dataset.status; // "P" or "A"
      activeAttendanceMap[username] = status;

      const parent = btn.closest(".pa-toggle-group");
      if (parent) {
        parent.querySelectorAll(".btn-pa").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });

  // Save Daily Attendance
  const saveBtn = $("saveDailyAttendanceBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (isAttendanceReadOnly) return;

      const facultySem = getSemesterForSubject(currentUser.subject);
      const facultyYear = getCourseYearForSemester(facultySem);

      const activeSubDiv = getFacultySubjectDivision(currentUser, currentUser.subject);
      const allSubStudents = getStudentsForSubject(currentUser.subject, activeSubDiv);
      const currentStudents = allSubStudents.filter(s => {
        const studentDiv = s.division || "Div A";
        return !attendanceFilterDivision || studentDiv === attendanceFilterDivision;
      });

      const hasUnselected = currentStudents.some(s => !activeAttendanceMap[s.username] || (activeAttendanceMap[s.username] !== "P" && activeAttendanceMap[s.username] !== "A"));
      const msg = $("attSaveMessage");
      if (hasUnselected) {
        if (msg) {
          msg.textContent = "⚠️ Please select attendance status (P or A) for all students before saving.";
          msg.className = "message error";
        }
        return;
      }

      if (!ACADEMIC.dailyAttendance) ACADEMIC.dailyAttendance = [];
      const isoDate = attendanceFilterDate;
      const formattedDate = formatDateDDMMYY(isoDate);

      let existingIndex = ACADEMIC.dailyAttendance.findIndex(entry =>
        entry.subject === currentUser.subject &&
        entry.isoDate === isoDate &&
        entry.division === attendanceFilterDivision &&
        entry.semester === attendanceFilterSemester &&
        entry.courseYear === attendanceFilterCourseYear
      );

      const recordToSave = {
        id: existingIndex >= 0 ? ACADEMIC.dailyAttendance[existingIndex].id : "att-" + Date.now(),
        date: formattedDate,
        isoDate: isoDate,
        subject: currentUser.subject,
        division: attendanceFilterDivision,
        semester: attendanceFilterSemester,
        courseYear: attendanceFilterCourseYear,
        records: { ...activeAttendanceMap },
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        ACADEMIC.dailyAttendance[existingIndex] = recordToSave;
      } else {
        ACADEMIC.dailyAttendance.push(recordToSave);
      }

      updateStudentOverallAttendance(currentUser.subject);
      saveAcademicData();

      const successMsg = `✅ Daily attendance for ${formattedDate} saved successfully!`;
      resetAttendanceFilters();
      attendanceSaveSuccessMessage = successMsg;
      navigate("attendance");

      if (window.saveSuccessTimer) clearTimeout(window.saveSuccessTimer);
      window.saveSuccessTimer = setTimeout(() => {
        attendanceSaveSuccessMessage = "";
        const msgEl = document.getElementById("attFilterSuccessMsg");
        if (msgEl) {
          msgEl.style.display = "none";
        }
      }, 1500);
    });
  }

  // Load past log button (Read-Only Mode)
  document.querySelectorAll(".load-log-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      isAttendanceReadOnly = true;
      isAttendanceDetailsEntered = true;
      attendanceFilterDate = btn.dataset.date || getTodayISODate();
      attendanceFilterDivision = btn.dataset.div || "";
      attendanceFilterSemester = btn.dataset.sem || "";
      attendanceFilterCourseYear = btn.dataset.year || "";
      navigate("attendance");
      setTimeout(() => {
        const entryPanel = document.querySelector(".attendance-panel");
        if (entryPanel) entryPanel.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });
  });

  // Edit past log button (Editing Mode)
  document.querySelectorAll(".edit-log-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      isAttendanceReadOnly = false;
      isAttendanceDetailsEntered = true;
      if (btn.dataset.date) attendanceFilterDate = btn.dataset.date;
      if (btn.dataset.div) attendanceFilterDivision = btn.dataset.div;
      if (btn.dataset.sem) attendanceFilterSemester = btn.dataset.sem;
      if (btn.dataset.year) attendanceFilterCourseYear = btn.dataset.year;
      navigate("attendance");
      setTimeout(() => {
        const entryPanel = document.querySelector(".attendance-panel");
        if (entryPanel) entryPanel.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });
  });

  // Delete past log button (Instant 0ms DOM removal)
  document.querySelectorAll(".delete-log-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      if (e) e.preventDefault();
      const dDate = btn.dataset.date;
      const dDiv = btn.dataset.div;
      const dSem = btn.dataset.sem;
      const dYear = btn.dataset.year;

      if (confirm("Are you sure you want to delete this attendance record?")) {
        // INSTANT 0ms DOM REMOVAL
        const logItem = btn.closest(".history-item, tr, .card, .att-log-card");
        if (logItem) logItem.remove();

        ACADEMIC.dailyAttendance = (ACADEMIC.dailyAttendance || []).filter(entry =>
          !(entry.subject === currentUser.subject &&
            entry.isoDate === dDate &&
            entry.division === dDiv &&
            entry.semester === dSem &&
            entry.courseYear === dYear)
        );
        updateStudentOverallAttendance(currentUser.subject);
        saveAcademicData();
      }
    });
  });

  // Clear all past logs button (Instant 0ms DOM clear)
  const deleteAllBtn = $("deleteAllLogsBtn");
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener("click", (e) => {
      if (e) e.preventDefault();
      const subjectObj = subjectById(currentUser ? currentUser.subject : "") || { name: "this subject" };
      if (confirm(`Are you sure you want to delete ALL stored attendance records for ${subjectObj.name}?`)) {
        // INSTANT 0ms DOM CLEAR
        const historyWrap = document.querySelector(".attendance-history-list, .att-history-wrap");
        if (historyWrap) {
          historyWrap.innerHTML = `<div class="empty-state" style="padding:20px; text-align:center; color:#64748b;">🗑️ All stored attendance records cleared.</div>`;
        }

        ACADEMIC.dailyAttendance = (ACADEMIC.dailyAttendance || []).filter(entry => entry.subject !== currentUser.subject);
        updateStudentOverallAttendance(currentUser.subject);
        saveAcademicData();
      }
    });
  }
}

function initMarksPage() {
  if (currentUser.role !== "faculty") return;

  const configForm = $("maxMarksConfigForm");
  if (configForm) {
    configForm.addEventListener("submit", e => {
      e.preventDefault();
      const m1 = parseInt($("maxInternal1Select").value, 10) || 20;
      const m2 = parseInt($("maxInternal2Select").value, 10) || 20;
      if (!ACADEMIC.subjectMarksConfig) ACADEMIC.subjectMarksConfig = {};
      ACADEMIC.subjectMarksConfig[currentUser.subject] = { maxInternal1: m1, maxInternal2: m2 };
      saveAcademicData();
      navigate("marks");
    });
  }

  // Live total calculation when typing marks in table
  document.querySelectorAll(".marks-input-field").forEach(input => {
    input.addEventListener("input", () => {
      const username = input.dataset.username;
      if (!username) return;
      const row = document.querySelector(`tr[data-student-row="${username}"]`);
      if (!row) return;

      const i1Inp = row.querySelector(`input[data-field="internal1"]`);
      const i2Inp = row.querySelector(`input[data-field="internal2"]`);
      const assignInp = row.querySelector(`input[data-field="assignment"]`);

      const config = getSubjectMarksConfig(currentUser.subject);
      const maxI1 = config.maxInternal1 || 20;
      const maxI2 = config.maxInternal2 || 20;
      const maxTotal = maxI1 + maxI2 + 10;

      const i1 = i1Inp && i1Inp.value.trim() !== "" ? parseFloat(i1Inp.value) : NaN;
      const i2 = i2Inp && i2Inp.value.trim() !== "" ? parseFloat(i2Inp.value) : NaN;
      const assign = assignInp && assignInp.value.trim() !== "" ? parseFloat(assignInp.value) : NaN;

      const badge = document.getElementById(`total-badge-${username}`);
      if (badge) {
        if (!isNaN(i1) || !isNaN(i2) || !isNaN(assign)) {
          const tot = (isNaN(i1) ? 0 : i1) + (isNaN(i2) ? 0 : i2) + (isNaN(assign) ? 0 : assign);
          badge.innerHTML = `<strong>${tot}</strong> / ${maxTotal}`;
        } else {
          badge.textContent = "Not set";
        }
      }
    });
  });

  // Batch Form Submit
  const batchForm = $("marksBatchForm");
  if (batchForm) {
    batchForm.addEventListener("submit", event => {
      event.preventDefault();
      const config = getSubjectMarksConfig(currentUser.subject);
      const maxI1 = config.maxInternal1 || 20;
      const maxI2 = config.maxInternal2 || 20;

      const facultySem = getSemesterForSubject(currentUser.subject);
      const facultyYear = getCourseYearForSemester(facultySem);

      const filteredStudents = getStudentsForSubject(currentUser.subject, currentUser.division);

      let hasError = false;
      const msg = $("marksBatchMessage");

      filteredStudents.forEach(s => {
        if (hasError) return;
        const row = document.querySelector(`tr[data-student-row="${s.username}"]`);
        if (!row) return;

        const i1Inp = row.querySelector(`input[data-field="internal1"]`);
        const i2Inp = row.querySelector(`input[data-field="internal2"]`);
        const assignInp = row.querySelector(`input[data-field="assignment"]`);

        const i1Val = i1Inp ? i1Inp.value.trim() : "";
        const i2Val = i2Inp ? i2Inp.value.trim() : "";
        const assignVal = assignInp ? assignInp.value.trim() : "";

        const i1 = i1Val !== "" ? parseFloat(i1Val) : null;
        const i2 = i2Val !== "" ? parseFloat(i2Val) : null;
        const assign = assignVal !== "" ? parseFloat(assignVal) : null;

        if (i1 !== null && (isNaN(i1) || i1 < 0 || i1 > maxI1)) {
          if (msg) {
            msg.textContent = `⚠️ 1st Internal mark for ${s.name} must be between 0 and ${maxI1}.`;
            msg.className = "message error";
          }
          hasError = true;
          return;
        }

        if (i2 !== null && (isNaN(i2) || i2 < 0 || i2 > maxI2)) {
          if (msg) {
            msg.textContent = `⚠️ 2nd Internal mark for ${s.name} must be between 0 and ${maxI2}.`;
            msg.className = "message error";
          }
          hasError = true;
          return;
        }

        if (assign !== null && (isNaN(assign) || assign < 0 || assign > 10)) {
          if (msg) {
            msg.textContent = `⚠️ Assignment mark for ${s.name} must be between 0 and 10.`;
            msg.className = "message error";
          }
          hasError = true;
          return;
        }
      });

      if (hasError) return;

      filteredStudents.forEach(s => {
        const row = document.querySelector(`tr[data-student-row="${s.username}"]`);
        if (!row) return;

        const i1Inp = row.querySelector(`input[data-field="internal1"]`);
        const i2Inp = row.querySelector(`input[data-field="internal2"]`);
        const assignInp = row.querySelector(`input[data-field="assignment"]`);

        const i1Val = i1Inp ? i1Inp.value.trim() : "";
        const i2Val = i2Inp ? i2Inp.value.trim() : "";
        const assignVal = assignInp ? assignInp.value.trim() : "";

        const i1 = i1Val !== "" ? parseFloat(i1Val) : null;
        const i2 = i2Val !== "" ? parseFloat(i2Val) : null;
        const assign = assignVal !== "" ? parseFloat(assignVal) : null;

        const record = ensureStudentRecord(s.username);
        record.marks[currentUser.subject] = {
          internal1: i1,
          internal2: i2,
          assignment: assign,
          maxInternal1: maxI1,
          maxInternal2: maxI2,
          maxAssignment: 10
        };
      });

      saveAcademicData();

      if (msg) {
        msg.textContent = "✅ All student marks saved successfully!";
        msg.className = "message success";
        setTimeout(() => {
          if (msg) msg.textContent = "";
        }, 3000);
      }
    });
  }
}

function initAssignmentsPage() {
  if (currentUser.role === "faculty") {
    const form = $("assignmentForm");
    if (form) {
      form.addEventListener("submit", event => {
        event.preventDefault();
        const title = $("assignmentTitle").value.trim();
        const description = $("assignmentDescription") ? $("assignmentDescription").value.trim() : "";
        const due = $("assignmentDue").value;
        const status = "Pending";
        const fileInput = $("assignmentDocFile");

        if (!title || !due) {
          $("assignmentMessage").textContent = "Fill in title and submission date.";
          $("assignmentMessage").className = "message error";
          return;
        }
        const targetSub = (currentUser && currentUser.subject) ? currentUser.subject : ($("assignmentTargetSubject") ? $("assignmentTargetSubject").value : "");
        const targetDiv = (currentUser && currentUser.division && currentUser.division !== "Both Divisions" && currentUser.division !== "All Divisions") ? currentUser.division : "All Divisions";
        let targetStudents = getStudentsForSubject(targetSub, currentUser ? currentUser.division : null);
        if (targetDiv && targetDiv !== "All Divisions") {
          const divStudents = targetStudents.filter(s => (s.division || "Div A") === targetDiv);
          if (divStudents.length) targetStudents = divStudents;
        }

        if (!targetStudents.length) {
          targetStudents = (USERS.student || []).filter(s => !targetDiv || targetDiv === "All Divisions" || (s.division || "Div A") === targetDiv);
        }

        if (!targetStudents.length && (USERS.student || []).length) {
          targetStudents = USERS.student;
        }

        if (!targetStudents.length) {
          targetStudents = [{ username: "all", name: "All Students", division: targetDiv || "Div A" }];
        }

        const saveAndNavigate = (fileName, fileData) => {
          const assignId = "assign_" + Date.now();
          const todayISO = getTodayISODate();
          if (!Array.isArray(ACADEMIC.deletedAssignments)) ACADEMIC.deletedAssignments = [];

          targetStudents.forEach(s => {
            const deleteKey = `${String(s.username).toLowerCase()}___${targetSub}___${title}___${due}`;
            ACADEMIC.deletedAssignments = ACADEMIC.deletedAssignments.filter(k => k !== deleteKey);
            ACADEMIC.assignments.push({
              id: assignId,
              student: s.username,
              subject: targetSub,
              targetDivision: targetDiv,
              title,
              description,
              fileName: fileName || "",
              fileData: fileData || "",
              due,
              status,
              submittedDate: status === "Submitted" ? todayISO : ""
            });
          });
          saveAcademicData();
          navigate("assignments");
        };

        if (fileInput && fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];
          const reader = new FileReader();
          reader.onload = function (e) {
            saveAndNavigate(file.name, e.target.result);
          };
          reader.onerror = function () {
            saveAndNavigate(file.name, "");
          };
          reader.readAsDataURL(file);
        } else {
          saveAndNavigate("", "");
        }
      });
    }

    const searchInput = $("assignmentStudentSearch");
    const clearBtn = $("clearAssignmentSearch");
    if (searchInput) {
      const filterTableRows = () => {
        const query = searchInput.value.trim().toLowerCase();
        assignmentSearchQuery = searchInput.value;
        if (clearBtn) {
          clearBtn.style.display = query ? "inline-block" : "none";
        }
        const rows = document.querySelectorAll(".assignment-table-row");
        let visibleCount = 0;
        rows.forEach(row => {
          const name = (row.dataset.studentName || "").toLowerCase();
          const username = (row.dataset.studentUsername || "").toLowerCase();
          const title = (row.dataset.assignmentTitle || "").toLowerCase();
          const matches = !query || name.includes(query) || username.includes(query) || title.includes(query);
          row.style.display = matches ? "" : "none";
          if (matches) visibleCount++;
        });

        const countBadge = $("assignmentRecordCount");
        if (countBadge) {
          countBadge.textContent = `${visibleCount} Records`;
        }

        const noResultsRow = $("assignmentNoResultsRow");
        if (noResultsRow) {
          noResultsRow.style.display = (visibleCount === 0 && rows.length > 0) ? "" : "none";
        }
      };

      searchInput.addEventListener("input", filterTableRows);

      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          searchInput.value = "";
          assignmentSearchQuery = "";
          filterTableRows();
          searchInput.focus();
        });
      }
    }

    // Status, Delete, and Clear All actions are handled seamlessly with instant 0ms DOM updates by the global delegated click listener.

    const divFilter = $("assignmentDivisionFilter");
    if (divFilter) {
      divFilter.addEventListener("change", () => {
        assignmentFilterDivision = divFilter.value;
        navigate("assignments");
      });
    }

    const clearAllBtn = $("btnClearAllAssignments");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        const subjectObj = subjectById(currentUser ? currentUser.subject : "") || { name: (currentUser ? currentUser.subject : "") || "Subject" };
        const facSub = currentUser ? String(currentUser.subject || "").trim().toLowerCase() : "";

        let scopeText = `ALL assignment status records for ${subjectObj.name}`;
        if (assignmentFilterDivision && assignmentFilterDivision !== "All Divisions") {
          scopeText = `all assignment status records for ${assignmentFilterDivision} in ${subjectObj.name}`;
        }

        if (confirm(`Are you sure you want to clear ${scopeText}? This action cannot be undone.`)) {
          if (!Array.isArray(ACADEMIC.deletedAssignments)) ACADEMIC.deletedAssignments = [];

          ACADEMIC.assignments.forEach(a => {
            const matchSub = !facSub || String(a.subject || "").trim().toLowerCase() === facSub;
            if (matchSub) {
              const deleteKey = `${String(a.student).toLowerCase()}___${a.subject}___${a.title}___${a.due}`;
              if (!ACADEMIC.deletedAssignments.includes(deleteKey)) {
                ACADEMIC.deletedAssignments.push(deleteKey);
              }
            }
          });

          if (assignmentFilterDivision && assignmentFilterDivision !== "All Divisions") {
            ACADEMIC.assignments = ACADEMIC.assignments.filter(a => {
              const matchSub = !facSub || String(a.subject || "").trim().toLowerCase() === facSub;
              if (matchSub) {
                const st = (USERS.student || []).find(u => String(u.username).toLowerCase() === String(a.student).toLowerCase());
                const div = st ? (st.division || "Div A") : "Div A";
                return div !== assignmentFilterDivision;
              }
              return true;
            });
          } else {
            ACADEMIC.assignments = ACADEMIC.assignments.filter(a => {
              const matchSub = facSub && String(a.subject || "").trim().toLowerCase() === facSub;
              return !matchSub;
            });
          }

          saveAcademicData();
          navigate("assignments");
        }
      });
    }
  }
}

function initNotesPage() {
  markNotesAsSeen();
  if (currentUser.role === "faculty") {
    const uploadBtn = $("btnUploadNotes");
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        const titleEl = $("notesTitle");
        const subEl = $("notesTargetSubject");
        const divEl = $("notesDivision");
        const fileEl = $("notesFile");
        const msgEl = $("notesMessage");

        const title = titleEl ? titleEl.value.trim() : "";
        const targetSubject = (currentUser && currentUser.subject) ? currentUser.subject : (subEl ? subEl.value : "general");
        const division = (currentUser && currentUser.division && currentUser.division !== "Both Divisions" && currentUser.division !== "All Divisions") ? currentUser.division : "All Divisions";

        if (!title) {
          if (msgEl) {
            msgEl.textContent = "⚠️ Please enter a title for the study notes.";
            msgEl.className = "message error";
          }
          return;
        }

        const saveAndNavigate = (fileName, fileData) => {
          if (!Array.isArray(ACADEMIC.notes)) ACADEMIC.notes = [];
          ACADEMIC.notes.unshift({
            id: "note_" + Date.now(),
            subject: targetSubject,
            title: title,
            division: division || "All Divisions",
            fileName: fileName || "",
            fileData: fileData || "",
            uploadedBy: currentUser.username,
            uploadedByName: currentUser.name || "Faculty",
            date: new Date().toISOString().slice(0, 10)
          });
          saveAcademicData();
          navigate("notes");
        };

        if (fileEl && fileEl.files && fileEl.files[0]) {
          const file = fileEl.files[0];
          const reader = new FileReader();
          reader.onload = function (e) {
            saveAndNavigate(file.name, e.target.result);
          };
          reader.onerror = function () {
            saveAndNavigate(file.name, "");
          };
          reader.readAsDataURL(file);
        } else {
          saveAndNavigate("", "");
        }
      });
    }

    document.querySelectorAll(".btn-delete-note").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        const noteId = btn.dataset.noteId;
        if (noteId && Array.isArray(ACADEMIC.notes)) {
          if (confirm("Are you sure you want to delete this study note?")) {
            // INSTANT 0ms DOM REMOVAL
            const card = btn.closest(".note-card-item, .card, .panel, tr");
            if (card) card.remove();

            ACADEMIC.notes = ACADEMIC.notes.filter(n => n.id !== noteId);
            saveAcademicData();
            updateNotesBadges();
          }
        }
      });
    });
  }

  if (currentUser.role === "student") {
    const searchInput = $("notesSearchInput");
    const subjectFilter = $("notesSubjectFilter");

    const filterNotes = () => {
      const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
      const sub = subjectFilter ? subjectFilter.value : "All Subjects";

      document.querySelectorAll(".note-card-item").forEach(card => {
        const cardTitle = (card.dataset.title || "").toLowerCase();
        const cardDesc = (card.dataset.desc || "").toLowerCase();
        const cardSubject = card.dataset.subject || "";

        const matchQ = !q || cardTitle.includes(q) || cardDesc.includes(q);
        const matchSub = (sub === "All Subjects") || (cardSubject === sub);

        card.style.display = (matchQ && matchSub) ? "" : "none";
      });
    };

    if (searchInput) searchInput.addEventListener("input", filterNotes);
    if (subjectFilter) subjectFilter.addEventListener("change", filterNotes);
  }
}

function initNoticesPage() {
  markNoticesAsSeen();
  if (currentUser && (currentUser.role === "faculty" || currentUser.role === "admin")) {
    const form = $("noticeForm");
    if (form) {
      form.addEventListener("submit", event => {
        event.preventDefault();
        const title = $("noticeTitle").value.trim();
        const text = $("noticeText").value.trim();
        const date = $("noticeDate").value;
        const targetAudienceInput = $("noticeTargetAudience");

        const fileInput = $("noticeFile");

        let target = "student";
        if (currentUser.role === "admin") {
          target = targetAudienceInput ? targetAudienceInput.value : "all";
        } else if (currentUser.role === "faculty") {
          target = "student";
        }

        if (!title || !text || !date) {
          $("noticeMessage").textContent = "Fill in all notice fields.";
          $("noticeMessage").className = "message error";
          return;
        }

        const publishNoticeObj = (fileName = "", fileData = "") => {
          const newNotice = {
            id: "notice-" + Date.now(),
            title,
            text,
            date,
            target,
            authorRole: currentUser.role,
            authorName: currentUser.name || (currentUser.role === "admin" ? "Admin" : "Faculty"),
            fileName,
            fileData
          };

          ACADEMIC.notices.push(newNotice);

          saveAcademicData();
          updateNoticeBadges();


          navigate("notices");
        };

        const file = (fileInput && fileInput.files && fileInput.files.length) ? fileInput.files[0] : null;
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            publishNoticeObj(file.name, e.target.result);
          };
          reader.readAsDataURL(file);
        } else {
          publishNoticeObj();
        }
      });
    }

    document.querySelectorAll("[data-delete-notice-index]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        const idx = parseInt(btn.dataset.deleteNoticeIndex, 10);
        if (!isNaN(idx) && idx >= 0) {
          const sortedList = getNoticeList();
          const targetNotice = sortedList[idx];
          if (targetNotice && canDeleteNotice(targetNotice, currentUser)) {
            if (confirm(`Delete notice "${targetNotice.title}"?`)) {
              // INSTANT 0ms DOM REMOVAL
              const card = btn.closest(".notice-card, .card, tr, .notice-item");
              if (card) card.remove();

              const originalIdx = ACADEMIC.notices.indexOf(targetNotice);
              if (originalIdx !== -1) {
                ACADEMIC.notices.splice(originalIdx, 1);
                saveAcademicData();
                updateNoticeBadges();
              }
            }
          }
        }
      });
    });
  }
}

function initAdminUserManagement(role = "student") {
  const searchInput = document.querySelector(`[data-user-search="${role}"]`);
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      document.querySelectorAll(`[data-user-row="${role}"]`).forEach(row => {
        const name = (row.dataset.userName || "").toLowerCase();
        const username = (row.dataset.userUsername || "").toLowerCase();
        const div = (row.dataset.userDivision || "").toLowerCase();
        const match = !q || name.includes(q) || username.includes(q) || div.includes(q);
        row.style.display = match ? "" : "none";
      });
    });
  }

  document.querySelectorAll(`[data-remove-user-role="${role}"]`).forEach(btn => {
    btn.onclick = async (e) => {
      e.preventDefault();
      const userRole = btn.dataset.removeUserRole;
      const username = btn.dataset.removeUserUsername;
      const name = btn.dataset.removeUserName || username;

      if (confirm(`Are you sure you want to remove ${role === "student" ? "student" : "faculty"} "${name}"?`)) {
        btn.disabled = true;
        // INSTANT 0ms DOM ROW REMOVAL
        const userRow = btn.closest("tr, [data-user-row], .user-card, .card");
        if (userRow) userRow.remove();

        try {
          const removed = await removeUserAccount(userRole, username);
          if (removed) {
            setAdminNotice(`${role === "student" ? "Student" : "Faculty"} "${name}" was removed successfully.`, "success");
          }
        } catch (err) {
          alert(err.message || "Failed to remove user account.");
          btn.disabled = false;
        }
      }
    };
  });
}

async function refreshAdminUserList(role = "student") {
  const refreshBtns = document.querySelectorAll(`[data-refresh-admin-users="${role}"]`);
  refreshBtns.forEach(b => {
    b.disabled = true;
    b.innerHTML = `<span>⏳ Refreshing...</span>`;
  });
  try {
    await hydrateUsersFromServer();
    await hydrateAcademicDataFromServer();
    if (currentPage === (role === "student" ? "students" : "faculty")) {
      const content = $("content");
      if (content) {
        content.innerHTML = pages[currentPage]();
        initAdminUserManagement(role);
      }
    }
  } catch (err) {
    console.error("Failed to refresh user list:", err);
  } finally {
    refreshBtns.forEach(b => {
      b.disabled = false;
      b.innerHTML = `<span>🔄 Refresh List</span>`;
    });
  }
}

function downloadTimetableCSV(division = activeTimetableDivision) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysHeader = ["Timing", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isMasterView = division === "Master View" || division === "All Divisions";
  const displayDivision = isMasterView ? "All Divisions" : division;
  const rows = getTimetableEntries(displayDivision);

  const BASE_TIMES = [
    "9:00-10:00", "10:00-11:00", "11:00-11:15", "11:15-12:15",
    "12:15-1:15", "1:15-2:00", "2:00-3:00", "3:00-4:00", "4:00-5:00"
  ];
  const combinedTimes = Array.from(new Set([...BASE_TIMES, ...rows.map(r => r.time)]));
  const rowTimings = sortTimingsSerialwise(combinedTimes);

  let csvContent = `BHARATESH COLLEGE OF COMPUTER APPLICATIONS 2026\n`;
  csvContent += `Time Table - ${displayDivision}\n\n`;
  csvContent += daysHeader.join(",") + "\n";

  rowTimings.forEach(timeVal => {
    const normT = (timeVal || "").replace(/\s+/g, "").toLowerCase();
    const isBreak = normT.includes("11:00-11:15") || normT.includes("11-11:15");
    const isLunch = normT.includes("1:15-2:00");

    if (isBreak) {
      csvContent += `"${timeVal}",BREAK TIME,BREAK TIME,BREAK TIME,BREAK TIME,BREAK TIME,BREAK TIME\n`;
      return;
    }
    if (isLunch) {
      csvContent += `"${timeVal}",LUNCH BREAK,LUNCH BREAK,LUNCH BREAK,LUNCH BREAK,LUNCH BREAK,LUNCH BREAK\n`;
      return;
    }

    const rowCells = [timeVal];
    days.forEach(dayName => {
      const cellEntries = rows.filter(e =>
        (e.time || "").replace(/\s+/g, "").toLowerCase() === (timeVal || "").replace(/\s+/g, "").toLowerCase() &&
        e.day === dayName
      );
      const text = Array.from(new Set(cellEntries.map(e => e.subjectText || (subjectById(e.subject) ? subjectById(e.subject).short || subjectById(e.subject).name : e.subject)).filter(Boolean))).join(" / ");
      rowCells.push(`"${text || '-'}"`);
    });
    csvContent += rowCells.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `Timetable_${displayDivision.replace(/[\s()]+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printColorTimetablePDF(division) {
  const targetDivision = (currentUser && currentUser.role === "student")
    ? (currentUser.division || "Div A")
    : (division || activeTimetableDivision || "Div A");

  const rows = getTimetableEntries(targetDivision);

  const DAYS_HEADER = [
    { short: "Mon", full: "Monday" },
    { short: "Tue", full: "Tuesday" },
    { short: "Wed", full: "Wednesday" },
    { short: "Thu", full: "Thursday" },
    { short: "Fri", full: "Friday" },
    { short: "Sat", full: "Saturday" }
  ];

  const BASE_TIMES = [
    "9:00-10:00", "10:00-11:00", "11:00-11:15", "11:15-12:15",
    "12:15-1:15", "1:15-2:00", "2:00-3:00", "3:00-4:00", "4:00-5:00"
  ];
  const combinedTimes = Array.from(new Set([...BASE_TIMES, ...rows.map(r => r.time)]));
  const rowTimings = sortTimingsSerialwise(combinedTimes);

  const storedHeader = (ACADEMIC.timetableHeader && ACADEMIC.timetableHeader[targetDivision]) || {};
  const headerTitle = storedHeader.title || "BHARATESH COLLEGE OF COMPUTER APPLICATIONS 2026";
  const headerSubtitle = storedHeader.subtitle || `Time Table - ${targetDivision}`;

  const printWin = window.open('', '_blank');
  if (!printWin) return;

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${headerTitle} - ${targetDivision}</title>
      <style>
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          padding: 24px;
          margin: 0;
          color: #1e293b;
          background: #ffffff;
        }
        .banner {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 3px double #c084fc;
        }
        .banner h1 {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 6px 0;
          color: #1e293b;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .banner p {
          font-size: 15px;
          font-weight: 700;
          color: #475569;
          margin: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          font-size: 13px;
          border: 2px solid #7c3aed;
          border-radius: 8px;
          overflow: hidden;
        }
        th {
          background: #7c3aed !important;
          color: #ffffff !important;
          padding: 10px 6px;
          border: 1px solid #6d28d9;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        td {
          border: 1px solid #e9d5ff;
          padding: 8px 6px;
          vertical-align: middle;
          background: #ffffff;
        }
        .time-col {
          font-weight: 800;
          background: #f3e8ff !important;
          color: #581c87 !important;
          white-space: nowrap;
          border-right: 2px solid #c084fc;
        }
        .break-row td, .lunch-row td {
          background: #f3e8ff !important;
          color: #581c87 !important;
          font-weight: 800 !important;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-top: 1px solid #d8b4fe;
          border-bottom: 1px solid #d8b4fe;
        }
        .subject-chip {
          display: block;
          background: #faf5ff !important;
          color: #3b0764 !important;
          font-weight: 700;
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid #c084fc;
        }
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>${headerTitle}</h1>
        <p>${headerSubtitle}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 110px;">Timing</th>
            ${DAYS_HEADER.map(d => `<th>${d.short}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rowTimings.map(timeVal => {
    const customBreaks = (ACADEMIC.customBreakRows && ACADEMIC.customBreakRows[targetDivision]) || {};
    const cBreakTime = customBreaks.breakTime || "11:00-11:15";
    const cBreakLabel = customBreaks.breakLabel || "Break Time";
    const cLunchTime = customBreaks.lunchTime || "1:15-2:00";
    const cLunchLabel = customBreaks.lunchLabel || "Lunch Break";

    const normT = (timeVal || "").replace(/\s+/g, "").toLowerCase();
    const isBreak = normT.includes("11:00-11:15") || normT.includes("11-11:15") || normT === cBreakTime.replace(/\s+/g, "").toLowerCase();
    const isLunch = normT.includes("1:15-2:00") || normT === cLunchTime.replace(/\s+/g, "").toLowerCase();

    if (isBreak) {
      return `<tr class="break-row"><td class="time-col">${cBreakTime}</td><td colspan="6">${cBreakLabel}</td></tr>`;
    }
    if (isLunch) {
      return `<tr class="lunch-row"><td class="time-col">${cLunchTime}</td><td colspan="6">${cLunchLabel}</td></tr>`;
    }
    return `<tr>
              <td class="time-col">${timeVal}</td>
              ${DAYS_HEADER.map(d => {
      const cellEntries = rows.filter(e => (e.time || "").replace(/\s+/g, "").toLowerCase() === (timeVal || "").replace(/\s+/g, "").toLowerCase() && e.day === d.full);
      const ownEntries = cellEntries.filter(e => isFacultyOwnEntry(e, currentUser));
      const subjectText = currentUser.role === "faculty"
        ? (ownEntries.length ? (ownEntries[0].subjectText || (subjectById(ownEntries[0].subject) ? subjectById(ownEntries[0].subject).short || subjectById(ownEntries[0].subject).name : ownEntries[0].subject)) : "")
        : Array.from(new Set(cellEntries.map(e => e.subjectText || (subjectById(e.subject) ? subjectById(e.subject).short || subjectById(e.subject).name : e.subject)).filter(Boolean))).join(" / ");
      return `<td>${subjectText ? `<span class="subject-chip">${subjectText}</span>` : '-'}</td>`;
    }).join('')}
            </tr>`;
  }).join('')}
        </tbody>
      </table>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}

function initTimetablePage() {
  const divSelect = $("timetableDivisionSelect");
  if (divSelect) {
    divSelect.addEventListener("change", () => {
      activeTimetableDivision = divSelect.value;
      isTimetableEditMode = false;
      navigate("timetable");
    });
  }

  const semSelect = $("timetableSemesterSelect");
  if (semSelect) {
    semSelect.addEventListener("change", () => {
      activeTimetableSemester = semSelect.value;
      isTimetableEditMode = false;
      navigate("timetable");
    });
  }

  const downloadBtn = $("btnDownloadTimetable");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const targetDiv = (currentUser && currentUser.role === "student")
        ? (currentUser.division || "Div A")
        : activeTimetableDivision;
      printColorTimetablePDF(targetDiv);
    });
  }

  // Auto-fit cell box size to text content as user types
  document.querySelectorAll(".direct-cell-input, .direct-time-input").forEach(input => {
    const autoResize = () => {
      input.style.height = "auto";
      input.style.height = Math.max(20, input.scrollHeight) + "px";
    };
    input.addEventListener("input", autoResize);
    setTimeout(autoResize, 10);
  });

  if (currentUser.role !== "faculty") return;

  const editModeBtn = $("btnEditTimetableMode");
  if (editModeBtn) {
    editModeBtn.addEventListener("click", () => {
      isTimetableEditMode = true;
      navigate("timetable");
    });
  }

  const cancelEditBtn = $("btnCancelTimetableEdit");
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      isTimetableEditMode = false;
      navigate("timetable");
    });
  }

  const saveBtn = $("btnSaveTimetable");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const msgElem = $("timetableSaveMsg");
      const targetDivision = activeTimetableDivision;

      // Preserve entries for other divisions, AND preserve entries for this division belonging to OTHER faculty members!
      const targetDivNorm = (targetDivision || "Div A").replace("Section ", "Div ").replace("Division ", "Div ");

      ACADEMIC.timetable = ACADEMIC.timetable.filter(e => {
        const entryDiv = (e.division || "Div A").replace("Section ", "Div ").replace("Division ", "Div ");
        if (entryDiv !== targetDivNorm) return true;
        return !isFacultyOwnEntry(e, currentUser);
      });

      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const timeInputs = document.querySelectorAll(".direct-time-input");

      const titleInput = $("timetableHeaderTitleInput");
      const subtitleInput = $("timetableHeaderSubtitleInput");

      if (titleInput || subtitleInput) {
        if (!ACADEMIC.timetableHeader) ACADEMIC.timetableHeader = {};
        const titleVal = titleInput ? titleInput.value.trim() : "";
        const subtitleVal = subtitleInput ? subtitleInput.value.trim() : "";
        const headerKey = `${activeTimetableSemester}_${targetDivision}`;

        const headerObj = {
          title: titleVal || "BHARATESH COLLEGE OF COMPUTER APPLICATIONS 2026",
          subtitle: subtitleVal
        };
        ACADEMIC.timetableHeader[headerKey] = headerObj;
        ACADEMIC.timetableHeader[targetDivision] = headerObj;
      }

      const breakTimeInp = $("breakTimeInput");
      const breakLabelInp = $("breakLabelInput");
      const lunchTimeInp = $("lunchTimeInput");
      const lunchLabelInp = $("lunchLabelInput");

      if (breakTimeInp || breakLabelInp || lunchTimeInp || lunchLabelInp) {
        if (!ACADEMIC.customBreakRows) ACADEMIC.customBreakRows = {};
        ACADEMIC.customBreakRows[targetDivision] = {
          breakTime: breakTimeInp ? breakTimeInp.value.trim() : "11:00-11:15",
          breakLabel: breakLabelInp ? breakLabelInp.value.trim() : "Break Time",
          lunchTime: lunchTimeInp ? lunchTimeInp.value.trim() : "1:15-2:00",
          lunchLabel: lunchLabelInp ? lunchLabelInp.value.trim() : "Lunch Break"
        };
      }

      timeInputs.forEach(timeInput => {
        const rowIdx = timeInput.dataset.rowIdx;
        const timeVal = timeInput.value.trim();
        if (!timeVal) return;

        days.forEach(day => {
          const cellInput = document.querySelector(`.direct-cell-input[data-row-idx="${rowIdx}"][data-day="${day}"]`);
          const cellVal = cellInput ? cellInput.value.trim() : "";
          if (cellVal) {
            ACADEMIC.timetable.push({
              division: targetDivision,
              day: day,
              time: timeVal,
              subject: currentUser.subject || "custom",
              subjectText: cellVal,
              faculty: currentUser.username
            });
          }
        });
      });

      saveAcademicData();
      isTimetableEditMode = false;
      navigate("timetable");
    });
  }

  const addRowBtn = $("btnAddTimetableRow");
  if (addRowBtn) {
    addRowBtn.addEventListener("click", () => {
      const tbody = document.querySelector(".college-timetable-table tbody");
      if (!tbody) return;
      const currentRows = tbody.querySelectorAll("tr");
      const newRowIdx = currentRows.length;
      const days = [
        { short: "Mon", full: "Monday" },
        { short: "Tue", full: "Tuesday" },
        { short: "Wed", full: "Wednesday" },
        { short: "Thu", full: "Thursday" },
        { short: "Fri", full: "Friday" },
        { short: "Sat", full: "Saturday" }
      ];

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="time-col">
          <textarea class="direct-time-input" data-row-idx="${newRowIdx}" rows="1" placeholder="e.g. 5:00-6:00"></textarea>
        </td>
        ${days.map(d => `
          <td>
            <textarea class="direct-cell-input" data-row-idx="${newRowIdx}" data-day="${d.full}" rows="1" placeholder="-"></textarea>
          </td>
        `).join("")}
      `;
      tbody.appendChild(tr);
    });
  }

  if (!window.timetableSyncInitialized) {
    window.timetableSyncInitialized = true;
    window.addEventListener("academicDataUpdated", () => {
      updateNoticeBadges();
      updateNotesBadges();
      render();
    });
  }
}

function subjectCards(type) {
  const record = currentUser && currentUser.role === "student" ? getStudentRecord(currentUser.username) : { attendance: {}, marks: {} };
  const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
  const subjectsToDisplay = currentUser && currentUser.role === "student" ? getSubjectsForStudent(currentUser) : subjectsSource;
  return subjectsToDisplay.map(s => {
    const value = type === "attendance" ? (record.attendance[s.id] ?? 0) + "%" : (record.marks[s.id] !== undefined ? record.marks[s.id] + "/100" : "--");
    return `<div class="subject-card">
      ${s.icon ? `<div class="subject-icon">${s.icon}</div>` : ''}<div><b>${s.short}</b><small>${s.name}</small></div>
      <strong>${value}</strong>
    </div>`;
  }).join("");
}

const pages = {
  dashboard() {
    if (currentUser.role === "admin") return adminDashboard();
    if (currentUser.role === "faculty") return facultyDashboard();
    const visibleSubjects = getSubjectsForStudent(currentUser);
    const record = getStudentRecord(currentUser.username);
    const attendance = Math.round(recordAverage(record.attendance, visibleSubjects.map(s => s.id)));
    const assignmentCount = getStudentAssignments(currentUser.username).length;
    const noticeCount = getNoticeList().length;
    return `<div class="welcome">
      <div>
        <p class="eyebrow">Welcome back</p>
        <h1>${currentUser.name} 👋</h1>
        <p>Your academic overview is ready.</p>
      </div>
      <div class="welcome-icon">🎓</div>
    </div>
    <div class="stat-grid"><div class="stat"><span>📚</span><b>${visibleSubjects.length}</b><small>Subjects</small></div>
      <div class="stat"><span>📊</span><b>${attendance}%</b><small>Average Attendance</small></div>
      <div class="stat"><span>📢</span><b>${noticeCount}</b><small>Notices</small></div></div>
      <section class="panel">
        <div class="panel-head">
          <h3>Subject Overview</h3>
        </div>
      <div class="subject-grid">${visibleSubjects.map(s => {
      const markValue = typeof record.marks[s.id] === "number" ? `${record.marks[s.id]}/100` : "--";
      return `<div class="subject-card">${s.icon ? `<div class="subject-icon">${s.icon}</div>` : ''}<div><b>${s.short}</b><small>${s.name}</small></div><strong>${markValue}</strong></div>`;
    }).join("")}</div></section>`;
  },
  profile() {
    if (currentUser.role === "student") {
      const course = currentUser.course || "Not Selected";
      const year = currentUser.courseYear || "Not Selected";
      const sem = currentUser.semester || "Not Selected";
      const div = currentUser.division || "Not Selected";
      const email = currentUser.email || "Not provided";
      const isConfigured = Boolean(currentUser.courseYear && currentUser.semester && currentUser.division && currentUser.languageChoice);

      const subtitleParts = [course, year, sem, div].filter(p => p !== "Not Selected");
      const subtitleText = subtitleParts.length ? subtitleParts.join(" • ") : "Profile setup pending";
      const profileStatus = getProfileStatusMessage();
      const statusMarkup = profileStatus ? `<p id="profileStatusMessage" class="message ${profileStatus.type}">${profileStatus.message}</p>` : "";

      const setupBanner = !isConfigured ? `
        <div class="profile-notice-banner" style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:14px 18px; border-radius:16px; margin-bottom:20px; font-size:14px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
          <div><strong>⚠️ Profile Setup Required:</strong> You haven't selected your academic details yet. Click <b>Edit Profile</b> to choose your Course Year, Semester, Division, and Language.</div>
          <button onclick="openEditProfileModal()" class="primary-btn" style="padding:6px 14px; font-size:13px;" type="button">Edit Profile Now</button>
        </div>` : "";

      const allEnrolled = getSubjectsForStudent(currentUser);
      const theorySubjects = allEnrolled.filter(s => !s.name.toLowerCase().includes("lab") && !s.id.toLowerCase().includes("lab"));
      const labSubjects = allEnrolled.filter(s => s.name.toLowerCase().includes("lab") || s.id.toLowerCase().includes("lab"));

      const renderStudentSubjectTag = (s, isLab) => {
        const matchingFaculty = getFacultyForSubject(s.id, currentUser.division);
        const facName = matchingFaculty.length ? matchingFaculty[0].name : "";
        const facText = facName ? ` • 🧑‍🏫 ${facName}` : "";
        const bg = isLab ? "#e0f2fe" : "#eef2ff";
        const color = isLab ? "#075985" : "#3730a3";
        const border = isLab ? "#bae6fd" : "#c7d2fe";
        const icon = isLab ? "🧪" : "📖";
        return `<span class="subject-tag ${isLab ? 'lab-tag' : 'theory-tag'}" style="background:${bg}; color:${color}; padding:6px 14px; border-radius:10px; font-size:13px; font-weight:600; border:1px solid ${border};">${icon} ${s.name}${facText}</span>`;
      };

      const theorySubjectsMarkup = theorySubjects.length
        ? `<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:4px;">` +
        theorySubjects.map(s => renderStudentSubjectTag(s, false)).join("") +
        `</div>`
        : `<b style="color: #64748b; font-size: 14px; display: block;">${isConfigured ? "No theory subjects listed for this semester" : "Please select your semester in Edit Profile to view enrolled subjects"}</b>`;

      const labSubjectsMarkup = labSubjects.length
        ? `<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:4px;">` +
        labSubjects.map(s => renderStudentSubjectTag(s, true)).join("") +
        `</div>`
        : `<b style="color: #64748b; font-size: 14px; display: block;">${isConfigured ? "No practical lab subjects for this semester" : "Please select your semester in Edit Profile to view enrolled labs"}</b>`;

      return `<section class="panel profile">
        ${setupBanner}
        <div class="profile-head">
          <div class="profile-avatar-container">
            <img src="${getProfilePicUrl(currentUser)}" alt="${currentUser.name}" class="profile-picture-img">
          </div>
          <div class="profile-main-info">
            <h2>${currentUser.name} <span class="role-badge-chip">🎓 Student</span></h2>
            <p>${subtitleText}</p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <button id="openStudentCredentialsBtn" class="primary-btn profile-edit-btn" type="button" style="width: auto !important; margin: 0; padding: 10px 18px;">
              <span>✏️ Edit Details</span>
            </button>
            <button id="openEditProfileBtn" class="secondary-btn profile-edit-btn" type="button" style="width: auto !important; margin: 0; padding: 10px 16px;">
              <span>⚙️ Academic Setup</span>
            </button>
          </div>
        </div>
        ${statusMarkup}
        <div class="profile-subhead">
          <h3>Personal & Academic Information</h3>
        </div>
        <div class="info-grid profile-info-grid">
          <div><small>Full Name</small><b>${currentUser.name}</b></div>
          <div><small>Username</small><b>${currentUser.username}</b></div>
          <div><small>Division</small><b>${div}</b></div>
          <div><small>Semester</small><b>${sem}</b></div>
          <div><small>Course Year</small><b>${year}</b></div>
          <div><small>Course</small><b>${course}</b></div>
          <div><small>Email Address</small><b>${email}</b></div>
          <div><small>Account Role</small><b>Student</b></div>
          <div style="grid-column: 1 / -1; background: #f8fafc; padding: 16px 20px; border-radius: 14px; border: 1px solid #e2e8f0; margin-top: 8px;">
            <small style="color: #4f46e5; font-weight: 700; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 8px; letter-spacing: 0.5px;">📖 Enrolled Semester Subjects (${sem})</small>
            ${theorySubjectsMarkup}
          </div>
          <div style="grid-column: 1 / -1; background: #f0f9ff; padding: 16px 20px; border-radius: 14px; border: 1px solid #bae6fd; margin-top: 8px;">
            <small style="color: #0284c7; font-weight: 700; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 8px; letter-spacing: 0.5px;">🧪 Enrolled Semester Labs (${sem})</small>
            ${labSubjectsMarkup}
          </div>
        </div>
      </section>

      <section class="panel hidden" id="studentCredentialsCard" style="margin-top: 24px;">
        <div class="panel-head" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="display: flex; align-items: center; gap: 8px;">
              <span>🔐</span> Change Username, Password & Profile Info
            </h3>
            <span class="badge" style="background: #eef2ff; color: #4338ca;">Credentials Manager</span>
          </div>
          <button type="button" id="closeStudentCredentialsBtn" class="secondary-btn" style="width: auto !important; margin: 0; padding: 6px 14px; font-size: 13px;">
            <span>✕ Close</span>
          </button>
        </div>

        <form id="studentProfileForm" class="admin-credentials-form" autocomplete="off">
          <div id="studentProfileFeedback" class="message" style="display: none; margin-bottom: 18px;"></div>

          <div class="credentials-photo-section" id="credentialsPhotoSection">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
              <label style="font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; margin: 0;">
                <span>📸</span> Profile Picture
              </label>
            </div>

            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
              <div class="credentials-avatar-interactive" id="credentialsAvatarTrigger" title="Click to upload or change profile photo">
                <img id="credentialsPreviewImg" src="${getProfilePicUrl(currentUser)}" alt="Profile Picture" class="credentials-preview-img">
                <div class="avatar-hover-overlay">
                  <span>📷</span>
                  <small>Change</small>
                </div>
                <div class="avatar-badge-check" title="Active Profile Photo">✓</div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 240px;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                  <label for="credentialsPicInput" class="primary-btn" style="cursor: pointer; padding: 8px 16px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px; width: fit-content; margin: 0; border-radius: 10px;">
                    <span>📁 Upload Photo</span>
                    <input type="file" id="credentialsPicInput" accept="image/*, .png, .jpg, .jpeg, .webp, .gif, .svg, .bmp, .ico, .avif, .tif, .tiff, .heic, .heif, *" style="display: none;">
                  </label>
                  <button type="button" id="credentialsAdjustCropBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px; margin: 0; border-radius: 10px;">
                    <span>✂️ Adjust / Zoom</span>
                  </button>
                  <button type="button" id="credentialsRemovePicBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; color: #ef4444; border-color: #fecaca; margin: 0; border-radius: 10px;">
                    <span>🗑️ Reset Avatar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="admin-form-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-bottom: 16px;">
            <div>
              <label for="studentProfileName" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                Student Full Name <span style="color: #e11d48;">*</span>
              </label>
              <div class="input-wrap">
                <span class="input-icon">👤</span>
                <input id="studentProfileName" type="text" value="${currentUser.name}" required placeholder="Student Full Name">
              </div>
            </div>

            <div>
              <label for="studentProfileUsername" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                Username <span style="color: #e11d48;">*</span>
              </label>
              <div class="input-wrap">
                <span class="input-icon">🛡️</span>
                <input id="studentProfileUsername" type="text" value="${currentUser.username}" required placeholder="Enter username (4–30 chars)">
              </div>
              <small style="display: block; margin-top: 4px; color: #64748b; font-size: 12px;">
                4–30 letters, numbers, dot, dash or underscore.
              </small>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label for="studentProfileEmail" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
              Student Email Address
            </label>
            <div class="input-wrap">
              <span class="input-icon">✉️</span>
              <input id="studentProfileEmail" type="email" value="${currentUser.email || ""}" placeholder="student@smartportal.edu">
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 6px;">
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                <span>🔒</span> Change Student Password
              </h4>
              <span style="font-size: 12px; color: #64748b;">(Optional — Leave blank to keep current password)</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
              <div>
                <label for="studentCurrentPassword" style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Current Password
                </label>
                <div class="password-wrap">
                  <span class="input-icon">🔐</span>
                  <input id="studentCurrentPassword" type="password" placeholder="Enter current password" autocomplete="current-password">
                  <button type="button" class="eye-btn student-eye-toggle" data-target="studentCurrentPassword" aria-label="Show password" title="Show password">
                    ${eyeOpenSVG}
                  </button>
                </div>
              </div>

              <div>
                <label for="studentNewPassword" style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  New Password
                </label>
                <div class="password-wrap">
                  <span class="input-icon">🔑</span>
                  <input id="studentNewPassword" type="password" placeholder="At least 6 characters" autocomplete="new-password">
                  <button type="button" class="eye-btn student-eye-toggle" data-target="studentNewPassword" aria-label="Show password" title="Show password">
                    ${eyeOpenSVG}
                  </button>
                </div>
              </div>

              <div>
                <label for="studentConfirmPassword" style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Confirm New Password
                </label>
                <div class="password-wrap">
                  <span class="input-icon">🔒</span>
                  <input id="studentConfirmPassword" type="password" placeholder="Re-enter new password" autocomplete="new-password">
                  <button type="button" class="eye-btn student-eye-toggle" data-target="studentConfirmPassword" aria-label="Show password" title="Show password">
                    ${eyeOpenSVG}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: flex-start; gap: 14px; flex-wrap: wrap;">
            <button id="studentSaveProfileBtn" type="submit" class="primary-btn" style="width: auto !important; min-width: 220px; padding: 12px 28px; font-size: 14px; font-weight: 700; margin: 0;">
              <span>💾 Update Profile & Credentials</span>
            </button>
            <button type="button" class="secondary-btn" id="studentCancelBtn" style="margin: 0; padding: 10px 18px;">
              Cancel
            </button>
          </div>
        </form>
      </section>`;
    }

    if (currentUser.role === "faculty") {
      const email = currentUser.email || `${currentUser.username}@smartportal.edu`;
      const subjectObj = subjectById(currentUser.subject);
      const profileStatus = getProfileStatusMessage();
      const statusMarkup = profileStatus ? `<p id="profileStatusMessage" class="message ${profileStatus.type}">${profileStatus.message}</p>` : "";

      return `<section class="panel profile">
        <div class="profile-head">
          <div class="profile-avatar-container">
            <img src="${getProfilePicUrl(currentUser)}" alt="${currentUser.name}" class="profile-picture-img">
          </div>
          <div class="profile-main-info">
            <h2>${currentUser.name} <span class="role-badge-chip" style="background:#f3e8ff; color:#7e22ce;">🧑‍🏫 Faculty</span></h2>
            <p>${roleLabel(currentUser.role, currentUser.subject)}</p>
          </div>
          <button id="openFacultyCredentialsBtn" class="primary-btn profile-edit-btn" type="button" style="width: auto !important; margin: 0; padding: 10px 20px;">
            <span>✏️ Edit Details</span>
          </button>
        </div>
        ${statusMarkup}
        <div class="profile-subhead">
          <h3>Faculty Credentials & Account Information</h3>
        </div>
        <div class="info-grid profile-info-grid">
          <div><small>Full Name</small><b>${currentUser.name}</b></div>
          <div><small>Username</small><b>${currentUser.username}</b></div>
          <div><small>Email Address</small><b>${email}</b></div>
          <div><small>Account Role</small><b>Faculty Member</b></div>
          <div><small>Department</small><b>${currentUser.department || "Department of Computer Science & Applications"}</b></div>
          <div><small>Assigned Subject</small><b>${subjectObj ? subjectObj.name : "N/A"}</b></div>
          <div><small>Assigned Division</small><b>${(!currentUser.division || currentUser.division === "Both Divisions" || currentUser.division === "All Divisions") ? "Both Divisions (Div A & Div B)" : currentUser.division}</b></div>
        </div>
      </section>

      <section class="panel hidden" id="facultyCredentialsCard" style="margin-top: 24px;">
        <div class="panel-head" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="display: flex; align-items: center; gap: 8px;">
              <span>🔐</span> Change Username, Password & Profile Info
            </h3>
            <span class="badge" style="background: #eef2ff; color: #4338ca;">Credentials Manager</span>
          </div>
          <button type="button" id="closeFacultyCredentialsBtn" class="secondary-btn" style="width: auto !important; margin: 0; padding: 6px 14px; font-size: 13px;">
            <span>✕ Close</span>
          </button>
        </div>

        <form id="facultyProfileForm" class="admin-credentials-form" autocomplete="off">
          <div id="facultyProfileFeedback" class="message" style="display: none; margin-bottom: 18px;"></div>

          <div class="credentials-photo-section" id="credentialsPhotoSection">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
              <label style="font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; margin: 0;">
                <span>📸</span> Profile Picture
              </label>
            </div>

            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
              <div class="credentials-avatar-interactive" id="credentialsAvatarTrigger" title="Click to upload or change profile photo">
                <img id="credentialsPreviewImg" src="${getProfilePicUrl(currentUser)}" alt="Profile Picture" class="credentials-preview-img" style="border-color: #7c3aed;">
                <div class="avatar-hover-overlay">
                  <span>📷</span>
                  <small>Change</small>
                </div>
                <div class="avatar-badge-check" style="background: #7c3aed;" title="Active Profile Photo">✓</div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 240px;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                  <label for="credentialsPicInput" class="primary-btn" style="cursor: pointer; padding: 8px 16px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px; width: fit-content; margin: 0; border-radius: 10px;">
                    <span>📁 Upload Photo</span>
                    <input type="file" id="credentialsPicInput" accept="image/*, .png, .jpg, .jpeg, .webp, .gif, .svg, .bmp, .ico, .avif, .tif, .tiff, .heic, .heif, *" style="display: none;">
                  </label>
                  <button type="button" id="credentialsAdjustCropBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px; margin: 0; border-radius: 10px;">
                    <span>✂️ Adjust / Zoom</span>
                  </button>
                  <button type="button" id="credentialsRemovePicBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; color: #ef4444; border-color: #fecaca; margin: 0; border-radius: 10px;">
                    <span>🗑️ Reset Avatar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="admin-form-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-bottom: 16px;">
            <div>
              <label for="facultyProfileName" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                Faculty Full Name <span style="color: #e11d48;">*</span>
              </label>
              <div class="input-wrap">
                <span class="input-icon">🧑‍🏫</span>
                <input id="facultyProfileName" type="text" value="${currentUser.name}" required placeholder="Faculty Full Name">
              </div>
            </div>

            <div>
              <label for="facultyProfileUsername" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                Username <span style="color: #e11d48;">*</span>
              </label>
              <div class="input-wrap">
                <span class="input-icon">🛡️</span>
                <input id="facultyProfileUsername" type="text" value="${currentUser.username}" required placeholder="Enter username (4–30 chars)">
              </div>
              <small style="display: block; margin-top: 4px; color: #64748b; font-size: 12px;">
                4–30 letters, numbers, dot, dash or underscore.
              </small>
            </div>
          </div>

          <div class="admin-form-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin-bottom: 20px;">
            <div>
              <label for="facultyProfileEmail" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                Faculty Email Address
              </label>
              <div class="input-wrap">
                <span class="input-icon">✉️</span>
                <input id="facultyProfileEmail" type="email" value="${currentUser.email || ""}" placeholder="faculty@smartportal.edu">
              </div>
            </div>

            <div>
              <label for="facultyProfileDepartment" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                Department
              </label>
              <div class="input-wrap">
                <span class="input-icon">🏛️</span>
                <input id="facultyProfileDepartment" type="text" value="${currentUser.department || "Department of Computer Science & Applications"}" placeholder="Department">
              </div>
            </div>

            <div>
              <label for="facultyProfileDivision" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                Assigned Division
              </label>
              <div class="input-wrap">
                <select id="facultyProfileDivision" style="padding:10px 14px; border-radius:10px; border:1px solid #cbd5e1; font-weight:600; width:100%;">
                  ${renderFacultyDivisionSelectOptions(currentUser.division || "Both Divisions")}
                </select>
              </div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 6px;">
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                <span>🔒</span> Change Faculty Password
              </h4>
              <span style="font-size: 12px; color: #64748b;">(Optional — Leave blank to keep existing password)</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
              <div>
                <label for="facultyAuthUsername" style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px; min-height: 18px;">
                  Faculty Username
                </label>
                <div class="input-wrap">
                  <span class="input-icon">🛡️</span>
                  <input id="facultyAuthUsername" type="text" placeholder="Enter faculty username" autocomplete="username">
                </div>
              </div>

              <div>
                <label for="facultyNewPassword" style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px; min-height: 18px;">
                  New Password
                </label>
                <div class="password-wrap">
                  <span class="input-icon">🔑</span>
                  <input id="facultyNewPassword" type="password" placeholder="At least 6 characters" autocomplete="new-password">
                  <button type="button" class="eye-btn faculty-eye-toggle" data-target="facultyNewPassword" aria-label="Show password" title="Show password">
                    ${eyeOpenSVG}
                  </button>
                </div>
              </div>

              <div>
                <label for="facultyConfirmPassword" style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px; min-height: 18px;">
                  Confirm New Password
                </label>
                <div class="password-wrap">
                  <span class="input-icon">🔒</span>
                  <input id="facultyConfirmPassword" type="password" placeholder="Re-enter new password" autocomplete="new-password">
                  <button type="button" class="eye-btn faculty-eye-toggle" data-target="facultyConfirmPassword" aria-label="Show password" title="Show password">
                    ${eyeOpenSVG}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: flex-start; gap: 14px; flex-wrap: wrap;">
            <button id="facultySaveProfileBtn" type="submit" class="primary-btn" style="width: auto !important; min-width: 220px; padding: 12px 28px; font-size: 14px; font-weight: 700; margin: 0;">
              <span>💾 Update Profile & Credentials</span>
            </button>
            <button type="button" class="secondary-btn" id="facultyCancelBtn" style="margin: 0; padding: 10px 18px;">
              Cancel
            </button>
          </div>
        </form>
      </section>`;
    }

    const adminName = (currentUser && currentUser.name) ? currentUser.name : "Administrator";
    const adminUsername = (currentUser && currentUser.username) ? currentUser.username : "admin";
    const adminEmail = (currentUser && currentUser.email) ? currentUser.email : "admin@smartportal.edu";
    const adminId = (currentUser && currentUser.id) ? currentUser.id : "admin-001";
    const profileStatus = getProfileStatusMessage();
    const statusMarkup = profileStatus ? `<p id="profileStatusMessage" class="message ${profileStatus.type}">${profileStatus.message}</p>` : "";

    return `<section class="panel profile admin-profile-panel">
      <div class="profile-head admin-profile-head">
        <div class="profile-avatar-container">
          <img src="${getProfilePicUrl(currentUser)}" alt="${adminName}" class="profile-picture-img">
        </div>
        <div class="profile-main-info">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <h2 style="font-size: 24px; font-weight: 800; color: #1e293b; margin: 0;">${adminName}</h2>
            <span class="badge" style="background: linear-gradient(135deg, #e0e7ff, #ede9fe); color: #4338ca; border: 1px solid #c7d2fe; font-weight: 700; padding: 4px 10px; border-radius: 999px; font-size: 12px;">🛡️ Super Administrator</span>
          </div>
          <p style="margin: 6px 0 0; color: #64748b; font-size: 14px;">
            Account ID: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 6px; font-weight: 700; color: #334155;">${adminId}</code> • Username: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 6px; font-weight: 700; color: #4f46e5;">@${adminUsername}</code> • Full Access Level
          </p>
        </div>
        <button id="openAdminCredentialsBtn" class="primary-btn profile-edit-btn" type="button" style="width: auto !important; margin: 0; padding: 10px 20px;">
          <span>✏️ Edit Details</span>
        </button>
      </div>
      ${statusMarkup}

      <div class="profile-subhead">
        <h3>Administrator Details</h3>
      </div>

      <div class="info-grid profile-info-grid admin-info-grid">
        <div class="admin-detail-box">
          <small style="color: #64748b; font-weight: 600;">Full Name</small>
          <b id="adminDisplayFullName" style="font-size: 15px; color: #0f172a;">${adminName}</b>
        </div>
        <div class="admin-detail-box">
          <small style="color: #64748b; font-weight: 600;">Username</small>
          <b id="adminDisplayUsername" style="font-size: 15px; color: #4f46e5;">@${adminUsername}</b>
        </div>
        <div class="admin-detail-box">
          <small style="color: #64748b; font-weight: 600;">Email Address</small>
          <b id="adminDisplayEmail" style="font-size: 15px; color: #0f172a;">${adminEmail}</b>
        </div>
        <div class="admin-detail-box">
          <small style="color: #64748b; font-weight: 600;">System Role</small>
          <b style="font-size: 15px; color: #0f172a;">Root Administrator</b>
        </div>
      </div>
    </section>

    <section class="panel hidden" id="adminCredentialsCard" style="margin-top: 24px;">
      <div class="panel-head" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="display: flex; align-items: center; gap: 8px;">
            <span>🔐</span> Change Username, Password & Profile Info
          </h3>
          <span class="badge" style="background: #eef2ff; color: #4338ca;">Credentials Manager</span>
        </div>
        <button type="button" id="closeAdminCredentialsBtn" class="secondary-btn" style="width: auto !important; margin: 0; padding: 6px 14px; font-size: 13px;">
          <span>✕ Close</span>
        </button>
      </div>

      <form id="adminProfileForm" class="admin-credentials-form" autocomplete="off">
        <div id="adminProfileFeedback" class="message" style="display: none; margin-bottom: 18px;"></div>

        <div class="credentials-photo-section" id="credentialsPhotoSection">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <label style="font-weight: 700; color: #1e293b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; margin: 0;">
              <span>📸</span> Profile Picture
            </label>
          </div>

          <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
            <div class="credentials-avatar-interactive" id="credentialsAvatarTrigger" title="Click to upload or change profile photo">
              <img id="credentialsPreviewImg" src="${getProfilePicUrl(currentUser)}" alt="Profile Picture" class="credentials-preview-img" style="border-color: #4f46e5;">
              <div class="avatar-hover-overlay">
                <span>📷</span>
                <small>Change</small>
              </div>
              <div class="avatar-badge-check" style="background: #4f46e5;" title="Active Profile Photo">✓</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 240px;">
              <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                <label for="credentialsPicInput" class="primary-btn" style="cursor: pointer; padding: 8px 16px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px; width: fit-content; margin: 0; border-radius: 10px;">
                  <span>📁 Upload Photo</span>
                  <input type="file" id="credentialsPicInput" accept="image/*, .png, .jpg, .jpeg, .webp, .gif, .svg, .bmp, .ico, .avif, .tif, .tiff, .heic, .heif, *" style="display: none;">
                </label>
                <button type="button" id="credentialsAdjustCropBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px; margin: 0; border-radius: 10px;">
                  <span>✂️ Adjust / Zoom</span>
                </button>
                <button type="button" id="credentialsRemovePicBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; color: #ef4444; border-color: #fecaca; margin: 0; border-radius: 10px;">
                  <span>🗑️ Reset Avatar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-form-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-bottom: 16px;">
          <div>
            <label for="adminProfileName" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
              Administrator Full Name <span style="color: #e11d48;">*</span>
            </label>
            <div class="input-wrap">
              <span class="input-icon">👤</span>
              <input id="adminProfileName" type="text" value="${adminName}" required placeholder="Administrator Full Name">
            </div>
          </div>

          <div>
            <label for="adminProfileUsername" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
              Username <span style="color: #e11d48;">*</span>
            </label>
            <div class="input-wrap">
              <span class="input-icon">🛡️</span>
              <input id="adminProfileUsername" type="text" value="${adminUsername}" required placeholder="Enter username (4–30 chars)">
            </div>
            <small style="display: block; margin-top: 4px; color: #64748b; font-size: 12px;">
              4–30 letters, numbers, dot, dash or underscore.
            </small>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label for="adminProfileEmail" style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
            Administrator Email Address
          </label>
          <div class="input-wrap">
            <span class="input-icon">✉️</span>
            <input id="adminProfileEmail" type="email" value="${adminEmail}" placeholder="admin@smartportal.edu">
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 6px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 6px;">
              <span>🔒</span> Change Admin Password
            </h4>
            <span style="font-size: 12px; color: #64748b;">(Optional — Leave blank to keep existing password)</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            <div>
              <label for="adminAuthUsername" style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px; min-height: 18px;">
                Admin Username
              </label>
              <div class="input-wrap">
                <span class="input-icon">🛡️</span>
                <input id="adminAuthUsername" type="text" placeholder="Enter admin username" autocomplete="username">
              </div>
            </div>

            <div>
              <label for="adminNewPassword" style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px; min-height: 18px;">
                New Password
              </label>
              <div class="password-wrap">
                <span class="input-icon">🔑</span>
                <input id="adminNewPassword" type="password" placeholder="At least 6 characters" autocomplete="new-password">
                <button type="button" class="eye-btn admin-eye-toggle" data-target="adminNewPassword" aria-label="Show password" title="Show password">
                  ${eyeOpenSVG}
                </button>
              </div>
            </div>

            <div>
              <label for="adminConfirmPassword" style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px; min-height: 18px;">
                Confirm New Password
              </label>
              <div class="password-wrap">
                <span class="input-icon">🔒</span>
                <input id="adminConfirmPassword" type="password" placeholder="Re-enter new password" autocomplete="new-password">
                <button type="button" class="eye-btn admin-eye-toggle" data-target="adminConfirmPassword" aria-label="Show password" title="Show password">
                  ${eyeOpenSVG}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: flex-start; gap: 14px; flex-wrap: wrap;">
          <button id="adminSaveProfileBtn" type="submit" class="primary-btn" style="width: auto !important; min-width: 220px; padding: 12px 28px; font-size: 14px; font-weight: 700; margin: 0;">
            <span>💾 Update Profile & Credentials</span>
          </button>
          <button type="button" class="secondary-btn" id="adminCancelBtn" style="margin: 0; padding: 10px 18px;">
            Cancel
          </button>
        </div>
      </form>
    </section>`;
  },
  attendance() {
    if (currentUser.role === "admin") {
      return `<section class="panel"><div class="empty-state" style="text-align:center; padding: 40px 20px;"><span style="font-size:42px; display:block; margin-bottom:12px;">🚫</span><h4 style="font-size:18px; font-weight:700; color:#334155; margin:0 0 8px;">Access Restricted</h4><p style="font-size:14px; color:#64748b; margin:0;">Attendance management is not available in the Admin Portal.</p></div></section>`;
    }
    if (currentUser.role === "faculty") {
      const allFacultySubjects = getFacultyEligibleSubjects(currentUser);
      const subjectObj = subjectById(currentUser.subject) || { name: currentUser.subject || "Subject", icon: "📘" };
      const todayISO = getTodayISODate();
      if (attendanceFilterDate > todayISO) {
        attendanceFilterDate = todayISO;
      }
      const activeClassDivision = getFacultySubjectDivision(currentUser, currentUser.subject);
      const isBothDivisions = !activeClassDivision || activeClassDivision === "Both Divisions" || activeClassDivision === "All Divisions";
      if (!isBothDivisions && !attendanceFilterDivision) {
        attendanceFilterDivision = activeClassDivision;
      }
      const displayDate = formatDateDDMMYY(attendanceFilterDate);

      const facultySem = getSemesterForSubject(currentUser.subject);
      const facultyYear = getCourseYearForSemester(facultySem);

      attendanceFilterSemester = facultySem;
      attendanceFilterCourseYear = facultyYear;

      // Filter students matching faculty subject's semester, courseYear and assigned division
      const allSubjectStudents = getStudentsForSubject(currentUser.subject, activeClassDivision);
      const filteredStudents = allSubjectStudents.filter(s => {
        const studentDiv = s.division || "Div A";
        return !attendanceFilterDivision || studentDiv === attendanceFilterDivision;
      });

      // Find existing daily log for date + class + subject
      const existingLog = (ACADEMIC.dailyAttendance || []).find(entry =>
        entry.subject === currentUser.subject &&
        entry.isoDate === attendanceFilterDate &&
        entry.division === attendanceFilterDivision &&
        entry.semester === attendanceFilterSemester &&
        entry.courseYear === attendanceFilterCourseYear
      );

      // Sync activeAttendanceMap (defaults to unselected "")
      activeAttendanceMap = {};
      filteredStudents.forEach(s => {
        if (existingLog && existingLog.records && existingLog.records[s.username]) {
          activeAttendanceMap[s.username] = existingLog.records[s.username];
        } else {
          activeAttendanceMap[s.username] = "";
        }
      });

      // Get stored logs for this subject
      const subjectLogs = (ACADEMIC.dailyAttendance || [])
        .filter(entry => entry.subject === currentUser.subject)
        .sort((a, b) => (b.isoDate || "").localeCompare(a.isoDate || ""));

      const historyRows = subjectLogs.map(log => {
        const total = Object.keys(log.records || {}).length;
        const presents = Object.values(log.records || {}).filter(val => val === "P").length;
        const absents = total - presents;
        return `
          <tr>
            <td><strong class="date-highlight">${log.date || formatDateDDMMYY(log.isoDate)}</strong></td>
            <td><span class="chip-sm">${log.courseYear || "2nd Year"} • ${log.semester || "3rd Sem"} • ${log.division || "Sec A"}</span></td>
            <td><span class="badge-p">${presents} P</span> <span class="badge-a">${absents} A</span></td>
            <td>
              <div class="action-buttons-wrap">
                <button type="button" class="btn-sm edit-log-btn" 
                  data-date="${log.isoDate}" 
                  data-div="${log.division}" 
                  data-sem="${log.semester}" 
                  data-year="${log.courseYear}">
                  ✏️ Edit
                </button>
                <button type="button" class="btn-sm load-log-btn" 
                  data-date="${log.isoDate}" 
                  data-div="${log.division}" 
                  data-sem="${log.semester}" 
                  data-year="${log.courseYear}">
                  📥 Load
                </button>
                <button type="button" class="btn-sm delete-log-btn" 
                  data-date="${log.isoDate}" 
                  data-div="${log.division}" 
                  data-sem="${log.semester}" 
                  data-year="${log.courseYear}">
                  🗑️ Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");

      return `
        <section class="panel attendance-panel">
          <div class="panel-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 style="margin:0;">Daily Attendance Entry</h3>
              <small style="color:#64748b; font-weight:600;">Managing: <strong>${subjectObj.name}</strong> • ${facultySem} (${facultyYear})</small>
            </div>
            <div class="active-class-badge" style="display:inline-flex; align-items:center; gap:6px; background:#e0e7ff; color:#3730a3; padding:6px 14px; border-radius:8px; font-weight:700; font-size:13px;">
              <span>📚</span> Active Class: ${subjectObj.name} — ${facultySem} (${facultyYear})
            </div>
          </div>
          <div class="attendance-filters-grid">
            <div class="filter-group">
              <label for="attCourseYearSelect">1. Course Year</label>
              <select id="attCourseYearSelect" class="filter-select" disabled style="background:#f1f5f9; cursor:not-allowed; opacity:0.9;">
                <option value="${facultyYear}" selected>${facultyYear}</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="attSemesterSelect">2. Semester</label>
              <select id="attSemesterSelect" class="filter-select" disabled style="background:#f1f5f9; cursor:not-allowed; opacity:0.9;">
                <option value="${facultySem}" selected>${facultySem}</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="attDivisionSelect">3. Division ${isBothDivisions ? '(All Divisions)' : `(Assigned: ${activeClassDivision})`}</label>
              <select id="attDivisionSelect" class="filter-select" ${isAttendanceDetailsEntered ? 'disabled' : ''}>
                ${isBothDivisions ? '<option value="" ' + (!attendanceFilterDivision ? 'selected' : '') + '>-- Select Division --</option>' : ''}
                ${isBothDivisions
                  ? getAvailableDivisions().map(d => `<option value="${escapeHtml(d)}" ${attendanceFilterDivision === d ? "selected" : ""}>${escapeHtml(d)}</option>`).join("")
                  : `<option value="${escapeHtml(activeClassDivision)}" selected>${escapeHtml(activeClassDivision)}</option>`
                }
              </select>
            </div>

            <div class="filter-group">
              <label for="attDateInput">4. Particular Date (DD-MM-YY)</label>
              <div class="date-input-wrap">
                <input type="date" id="attDateInput" max="${todayISO}" value="${attendanceFilterDate}" class="filter-input-date">
                <span class="date-formatted-badge">📅 ${displayDate}</span>
              </div>
            </div>

            <div style="grid-column: 1 / -1; display: flex; gap: 12px; align-items: center; margin-top: 6px;">
              <button type="button" id="submitAttDetailsBtn" class="primary-btn" style="padding: 10px 22px; font-size: 14px;">
                <span>🔍 Fetch Attendance</span>
              </button>
              <button type="button" id="resetAttDetailsBtn" class="secondary-btn" style="padding: 10px 22px; font-size: 14px;">
                <span>🔄 Reset Details</span>
              </button>
            </div>
            <p id="attFilterErrorMsg" class="message error" style="display:none; grid-column:1/-1; margin-top:6px;"></p>
            ${attendanceSaveSuccessMessage ? `
              <p id="attFilterSuccessMsg" class="message success" style="grid-column:1/-1; margin-top:6px;">${attendanceSaveSuccessMessage}</p>
            ` : ''}
          </div>

          ${isAttendanceDetailsEntered ? `
            <div class="attendance-header-banner">
              <div class="att-title-info">
                <h4>Attendance Sheet: <span>${attendanceFilterCourseYear}</span> • <span>${attendanceFilterSemester}</span> • <span>${attendanceFilterDivision}</span></h4>
                <p>Date: <strong class="date-highlight">${displayDate}</strong> | Subject: <strong>${subjectObj.name}</strong> ${existingLog ? `<span class="badge-p" style="margin-left:8px;">Saved Record Loaded</span>` : ''}</p>
              </div>
            </div>

            ${filteredStudents.length ? `
              <div class="student-att-list">
                <table class="att-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Username</th>
                      <th>Course Year, Semester & Division</th>
                      <th style="text-align:center;">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredStudents.map((s, idx) => {
        const status = activeAttendanceMap[s.username] || "";
        return `
                        <tr data-username="${s.username}">
                          <td>${idx + 1}</td>
                          <td><strong class="student-name">${s.name}</strong></td>
                          <td><code class="uucms-code">${s.username}</code></td>
                          <td><span class="chip-sm">${s.courseYear || "2nd Year"} • ${s.semester || "3rd Sem"} • ${s.division || "Sec A"}</span></td>
                          <td style="text-align:center;">
                            <div class="pa-toggle-group">
                              <button type="button" class="btn-pa btn-p ${status === "P" ? "active" : ""}" ${isAttendanceReadOnly ? 'disabled style="pointer-events:none; opacity:0.85;"' : ''} data-username="${s.username}" data-status="P" title="P">P</button>
                              <button type="button" class="btn-pa btn-a ${status === "A" ? "active" : ""}" ${isAttendanceReadOnly ? 'disabled style="pointer-events:none; opacity:0.85;"' : ''} data-username="${s.username}" data-status="A" title="A">A</button>
                            </div>
                          </td>
                        </tr>
                      `;
      }).join("")}
                  </tbody>
                </table>
              </div>

              ${!isAttendanceReadOnly ? `
                <div class="att-submit-bar">
                  <button type="button" id="saveDailyAttendanceBtn" class="primary-btn save-att-btn">
                    <span>💾 Save Daily Attendance (${displayDate})</span>
                    <span class="arrow">→</span>
                  </button>
                  <p id="attSaveMessage" class="message"></p>
                </div>
              ` : ''}
            ` : `
              <div class="empty-state" style="text-align:center; padding: 40px 20px;">
                <span class="empty-icon" style="font-size:36px; display:block; margin-bottom:10px;">👥</span>
                <p style="font-size:16px; font-weight:700; color:#475569; margin:0 0 6px;">No students found for ${attendanceFilterCourseYear}, ${attendanceFilterSemester}, ${attendanceFilterDivision}.</p>
                <small style="color:#94a3b8;">Try changing the division dropdown above and click Fetch Attendance.</small>
              </div>
            `}
          ` : `
            <div class="empty-state" style="text-align:center; padding: 40px 20px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; margin-top:20px;">
              <span style="font-size:42px; display:block; margin-bottom:12px;">📝</span>
              <h4 style="font-size:18px; font-weight:700; color:#334155; margin:0 0 8px;">Select Attendance Details</h4>
              <p style="font-size:14px; color:#64748b; margin:0;">Please select <strong>Division</strong>, and <strong>Date</strong> above, then click <strong>Fetch Attendance</strong> to load students list.</p>
            </div>
          `}
        </section>

        <section class="panel attendance-history-panel" style="margin-top:24px;">
          <div class="panel-head">
            <h3>Stored Daily Attendance Records (${subjectObj.name})</h3>
            <div style="display:flex; gap:8px; align-items:center;">
              <span class="badge">Subject Logs</span>
              ${historyRows ? `
                <button type="button" id="deleteAllLogsBtn" class="badge badge-clear-all">
                  🗑️ Clear All
                </button>
              ` : ''}
            </div>
          </div>
          ${historyRows ? `
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date (DD-MM-YY)</th>
                    <th>Course Year, Semester & Division</th>
                    <th>Attendance Summary</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${historyRows}
                </tbody>
              </table>
            </div>
          ` : `
            <p style="color:#64748b; font-size:14px; padding:12px 0;">No attendance records stored for ${subjectObj.name} yet.</p>
          `}
        </section>
      `;
    }

    // Student view
    const record = getStudentRecord(currentUser.username);
    const studentSubjects = getSubjectsForStudent(currentUser);
    const ids = studentSubjects.map(s => s.id);
    const studentUser = currentUser;

    // Group student's daily attendance records by date
    const dailyLogsByDate = {};
    (ACADEMIC.dailyAttendance || []).forEach(log => {
      if (log.records && log.records[studentUser.username] !== undefined) {
        const dateKey = log.isoDate || log.date || "unknown";
        if (!dailyLogsByDate[dateKey]) {
          dailyLogsByDate[dateKey] = {
            dateKey: dateKey,
            displayDate: log.date || formatDateDDMMYY(log.isoDate),
            entries: []
          };
        }
        const subj = subjectById(log.subject) || { name: log.subject || "Subject", icon: "" };
        const status = log.records[studentUser.username];
        dailyLogsByDate[dateKey].entries.push({
          subjectId: log.subject,
          subjectName: subj.name,
          subjectIcon: subj.icon,
          status: status
        });
      }
    });

    const sortedDateKeys = Object.keys(dailyLogsByDate).sort((a, b) => b.localeCompare(a));

    const myLogRows = sortedDateKeys.map((dateKey, index) => {
      const dateObj = dailyLogsByDate[dateKey];
      const totalSubjects = dateObj.entries.length;
      const presents = dateObj.entries.filter(e => e.status === "P").length;
      const absents = totalSubjects - presents;

      const subjectItemsMarkup = dateObj.entries.map(e => `
        <div class="daily-subject-item">
          <div class="subj-info">
            ${e.subjectIcon ? `<span class="subj-icon">${e.subjectIcon}</span>` : ''}
            <span class="subj-name">${e.subjectName}</span>
          </div>
          <div class="subj-status">
            ${e.status === "P"
          ? '<span class="badge-p">P</span>'
          : '<span class="badge-a">A</span>'}
          </div>
        </div>
      `).join("");

      const rowId = `student-date-detail-${index}`;

      return `
        <tr class="student-date-row" data-target="${rowId}">
          <td>
            <button type="button" class="btn-date-toggle" data-target="${rowId}" aria-expanded="false" title="Click/Tap to view subject attendance">
              <span class="date-highlight">📅 ${dateObj.displayDate}</span>
              <span class="toggle-chevron">▼</span>
            </button>
          </td>
          <td>
            <span class="chip-sm">${totalSubjects} ${totalSubjects === 1 ? 'Subject Class' : 'Subject Classes'}</span>
          </td>
          <td>
            <span class="badge-p">${presents} P</span> ${absents > 0 ? `<span class="badge-a">${absents} A</span>` : ''}
          </td>
        </tr>
        <tr id="${rowId}" class="daily-subject-expand-row" style="display: none;">
          <td colspan="3">
            <div class="daily-subject-expand-panel">
              <div class="expand-header">
                <h5>Subjects & Attendance Status for <span>${dateObj.displayDate}</span></h5>
              </div>
              <div class="daily-subject-list">
                ${subjectItemsMarkup}
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    return `
      <section class="panel">
        <div class="panel-head">
          <h3>Subject Attendance Summary</h3>
          <div style="display:flex; gap:10px; align-items:center;">
            <button type="button" class="ai-analysis-btn ai-analysis-btn-sm" onclick="openAiAnalysisModal('${currentUser.username}', 'attendance')">
              <span>📊 AI Attendance Analysis</span>
            </button>
            <span class="badge">Overall Progress</span>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th style="text-align:center;">No. Of Classes Taken</th>
                <th style="text-align:center;">No. of Classes Attended</th>
                <th style="text-align:center;">Overall Attendance (%)</th>
              </tr>
            </thead>
            <tbody>
              ${ids.map(id => {
      const s = subjectById(id);
      const stats = getSubjectClassesSummary(currentUser.username, id);
      const isGood = stats.overallPct >= 75;
      return `
                  <tr>
                    <td>${s.icon ? s.icon + ' ' : ''}<b>${s.name}</b></td>
                    <td style="text-align:center; font-weight:700; color:#334155; font-size:15px;">${stats.classesTaken}</td>
                    <td style="text-align:center; font-weight:700; color:#334155; font-size:15px;">${stats.classesAttended}</td>
                    <td style="text-align:center; vertical-align:middle;">
                      <div class="att-circle-badge ${isGood ? 'good' : 'warn'}">
                        ${stats.overallPct}%
                      </div>
                    </td>
                  </tr>
                `;
    }).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel" style="margin-top:24px;">
        <div class="panel-head">
          <h3>My Daily Attendance Log</h3>
          <span class="badge">Class History</span>
        </div>
        ${myLogRows ? `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Classes Logged</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                ${myLogRows}
              </tbody>
            </table>
          </div>
        ` : `
          <p style="color:#64748b; font-size:14px; padding:12px 0;">No daily attendance records logged yet.</p>
        `}
      </section>
    `;
  },
  marks() {
    if (currentUser.role === "admin") {
      return `<section class="panel"><div class="empty-state" style="text-align:center; padding: 40px 20px;"><span style="font-size:42px; display:block; margin-bottom:12px;">🚫</span><h4 style="font-size:18px; font-weight:700; color:#334155; margin:0 0 8px;">Access Restricted</h4><p style="font-size:14px; color:#64748b; margin:0;">Marks management is not available in the Admin Portal.</p></div></section>`;
    }
    if (currentUser.role === "faculty") {
      const allFacultySubjects = getFacultyEligibleSubjects(currentUser);
      const subjectObj = subjectById(currentUser.subject) || { name: currentUser.subject || "Subject", icon: "📘" };
      const facultySem = getSemesterForSubject(currentUser.subject);
      const facultyYear = getCourseYearForSemester(facultySem);

      const activeClassDivision = getFacultySubjectDivision(currentUser, currentUser.subject);
      const filteredStudents = getStudentsForSubject(currentUser.subject, activeClassDivision);

      const config = getSubjectMarksConfig(currentUser.subject);
      const maxI1 = config.maxInternal1 || 20;
      const maxI2 = config.maxInternal2 || 20;
      const maxTotal = maxI1 + maxI2 + 10;

      const studentOptions = filteredStudents.length
        ? `<option value="" selected>-- Select Student --</option>` + filteredStudents.map(s => `<option value="${s.username}">${s.name} (${s.username}) - ${s.division || 'Sec A'}</option>`).join("")
        : `<option value="">No students available in ${facultySem}</option>`;

      const rows = filteredStudents.map((s, idx) => {
        const record = getStudentRecord(s.username);
        const marksObj = (record && record.marks && typeof record.marks === "object") ? record.marks : {};
        const m = marksObj[currentUser.subject];
        let i1Val = "";
        let i2Val = "";
        let assignVal = "";

        if (m && typeof m === "object") {
          i1Val = typeof m.internal1 === "number" ? m.internal1 : (m.internal1 ?? "");
          i2Val = typeof m.internal2 === "number" ? m.internal2 : (m.internal2 ?? "");
          assignVal = typeof m.assignment === "number" ? m.assignment : (m.assignment ?? "");
        } else if (typeof m === "number") {
          i1Val = m;
        }

        const i1Num = parseFloat(i1Val);
        const i2Num = parseFloat(i2Val);
        const assignNum = parseFloat(assignVal);

        let totalText = "Not set";
        if (!isNaN(i1Num) || !isNaN(i2Num) || !isNaN(assignNum)) {
          const tot = (isNaN(i1Num) ? 0 : i1Num) + (isNaN(i2Num) ? 0 : i2Num) + (isNaN(assignNum) ? 0 : assignNum);
          totalText = `<strong>${tot}</strong> / ${maxTotal}`;
        }

        return `
          <tr data-student-row="${s.username}">
            <td>${idx + 1}</td>
            <td><strong class="student-name">${s.name}</strong></td>
            <td><code class="uucms-code">${s.username}</code></td>
            <td><code class="uucms-code">${s.division || 'Div A'}</code></td>
            <td>
              <input type="number" 
                class="marks-input-field" 
                data-username="${s.username}" 
                data-field="internal1" 
                min="0" max="${maxI1}" step="0.5" 
                value="${i1Val}" 
                placeholder="0"
                style="width: 100px; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 600;">
            </td>
            <td>
              <input type="number" 
                class="marks-input-field" 
                data-username="${s.username}" 
                data-field="internal2" 
                min="0" max="${maxI2}" step="0.5" 
                value="${i2Val}" 
                placeholder="0"
                style="width: 100px; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 600;">
            </td>
            <td>
              <input type="number" 
                class="marks-input-field" 
                data-username="${s.username}" 
                data-field="assignment" 
                min="0" max="10" step="0.5" 
                value="${assignVal}" 
                placeholder="0"
                style="width: 90px; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 600;">
            </td>
            <td>
              <span id="total-badge-${s.username}" class="badge-p">${totalText}</span>
            </td>
          </tr>
        `;
      }).join("");

      return `
        <section class="panel">
          <div class="panel-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h3>Subject Internal Exam Max Marks Configuration (${subjectObj.name})</h3>
              <small style="color:#64748b; font-weight:600;">Faculty can select whether 1st Internal & 2nd Internal exams are out of 20 or 40 marks for ${facultySem} (${facultyYear}).</small>
            </div>
            <div class="active-class-badge" style="display:inline-flex; align-items:center; gap:6px; background:#dbeafe; color:#1e40af; padding:6px 14px; border-radius:8px; font-weight:700; font-size:13px;">
              <span>📊</span> Active Class: ${subjectObj.name} — ${facultySem} (${facultyYear})
            </div>
          </div>
          <form id="maxMarksConfigForm" style="display:flex; gap:16px; align-items:flex-end; flex-wrap:wrap; background:#f8fafc; padding:14px 18px; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:16px;">
            <div>
              <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">1st Internal Max Marks</label>
              <select id="maxInternal1Select" class="filter-select" style="width:140px;">
                <option value="20" ${maxI1 === 20 ? "selected" : ""}>Out of 20</option>
                <option value="40" ${maxI1 === 40 ? "selected" : ""}>Out of 40</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">2nd Internal Max Marks</label>
              <select id="maxInternal2Select" class="filter-select" style="width:140px;">
                <option value="20" ${maxI2 === 20 ? "selected" : ""}>Out of 20</option>
                <option value="40" ${maxI2 === 40 ? "selected" : ""}>Out of 40</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Assignment Max Marks</label>
              <input type="text" value="Out of 10 (Fixed)" disabled class="filter-select" style="width:150px; background:#f1f5f9; cursor:not-allowed;">
            </div>
            <div>
              <button type="submit" class="secondary-btn" style="padding:10px 18px; font-size:13px; font-weight:700;">⚙️ Update Max Marks</button>
            </div>
          </form>
        </section>

        <section class="panel" style="margin-top:20px;">
          <div class="panel-head">
            <div>
              <h3>Student Marks Entry Table (${subjectObj.name})</h3>
              <small style="color:#64748b; font-weight:600;">${facultySem} (${facultyYear}) • Enter marks directly in the table below</small>
            </div>
            <span class="badge">Faculty Table Entry</span>
          </div>

          ${filteredStudents.length ? `
            <form id="marksBatchForm">
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Username</th>
                      <th>Division</th>
                      <th>1st Internal</th>
                      <th>2nd Internal</th>
                      <th>Assignment</th>
                      <th>Total Marks (Out of ${maxTotal})</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows}
                  </tbody>
                </table>
              </div>
              <div style="display:flex; gap:16px; align-items:center; margin-top:16px; padding-top:12px; border-top:1px solid #e2e8f0;">
                <button type="submit" id="saveBatchMarksBtn" class="primary-btn" style="padding:10px 24px; font-size:14px;">
                  <span>💾 Save All Student Marks</span>
                  <span class="arrow">→</span>
                </button>
                <p id="marksBatchMessage" class="message"></p>
              </div>
            </form>
          ` : `
            <div class="empty-state" style="text-align:center; padding:40px 20px;">
              <p style="font-size:16px; font-weight:700; color:#475569; margin:0 0 6px;">No students found for ${facultySem} (${facultyYear}).</p>
            </div>
          `}
        </section>
      `;
    }

    // Student View
    const record = getStudentRecord(currentUser.username);
    const studentSubjects = getSubjectsForStudent(currentUser);

    const studentRows = studentSubjects.map((s, idx) => {
      const m = record.marks[s.id];
      let i1Text = "Not set";
      let i2Text = "Not set";
      let assignText = "Not set";
      let totalText = "Not set";

      if (m && typeof m === "object") {
        const i1 = typeof m.internal1 === "number" ? m.internal1 : null;
        const i2 = typeof m.internal2 === "number" ? m.internal2 : null;
        const assign = typeof m.assignment === "number" ? m.assignment : null;
        const m1Max = m.maxInternal1 || 20;
        const m2Max = m.maxInternal2 || 20;

        i1Text = i1 !== null ? `${i1}` : "Not set";
        i2Text = i2 !== null ? `${i2}` : "Not set";
        assignText = assign !== null ? `${assign}` : "Not set";

        if (i1 !== null || i2 !== null || assign !== null) {
          const tot = (i1 || 0) + (i2 || 0) + (assign || 0);
          const totMax = m1Max + m2Max + 10;
          totalText = `<strong>${tot}</strong> / ${totMax}`;
        }
      } else if (typeof m === "number") {
        totalText = `${m} / 100`;
      }

      return `
        <tr>
          <td>${idx + 1}</td>
          <td><strong class="student-name">${s.name}</strong></td>
          <td><span class="chip-sm">${i1Text}</span></td>
          <td><span class="chip-sm">${i2Text}</span></td>
          <td><span class="chip-sm">${assignText}</span></td>
          <td><span class="badge-p">${totalText}</span></td>
        </tr>
      `;
    }).join("");

    return `
      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Academic Marks Statement</h3>
            <small style="color:#64748b;">Detailed breakdown of Internal Exams & Assignment Marks • ${currentUser.semester || '1st Semester'} (${currentUser.division || 'Div A'})</small>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <button type="button" class="ai-analysis-btn ai-analysis-btn-sm" onclick="openAiAnalysisModal('${currentUser.username}', 'marks')">
              <span>📈 AI Marks Analysis</span>
            </button>
            <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">${currentUser.division || 'Div A'} • Student Statement</span>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Subject Name</th>
                <th>1st Internal</th>
                <th>2nd Internal</th>
                <th>Assignment</th>
                <th>Total Marks</th>
              </tr>
            </thead>
            <tbody>
              ${studentRows.length ? studentRows : `<tr><td colspan="6" style="text-align:center;">No marks available.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },
  assignments() {
    if (currentUser.role === "faculty") {
      const allFacultySubjects = getFacultyEligibleSubjects(currentUser);
      const subjectObj = subjectById(currentUser.subject) || { name: currentUser.subject || "Subject", icon: "📘" };
      const activeClassDivision = getFacultySubjectDivision(currentUser, currentUser.subject);
      const targetStudents = getStudentsForSubject(currentUser.subject, activeClassDivision);
      const subjectAssignments = getSubjectAssignments(currentUser.subject);
      let list = subjectAssignments;
      if (assignmentFilterDivision && assignmentFilterDivision !== "All Divisions") {
        list = list.filter(a => {
          const aDiv = a.targetDivision || "All Divisions";
          if (aDiv === assignmentFilterDivision || aDiv === "All Divisions") return true;
          const st = (USERS.student || []).find(u => String(u.username).toLowerCase() === String(a.student).toLowerCase());
          const div = st ? (st.division || "Div A") : "Div A";
          return div === assignmentFilterDivision;
        });
      }

      const qInitial = (assignmentSearchQuery || "").trim().toLowerCase();
      let initialVisibleCount = 0;
      list.forEach(a => {
        const st = (USERS.student || []).find(u => String(u.username).toLowerCase() === String(a.student).toLowerCase());
        const studentName = st ? st.name.toLowerCase() : "";
        const studentUsername = String(a.student).toLowerCase();
        const title = String(a.title || "").toLowerCase();
        const matches = !qInitial || studentName.includes(qInitial) || studentUsername.includes(qInitial) || title.includes(qInitial);
        if (matches) initialVisibleCount++;
      });

      const facultySem = getSemesterForSubject(currentUser.subject);
      const facultyYear = getCourseYearForSemester(facultySem);

      return `<section class="panel">
        <div class="panel-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h3 style="margin:0;">Assignments</h3>
            <small style="color:#64748b; font-weight:600;">Active Class: <strong>${subjectObj.name}</strong> • ${facultySem} (${facultyYear}) • Assigned: <strong>${activeClassDivision || 'All Divisions'}</strong></small>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="badge" style="background:#eef2ff; color:#4338ca; border:1px solid #c7d2fe; font-weight:700; padding:6px 12px;">Active Class: ${subjectObj.name} — ${facultySem} (${facultyYear})</span>
            <span class="badge">Faculty Input</span>
          </div>
        </div>
        <form id="assignmentForm" class="entry-form" style="display:flex; flex-direction:column; gap:16px;">
        <input type="hidden" id="assignmentTargetSubject" value="${currentUser.subject}">

        <div style="margin-bottom:4px;">
          <label style="display:block; margin-bottom:6px; font-weight:700; color:#334155; font-size:13px;">Assignment Title</label>
          <div class="input-wrap"><input id="assignmentTitle" type="text" required placeholder="Enter assignment title (e.g. Unit 1 Assignment)"></div>
        </div>

        <div style="margin-bottom:4px;">
          <label style="display:block; margin-bottom:6px; font-weight:700; color:#334155; font-size:13px;">Details / Description (Text)</label>
          <div class="input-wrap"><textarea id="assignmentDescription" rows="3" placeholder="Enter assignment instructions, guidelines, or questions..." style="width: 100%; height: 97px; resize: vertical;"></textarea></div>
        </div>

        <div style="margin-bottom:4px;">
          <label style="display:block; margin-bottom:6px; font-weight:700; color:#334155; font-size:13px;">Attach Document File (Optional)</label>
          <div class="input-wrap"><input id="assignmentDocFile" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.zip" style="padding:6px; font-size:13px;"></div>
        </div>

        <div style="margin-bottom:4px;">
          <label style="display:block; margin-bottom:6px; font-weight:700; color:#334155; font-size:13px;">Submission Date</label>
          <div class="input-wrap"><input id="assignmentDue" type="date" required></div>
        </div>

        <div style="margin-top:6px;">
          <button class="primary-btn" type="submit"><span>Add Assignment</span><span class="arrow">→</span></button>
        </div>
        <p id="assignmentMessage" class="message"></p></form>
        
        <div class="panel-head" style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <div>
            <h3>Student Assignment Status Sheet</h3>
            <small style="color:#64748b;">Manage student assignment submission statuses for ${subjectObj.name}</small>
          </div>
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <div class="assignment-search-box">
              <span class="assignment-search-icon">🔍</span>
              <input id="assignmentStudentSearch" type="text" class="assignment-search-input" placeholder="Search student name or USN..." value="${assignmentSearchQuery || ''}">
              <button type="button" id="clearAssignmentSearch" class="assignment-search-clear" title="Clear search" style="${assignmentSearchQuery ? 'display:inline-block;' : 'display:none;'}">✕</button>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:#475569;">Filter Division:</label>
              <select id="assignmentDivisionFilter" class="filter-select" style="padding: 4px 10px; font-size:13px; font-weight:600;">
                <option value="All Divisions" ${assignmentFilterDivision === "All Divisions" ? "selected" : ""}>All Divisions</option>
                <option value="Div A" ${assignmentFilterDivision === "Div A" ? "selected" : ""}>Div A</option>
                <option value="Div B" ${assignmentFilterDivision === "Div B" ? "selected" : ""}>Div B</option>
              </select>
            </div>
            <span id="assignmentRecordCount" class="table-count-badge">${qInitial ? initialVisibleCount : list.length} Records</span>
            ${list.length ? `<button type="button" id="btnClearAllAssignments" class="btn-clear-all" title="Clear assignment status records">🗑️ Clear All</button>` : ''}
          </div>
        </div>

        ${list.length ? `
          <div class="table-wrap compact-status-sheet" style="margin-top: 12px;">
            <table class="att-table compact-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Username</th>
                  <th>Division</th>
                  <th>Assignment Title</th>
                  <th>Submission Date</th>
                  <th>Submitted Date</th>
                  <th style="text-align:center;">Status Control</th>
                  <th style="text-align:center;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${list.map((a, idx) => {
        const globalIdx = subjectAssignments.indexOf(a);
        const st = (USERS.student || []).find(u => String(u.username).toLowerCase() === String(a.student).toLowerCase());
        const studentName = st ? st.name : a.student;
        const studentDiv = st ? (st.division || "Div A") : "Div A";
        const formattedDue = formatDateDDOrdinalMonth(a.due);
        const formattedSubmitted = a.status === "Submitted"
          ? (a.submittedDate ? formatDateDDOrdinalMonth(a.submittedDate) : "Submitted")
          : `<span style="color:#94a3b8;">Not Submitted</span>`;
        const hasAttachments = !!a.fileData;
        const matches = !qInitial || studentName.toLowerCase().includes(qInitial) || String(a.student).toLowerCase().includes(qInitial) || String(a.title || "").toLowerCase().includes(qInitial);

        return `
                    <tr class="assignment-table-row" data-student-name="${(studentName || '').replace(/"/g, '&quot;')}" data-student-username="${(a.student || '').replace(/"/g, '&quot;')}" data-assignment-title="${(a.title || '').replace(/"/g, '&quot;')}" style="${matches ? '' : 'display:none;'}">
                      <td style="font-size:11px; text-align:center;">${idx + 1}</td>
                      <td><strong class="student-name">${studentName}</strong></td>
                      <td><code class="uucms-code" style="font-weight:700; font-size:12px; color:#0f172a;">${a.student}</code></td>
                      <td><span class="chip-sm" style="background:#f1f5f9; color:#475569; padding:0px 5px; border-radius:4px; font-weight:600; font-size:10.5px;">${studentDiv}</span></td>
                      <td><span style="color:#475569; font-size:11px; font-weight:400;">${a.title}</span></td>
                      <td style="font-size:11px;">${formattedDue}</td>
                      <td style="font-size:11px;">${formattedSubmitted}</td>
                      <td style="text-align:center;">
                        <div class="pa-toggle-group" style="justify-content:center; gap: 4px;">
                          <button type="button" class="btn-assign-status btn-pend ${a.status === "Pending" ? "active" : ""} btn-faculty-set-status" data-assign-index="${globalIdx}" data-student="${a.student}" data-title="${encodeURIComponent(a.title || '')}" data-due="${a.due}" data-status="Pending" title="Set Pending">Pending</button>
                          <button type="button" class="btn-assign-status btn-sub ${a.status === "Submitted" ? "active" : ""} btn-faculty-set-status" data-assign-index="${globalIdx}" data-student="${a.student}" data-title="${encodeURIComponent(a.title || '')}" data-due="${a.due}" data-status="Submitted" title="Set Submitted">Submitted</button>
                        </div>
                      </td>
                      <td style="text-align:center;">
                        <button type="button" class="btn-assign-status btn-del btn-delete-assignment" data-assign-index="${globalIdx}" data-student="${a.student}" data-title="${encodeURIComponent(a.title || '')}" data-due="${a.due}" title="Delete Record">🗑️ Delete</button>
                      </td>
                    </tr>
                  `;
      }).join("")}
                <tr id="assignmentNoResultsRow" style="${(initialVisibleCount === 0 && list.length > 0) ? '' : 'display:none;'}">
                  <td colspan="9" style="text-align:center; padding: 16px; color: #64748b;">
                    🔍 No student records found matching your search.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state" style="text-align:center; padding: 30px 20px;">
            <p style="font-size:15px; color:#64748b; margin:0;">No assignments entered for this subject yet.</p>
          </div>
        `}
      </section>`;
    }
    const list = getStudentAssignments(currentUser.username);
    return `<section class="panel">
      <div class="panel-head">
        <div>
          <h3>My Assignments</h3>
          <small style="color:#64748b;">View assignment details and submission status</small>
        </div>
        <span class="badge">Student View</span>
      </div>
      <div class="assignment-list">${list.length ? list.map(a => {
      const s = subjectById(a.subject);
      const hasAttachments = !!a.fileData;
      const formattedDue = formatDateDDOrdinalMonth(a.due);
      const formattedSubmitted = a.submittedDate ? formatDateDDOrdinalMonth(a.submittedDate) : "";
      return `<article class="assignment"><div class="assignment-icon">${s ? s.icon : '📝'}</div><div class="assignment-main"><b style="font-size:15px; color:#1e293b;">${a.title}</b>${a.description ? `<p class="assignment-desc">${a.description}</p>` : ''}${hasAttachments ? `<div class="assignment-attachments">${a.fileData ? `<a href="${a.fileData}" download="${a.fileName || 'Assignment_Document'}" class="btn-doc-download"><span style="font-size:14px;">📄</span> ${a.fileName || 'Download Document'}</a>` : ''}</div>` : ''}<small style="margin-top:6px; color:#64748b;">${s ? s.name : ''} • <strong>Submission Date:</strong> ${formattedDue}${a.status === "Submitted" && formattedSubmitted ? ` • <span style="color:#16a34a; font-weight:600;">Submitted on ${formattedSubmitted}</span>` : ''}</small></div><div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;"><span class="status ${a.status === "Submitted" ? "good" : "warn"}" style="padding:6px 14px; font-size:13px; font-weight:600; border-radius:20px; text-transform:uppercase;">${a.status === "Submitted" ? "✓ Submitted" : "⏳ Pending"}</span></div></article>`;
    }).join("") : `<div class="empty-state">No assignments assigned to you yet.</div>`}</div></section>`;
  },
  notes() {
    const isFaculty = currentUser.role === "faculty";
    const isStudent = currentUser.role === "student";

    if (isFaculty) {
      const allFacultySubjects = getFacultyEligibleSubjects(currentUser);
      const facultySub = subjectById(currentUser.subject);
      const subjectName = facultySub ? facultySub.name : (currentUser.subject || "Subject");
      const subjectShort = facultySub ? facultySub.short : (currentUser.subject || "Subject");
      const subjectIcon = facultySub ? facultySub.icon : "📚";

      const allFacultySubIds = allFacultySubjects.map(s => s.id);
      const facultyNotes = (ACADEMIC.notes || []).filter(n =>
        n.uploadedBy === currentUser.username ||
        allFacultySubIds.includes(n.subject) ||
        n.subject === currentUser.subject
      );

      const facultySem = getSemesterForSubject(currentUser.subject);
      const facultyYear = getCourseYearForSemester(facultySem);
      const activeClassDivision = getFacultySubjectDivision(currentUser, currentUser.subject);

      return `<section class="panel">
        <div class="panel-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="margin:0;">Subject Notes & Study Materials</h3>
            <small style="color:#64748b; font-weight:600;">Active Class: <strong>${subjectName}</strong> • ${facultySem} (${facultyYear}) • Assigned: <strong>${activeClassDivision || 'All Divisions'}</strong></small>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="badge" style="background:#e0f2fe; color:#0369a1; padding:6px 12px; font-weight:700;">Active Class: ${subjectName} — ${facultySem} (${facultyYear})</span>
            <span class="badge" style="background:#e0f2fe; color:#0369a1; padding:6px 12px; font-weight:700;">Faculty Portal</span>
          </div>
        </div>

        <form id="notesUploadForm" class="entry-form" style="background:#f8fafc; border:1px solid #e2e8f0; padding:18px; border-radius:12px; margin-bottom:24px;">
          <input type="hidden" id="notesTargetSubject" value="${currentUser.subject}">
          <h4 style="margin:0 0 14px 0; color:#1e293b; display:flex; align-items:center; gap:6px;"><span>📤</span> Share New Study Notes</h4>
          
          <label style="font-weight:700; color:#334155;">1. Note Title / Topic</label>
          <div class="input-wrap" style="margin-bottom:14px;">
            <span class="input-icon">📝</span>
            <input id="notesTitle" type="text" required placeholder="e.g. Module 1 Notes - Data Structures & Algorithms">
          </div>

          <div style="margin-bottom:16px;">
            <label style="font-weight:700; color:#334155; display:block; margin-bottom:6px;">2. Attach Document (PDF, Word, TXT, PPT, Images)</label>
            <div class="input-wrap">
              <input id="notesFile" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*" style="padding:6px; font-size:13px; width:100%;">
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:12px;">
            <button id="btnUploadNotes" class="primary-btn" type="button" style="height:38px; padding:0 22px; font-weight:700;">
              <span>📤 Upload & Share Notes</span>
            </button>
            <p id="notesMessage" class="message" style="margin:0; font-weight:600;"></p>
          </div>
        </form>

        <h4 style="margin:0 0 14px 0; color:#1e293b; display:flex; align-items:center; gap:6px;"><span>📚</span> Shared Notes History (${facultyNotes.length})</h4>
        <div class="assignment-list">
          ${facultyNotes.length ? facultyNotes.map(n => {
        const hasFile = !!n.fileData;
        const sub = subjectById(n.subject) || { name: n.subject, icon: "📚" };
        return `<article class="assignment" style="border-left:4px solid #0284c7;">
              <div class="assignment-icon">${sub.icon || '📚'}</div>
              <div class="assignment-main">
                <b style="font-size:15px; color:#1e293b;">${n.title}</b>
                ${hasFile ? `<div class="assignment-attachments" style="margin-top:6px;"><a href="${n.fileData}" download="${n.fileName || 'Study_Notes'}" class="btn-doc-download" style="display:inline-flex; align-items:center; gap:6px; background:#f0f9ff; border:1px solid #7dd3fc; color:#0369a1; padding:6px 14px; border-radius:6px; font-weight:700; text-decoration:none; font-size:13px;"><span style="font-size:14px;">📄</span> Download ${n.fileName || 'Notes Document'}</a></div>` : ''}
                <small style="margin-top:6px; color:#64748b; display:block;">
                  ${sub.name} • Target: <strong>${n.division || 'All Divisions'}</strong> • Uploaded on ${n.date || 'Today'}
                </small>
              </div>
              <button type="button" class="btn-delete-note" data-note-id="${n.id}" style="background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;" title="Delete this note">🗑️ Delete</button>
            </article>`;
      }).join("") : `<div class="empty-state">No notes shared for your assigned subjects yet. Upload notes using the form above.</div>`}
        </div>
      </section>`;
    }

    // Student view
    const studentUser = currentUser;
    const studentSubjects = getSubjectsForStudent(studentUser);
    const studentSubIds = studentSubjects.map(s => s.id);
    const studentDiv = studentUser.division || "Div A";

    const allNotes = (ACADEMIC.notes || []).filter(n => {
      const matchSubject = !n.subject || studentSubIds.includes(n.subject) || n.subject === "general";
      const matchDiv = !n.division || n.division === "All Divisions" || n.division === studentDiv;
      return matchSubject && matchDiv;
    });

    return `<section class="panel">
      <div class="panel-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 style="margin:0;">Subject Notes & Study Materials</h3>
          <small style="color:#64748b;">View and download study materials uploaded by your subject faculty</small>
        </div>
        <span class="badge" style="background:#f0fdf4; color:#166534; padding:6px 12px; font-weight:700;">Student Portal</span>
      </div>

      <div class="assignment-controls-wrap" style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:240px;">
          <input id="notesSearchInput" type="text" placeholder="🔍 Search notes by topic, module or title..." style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; font-weight:600;">
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <label style="font-size:13px; font-weight:700; color:#475569;">Filter Subject:</label>
          <select id="notesSubjectFilter" class="filter-select" style="padding:6px 12px; font-size:13px; font-weight:700; border-radius:8px;">
            <option value="All Subjects">All Subjects</option>
            ${studentSubjects.map(s => `<option value="${s.id}">${s.short} (${s.name})</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="assignment-list" id="studentNotesContainer">
        ${allNotes.length ? allNotes.map(n => {
      const sub = subjectById(n.subject) || { name: n.subject || "General", short: n.subject || "General", icon: "📚" };
      const hasFile = !!n.fileData;
      return `<article class="assignment note-card-item" data-title="${(n.title || '').replace(/"/g, '&quot;')}" data-subject="${n.subject || ''}" style="border-left:4px solid #16a34a;">
            <div class="assignment-icon">${sub.icon || '📚'}</div>
            <div class="assignment-main">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
                <b style="font-size:15px; color:#1e293b;">${n.title}</b>
                <span class="badge" style="background:#dcfce7; color:#15803d; font-size:11px; padding:2px 8px; font-weight:700;">${sub.short}</span>
                <span class="badge" style="background:#f1f5f9; color:#475569; font-size:11px; padding:2px 8px; font-weight:600;">${n.division || 'All Divisions'}</span>
              </div>
              ${hasFile ? `<div class="assignment-attachments" style="margin-top:6px;"><a href="${n.fileData}" download="${n.fileName || 'Study_Notes'}" class="btn-doc-download" style="display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; border:1px solid #86efac; color:#166534; padding:6px 14px; border-radius:6px; font-weight:700; text-decoration:none; font-size:13px;"><span style="font-size:14px;">📄</span> Download ${n.fileName || 'Notes Document'}</a></div>` : ''}
              <small style="margin-top:6px; color:#64748b; display:block;">
                Shared by <strong>Prof. ${n.uploadedByName || 'Faculty'}</strong> • Uploaded on ${n.date || 'Recently'}
              </small>
            </div>
          </article>`;
    }).join("") : `<div class="empty-state">No study notes uploaded for your subjects yet.</div>`}
      </div>
    </section>`;
  },
  timetable() {
    const isFaculty = currentUser.role === "faculty";
    const isStudent = currentUser.role === "student";
    const isAdmin = currentUser.role === "admin";
    const allFacultySubjects = isFaculty ? getFacultyEligibleSubjects(currentUser) : [];

    if (isStudent) {
      if (currentUser.division) activeTimetableDivision = currentUser.division;
      if (currentUser.semester) activeTimetableSemester = currentUser.semester;
    } else if (isFaculty && currentUser.subject) {
      if (!activeTimetableSemester) activeTimetableSemester = getSemesterForSubject(currentUser.subject);
    }

    const displayDivision = activeTimetableDivision || (isStudent ? (currentUser.division || "Div A") : "");
    const displaySemester = activeTimetableSemester || (isStudent ? (currentUser.semester || "1st Semester") : (isFaculty && currentUser.subject ? getSemesterForSubject(currentUser.subject) : ""));

    const rows = (displayDivision && displaySemester) ? getTimetableEntries(displayDivision, displaySemester) : [];
    const canEdit = isFaculty && isTimetableEditMode;

    const DAYS_HEADER = [
      { short: "Mon", full: "Monday" },
      { short: "Tue", full: "Tuesday" },
      { short: "Wed", full: "Wednesday" },
      { short: "Thu", full: "Thursday" },
      { short: "Fri", full: "Friday" },
      { short: "Sat", full: "Saturday" }
    ];

    const BASE_TIMES = [
      "9:00-10:00",
      "10:00-11:00",
      "11:00-11:15",
      "11:15-12:15",
      "12:15-1:15",
      "1:15-2:00",
      "2:00-3:00",
      "3:00-4:00",
      "4:00-5:00"
    ];

    const combinedTimes = Array.from(new Set([...BASE_TIMES, ...rows.map(r => r.time)]));
    const rowTimings = sortTimingsSerialwise(combinedTimes);

    const defaultHeaderTitle = "BHARATESH COLLEGE OF COMPUTER APPLICATIONS 2026";
    const headerKey = `${displaySemester}_${displayDivision}`;
    const storedHeader = (ACADEMIC.timetableHeader && (ACADEMIC.timetableHeader[headerKey] || ACADEMIC.timetableHeader[displayDivision])) || {};
    const headerTitle = storedHeader.title || defaultHeaderTitle;
    const headerSubtitle = (typeof storedHeader.subtitle === "string") ? storedHeader.subtitle : "";

    const renderMatrixTable = () => {
      if (!displaySemester || !displayDivision) {
        return `
          <div class="empty-state" style="padding:45px 20px; text-align:center; background:#ffffff; border-radius:16px; border:1px solid #e2e8f0; margin-top:10px;">
            <div style="font-size:36px; margin-bottom:10px;">🗓️</div>
            <h3 style="margin:0 0 6px 0; color:#1e293b; font-size:16px; font-weight:700;">Please Select Semester & Division</h3>
            <p style="margin:0; color:#64748b; font-size:13px;">Choose a Semester (1st to 6th) and Division (Div A / Div B) above to view or manage the timetable.</p>
          </div>
        `;
      }

      return `
        <div class="college-timetable-container">
          <div class="college-header-banner" style="text-align:center; margin-bottom: 8px;">
            ${canEdit ? `
              <input id="timetableHeaderTitleInput" type="text" class="direct-cell-input" value="${(headerTitle || '').replace(/"/g, '&quot;')}" placeholder="College Title (e.g. BHARATESH COLLEGE OF COMPUTER APPLICATIONS 2026)" style="text-align:center; font-weight:800; font-size:17px; color:#1e293b; border:1px solid #c084fc; background:#ffffff; padding:4px 8px; border-radius:4px; margin-bottom:4px; width:100%; box-sizing:border-box;">
              <input id="timetableHeaderSubtitleInput" type="text" class="direct-cell-input" value="${(headerSubtitle || '').replace(/<[^>]*>/g, '').replace(/"/g, '&quot;')}" placeholder="Enter Timetable Subtitle here..." style="text-align:center; font-weight:700; font-size:13.5px; color:#475569; border:1px solid #c084fc; background:#ffffff; padding:3px 8px; border-radius:4px; width:100%; box-sizing:border-box;">
            ` : `
              <h2 style="text-align:center; margin:0 0 3px 0; font-size:17px; font-weight:800; color:#1e293b;">${headerTitle}</h2>
              ${headerSubtitle ? `
                <div class="timetable-subtitle" style="text-align:center; font-size:13.5px; font-weight:700; color:#475569;">
                  ${headerSubtitle}
                </div>
              ` : ''}
            `}
          </div>

          ${canEdit ? `
            <div style="display:flex; justify-content:flex-end; margin-bottom:8px;">
              <button id="btnAddTimetableRow" type="button" class="btn-assign-status" style="height:32px; padding:0 12px; font-size:11.5px; font-weight:700; border:1px solid #cbd5e1; background:#ffffff; cursor:pointer; border-radius:6px;">
                <span>+ Add Row</span>
              </button>
            </div>
          ` : ''}

          <div class="timetable-matrix-wrap">
            <table class="college-timetable-table">
              <thead>
                <tr>
                  <th class="time-header" style="text-align:center;">Timing</th>
                  ${DAYS_HEADER.map(d => `<th class="day-header">${d.short}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${rowTimings.map((timeVal, rowIdx) => {
        const customBreaks = (ACADEMIC.customBreakRows && ACADEMIC.customBreakRows[displayDivision]) || {};
        const breakTimeVal = customBreaks.breakTime || "11:00-11:15";
        const breakLabelVal = customBreaks.breakLabel || "Break Time";
        const lunchTimeVal = customBreaks.lunchTime || "1:15-2:00";
        const lunchLabelVal = customBreaks.lunchLabel || "Lunch Break";

        const normT = (timeVal || "").replace(/\s+/g, "").toLowerCase();
        const isBreak = normT.includes("11:00-11:15") || normT.includes("11-11:15") || normT === "11-11:15" || normT === "11:00-11:15" || normT === breakTimeVal.replace(/\s+/g, "").toLowerCase();
        const isLunch = normT.includes("1:15-2:00") || normT === "1:15-2:00" || normT === lunchTimeVal.replace(/\s+/g, "").toLowerCase();

        if (isBreak) {
          return `
                      <tr class="break-row">
                        <td class="time-col" style="text-align:center; vertical-align:middle; padding:2px 1px;">
                          ${canEdit ? `
                            <textarea id="breakTimeInput" class="direct-time-input" data-row-idx="${rowIdx}" rows="1" style="text-align:center; padding:0; resize:none; border:none; background:transparent;">${breakTimeVal}</textarea>
                          ` : `
                            <span class="matrix-time-chip">${breakTimeVal}</span>
                          `}
                        </td>
                        <td colspan="6" style="text-align:center; vertical-align:middle; font-weight:700; letter-spacing:0.5px; background:#f3e8ff; color:#581c87; text-transform:uppercase; padding:2px 1px;">
                          ${canEdit ? `
                            <input id="breakLabelInput" type="text" class="direct-cell-input" value="${breakLabelVal}" style="text-align:center; font-weight:700; background:#f3e8ff; border:1px solid #c084fc; color:#581c87; text-transform:uppercase; font-size:11px; padding:2px 4px; width:100%; border-radius:4px;" placeholder="Break Time label...">
                          ` : `
                            ${breakLabelVal}
                          `}
                        </td>
                      </tr>
                    `;
        }

        if (isLunch) {
          return `
                      <tr class="lunch-row">
                        <td class="time-col" style="text-align:center; vertical-align:middle; padding:2px 1px;">
                          ${canEdit ? `
                            <textarea id="lunchTimeInput" class="direct-time-input" data-row-idx="${rowIdx}" rows="1" style="text-align:center; padding:0; resize:none; border:none; background:transparent;">${lunchTimeVal}</textarea>
                          ` : `
                            <span class="matrix-time-chip">${lunchTimeVal}</span>
                          `}
                        </td>
                        <td colspan="6" style="text-align:center; vertical-align:middle; font-weight:700; letter-spacing:0.5px; background:#f3e8ff; color:#581c87; text-transform:uppercase; padding:2px 1px;">
                          ${canEdit ? `
                            <input id="lunchLabelInput" type="text" class="direct-cell-input" value="${lunchLabelVal}" style="text-align:center; font-weight:700; background:#f3e8ff; border:1px solid #c084fc; color:#581c87; text-transform:uppercase; font-size:11px; padding:2px 4px; width:100%; border-radius:4px;" placeholder="Lunch Break label...">
                          ` : `
                            ${lunchLabelVal}
                          `}
                        </td>
                      </tr>
                    `;
        }

        return `
                    <tr>
                      <td class="time-col" style="text-align:center; vertical-align:middle;">
                        ${canEdit ? `
                          <textarea class="direct-time-input"
                                    data-row-idx="${rowIdx}"
                                    rows="1"
                                    style="text-align:center;"
                                    placeholder="Timing...">${timeVal || ''}</textarea>
                        ` : `
                          <span class="matrix-time-chip">${timeVal || '-'}</span>
                        `}
                      </td>
                      ${DAYS_HEADER.map(d => {
          const cellEntries = rows.filter(e => (e.time || "").replace(/\s+/g, "").toLowerCase() === (timeVal || "").replace(/\s+/g, "").toLowerCase() && e.day === d.full);
          const ownEntries = cellEntries.filter(e => isFacultyOwnEntry(e, currentUser));
          const otherEntries = cellEntries.filter(e => !isFacultyOwnEntry(e, currentUser) && (e.subjectText || e.subject));

          const masterText = Array.from(new Set(cellEntries.map(e => e.subjectText || (subjectById(e.subject) ? subjectById(e.subject).short || subjectById(e.subject).name : e.subject)).filter(Boolean))).join("\n");

          return `
                          <td>
                            ${canEdit ? `
                              ${otherEntries.length > 0 ? `
                                <div class="matrix-occupied-chip" title="Timing booked by another faculty: ${otherEntries[0].subjectText || ''}">
                                  Occupied
                                </div>
                              ` : `
                                <textarea class="direct-cell-input"
                                          data-row-idx="${rowIdx}"
                                          data-day="${d.full}"
                                          rows="1"
                                          placeholder="-">${ownEntries.length ? (ownEntries[0].subjectText || (subjectById(ownEntries[0].subject) ? subjectById(ownEntries[0].subject).short || subjectById(ownEntries[0].subject).name : ownEntries[0].subject)) : ''}</textarea>
                              `}
                            ` : `
                              <span class="matrix-subject-chip">${(isFaculty ? (ownEntries.length ? (ownEntries[0].subjectText || (subjectById(ownEntries[0].subject) ? subjectById(ownEntries[0].subject).short || subjectById(ownEntries[0].subject).name : ownEntries[0].subject)) : '-') : masterText) || '-'}</span>
                            `}
                          </td>
                        `;
        }).join("")}
                    </tr>
                  `;
      }).join("")}
              </tbody>
            </table>
          </div>

          ${canEdit ? `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; margin-top:20px; gap:10px; text-align:center;">
              <div style="display:flex; gap:10px; align-items:center;">
                <button id="btnSaveTimetable" class="primary-btn" type="button" style="height:36px; padding:0 22px; font-size:13px; font-weight:700;">
                  <span>💾 Save Timetable</span>
                </button>
              </div>
              <p id="timetableSaveMsg" class="message" style="margin:0; font-weight:600; text-align:center;"></p>
            </div>
          ` : ''}
        </div>
      `;
    };

    return `<section class="panel">
      <div class="panel-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <h3 style="margin:0; white-space:nowrap;">Daily Timetable</h3>
        </div>
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; white-space:nowrap;">
          ${!isStudent ? `
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:12px; font-weight:700; color:#475569;">Semester:</label>
              <select id="timetableSemesterSelect" class="filter-select" style="padding:4px 10px; font-size:12px; font-weight:700; border-radius:8px;">
                <option value="" ${!displaySemester ? "selected" : ""}>-- Select Semester --</option>
                <option value="1st Semester" ${displaySemester === "1st Semester" ? "selected" : ""}>1st Semester</option>
                <option value="2nd Semester" ${displaySemester === "2nd Semester" ? "selected" : ""}>2nd Semester</option>
                <option value="3rd Semester" ${displaySemester === "3rd Semester" ? "selected" : ""}>3rd Semester</option>
                <option value="4th Semester" ${displaySemester === "4th Semester" ? "selected" : ""}>4th Semester</option>
                <option value="5th Semester" ${displaySemester === "5th Semester" ? "selected" : ""}>5th Semester</option>
                <option value="6th Semester" ${displaySemester === "6th Semester" ? "selected" : ""}>6th Semester</option>
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:12px; font-weight:700; color:#475569;">Division:</label>
              <select id="timetableDivisionSelect" class="filter-select" style="padding:4px 10px; font-size:12px; font-weight:700; border-radius:8px;">
                <option value="" ${!displayDivision ? "selected" : ""}>-- Select Division --</option>
                ${renderDivisionSelectOptions(displayDivision)}
              </select>
            </div>
          ` : `
            <span class="badge" style="background:#f1f5f9; color:#334155; padding:6px 14px; font-size:12px; font-weight:700; border-radius:20px;">${displayDivision} • ${currentUser.semester || '3rd Semester'}</span>
          `}

          ${!isAdmin ? `
            <button id="btnDownloadTimetable" type="button" class="btn-download-timetable" title="Download Timetable PDF">
              <span>📥 Download Timetable (PDF)</span>
            </button>
          ` : ''}

          ${isFaculty ? `
            ${!isTimetableEditMode ? `
              <button id="btnEditTimetableMode" type="button" class="primary-btn timetable-edit-btn" style="width:auto !important; min-width:60px; height:30px; padding:0 12px; font-size:12px; font-weight:700; white-space:nowrap; margin-top:0;">
                <span>Edit</span>
              </button>
            ` : `
              <button id="btnCancelTimetableEdit" type="button" class="primary-btn timetable-edit-btn" style="width:auto !important; min-width:65px; height:30px; padding:0 12px; font-size:12px; font-weight:700; background:#64748b; white-space:nowrap; margin-top:0;">
                <span>Cancel</span>
              </button>
            `}
          ` : ''}
        </div>
      </div>
      ${isFaculty && allFacultySubjects.length > 1 ? `
        <div class="faculty-timetable-class-pills" style="display:flex; align-items:center; gap:8px; margin: 12px 0 16px 0; flex-wrap:wrap; background:#f8fafc; padding:10px 14px; border-radius:10px; border:1px solid #e2e8f0;">
          <span style="font-size:12px; font-weight:700; color:#64748b;">Quick Semester Switch:</span>
          ${allFacultySubjects.map(s => {
            const sSem = s.semester || getSemesterForSubject(s.id);
            const isCurrent = (displaySemester === sSem);
            return `<button type="button" onclick="activeTimetableSemester='${sSem}'; navigate('timetable');" class="btn-sem-pill" style="padding:5px 12px; font-size:12px; font-weight:700; border-radius:6px; border:1px solid ${isCurrent ? '#4f46e5' : '#cbd5e1'}; background:${isCurrent ? '#4f46e5' : '#ffffff'}; color:${isCurrent ? '#ffffff' : '#334155'}; cursor:pointer; transition:all 0.2s;">${s.icon || '📚'} ${s.short || s.name} (${sSem})</button>`;
          }).join("")}
        </div>
      ` : ''}
      ${renderMatrixTable()}
    </section>`;
  },
  notices() {
    const isFaculty = currentUser.role === "faculty";
    const isAdmin = currentUser.role === "admin";
    const canPublish = isFaculty || isAdmin;

    const notices = getNoticeList();
    const count = notices.length;
    const countLabel = `${count} ${count === 1 ? 'Notice' : 'Notices'}`;

    if (canPublish) {
      const audienceBadge = isAdmin
        ? ""
        : `<span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700;">Audience: Students Only</span>`;

      return `<section class="panel">
        <div class="panel-head">
          <h3>📢 Publish Notice</h3>
          <div style="display:flex; align-items:center; gap:8px;">
            ${audienceBadge}
            <span class="notice-header-count">📢 ${countLabel}</span>
          </div>
        </div>
        <form id="noticeForm" class="entry-form">
          <label>Title</label><div class="input-wrap"><input id="noticeTitle" type="text" required placeholder="Notice title"></div>
          <label>Message</label><div class="input-wrap"><textarea id="noticeText" rows="4" required placeholder="Write notice text"></textarea></div>
          <label>Date</label><div class="input-wrap"><input id="noticeDate" type="date" value="${new Date().toISOString().slice(0, 10)}" required></div>
          <label>Attach Document (Optional)</label>
          <div class="input-wrap">
            <input id="noticeFile" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.txt" style="padding:6px 10px; height:auto; background:#ffffff;">
          </div>
          ${isAdmin ? `
            <label>Target Audience</label>
            <div class="input-wrap">
              <select id="noticeTargetAudience" style="padding:8px 12px; border-radius:8px; border:1px solid #cbd5e1; font-weight:600; font-size:13px; width:100%; box-sizing:border-box;">
                <option value="all" selected>Students & Faculty</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
            </div>
          ` : ''}
          <button class="primary-btn" type="submit" style="margin-top:12px;"><span>Publish Notice</span><span class="arrow">→</span></button>
          <p id="noticeMessage" class="message"></p>
        </form>
        <div class="panel-head" style="margin-top:24px;">
          <h3>Published Notices</h3>
        </div>
        <div class="notice-grid">${notices.length ? notices.map((n, idx) => {
        const targetTag = (!n.target || n.target === "all")
          ? `<span class="badge" style="background:#dcfce7; color:#14532d; font-size:11px;">Students & Faculty</span>`
          : (n.target === "student"
            ? `<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:11px;">Students Only</span>`
            : `<span class="badge" style="background:#fef3c7; color:#92400e; font-size:11px;">Faculty Only</span>`);

        const showDelete = canDeleteNotice(n, currentUser);

        return `
          <article class="notice">
            <span>📢</span>
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
                <small>${n.date}</small>
                ${targetTag}
                ${n.authorRole ? `<small style="color:#64748b; font-style:italic;">By ${n.authorName || (n.authorRole === 'admin' ? 'Admin' : 'Faculty')}</small>` : ''}
              </div>
              <h3>${n.title}</h3>
              <p>${n.text}</p>
              ${n.fileData ? `
                <div style="margin-top:10px;">
                  <a href="${n.fileData}" download="${(n.fileName || 'Notice_Document').replace(/"/g, '&quot;')}" class="notice-doc-link">
                    <span>📄</span> ${n.fileName || 'Download Attachment'}
                  </a>
                </div>
              ` : ''}
            </div>
            ${showDelete ? `<button class="delete-notice-btn" type="button" data-delete-notice-index="${idx}" title="Delete Notice">🗑️</button>` : ''}
          </article>`;
      }).join("") : `<div class="empty-state">No notices published yet.</div>`}</div>
      </section>`;
    }

    return `<section class="panel">
      <div class="panel-head">
        <h3>📢 Campus Notices</h3>
        <span class="notice-header-count">📢 ${countLabel}</span>
      </div>
      <div class="notice-grid">${notices.length ? notices.map(n => {
      const targetTag = (!n.target || n.target === "all")
        ? `<span class="badge" style="background:#dcfce7; color:#14532d; font-size:11px;">Students & Faculty</span>`
        : `<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:11px;">Students Only</span>`;

      return `
        <article class="notice">
          <span>📢</span>
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
              <small>${n.date}</small>
              ${targetTag}
            </div>
            <h3>${n.title}</h3>
            <p>${n.text}</p>
            ${n.fileData ? `
              <div style="margin-top:10px;">
                <a href="${n.fileData}" download="${(n.fileName || 'Notice_Document').replace(/"/g, '&quot;')}" class="notice-doc-link">
                  <span>📄</span> ${n.fileName || 'Download Attachment'}
                </a>
              </div>
            ` : ''}
          </div>
        </article>`;
    }).join("") : `<div class="empty-state">No notices available.</div>`}</div>
    </section>`;
  },
  students() {
    const studentCount = (USERS.student || []).length;
    return `<section class="panel">
      <div class="panel-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3>Student Management</h3>
          <span class="badge">${studentCount} Registered Students</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="secondary-btn" data-refresh-admin-users="student" onclick="refreshAdminUserList('student')" style="padding:6px 12px; font-size:12px; font-weight:700; margin:0; cursor:pointer;" title="Refresh list from server">
            <span>🔄 Refresh List</span>
          </button>
          <button type="button" class="primary-btn" onclick="openSignup('student')" style="padding:6px 14px; font-size:12px; font-weight:700; margin:0; cursor:pointer;">
            <span>+ Register Student</span>
          </button>
        </div>
      </div>
      ${getAdminNoticeMarkup()}
      <div class="admin-search-wrap"><input type="search" data-user-search="student" placeholder="Search students by name, username, or division" aria-label="Search students"></div>
      <div class="table-wrap"><table><thead><tr><th>Name</th><th>Username</th><th style="text-align:center !important;">Division</th><th>Course Year & Semester</th><th style="text-align:center !important;">Status</th><th style="text-align:center !important;">Action</th></tr></thead><tbody>${USERS.student.map(s => {
      const studentDiv = s.division || "Div A";
      const studentSem = s.semester || "1st Semester";
      const studentYear = s.courseYear || (studentSem === "3rd Semester" || studentSem === "4th Semester" ? "2nd Year" : (studentSem === "5th Semester" || studentSem === "6th Semester" ? "3rd Year" : "1st Year"));
      return `<tr data-user-row="student" data-user-name="${s.name}" data-user-username="${s.username}" data-user-division="${studentDiv}"><td><strong>${s.name}</strong></td><td><code>${s.username}</code></td><td style="text-align:center !important;">${studentDiv}</td><td>${studentYear} - ${studentSem}</td><td style="text-align:center !important;"><span class="status good">Active</span></td><td class="admin-actions" style="text-align:center !important; vertical-align:middle !important;"><button class="danger-btn" type="button" data-remove-user-role="student" data-remove-user-username="${s.username}" data-remove-user-name="${s.name}" style="margin:0 auto !important; display:inline-block !important; height:28px; padding:0 12px; font-size:12px; font-weight:700;">Remove</button></td></tr>`;
    }).join("") || `<tr><td colspan="6" style="text-align:center;">No students registered yet.</td></tr>`}</tbody></table></div></section>`;
  },
  faculty() {
    const facultyCount = (USERS.faculty || []).length;
    return `<section class="panel">
      <div class="panel-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3>Faculty Management</h3>
          <span class="badge">${facultyCount} Faculty Members</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="secondary-btn" data-refresh-admin-users="faculty" onclick="refreshAdminUserList('faculty')" style="padding:6px 12px; font-size:12px; font-weight:700; margin:0; cursor:pointer;" title="Refresh list from server">
            <span>🔄 Refresh List</span>
          </button>
          <button type="button" class="primary-btn" onclick="openSignup('faculty')" style="padding:6px 14px; font-size:12px; font-weight:700; margin:0; cursor:pointer;">
            <span>+ Register Faculty</span>
          </button>
        </div>
      </div>
      ${getAdminNoticeMarkup()}
      <div class="admin-search-wrap"><input type="search" data-user-search="faculty" placeholder="Search faculty by name or username" aria-label="Search faculty"></div>
      <div class="faculty-grid">${USERS.faculty.length ? USERS.faculty.map(f => {
      const subs = getFacultyEligibleSubjects(f);
      const divText = (!f.division || f.division === "Both Divisions" || f.division === "All Divisions") ? "Both Divs (A & B)" : f.division;
      const divBadge = `<span class="badge" style="font-size:11px; background:#e0f2fe; color:#0369a1; padding:2px 7px; border-radius:6px;">📍 ${divText}</span>`;
      const subjectBadges = subs.length
        ? subs.map(sub => `<span class="badge" style="font-size:11px; background:#f1f5f9; color:#334155; padding:3px 7px; border-radius:6px; margin:2px; display:inline-flex; align-items:center; gap:4px;"><span>${sub.icon || '📚'}</span> <strong>${sub.short || sub.name}</strong> <small style="color:#64748b;">(${sub.semester})</small></span>`).join(" ")
        : `<span style="font-size:12px; color:#94a3b8;">No subjects assigned</span>`;
      return `<div class="faculty-card" data-user-row="faculty" data-user-name="${f.name}" data-user-username="${f.username}">
          <div class="big-avatar">${f.name.charAt(0)}</div>
          <h3>${f.name}</h3>
          <div style="margin: 6px 0 8px 0;">${divBadge}</div>
          <div style="margin-bottom:12px; text-align:left; width:100%;">
            <div style="font-size:11px; font-weight:700; color:#64748b; margin-bottom:4px; text-transform:uppercase;">Managed Classes (${subs.length}):</div>
            <div style="display:flex; flex-wrap:wrap; gap:4px;">${subjectBadges}</div>
          </div>
          <small>Username: ${f.username}</small>
          <span class="status good">Active</span>
          <div class="admin-actions admin-actions-stack">
            <button class="secondary-btn full-width" type="button" onclick="openAdminFacultyEditModal('${f.username}')" style="margin-bottom:6px; font-size:12px; font-weight:700; padding:6px 10px; border-radius:6px; cursor:pointer;">✏️ Manage Classes</button>
            <button class="danger-btn full-width" type="button" data-remove-user-role="faculty" data-remove-user-username="${f.username}" data-remove-user-name="${f.name}">Remove</button>
          </div>
        </div>`;
    }).join("") : `<div class="empty-state">No faculty accounts registered yet.</div>`}</div></section>`;
  },
  subjects() {
    return adminSubjects();
  },
  divisions() {
    return adminDivisions();
  }
};

let activeSubjectSemesterFilter = "all";

function isLabSubject(subject) {
  if (!subject) return false;
  const id = (subject.id || "").toLowerCase();
  const name = (subject.name || "").toLowerCase();
  const short = (subject.short || "").toLowerCase();
  return id.includes("lab") || name.includes("lab") || short.includes("lab");
}

function getSubjectIcon(subject) {
  if (subject && subject.icon) return subject.icon;
  const name = (subject.name || "").toLowerCase();
  const id = (subject.id || "").toLowerCase();
  if (name.includes("lab") || id.includes("lab")) return "🧪";
  if (name.includes("python") || id.includes("python")) return "🐍";
  if (name.includes("java") || id.includes("java")) return "☕";
  if (name.includes("c ") || name.includes("c prog") || id === "cprog") return "💻";
  if (name.includes("network") || id === "cn") return "🌐";
  if (name.includes("dbms") || name.includes("database")) return "🗄️";
  if (name.includes("math") || name.includes("statistical") || id === "nsm") return "📐";
  if (name.includes("kannada") || name.includes("hindi") || name.includes("english")) return "🗣️";
  if (name.includes("intelligence") || name.includes("learning") || id === "ai" || id === "ml") return "🤖";
  if (name.includes("cloud") || id === "cloud") return "☁️";
  if (name.includes("cyber") || name.includes("security")) return "🛡️";
  if (name.includes("project")) return "🚀";
  if (name.includes("web")) return "🌍";
  if (name.includes("structure") || id === "ds") return "🌲";
  if (name.includes("operating") || id === "os") return "🖥️";
  if (name.includes("environment") || id === "evs") return "🌱";
  if (name.includes("constitution") || id === "ic") return "📜";
  if (name.includes("accountancy")) return "📊";
  return "📚";
}

function facultyDashboard() {
  const allFacultySubjects = getFacultyEligibleSubjects(currentUser);
  let activeSubjectId = (currentUser && currentUser.subject) ? currentUser.subject : "";
  if (!allFacultySubjects.some(s => s.id === activeSubjectId)) {
    activeSubjectId = allFacultySubjects.length ? allFacultySubjects[0].id : "";
    if (currentUser && activeSubjectId && currentUser.subject !== activeSubjectId) {
      currentUser.subject = activeSubjectId;
      sessionStorage.setItem("portalUser", JSON.stringify(currentUser));
    }
  }

  const subjectObj = subjectById(activeSubjectId) || (allFacultySubjects.length ? allFacultySubjects[0] : { name: "Assigned Subject", short: "Subject", id: activeSubjectId });
  const sem = subjectObj.semester || getSemesterForSubject(activeSubjectId) || "Semester";
  const courseYear = getCourseYearForSemester(sem) || "Year";
  const courseName = "Bachelor of Computer Applications (BCA)";

  const activeSubDiv = getFacultySubjectDivision(currentUser, activeSubjectId);
  const enrolledStudents = getStudentsForSubject(activeSubjectId, activeSubDiv);
  const enrolledCount = enrolledStudents.length;

  const activeDivLabelFull = (!activeSubDiv || activeSubDiv === "Both Divisions" || activeSubDiv === "All Divisions")
    ? "Both Div A & Div B"
    : (activeSubDiv === "Div A" ? "Division A Only" : (activeSubDiv === "Div B" ? "Division B Only" : activeSubDiv));
  const activeDivLabelShort = (!activeSubDiv || activeSubDiv === "Both Divisions" || activeSubDiv === "All Divisions")
    ? "Div A & B"
    : activeSubDiv;

  // Aggregate student count across all subjects using their individual assigned divisions
  const allUniqueEnrolled = new Set();
  allFacultySubjects.forEach(s => {
    const sDiv = getFacultySubjectDivision(currentUser, s.id);
    const list = getStudentsForSubject(s.id, sDiv);
    list.forEach(st => allUniqueEnrolled.add(st.username));
  });
  const totalEnrolledAcrossClasses = allUniqueEnrolled.size || enrolledCount;

  const noticeCount = getNoticeList().length;
  const assignmentCount = (ACADEMIC && Array.isArray(ACADEMIC.assignments))
    ? ACADEMIC.assignments.filter(a => allFacultySubjects.some(s => s.id === a.subject)).length
    : 0;
  const notesCount = (ACADEMIC && Array.isArray(ACADEMIC.notes))
    ? ACADEMIC.notes.filter(n => allFacultySubjects.some(s => s.id === n.subject) || n.uploadedBy === currentUser.username).length
    : 0;
  const email = (currentUser && currentUser.email) ? currentUser.email : (currentUser ? `${currentUser.username}@smartportal.edu` : "");
  const facultyName = (currentUser && currentUser.name) ? currentUser.name : "Faculty Member";

  return `<div class="welcome">
    <div>
      <p class="eyebrow">Faculty Portal</p>
      <h1>Welcome back, ${facultyName} 👋</h1>
    </div>
    <div class="welcome-icon">🧑‍🏫</div>
  </div>

  <div class="stat-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; margin-bottom:17px;">
    <div class="stat" style="cursor: pointer;" onclick="document.querySelector('.faculty-classes-panel')?.scrollIntoView({ behavior: 'smooth' })">
      <span>📚</span><b>${allFacultySubjects.length}</b><small>Assigned Classes</small>
    </div>
    <div class="stat" style="cursor: pointer;" onclick="navigate('attendance')">
      <span>👥</span><b>${totalEnrolledAcrossClasses}</b><small>Total Enrolled Students</small>
    </div>
    <div class="stat" style="cursor: pointer;" onclick="navigate('assignments')">
      <span>📝</span><b>${assignmentCount}</b><small>Total Assignments</small>
    </div>
    <div class="stat" style="cursor: pointer;" onclick="navigate('notes')">
      <span>📖</span><b>${notesCount}</b><small>Subject Notes</small>
    </div>
    <div class="stat" style="cursor: pointer;" onclick="navigate('notices')">
      <span>📢</span><b>${noticeCount}</b><small>Notices</small>
    </div>
  </div>

  <!-- All Managed Classes & Subjects Across Different Years -->
  <section class="panel faculty-classes-panel" style="margin-top: 18px;">
    <div class="panel-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <h3 style="display:flex; align-items:center; gap:8px;"><span>📚</span> All Managed Classes & Subjects (${allFacultySubjects.length})</h3>
        <small style="color:#64748b; font-weight:600;">You manage classes across different course years & semesters from this single portal</small>
      </div>
      <button type="button" onclick="openFacultyEditProfileModal()" class="secondary-btn" style="padding:6px 14px; font-size:12.5px; font-weight:700; border-radius:8px; margin:0; cursor:pointer;">
        <span>+ Add / Manage Classes</span>
      </button>
    </div>

    <div class="faculty-classes-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:14px; margin-top:14px;">
      ${allFacultySubjects.length === 0 ? `
        <div class="empty-state" style="padding: 28px 20px; text-align: center; background: #f8fafc; border-radius: 12px; border: 1.5px dashed #cbd5e1; grid-column: 1 / -1;">
          <p style="font-size: 15px; font-weight: 700; color: #334155; margin: 0 0 6px;">No classes or subjects assigned yet</p>
          <p style="font-size: 13px; color: #64748b; margin: 0 0 16px;">Add the subjects and class divisions you teach to start taking attendance and posting marks.</p>
          <button type="button" onclick="openFacultyEditProfileModal()" class="primary-btn" style="width: auto !important; margin: 0 auto; padding: 8px 18px; font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer;">
            <span>+ Add Your Classes Now</span>
          </button>
        </div>
      ` : allFacultySubjects.map(s => {
        const sSem = s.semester || getSemesterForSubject(s.id);
        const sYear = getCourseYearForSemester(sSem);
        const sDiv = getFacultySubjectDivision(currentUser, s.id);
        const sDivText = (!sDiv || sDiv === "Both Divisions" || sDiv === "All Divisions") ? "Div A & B" : sDiv;
        const isActive = s.id === activeSubjectId;
        const sEnrolled = getStudentsForSubject(s.id, sDiv);
        const sAssigns = (ACADEMIC && Array.isArray(ACADEMIC.assignments)) ? ACADEMIC.assignments.filter(a => a.subject === s.id).length : 0;
        const sNotes = (ACADEMIC && Array.isArray(ACADEMIC.notes)) ? ACADEMIC.notes.filter(n => n.subject === s.id).length : 0;
        return `
          <div class="class-card-item ${isActive ? 'active-class active-class-card' : ''}" style="background:${isActive ? '#f0fdf4' : '#ffffff'}; border:2px solid ${isActive ? '#22c55e' : '#e2e8f0'}; border-radius:14px; padding:16px; box-shadow:0 2px 5px rgba(0,0,0,0.04); display:flex; flex-direction:column; justify-content:space-between; position:relative;">
            ${isActive ? `<span style="position:absolute; top:12px; right:12px; background:#22c55e; color:white; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; text-transform:uppercase; letter-spacing:0.3px;">Active Now</span>` : ''}
            <div>
              <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
                <div style="flex:1; min-width:0; padding-right:${isActive ? '75px' : '0'};">
                  <h4 style="margin:0; font-size:15px; font-weight:800; color:#1e293b; line-height:1.3;">${s.name}</h4>
                  <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
                    <span class="chip-sm" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:11px; padding:2px 6px; border-radius:4px;">${sYear}</span>
                    <span class="chip-sm" style="background:#f1f5f9; color:#475569; font-weight:700; font-size:11px; padding:2px 6px; border-radius:4px;">${sSem}</span>
                    <span class="chip-sm" style="background:#fef3c7; color:#92400e; font-weight:700; font-size:11px; padding:2px 6px; border-radius:4px;">${sDivText}</span>
                  </div>
                </div>
              </div>
              
              <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; background:#f8fafc; padding:8px 6px; border-radius:8px; margin:10px 0; border:1px solid #f1f5f9; text-align:center;">
                <div><b style="display:block; font-size:14px; color:#0f172a;">${sEnrolled.length}</b><small style="font-size:11px; color:#64748b;">Students</small></div>
                <div><b style="display:block; font-size:14px; color:#0f172a;">${sAssigns}</b><small style="font-size:11px; color:#64748b;">Assigns</small></div>
                <div><b style="display:block; font-size:14px; color:#0f172a;">${sNotes}</b><small style="font-size:11px; color:#64748b;">Notes</small></div>
              </div>
            </div>

            <div style="margin-top:10px; display:flex; gap:6px; flex-direction:column;">
              ${isActive ? `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                  <button type="button" class="btn-sm" onclick="navigate('attendance')" style="padding:7px 8px; font-weight:700; font-size:11.5px; background:#16a34a; color:white; border:none; border-radius:6px; cursor:pointer;">📊 Attendance</button>
                  <button type="button" class="btn-sm" onclick="navigate('marks')" style="padding:7px 8px; font-weight:700; font-size:11.5px; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer;">📈 Marks</button>
                </div>
              ` : `
                <button type="button" onclick="switchFacultyActiveSubject('${s.id}')" class="primary-btn" style="width:100% !important; margin:0; padding:8px 12px; font-size:12px; font-weight:700; border-radius:8px; cursor:pointer;">
                  <span>Switch to Manage This Class</span>
                  <span class="arrow">→</span>
                </button>
              `}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  </section>

  ${allFacultySubjects.length === 0 ? `
    <section class="panel faculty-course-panel" style="margin-top: 18px;">
      <div class="panel-head">
        <div>
          <h3>Active Class</h3>
          <span class="badge" style="background:#fee2e2; color:#b91c1c;">No Class Selected</span>
        </div>
      </div>
      <div style="padding: 24px; text-align: center; color: #64748b;">
        <p style="font-size: 14px; margin: 0 0 14px;">Please assign at least one class or subject to manage attendance, marks, and assignments.</p>
        <button type="button" onclick="openFacultyEditProfileModal()" class="primary-btn" style="width: auto !important; margin: 0 auto; padding: 7px 16px; font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer;">
          <span>+ Add Class Now</span>
        </button>
      </div>
    </section>
  ` : `
    <section class="panel faculty-course-panel" style="margin-top: 18px;">
      <div class="panel-head">
        <div>
          <h3>📚 Active Class: ${subjectObj.name}</h3>
          <span class="badge" style="background:#dcfce7; color:#15803d;">${sem} • ${courseYear}</span>
        </div>
      </div>

      <div class="subject-grid">
        <div class="subject-card">
          <div class="subject-icon">🎓</div>
          <div>
            <b>Degree Program</b>
            <small>${courseName}</small>
          </div>
          <strong>BCA</strong>
        </div>

        <div class="subject-card">
          <div class="subject-icon">💻</div>
          <div>
            <b>Active Subject</b>
            <small>${subjectObj.name}</small>
          </div>
          <strong>${subjectObj.short || subjectObj.code || subjectObj.id}</strong>
        </div>

        <div class="subject-card">
          <div class="subject-icon">📅</div>
          <div>
            <b>Semester & Year</b>
            <small>${sem} (${courseYear})</small>
          </div>
          <strong>${sem}</strong>
        </div>

        <div class="subject-card">
          <div class="subject-icon">🏫</div>
          <div>
            <b>Assigned Division(s)</b>
            <small>${activeDivLabelFull}</small>
          </div>
          <strong>${activeDivLabelShort}</strong>
        </div>

        <div class="subject-card">
          <div class="subject-icon">👥</div>
          <div>
            <b>Enrolled Students</b>
            <small>${enrolledCount} Registered in this Class</small>
          </div>
          <strong>${enrolledCount} Students</strong>
        </div>
      </div>

      <div class="course-actions-row" style="margin-top: 16px; display:flex; gap:10px; flex-wrap:wrap;">
        <button type="button" class="action-btn-secondary" onclick="navigate('attendance')" style="padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer; background:#f8fafc; border:1px solid #cbd5e1;">📊 Manage Attendance</button>
        <button type="button" class="action-btn-secondary" onclick="navigate('marks')" style="padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer; background:#f8fafc; border:1px solid #cbd5e1;">📈 Manage Marks</button>
        <button type="button" class="action-btn-secondary" onclick="navigate('assignments')" style="padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer; background:#f8fafc; border:1px solid #cbd5e1;">📝 View Assignments</button>
        <button type="button" class="action-btn-secondary" onclick="navigate('notes')" style="padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer; background:#f8fafc; border:1px solid #cbd5e1;">📚 Upload Notes</button>
        <button type="button" class="action-btn-secondary" onclick="navigate('timetable')" style="padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer; background:#f8fafc; border:1px solid #cbd5e1;">🗓️ Timetable</button>
      </div>
    </section>
  `}

  <section class="panel faculty-profile-panel" style="margin-top: 18px;">
    <div class="panel-head">
      <div>
        <h3>👤 Faculty Information</h3>
        <span class="badge">Faculty Account</span>
      </div>
      <button type="button" id="openFacultyEditProfileBtn" onclick="openFacultyEditProfileModal()" class="primary-btn profile-edit-btn" style="width: auto !important; margin: 0; padding: 6px 14px; cursor:pointer;">
        <span>✏️ Edit Details</span>
      </button>
    </div>

    <div class="subject-grid">
      <div class="subject-card">
        <div class="subject-icon">🪪</div>
        <div>
          <b>Full Name</b>
          <small>${facultyName}</small>
        </div>
        <strong>Faculty</strong>
      </div>

      <div class="subject-card">
        <div class="subject-icon">👤</div>
        <div>
          <b>Username</b>
          <small>${currentUser.username}</small>
        </div>
        <strong>System ID</strong>
      </div>

      <div class="subject-card">
        <div class="subject-icon">✉️</div>
        <div>
          <b>Email Address</b>
          <small style="word-break:break-all;">${email}</small>
        </div>
        <strong>Primary</strong>
      </div>

      <div class="subject-card">
        <div class="subject-icon">🏛️</div>
        <div>
          <b>Department</b>
          <small>${currentUser.department || "Department of Computer Science & Applications"}</small>
        </div>
        <strong>BCA</strong>
      </div>
    </div>
  </section>`;
}

function adminDashboard() {
  const adminName = (currentUser && currentUser.name) ? currentUser.name : "Administrator";
  const adminUsername = (currentUser && currentUser.username) ? currentUser.username : "admin";
  const noticeCount = getNoticeList().length;
  const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
  const totalSubjects = subjectsSource.length;
  const totalDivisions = getAvailableDivisions().length;

  const semesters = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester"];

  return `<div class="welcome">
    <div>
      <p class="eyebrow">Administrator</p>
      <h1>Portal Control Center ⚙️</h1>
      <p>Manage students, faculty, timetables, and academic semester subjects.</p>
    </div>
    <div class="welcome-icon">🛡️</div>
  </div>

  <div class="stat-grid">
    <div class="stat" style="cursor: pointer;" onclick="navigate('profile')"><span>👤</span><b>${adminName}</b><small>Admin (@${adminUsername})</small></div>
    <div class="stat" style="cursor: pointer;" onclick="navigate('divisions')"><span>🏫</span><b>${totalDivisions}</b><small>Class Divisions</small></div>
    <div class="stat" style="cursor: pointer;" onclick="navigate('subjects')"><span>📚</span><b>${totalSubjects}</b><small>Semester Subjects</small></div>
    <div class="stat" style="cursor: pointer;" onclick="navigate('students')"><span>👥</span><b>${USERS.student.length}</b><small>Students</small></div>
    <div class="stat" style="cursor: pointer;" onclick="navigate('faculty')"><span>🧑‍🏫</span><b>${USERS.faculty.length}</b><small>Faculty</small></div>
    <div class="stat" style="cursor: pointer;" onclick="navigate('notices')"><span>📢</span><b>${noticeCount}</b><small>Notices</small></div>
  </div>

  <section class="panel" style="margin-top: 18px;">
    <div class="panel-head">
      <div>
        <h3>⚡ Quick Operations</h3>
        <span class="badge">Direct Shortcuts</span>
      </div>
    </div>
    <div class="admin-quick-actions-bar">
      <button type="button" class="admin-quick-btn" onclick="navigate('profile')">
        <span>👤</span> Admin Profile & Security
      </button>
      <button type="button" class="admin-quick-btn" onclick="navigate('divisions')">
        <span>🏫</span> Manage Class Divisions
      </button>
      <button type="button" class="admin-quick-btn" onclick="navigate('subjects')">
        <span>📚</span> Manage Semester-wise Subjects
      </button>
      <button type="button" class="admin-quick-btn" onclick="navigate('students')">
        <span>👥</span> Manage Students
      </button>
      <button type="button" class="admin-quick-btn" onclick="navigate('faculty')">
        <span>🧑‍🏫</span> Manage Faculty
      </button>
      <button type="button" class="admin-quick-btn" onclick="navigate('timetable')">
        <span>🗓️</span> Manage Timetable
      </button>
      <button type="button" class="admin-quick-btn" onclick="navigate('notices')">
        <span>📢</span> Publish Notices
      </button>
    </div>
  </section>

  <section class="panel" style="margin-top: 18px;">
    <div class="panel-head">
      <div>
        <h3>📚 Semester-wise Curriculum Overview</h3>
        <span class="badge">6 Semesters • ${totalSubjects} Subjects</span>
      </div>
      <button type="button" class="primary-btn" onclick="navigate('subjects')" style="width: auto !important; margin: 0; padding: 6px 14px; font-size: 12.5px;">
        <span>Open Subjects Section →</span>
      </button>
    </div>
    <div class="admin-curriculum-grid">
      ${semesters.map(sem => {
    const semSubs = subjectsSource.filter(s => s.semester === sem);
    const theory = semSubs.filter(s => !isLabSubject(s)).length;
    const labs = semSubs.filter(s => isLabSubject(s)).length;
    const year = getCourseYearForSemester(sem);
    return `
          <div class="sem-overview-card">
            <div class="sem-head">
              <h5 class="sem-title">📚 ${sem}</h5>
              <span class="sem-count-pill">${semSubs.length} Subs</span>
            </div>
            <div class="sem-breakdown">
              <span>${theory} Theory</span>
              <span>•</span>
              <span>${labs} Labs</span>
            </div>
            <button type="button" class="btn-sem-jump" onclick="activeSubjectSemesterFilter='${sem}'; navigate('subjects');">
              <span>Configure ${sem} (${year}) →</span>
            </button>
          </div>
        `;
  }).join("")}
    </div>
  </section>`;
}

function adminSubjects() {
  const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
  const totalSubjects = subjectsSource.length;
  const theoryCount = subjectsSource.filter(s => !isLabSubject(s)).length;
  const labCount = subjectsSource.filter(s => isLabSubject(s)).length;
  const semesters = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester"];

  const semCounts = {};
  semesters.forEach(sem => {
    semCounts[sem] = subjectsSource.filter(s => s.semester === sem).length;
  });

  const currentFilter = activeSubjectSemesterFilter || "all";

  const tabsMarkup = `
    <div class="subject-filter-tabs">
      <button type="button" class="subject-tab-pill ${currentFilter === 'all' ? 'active' : ''}" data-sem-tab="all">
        <span>All Semesters</span>
        <span class="tab-chip">${totalSubjects}</span>
      </button>
      ${semesters.map(sem => `
        <button type="button" class="subject-tab-pill ${currentFilter === sem ? 'active' : ''}" data-sem-tab="${sem}">
          <span>${sem}</span>
          <span class="tab-chip">${semCounts[sem] || 0}</span>
        </button>
      `).join("")}
    </div>
  `;

  const semesterSectionsMarkup = semesters.map(sem => {
    const isVisible = (currentFilter === "all" || currentFilter === sem);
    const semSubjects = subjectsSource.filter(s => s.semester === sem);
    const semTheory = semSubjects.filter(s => !isLabSubject(s)).length;
    const semLab = semSubjects.filter(s => isLabSubject(s)).length;
    const courseYear = getCourseYearForSemester(sem);

    return `
      <div class="semester-subject-block" data-semester-block="${sem}" style="${isVisible ? '' : 'display: none;'}">
        <div class="semester-block-header">
          <div class="header-info">
            <div class="sem-icon-bubble">📚</div>
            <div>
              <h4>${sem} <span class="sem-year-badge">${courseYear}</span></h4>
              <p class="sem-meta-text">${semSubjects.length} Total Subjects • ${semTheory} Theory • ${semLab} Practical Labs</p>
            </div>
          </div>
          <button type="button" class="primary-btn btn-add-subject-sem" onclick="openAddSubjectModal('${sem}')">
            <span>➕ Add Subject to ${sem}</span>
          </button>
        </div>

        <div class="subject-manage-grid">
          ${semSubjects.length > 0 ? semSubjects.map(s => {
      const isLab = isLabSubject(s);
      const facultyAssigned = (USERS && USERS.faculty ? USERS.faculty : []).filter(f => f.subject === s.id);
      const facultyNames = facultyAssigned.map(f => {
        const divText = (!f.division || f.division === "Both Divisions" || f.division === "All Divisions") ? "Both Divs" : f.division;
        return `${f.name} (${divText})`;
      }).join(", ");

      return `
              <div class="subject-manage-card" data-subject-item="${s.id}" data-subject-name="${(s.name || '').toLowerCase()}" data-subject-short="${(s.short || '').toLowerCase()}" data-subject-id="${(s.id || '').toLowerCase()}" data-subject-semester="${sem}">
                <div class="card-top">
                  <h5 class="subject-title">${s.short}</h5>
                  <div class="subject-type-badge ${isLab ? 'badge-lab' : 'badge-theory'}">
                    ${isLab ? 'Practical Lab' : 'Theory'}
                  </div>
                </div>
                <div class="card-body">
                  <p class="subject-fullname" title="${s.name}">${s.name}</p>
                  <div class="subject-meta-row">
                    <span class="subject-code-tag">Code: <code>${s.id}</code></span>
                    <span class="subject-sem-tag">${s.semester}</span>
                  </div>
                  ${facultyNames ? `<div class="faculty-assigned-text">🧑‍🏫 <span>${facultyNames}</span></div>` : `<div class="faculty-assigned-text unassigned">⚪ No faculty assigned</div>`}
                </div>
                <div class="card-actions">
                  <button type="button" class="btn-action-edit" onclick="openEditSubjectModal('${s.id}')" title="Edit Subject Details">
                    <span>✏️ Edit</span>
                  </button>
                  <button type="button" class="btn-action-delete" onclick="deleteSubject('${s.id}')" title="Delete Subject">
                    <span>🗑️ Delete</span>
                  </button>
                </div>
              </div>
            `;
    }).join("") : `
            <div class="empty-state-box">
              <span class="empty-icon">📂</span>
              <p>No subjects configured for ${sem} yet.</p>
              <button type="button" class="secondary-btn" onclick="openAddSubjectModal('${sem}')">➕ Add Subject to ${sem}</button>
            </div>
          `}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="subjects-page-container">
      <div class="subjects-header-banner">
        <div class="banner-content">
          <span class="banner-eyebrow">ADMINISTRATION CONTROL</span>
          <h2>Semester-wise Subjects Management</h2>
          <p>Configure curriculum, core courses, language electives, and practical laboratory subjects across all 6 semesters.</p>
        </div>
      </div>

      <div class="stat-grid" style="margin-bottom: 20px;">
        <div class="stat"><span>📚</span><b>${totalSubjects}</b><small>Total Subjects</small></div>
        <div class="stat"><b>${theoryCount}</b><small>Theory Courses</small></div>
        <div class="stat"><b>${labCount}</b><small>Practical Labs</small></div>
        <div class="stat"><span>🎓</span><b>6 Semesters</b><small>BCA Curriculum</small></div>
      </div>

      <section class="panel subject-management-panel">
        <div class="panel-head-controls">
          <div class="search-box-wrap">
            <span class="search-icon">🔍</span>
            <input type="search" id="subjectSearchInput" placeholder="Search subjects by full name, short name, or subject code..." aria-label="Search Subjects">
          </div>
          ${tabsMarkup}
        </div>

        <div id="semesterSectionsContainer">
          ${semesterSectionsMarkup}
        </div>
      </section>
    </div>
  `;
}

function initAdminSubjectsPage() {
  const searchInput = $("subjectSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterSubjectsView);
  }

  document.querySelectorAll("[data-sem-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeSubjectSemesterFilter = btn.dataset.semTab;
      document.querySelectorAll("[data-sem-tab]").forEach(b => b.classList.toggle("active", b === btn));
      filterSubjectsView();
    });
  });
}

function filterSubjectsView() {
  const searchInput = $("subjectSearchInput");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const activeSem = activeSubjectSemesterFilter || "all";

  document.querySelectorAll("[data-semester-block]").forEach(block => {
    const sem = block.dataset.semesterBlock;
    const matchesSem = (activeSem === "all" || activeSem === sem);

    if (!matchesSem) {
      block.style.display = "none";
      return;
    }

    let visibleCardsInBlock = 0;
    const cards = block.querySelectorAll(".subject-manage-card");
    cards.forEach(card => {
      const name = card.dataset.subjectName || "";
      const short = card.dataset.subjectShort || "";
      const id = card.dataset.subjectId || "";
      const matchesQuery = !query || name.includes(query) || short.includes(query) || id.includes(query);

      card.style.display = matchesQuery ? "" : "none";
      if (matchesQuery) visibleCardsInBlock++;
    });

    if (cards.length === 0) {
      block.style.display = matchesSem ? "" : "none";
    } else {
      block.style.display = (matchesSem && (visibleCardsInBlock > 0 || !query)) ? "" : "none";
    }
  });
}

function logout() {
  try {
    resetAttendanceFilters();
  } catch (e) {
    console.warn("resetAttendanceFilters error on logout:", e);
  }

  sessionStorage.removeItem("portalUser");
  currentUser = null;
  updateFacultySubjectSwitcher();
  window.location.hash = "";

  try {
    if (typeof cleanupClassNotifications === "function") {
      cleanupClassNotifications();
    }
  } catch (e) { }

  try {
    const notifContainer = document.getElementById("classNotificationContainer");
    if (notifContainer) notifContainer.remove();
  } catch (e) { }

  try {
    document.querySelectorAll(".modal-backdrop, .schedule-modal-backdrop, #aiAnalysisModal").forEach(m => m.classList.add("hidden"));
    document.querySelectorAll(".signup-modal").forEach(m => m.classList.remove("hidden"));
    if (typeof closeSignupModal === "function") closeSignupModal();
  } catch (e) { }

  const appEl = $("app");
  const loginEl = $("loginPage");
  const homeEl = $("publicHome");
  if (appEl) appEl.classList.add("hidden");
  if (loginEl) {
    loginEl.classList.add("hidden");
    loginEl.style.display = "none";
  }
  if (homeEl) homeEl.classList.remove("hidden");

  try {
    resetLoginForm();
  } catch (e) { }

  window.scrollTo({ top: 0, behavior: "smooth" });
}



// Login background effects: dynamic particles and object timing
(function initLoginEffects() {
  const container = document.querySelector('.login-particles');
  if (!container) return;
  const rand = (min, max) => Math.random() * (max - min) + min;

  // generate small sprinkle particles
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.floor(rand(6, 18));
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.floor(rand(2, 96)) + '%';
    p.style.bottom = Math.floor(rand(6, 70)) + '%';
    p.style.opacity = (rand(.35, 1)).toFixed(2);
    p.style.animationDuration = (rand(3.5, 9)).toFixed(2) + 's';
    p.style.animationDelay = (-rand(0, 9)).toFixed(2) + 's';
    p.style.filter = 'blur(' + (rand(0, 3)).toFixed(1) + 'px)';
    container.appendChild(p);
  }

  // randomize object animation timing for a more organic look
  document.querySelectorAll('.login-objects .obj').forEach(el => {
    el.style.animationDuration = (rand(5.5, 9.5)).toFixed(2) + 's';
    el.style.animationDelay = (-rand(0, 5)).toFixed(2) + 's';
    // tiny x-offset variation
    el.style.transform = `translateX(${Math.floor(rand(-6, 6))}px)`;
  });
})();



function syncTimetableToBackend() {
  if (Array.isArray(ACADEMIC.timetable)) {
    fetch(API_BASE_URL + "/api/timetable/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timetable: ACADEMIC.timetable })
    }).catch(e => console.warn("Timetable backend sync warning:", e));
  }
}

function syncAcademicDataToBackend() {
  if (!ACADEMIC) return Promise.resolve(null);
  return fetch(API_BASE_URL + "/api/academic/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: ACADEMIC })
  }).then(r => r.json()).catch(e => {
    console.warn("Academic data backend sync error:", e);
    return null;
  });
}

async function hydrateAcademicDataFromServer() {
  try {
    const res = await fetch(API_BASE_URL + "/api/academic/data");
    const json = await res.json();
    if (json.success && json.data) {
      const serverAcademic = normalizeAcademicData(json.data);
      if (!serverAcademic.subjects || !serverAcademic.subjects.length) {
        serverAcademic.subjects = JSON.parse(JSON.stringify(SUBJECTS));
      }
      serverAcademic.divisions = normalizeAcademicDivisions(serverAcademic.divisions);
      ACADEMIC = serverAcademic;
      window.dispatchEvent(new CustomEvent("academicDataUpdated"));
      updateNoticeBadges();
      updateNotesBadges();
      if (typeof render === "function") render();
    }
  } catch (e) {
    console.warn("Could not hydrate academic data from MongoDB backend:", e);
  }
}

// Global delegated click handler for Student Assignment Status buttons with instant 0ms UI toggle
document.addEventListener("click", e => {
  const navBtn = e.target.closest("[data-nav-target]");
  if (navBtn) {
    const target = navBtn.dataset.navTarget;
    if (target) {
      navigate(target);
      return;
    }
  }

  const statusBtn = e.target.closest(".btn-faculty-set-status");
  if (statusBtn) {
    e.preventDefault();
    const studentUsername = statusBtn.dataset.student;
    const title = decodeURIComponent(statusBtn.dataset.title || "");
    const due = statusBtn.dataset.due;
    const newStatus = statusBtn.dataset.status;

    // 1. INSTANT 0ms UI TOGGLE ON THE BUTTON GROUP
    const toggleGroup = statusBtn.closest(".pa-toggle-group");
    if (toggleGroup) {
      toggleGroup.querySelectorAll(".btn-faculty-set-status").forEach(btn => {
        if (btn.dataset.status === newStatus) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    const tr = statusBtn.closest("tr");
    const todayISO = getTodayISODate();

    // 2. INSTANT 0ms SUBMITTED DATE CELL UPDATE
    if (tr) {
      const tds = tr.querySelectorAll("td");
      if (tds && tds[6]) {
        tds[6].innerHTML = newStatus === "Submitted"
          ? formatDateDDOrdinalMonth(todayISO)
          : `<span style="color:#94a3b8;">Not Submitted</span>`;
      }
    }

    // 3. PERSIST STATE IN LOCALSTORAGE & MONGODB ATLAS
    const normUser = String(studentUsername || "").trim().toLowerCase();
    const normTitle = String(title || "").trim().toLowerCase();

    let assign = ACADEMIC.assignments.find(a =>
      String(a.student || "").trim().toLowerCase() === normUser &&
      String(a.title || "").trim().toLowerCase() === normTitle &&
      (!due || String(a.due || "").trim() === String(due).trim())
    );

    if (!assign) {
      assign = ACADEMIC.assignments.find(a =>
        String(a.student || "").trim().toLowerCase() === normUser &&
        String(a.title || "").trim().toLowerCase() === normTitle
      );
    }

    if (!assign) {
      const idx = parseInt(statusBtn.dataset.assignIndex, 10);
      if (!isNaN(idx)) {
        const subjectList = getSubjectAssignments(currentUser ? currentUser.subject : "");
        assign = subjectList[idx];
      }
    }

    if (assign) {
      assign.status = newStatus;
      assign.submittedDate = newStatus === "Submitted" ? (assign.submittedDate || todayISO) : "";
      saveAcademicData();
    }
    return;
  }

  const deleteBtn = e.target.closest(".btn-delete-assignment");
  if (deleteBtn) {
    e.preventDefault();
    const studentUsername = deleteBtn.dataset.student;
    const title = decodeURIComponent(deleteBtn.dataset.title || "");
    const due = deleteBtn.dataset.due;

    const normUser = String(studentUsername || "").trim().toLowerCase();
    const normTitle = String(title || "").trim().toLowerCase();

    const st = (USERS.student || []).find(u => String(u.username).toLowerCase() === normUser);
    const studentName = st ? st.name : studentUsername;

    if (confirm(`Delete assignment "${title}" for ${studentName}?`)) {
      // INSTANT 0ms ROW REMOVAL
      const tr = deleteBtn.closest("tr");
      if (tr) tr.remove();

      if (!Array.isArray(ACADEMIC.deletedAssignments)) ACADEMIC.deletedAssignments = [];

      let assign = ACADEMIC.assignments.find(a =>
        String(a.student || "").trim().toLowerCase() === normUser &&
        String(a.title || "").trim().toLowerCase() === normTitle
      );

      if (assign) {
        const deleteKey = `${String(assign.student).toLowerCase()}___${assign.subject}___${assign.title}___${assign.due}`;
        if (!ACADEMIC.deletedAssignments.includes(deleteKey)) {
          ACADEMIC.deletedAssignments.push(deleteKey);
        }
        ACADEMIC.assignments = ACADEMIC.assignments.filter(a => a !== assign);
      }
      saveAcademicData();
    }
    return;
  }

  const clearAllBtn = e.target.closest("#btnClearAllAssignments, .btn-clear-all");
  if (clearAllBtn) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "faculty") return;
    const subjectObj = subjectById(currentUser ? currentUser.subject : "") || { name: (currentUser ? currentUser.subject : "") || "Subject" };
    const facSub = currentUser ? String(currentUser.subject || "").trim().toLowerCase() : "";

    let scopeText = `ALL assignment status records for ${subjectObj.name}`;
    if (assignmentFilterDivision && assignmentFilterDivision !== "All Divisions") {
      scopeText = `all assignment status records for ${assignmentFilterDivision} in ${subjectObj.name}`;
    }

    if (confirm(`Are you sure you want to clear ${scopeText}? This action cannot be undone.`)) {
      // 1. INSTANT 0ms UI CLEAR
      const tbody = document.querySelector(".compact-status-sheet table tbody");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align:center; padding: 24px; color: #64748b; font-weight: 600;">
              🗑️ All assignment status records cleared.
            </td>
          </tr>`;
      }
      const countBadge = document.getElementById("assignmentRecordCount");
      if (countBadge) countBadge.textContent = "0 Records";

      // 2. PERSIST DELETION IN LOCALSTORAGE & MONGODB ATLAS
      if (!Array.isArray(ACADEMIC.deletedAssignments)) ACADEMIC.deletedAssignments = [];

      ACADEMIC.assignments.forEach(a => {
        const matchSub = !facSub || String(a.subject || "").trim().toLowerCase() === facSub;
        if (matchSub) {
          const deleteKey = `${String(a.student).toLowerCase()}___${a.subject}___${a.title}___${a.due}`;
          if (!ACADEMIC.deletedAssignments.includes(deleteKey)) {
            ACADEMIC.deletedAssignments.push(deleteKey);
          }
        }
      });

      if (assignmentFilterDivision && assignmentFilterDivision !== "All Divisions") {
        ACADEMIC.assignments = ACADEMIC.assignments.filter(a => {
          const matchSub = !facSub || String(a.subject || "").trim().toLowerCase() === facSub;
          if (matchSub) {
            const st = (USERS.student || []).find(u => String(u.username).toLowerCase() === String(a.student).toLowerCase());
            const div = st ? (st.division || "Div A") : "Div A";
            return div !== assignmentFilterDivision;
          }
          return true;
        });
      } else {
        ACADEMIC.assignments = ACADEMIC.assignments.filter(a => {
          const matchSub = facSub && String(a.subject || "").trim().toLowerCase() === facSub;
          return !matchSub;
        });
      }

      saveAcademicData();
    }
    return;
  }
});

function openAddSubjectModal(sem) {
  const modal = $("subjectModal");
  if (!modal) return;
  $("subjectMode").value = "add";
  $("originalSubjectId").value = "";
  $("subjectIdInput").value = "";
  $("subjectIdInput").disabled = false;
  $("subjectNameInput").value = "";
  $("subjectShortInput").value = "";
  $("subjectSemesterSelect").value = sem || "1st Semester";
  $("subjectModalTitle").textContent = "Add Subject";
  $("subjectModalSubtitle").textContent = "Configure semester subject details";
  modal.classList.remove("hidden");
}

function openEditSubjectModal(subjectId) {
  const modal = $("subjectModal");
  if (!modal) return;
  const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
  const s = subjectsSource.find(item => item.id === subjectId);
  if (!s) return;
  $("subjectMode").value = "edit";
  $("originalSubjectId").value = s.id;
  $("subjectIdInput").value = s.id;
  $("subjectIdInput").disabled = false; // Enabled for editing!
  $("subjectNameInput").value = s.name;
  $("subjectShortInput").value = s.short;
  $("subjectSemesterSelect").value = s.semester;
  $("subjectModalTitle").textContent = "Edit Subject";
  $("subjectModalSubtitle").textContent = "Configure semester subject details";
  modal.classList.remove("hidden");
}

function closeSubjectModal() {
  const modal = $("subjectModal");
  if (modal) modal.classList.add("hidden");
}

function deleteSubject(subjectId) {
  if (confirm("Are you sure you want to delete this subject? This might affect student marks and timetable records linked to this subject code.")) {
    const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
    ACADEMIC.subjects = subjectsSource.filter(s => s.id !== subjectId);
    saveAcademicData();
    syncAcademicDataToBackend();
    render();
  }
}

function bindSubjectEvents() {
  const closeBtn = $("closeSubjectModalBtn");
  const cancelBtn = $("cancelSubjectModalBtn");
  const overlay = $("subjectModalOverlay");
  const form = $("subjectForm");

  if (closeBtn) closeBtn.onclick = closeSubjectModal;
  if (cancelBtn) cancelBtn.onclick = closeSubjectModal;
  if (overlay) overlay.onclick = closeSubjectModal;

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const mode = $("subjectMode").value;
      const originalId = $("originalSubjectId").value;
      const id = $("subjectIdInput").value.trim().toLowerCase();
      const name = $("subjectNameInput").value.trim();
      const short = $("subjectShortInput").value.trim();
      const semester = $("subjectSemesterSelect").value;

      if (!id || !/^[a-z0-9_-]+$/i.test(id)) {
        alert("Subject Code must be alphanumeric (letters, numbers, underscores, dashes only).");
        return;
      }

      if (!ACADEMIC.subjects || !ACADEMIC.subjects.length) {
        ACADEMIC.subjects = JSON.parse(JSON.stringify(SUBJECTS));
      }

      if (mode === "add") {
        if (ACADEMIC.subjects.some(s => s.id === id)) {
          alert(`A subject with code '${id}' already exists.`);
          return;
        }
        ACADEMIC.subjects.push({ id, name, short, icon: "", semester });
      } else {
        if (id !== originalId && ACADEMIC.subjects.some(s => s.id === id)) {
          alert(`A subject with code '${id}' already exists.`);
          return;
        }

        const s = ACADEMIC.subjects.find(item => item.id === originalId);
        if (s) {
          s.id = id;
          s.name = name;
          s.short = short;
          s.icon = "";
          s.semester = semester;
        }

        // Cascade rename to other entities (timetable, students data, faculty profile)
        if (id !== originalId) {
          // Update timetable entries
          if (Array.isArray(ACADEMIC.timetable)) {
            ACADEMIC.timetable.forEach(entry => {
              if (entry.subject === originalId) {
                entry.subject = id;
              }
            });
          }
          // Update student records (attendance, marks)
          if (ACADEMIC.students) {
            Object.keys(ACADEMIC.students).forEach(username => {
              const stud = ACADEMIC.students[username];
              if (stud) {
                if (stud.attendance && stud.attendance[originalId] !== undefined) {
                  stud.attendance[id] = stud.attendance[originalId];
                  delete stud.attendance[originalId];
                }
                if (stud.marks && stud.marks[originalId] !== undefined) {
                  stud.marks[id] = stud.marks[originalId];
                  delete stud.marks[originalId];
                }
              }
            });
          }

          // Update faculty members
          if (USERS && Array.isArray(USERS.faculty)) {
            USERS.faculty.forEach(fac => {
              if (fac.subject === originalId) {
                fac.subject = id;
              }
            });
            saveUsers();
          }

          // Update current logged-in user session if they are affected
          if (currentUser && currentUser.subject === originalId) {
            currentUser.subject = id;
            sessionStorage.setItem("portalUser", JSON.stringify(currentUser));
          }
        }
      }

      saveAcademicData();
      syncAcademicDataToBackend();
      closeSubjectModal();
      render();
    };
  }
}

let activeDivisionYearFilter = "1st Year";

function adminDivisions() {
  const divsObj = (ACADEMIC && ACADEMIC.divisions) ? normalizeAcademicDivisions(ACADEMIC.divisions) : DEFAULT_COURSE_YEAR_DIVISIONS;
  const courseYears = ["1st Year", "2nd Year", "3rd Year"];
  const students = USERS.student || [];
  const faculty = USERS.faculty || [];
  const totalStudents = students.length;

  const totalUniqueDivisions = getAvailableDivisions().length;
  const currentFilter = activeDivisionYearFilter || "1st Year";

  const tabsMarkup = `
    <div class="subject-filter-tabs" style="margin-bottom: 20px;">
      ${courseYears.map(yr => {
        const count = (divsObj[yr] || []).length;
        return `
          <button type="button" class="subject-tab-pill ${currentFilter === yr ? 'active' : ''}" data-div-year-tab="${yr}">
            <span>${yr}</span>
            <span class="tab-chip">${count}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;

  const yearBlocksMarkup = courseYears.map(yr => {
    const isVisible = (currentFilter === yr);
    const yrDivs = divsObj[yr] || [];
    const yrStudents = students.filter(s => {
      const sYr = s.courseYear || getCourseYearForSemester(s.semester || "1st Semester");
      return sYr === yr;
    });

    const semsCovered = yr === "1st Year" ? "1st & 2nd Semesters" : (yr === "2nd Year" ? "3rd & 4th Semesters" : "5th & 6th Semesters");

    const cardsMarkup = yrDivs.map(divName => {
      const enrolledInDiv = yrStudents.filter(s => (s.division || "Div A") === divName);
      const count = enrolledInDiv.length;
      const pct = yrStudents.length > 0 ? Math.round((count / yrStudents.length) * 100) : 0;

      const assignedFaculty = faculty.filter(f => {
        if (!f.division || f.division === "Both Divisions" || f.division === "All Divisions") return true;
        if (f.division === divName) return true;
        if (f.subjectDivisions && Object.values(f.subjectDivisions).includes(divName)) return true;
        return false;
      });

      const isRemovable = yrDivs.length > 1;

      return `
        <div class="division-manage-card" data-division-card="${escapeHtml(divName)}">
          <div>
            <div class="card-top">
              <div class="division-icon-box">🏫</div>
              <span class="division-badge-tag">${count} Students (${pct}%)</span>
            </div>
            <h3 class="division-title">${escapeHtml(divName)}</h3>
            <p class="division-desc">${yr} class section for attendance sheets, timetable allocations, and student batches.</p>
            
            <div class="division-stats-row">
              <div class="division-stat-pill">
                <span class="stat-label">Enrolled (${yr})</span>
                <span class="stat-num">${count}</span>
              </div>
              <div class="division-stat-pill">
                <span class="stat-label">Faculty</span>
                <span class="stat-num">${assignedFaculty.length}</span>
              </div>
            </div>
          </div>

          <div class="card-actions" style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="secondary-btn" onclick="renameDivision('${escapeHtml(divName)}', '${yr}')" style="margin:0; padding:6px 12px; font-size:12px; font-weight:700;">
              <span>✏️ Rename</span>
            </button>
            ${isRemovable ? `
              <button type="button" class="danger-btn" onclick="deleteDivision('${escapeHtml(divName)}', '${yr}')" style="margin:0; padding:6px 14px; font-size:12px; font-weight:700;">
                <span>🗑️ Remove</span>
              </button>
            ` : `
              <span style="font-size:11.5px; color:#94a3b8; font-style:italic;">Primary Division (${yr})</span>
            `}
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="semester-subject-block" data-division-year-block="${yr}" style="${isVisible ? '' : 'display: none;'} margin-bottom: 24px;">
        <div class="semester-block-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; margin-bottom: 16px;">
          <div class="header-info" style="display: flex; align-items: center; gap: 12px;">
            <div class="sem-icon-bubble">🏫</div>
            <div>
              <h4 style="margin: 0; font-size: 16px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                <span>${yr} Divisions</span>
                <span class="sem-year-badge">${semsCovered}</span>
              </h4>
              <p class="sem-meta-text" style="margin: 3px 0 0 0; font-size: 12px; color: #64748b;">
                ${yrDivs.length} Active Divisions • ${yrStudents.length} Students Enrolled
              </p>
            </div>
          </div>
          <button type="button" class="primary-btn btn-add-subject-sem" onclick="openAddDivisionModal('${yr}')">
            <span>+ Add Division to ${yr}</span>
          </button>
        </div>

        <div class="admin-divisions-grid">
          ${cardsMarkup}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="welcome">
      <div>
        <p class="eyebrow">Academic Structure Control</p>
        <h1>Class Divisions Management 🏫</h1>
      </div>
      <div class="welcome-icon">🏫</div>
    </div>

    <div class="stat-grid">
      <div class="stat"><span>🏫</span><b>${totalUniqueDivisions}</b><small>Total Unique Divisions</small></div>
      <div class="stat"><span>👥</span><b>${totalStudents}</b><small>Total Enrolled Students</small></div>
      <div class="stat"><span>🧑‍🏫</span><b>${faculty.length}</b><small>Faculty Members</small></div>
    </div>

    <section class="panel" style="margin-top: 18px;">
      <div class="panel-head" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
        <div>
          <h3>Course Year-wise Class Divisions</h3>
          <span class="badge">1st, 2nd & 3rd Year Sections</span>
        </div>
      </div>

      ${tabsMarkup}

      <div>
        ${yearBlocksMarkup}
      </div>
    </section>
  `;
}

function initAdminDivisionsPage() {
  document.querySelectorAll("[data-div-year-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeDivisionYearFilter = btn.dataset.divYearTab || "1st Year";
      document.querySelectorAll("[data-div-year-tab]").forEach(b => b.classList.toggle("active", b === btn));
      const activeYear = activeDivisionYearFilter;
      document.querySelectorAll("[data-division-year-block]").forEach(block => {
        const yr = block.dataset.divisionYearBlock;
        const matches = (activeYear === yr);
        block.style.display = matches ? "" : "none";
      });
    });
  });
}

function openAddDivisionModal(defaultYear = "1st Year") {
  const modal = $("divisionModal");
  if (!modal) return;
  const yrSelect = $("divisionCourseYearSelect");
  if (yrSelect) {
    const targetYr = (defaultYear && ["1st Year", "2nd Year", "3rd Year"].includes(defaultYear))
      ? defaultYear
      : (activeDivisionYearFilter && ["1st Year", "2nd Year", "3rd Year"].includes(activeDivisionYearFilter) ? activeDivisionYearFilter : "1st Year");
    yrSelect.value = targetYr;
  }
  const input = $("divisionNameInput");
  if (input) {
    input.value = "";
  }
  modal.classList.remove("hidden");
  if (input) {
    setTimeout(() => input.focus(), 50);
  }
}

function closeAddDivisionModal() {
  const modal = $("divisionModal");
  if (modal) modal.classList.add("hidden");
}

function deleteDivision(divName, courseYear) {
  if (!divName) return;
  const yr = courseYear || "1st Year";
  const currentDivs = getAvailableDivisions(yr);
  if (currentDivs.length <= 1) {
    alert(`Cannot remove division: At least one division must remain configured for ${yr}.`);
    return;
  }

  const enrolledStudents = (USERS.student || []).filter(s => {
    const sYr = s.courseYear || getCourseYearForSemester(s.semester || "1st Semester");
    return sYr === yr && (s.division || "Div A") === divName;
  });

  let msg = `Are you sure you want to remove "${divName}" from ${yr}?`;
  if (enrolledStudents.length > 0) {
    msg = `WARNING: There are currently ${enrolledStudents.length} student(s) in ${yr} assigned to "${divName}".\n\nRemoving this division will remove it from available options for ${yr}. Are you sure you want to proceed?`;
  }

  if (!confirm(msg)) return;

  if (!ACADEMIC.divisions || typeof ACADEMIC.divisions !== "object" || Array.isArray(ACADEMIC.divisions)) {
    ACADEMIC.divisions = normalizeAcademicDivisions(ACADEMIC.divisions);
  }

  ACADEMIC.divisions[yr] = currentDivs.filter(d => d.toLowerCase() !== divName.toLowerCase());
  saveAcademicData();
  syncAcademicDataToBackend();
  render();
}

async function renameDivision(divName, courseYear) {
  if (!divName) return;
  const yr = courseYear || "1st Year";
  const newNameRaw = prompt(`Enter new division name for "${divName}" (${yr}):`, divName);
  if (!newNameRaw) return;
  const newNameTrim = newNameRaw.trim();
  if (!newNameTrim || newNameTrim.toLowerCase() === divName.toLowerCase()) return;

  let formattedName = newNameTrim;
  if (/^[a-zA-Z]$/.test(newNameTrim)) {
    formattedName = `Div ${newNameTrim.toUpperCase()}`;
  } else if (/^div\s*([a-zA-Z0-9]+)$/i.test(newNameTrim)) {
    const match = newNameTrim.match(/^div\s*([a-zA-Z0-9]+)$/i);
    formattedName = `Div ${match[1].toUpperCase()}`;
  }

  if (!ACADEMIC.divisions || typeof ACADEMIC.divisions !== "object" || Array.isArray(ACADEMIC.divisions)) {
    ACADEMIC.divisions = normalizeAcademicDivisions(ACADEMIC.divisions);
  }

  const currentDivs = getAvailableDivisions(yr);
  if (currentDivs.some(d => d.toLowerCase() === formattedName.toLowerCase() && d.toLowerCase() !== divName.toLowerCase())) {
    alert(`Division "${formattedName}" already exists in ${yr}.`);
    return;
  }

  ACADEMIC.divisions[yr] = currentDivs.map(d => d.toLowerCase() === divName.toLowerCase() ? formattedName : d);

  // Cascade to enrolled students in USERS.student
  if (Array.isArray(USERS.student)) {
    USERS.student.forEach(s => {
      const sYr = s.courseYear || (typeof getCourseYearForSemester === "function" ? getCourseYearForSemester(s.semester || "1st Semester") : "1st Year");
      if (sYr === yr && (s.division || "Div A").toLowerCase() === divName.toLowerCase()) {
        s.division = formattedName;
        if (typeof syncUserToBackend === "function") {
          syncUserToBackend("student", s.username, s);
        }
      }
    });
  }

  // Cascade to timetable entries
  if (Array.isArray(ACADEMIC.timetable)) {
    ACADEMIC.timetable.forEach(t => {
      if ((t.division || "").toLowerCase() === divName.toLowerCase()) {
        t.division = formattedName;
      }
    });
  }

  saveAcademicData();
  await syncAcademicDataToBackend();
  render();
}

function bindDivisionEvents() {
  const closeBtn = $("closeDivisionModalBtn");
  const cancelBtn = $("cancelDivisionModalBtn");
  const overlay = $("divisionModalOverlay");
  const form = $("divisionForm");

  if (closeBtn) closeBtn.onclick = closeAddDivisionModal;
  if (cancelBtn) cancelBtn.onclick = closeAddDivisionModal;
  if (overlay) overlay.onclick = closeAddDivisionModal;

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const rawInput = $("divisionNameInput") ? $("divisionNameInput").value.trim() : "";
      if (!rawInput) {
        alert("Please enter a division name or letter.");
        return;
      }

      let formattedName = rawInput;
      if (/^[a-zA-Z]$/.test(rawInput)) {
        formattedName = `Div ${rawInput.toUpperCase()}`;
      } else if (/^div\s*([a-zA-Z0-9]+)$/i.test(rawInput)) {
        const match = rawInput.match(/^div\s*([a-zA-Z0-9]+)$/i);
        formattedName = `Div ${match[1].toUpperCase()}`;
      }

      const targetYear = ($("divisionCourseYearSelect") && $("divisionCourseYearSelect").value) ? $("divisionCourseYearSelect").value : (activeDivisionYearFilter || "1st Year");

      if (!ACADEMIC.divisions || typeof ACADEMIC.divisions !== "object" || Array.isArray(ACADEMIC.divisions)) {
        ACADEMIC.divisions = normalizeAcademicDivisions(ACADEMIC.divisions);
      }

      const targetYears = targetYear === "All Years" ? ["1st Year", "2nd Year", "3rd Year"] : [targetYear];

      if (targetYear !== "All Years") {
        const existingYearDivs = ACADEMIC.divisions[targetYear] || [];
        if (existingYearDivs.some(d => d.toLowerCase() === formattedName.toLowerCase())) {
          alert(`Division "${formattedName}" already exists in ${targetYear}.`);
          return;
        }
      }

      targetYears.forEach(yr => {
        if (!Array.isArray(ACADEMIC.divisions[yr])) {
          ACADEMIC.divisions[yr] = ["Div A", "Div B"];
        }
        if (!ACADEMIC.divisions[yr].some(d => d.toLowerCase() === formattedName.toLowerCase())) {
          ACADEMIC.divisions[yr].push(formattedName);
        }
      });

      saveAcademicData();
      syncAcademicDataToBackend();
      closeAddDivisionModal();
      render();
    };
  }
}

function getFacultyEligibleSubjects(faculty) {
  if (!faculty || faculty.role !== "faculty") return [];
  const subjectsSource = (ACADEMIC && ACADEMIC.subjects && ACADEMIC.subjects.length) ? ACADEMIC.subjects : SUBJECTS;
  const assignedIds = Array.isArray(faculty.subjects) && faculty.subjects.length
    ? faculty.subjects
    : (faculty.subject ? [faculty.subject] : []);

  if (!assignedIds.length) return [];

  const matched = [];
  assignedIds.forEach(id => {
    const s = subjectsSource.find(item => item.id === id);
    if (s && !matched.some(m => m.id === s.id)) {
      matched.push(s);
    } else if (!s && !matched.some(m => m.id === id)) {
      const sem = getSemesterForSubject(id);
      matched.push({ id, name: id, short: id, semester: sem });
    }
  });

  return matched;
}

function switchFacultyActiveSubject(subjectId) {
  if (currentUser && currentUser.role === "faculty") {
    currentUser.subject = subjectId;
    if (!Array.isArray(currentUser.subjects)) currentUser.subjects = [];
    if (!currentUser.subjects.includes(subjectId)) currentUser.subjects.push(subjectId);
    sessionStorage.setItem("portalUser", JSON.stringify(currentUser));

    if (USERS && Array.isArray(USERS.faculty)) {
      const fac = USERS.faculty.find(f => f.username === currentUser.username);
      if (fac) {
        fac.subject = subjectId;
        if (!Array.isArray(fac.subjects)) fac.subjects = [];
        if (!fac.subjects.includes(subjectId)) fac.subjects.push(subjectId);
        saveUsers();
      }
    }

    if (typeof updateUserOnServer === "function") {
      updateUserOnServer("faculty", currentUser.username, {
        subject: subjectId,
        subjects: currentUser.subjects,
        subjectDivisions: currentUser.subjectDivisions || {}
      }).catch(err => console.warn("Background active subject sync failed:", err.message));
    }

    resetAttendanceFilters();
    activeTimetableSemester = getSemesterForSubject(subjectId);
    assignmentFilterDivision = "All Divisions";
    updateFacultySubjectSwitcher();
    navigate(currentPage);
  }
}

function updateFacultySubjectSwitcher() {
  const container = $("facultySubjectSwitcherContainer");
  if (!container) return;

  const validPages = ["dashboard", "attendance", "marks", "assignments", "notes", "timetable"];
  if (!currentUser || currentUser.role !== "faculty" || !validPages.includes(currentPage)) {
    container.innerHTML = "";
    return;
  }

  const eligibleSubjects = getFacultyEligibleSubjects(currentUser);
  if (!eligibleSubjects.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="topbar-class-switcher" style="display: flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-left: 8px;">
      <span style="font-size: 14px;">👨‍🏫</span>
      <div style="display:flex; flex-direction:column; line-height:1.1;">
        <small style="color: #64748b; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px;">Active Class</small>
        <select onchange="switchFacultyActiveSubject(this.value)" aria-label="Select Active Subject" style="padding: 2px 6px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; font-weight: 700; color: #1e293b; background: #f8fafc; cursor: pointer; outline: none; height: 26px; margin-top:2px;">
          ${eligibleSubjects.map(s => {
            const sSem = s.semester || getSemesterForSubject(s.id);
            const sYear = getCourseYearForSemester(sSem);
            const sDiv = getFacultySubjectDivision(currentUser, s.id);
            const sDivText = (!sDiv || sDiv === "Both Divisions" || sDiv === "All Divisions") ? "Div A & B" : sDiv;
            return `
              <option value="${s.id}" ${s.id === currentUser.subject ? "selected" : ""}>
                ${s.short || s.name} — ${sSem} [${sDivText}]
              </option>
            `;
          }).join("")}
        </select>
      </div>
      <button type="button" onclick="openFacultyEditProfileModal()" title="Manage or Add More Subjects" style="border:none; background:#f1f5f9; color:#475569; padding:4px 7px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; margin-left:2px;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">+ Classes</button>
    </div>
  `;
}

try { bindSubjectEvents(); } catch (e) { }
try { bindDivisionEvents(); } catch (e) { }

// Purge any legacy client-side localStorage caches so all data resides solely in MongoDB
try {
  localStorage.removeItem("smartPortalUsers");
  localStorage.removeItem("smartPortalAcademic");
} catch (_) { }

hydrateAcademicDataFromServer();

// ============================================================================
// APP BOOTSTRAP & SESSION RESTORATION (DIRECT FROM MONGODB)
// ============================================================================
hydrateUsersFromServer();

const saved = sessionStorage.getItem("portalUser");
if (saved) {
  try {
    currentUser = sanitizeClientUser(JSON.parse(saved));
    sessionStorage.setItem("portalUser", JSON.stringify(currentUser));
    openPortal();
  } catch (err) {
    console.error("Session restore error:", err);
    sessionStorage.removeItem("portalUser");
  }
}

window.addEventListener("pageshow", () => {
  if (!currentUser) {
    closeSignupModal();
    resetLoginForm();
  }
});





/* =========================================================
   PUBLIC HOMEPAGE CONTROLLER
   Uses the existing login/signup functions; no auth duplication.
   ========================================================= */
(function initPublicHomepage() {
  const home = document.getElementById("publicHome");
  const login = document.getElementById("loginPage");
  const signup = document.getElementById("signupPage");
  if (!home) return;

  const loadHomeStatsCount = async (force = false) => {
    const studentVal = document.getElementById("homeStudentCountVal");
    const facultyVal = document.getElementById("homeFacultyCountVal");
    const studentCard = document.getElementById("studentStatCard");
    const facultyCard = document.getElementById("facultyStatCard");
    if (!studentVal && !facultyVal) return;

    // Fast-path: immediately apply locally cached counts with 0ms delay if not forcing
    if (!force) {
      try {
        const raw = localStorage.getItem("campussphere_stats_counts");
        if (raw) {
          const cached = JSON.parse(raw);
          if (studentVal && typeof cached.students === "number") {
            studentVal.textContent = Number(cached.students).toLocaleString();
            studentVal.classList.remove("is-loading");
            if (studentCard) studentCard.setAttribute("aria-label", "Registered Students: " + studentVal.textContent);
          }
          if (facultyVal && typeof cached.faculty === "number") {
            facultyVal.textContent = Number(cached.faculty).toLocaleString();
            facultyVal.classList.remove("is-loading");
            if (facultyCard) facultyCard.setAttribute("aria-label", "Registered Faculty Members: " + facultyVal.textContent);
          }
        }
      } catch (_) {}
    }

    try {
      const url = `${API_BASE_URL}/api/stats/counts${force ? "?fresh=1" : ""}`;
      const res = await fetch(url, { cache: "no-store" }).then(r => r.json()).catch(() => null);
      if (res && res.success) {
        if (studentVal && typeof res.students === "number") {
          studentVal.textContent = Number(res.students).toLocaleString();
          studentVal.classList.remove("is-loading");
          if (studentCard) studentCard.setAttribute("aria-label", "Registered Students: " + studentVal.textContent);
        }
        if (facultyVal && typeof res.faculty === "number") {
          facultyVal.textContent = Number(res.faculty).toLocaleString();
          facultyVal.classList.remove("is-loading");
          if (facultyCard) facultyCard.setAttribute("aria-label", "Registered Faculty Members: " + facultyVal.textContent);
        }
        try {
          localStorage.setItem("campussphere_stats_counts", JSON.stringify({
            students: res.students,
            faculty: res.faculty,
            time: Date.now()
          }));
        } catch (_) {}
      } else {
        // Only set fallback if not already populated with numbers
        if (studentVal && !studentVal.textContent) { studentVal.textContent = "—"; studentVal.classList.remove("is-loading"); }
        if (facultyVal && !facultyVal.textContent) { facultyVal.textContent = "—"; facultyVal.classList.remove("is-loading"); }
      }
    } catch (_) {
      if (studentVal && !studentVal.textContent) { studentVal.textContent = "—"; studentVal.classList.remove("is-loading"); }
      if (facultyVal && !facultyVal.textContent) { facultyVal.textContent = "—"; facultyVal.classList.remove("is-loading"); }
    }
  };

  const showHome = () => {
    if (login) {
      login.classList.add("hidden");
      login.style.display = "none";
    }
    if (signup) {
      signup.classList.add("hidden");
      signup.style.display = "none";
    }
    home.classList.remove("hidden");
    document.querySelectorAll(".bg-orb").forEach(el => { el.style.display = "none"; });
    const h = window.location.hash.toLowerCase();
    if (h === "#login" || h === "#signup") {
      try {
        history.pushState("", document.title, window.location.pathname + window.location.search);
      } catch (_) {
        window.location.hash = "";
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadHomeStatsCount();
  };

  const showLogin = (updateHash = true) => {
    if (home) home.classList.add("hidden");
    if (signup) {
      signup.classList.add("hidden");
      signup.style.display = "none";
    }
    if (login) {
      login.classList.remove("hidden");
      login.style.display = "grid";
      try { resetLoginForm(); } catch (_) {}
    }
    document.querySelectorAll(".bg-orb").forEach(el => { el.style.display = ""; });
    if (updateHash && window.location.hash.toLowerCase() !== "#login") {
      window.location.hash = "login";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showSignup = (role = "student", updateHash = true) => {
    if (home) home.classList.add("hidden");
    if (login) {
      login.classList.add("hidden");
      login.style.display = "none";
    }
    if (signup) {
      signup.classList.remove("hidden");
      signup.style.display = "grid";
      if (typeof setPageSignupRole === "function") {
        setPageSignupRole(role);
      }
      if (typeof populatePageDivisionSelect === "function") {
        const curDiv = pageSignupDivision ? pageSignupDivision.value : "";
        const curYr = pageSignupCourseYear ? pageSignupCourseYear.value : null;
        populatePageDivisionSelect(curDiv, curYr);
      }
    }
    document.querySelectorAll(".bg-orb").forEach(el => { el.style.display = ""; });
    if (updateHash && window.location.hash.toLowerCase() !== "#signup") {
      window.location.hash = "signup";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dedicated Signup Page Controller
  const tabStudent = document.getElementById("tabSignupStudent");
  const tabFaculty = document.getElementById("tabSignupFaculty");
  const pageSignupRole = document.getElementById("pageSignupRole");
  const pageSignupTitle = document.getElementById("pageSignupTitle");
  const pageSignupSubtitle = document.getElementById("pageSignupSubtitle");
  const pageSignupSubmitLabel = document.getElementById("pageSignupSubmitLabel");
  const pageStudentFields = document.getElementById("pageStudentFields");
  const pageFacultyFields = document.getElementById("pageFacultyFields");
  const pageSignupCourseYear = document.getElementById("pageSignupCourseYear");
  const pageSignupSemester = document.getElementById("pageSignupSemester");
  const pageSignupDivision = document.getElementById("pageSignupDivision");
  const pageSignupLanguage = document.getElementById("pageSignupLanguage");
  const pageSignupMathWrap = document.getElementById("pageSignupMathWrap");
  const pageSignupForm = document.getElementById("pageSignupForm");
  const pageSignupMessage = document.getElementById("pageSignupMessage");
  const togglePageSignupPassword = document.getElementById("togglePageSignupPassword");
  const pageSignupPassword = document.getElementById("pageSignupPassword");

  const setPageSignupRole = (role) => {
    const isStudent = role === "student";
    if (pageSignupRole) pageSignupRole.value = role;
    if (tabStudent) tabStudent.classList.toggle("active", isStudent);
    if (tabFaculty) tabFaculty.classList.toggle("active", !isStudent);
    if (pageSignupTitle) pageSignupTitle.textContent = isStudent ? "Student Registration" : "Faculty Registration";
    if (pageSignupSubtitle) pageSignupSubtitle.textContent = isStudent ? "Register with your academic details to access student resources." : "Register and choose your assigned subjects to manage classes.";
    if (pageSignupSubmitLabel) pageSignupSubmitLabel.textContent = isStudent ? "Create Student Account" : "Create Faculty Account";
    if (pageStudentFields) pageStudentFields.style.display = isStudent ? "block" : "none";
    if (pageFacultyFields) pageFacultyFields.style.display = isStudent ? "none" : "block";

    if (pageSignupCourseYear && pageSignupCourseYear.type !== "hidden") pageSignupCourseYear.required = isStudent;
    if (pageSignupSemester && pageSignupSemester.type !== "hidden") pageSignupSemester.required = isStudent;
    if (pageSignupDivision && pageSignupDivision.type !== "hidden") pageSignupDivision.required = isStudent;
    if (pageSignupLanguage && pageSignupLanguage.type !== "hidden") pageSignupLanguage.required = isStudent;

    if (!isStudent) {
      renderPageFacultySubjects();
    }
    if (pageSignupMessage) {
      pageSignupMessage.textContent = "";
      pageSignupMessage.className = "message";
    }
  };

  const wirePageSemesterPillEvents = () => {
    const toggle = document.getElementById("pageSemesterSegmentedToggle");
    if (!toggle) return;
    const btns = toggle.querySelectorAll(".sem-pill-btn");
    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        const sem = btn.getAttribute("data-sem");
        if (!sem) return;
        if (pageSignupSemester) {
          pageSignupSemester.value = sem;
          pageSignupSemester.dispatchEvent(new Event("change"));
        }
        btns.forEach(b => {
          const match = b.getAttribute("data-sem") === sem;
          b.classList.toggle("active", match);
          b.setAttribute("aria-checked", match ? "true" : "false");
        });
        const is1stSem = sem === "1st Semester";
        if (pageSignupMathWrap) pageSignupMathWrap.style.display = is1stSem ? "block" : "none";
      });
    });
  };

  const updatePageSemesterOptions = (courseYear, selectedSem) => {
    if (!pageSignupSemester) return;
    const toggle = document.getElementById("pageSemesterSegmentedToggle");
    const validSemesters = (courseYear && typeof getSemestersForCourseYear === "function")
      ? getSemestersForCourseYear(courseYear)
      : ["1st Semester", "2nd Semester"];
    const sem1 = validSemesters[0] || "1st Semester";
    const sem2 = validSemesters[1] || "2nd Semester";

    if (toggle) {
      const isSem1 = selectedSem === sem1;
      const isSem2 = selectedSem === sem2;
      pageSignupSemester.value = isSem1 ? sem1 : (isSem2 ? sem2 : "");

      toggle.innerHTML = `
        <button type="button" class="sem-pill-btn ${isSem1 ? "active" : ""}" data-sem="${escapeHtml(sem1)}" role="radio" aria-checked="${isSem1 ? "true" : "false"}">${escapeHtml(sem1)}</button>
        <button type="button" class="sem-pill-btn ${isSem2 ? "active" : ""}" data-sem="${escapeHtml(sem2)}" role="radio" aria-checked="${isSem2 ? "true" : "false"}">${escapeHtml(sem2)}</button>
      `;
      wirePageSemesterPillEvents();
    } else {
      let html = `<option value="">Select Semester</option>`;
      validSemesters.forEach(sem => {
        html += `<option value="${escapeHtml(sem)}" ${selectedSem === sem ? "selected" : ""}>${escapeHtml(sem)}</option>`;
      });
      pageSignupSemester.innerHTML = html;
      if (selectedSem && validSemesters.includes(selectedSem)) {
        pageSignupSemester.value = selectedSem;
      } else {
        pageSignupSemester.value = "";
      }
    }

    const is1stSem = pageSignupSemester.value === "1st Semester";
    if (pageSignupMathWrap) pageSignupMathWrap.style.display = is1stSem ? "block" : "none";
  };

  const setPageSignupDivisionValue = (divVal) => {
    if (pageSignupDivision) {
      pageSignupDivision.value = divVal || "";
      pageSignupDivision.dispatchEvent(new Event("change"));
    }
    const toggle = document.getElementById("pageDivisionSegmentedToggle");
    if (!toggle) return;
    const btns = toggle.querySelectorAll(".div-pill-btn");
    btns.forEach(b => {
      const match = !!divVal && b.getAttribute("data-div") === divVal;
      b.classList.toggle("active", match);
      b.setAttribute("aria-checked", match ? "true" : "false");
    });
  };

  const wirePageDivisionPillEvents = () => {
    const toggle = document.getElementById("pageDivisionSegmentedToggle");
    if (!toggle) return;

    if (!toggle.__hasDivisionDelegation) {
      toggle.__hasDivisionDelegation = true;
      toggle.addEventListener("click", e => {
        const btn = e.target.closest(".div-pill-btn");
        if (!btn) return;
        e.preventDefault();
        const divVal = btn.getAttribute("data-div");
        if (divVal) {
          setPageSignupDivisionValue(divVal);
        }
      });
    }

    const btns = toggle.querySelectorAll(".div-pill-btn");
    btns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const divVal = btn.getAttribute("data-div");
        if (divVal) {
          setPageSignupDivisionValue(divVal);
        }
      };
    });
  };

  const populatePageDivisionSelect = (selectedDiv = "", courseYear = null) => {
    if (!pageSignupDivision) return;
    const yr = courseYear || (pageSignupCourseYear ? pageSignupCourseYear.value : null);
    const divs = typeof getAvailableDivisions === "function" ? getAvailableDivisions(yr) : ["Div A", "Div B"];
    const toggle = document.getElementById("pageDivisionSegmentedToggle");

    if (toggle) {
      toggle.style.gridTemplateColumns = `repeat(${Math.max(divs.length, 1)}, 1fr)`;
      let html = "";
      divs.forEach(d => {
        const isSelected = selectedDiv === d;
        html += `<button type="button" class="div-pill-btn ${isSelected ? "active" : ""}" data-div="${escapeHtml(d)}" role="radio" aria-checked="${isSelected ? "true" : "false"}">${escapeHtml(d)}</button>`;
      });
      toggle.innerHTML = html;
      if (selectedDiv && divs.includes(selectedDiv)) {
        pageSignupDivision.value = selectedDiv;
      } else {
        pageSignupDivision.value = "";
      }
      wirePageDivisionPillEvents();
    } else {
      let html = `<option value="">-- Select Division --</option>`;
      divs.forEach(d => {
        html += `<option value="${escapeHtml(d)}" ${selectedDiv === d ? "selected" : ""}>${escapeHtml(d)}</option>`;
      });
      pageSignupDivision.innerHTML = html;
      if (selectedDiv && divs.includes(selectedDiv)) {
        pageSignupDivision.value = selectedDiv;
      } else {
        pageSignupDivision.value = "";
      }
    }
  };

  const pageYearPillBtns = document.querySelectorAll(".year-pill-btn");
  const setPageSignupCourseYearValue = (year) => {
    if (pageSignupCourseYear) {
      pageSignupCourseYear.value = year;
    }
    pageYearPillBtns.forEach(btn => {
      const isMatch = btn.getAttribute("data-year") === year;
      btn.classList.toggle("active", isMatch);
      btn.setAttribute("aria-checked", isMatch ? "true" : "false");
    });
    updatePageSemesterOptions(year);
    populatePageDivisionSelect("", year);
  };

  pageYearPillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const yr = btn.getAttribute("data-year");
      if (yr) setPageSignupCourseYearValue(yr);
    });
  });

  if (pageSignupCourseYear) {
    pageSignupCourseYear.addEventListener("change", () => {
      setPageSignupCourseYearValue(pageSignupCourseYear.value);
    });
  }
  if (pageSignupSemester) {
    pageSignupSemester.addEventListener("change", () => {
      const is1stSem = pageSignupSemester.value === "1st Semester";
      if (pageSignupMathWrap) pageSignupMathWrap.style.display = is1stSem ? "block" : "none";
    });
  }
  if (pageSignupDivision) {
    pageSignupDivision.addEventListener("change", () => {
      setPageSignupDivisionValue(pageSignupDivision.value);
    });
  }

  const setPageSignupLanguageValue = (lang) => {
    if (pageSignupLanguage) {
      pageSignupLanguage.value = lang || "";
    }
    const btns = document.querySelectorAll(".lang-pill-btn");
    btns.forEach(btn => {
      const isMatch = !!lang && btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("active", isMatch);
      btn.setAttribute("aria-checked", isMatch ? "true" : "false");
    });
  };

  const wirePageLanguagePillEvents = () => {
    const toggle = document.getElementById("pageLanguageSegmentedToggle");
    if (!toggle) return;

    if (!toggle.__hasLanguageDelegation) {
      toggle.__hasLanguageDelegation = true;
      toggle.addEventListener("click", e => {
        const btn = e.target.closest(".lang-pill-btn");
        if (!btn) return;
        e.preventDefault();
        const langVal = btn.getAttribute("data-lang");
        if (langVal) {
          setPageSignupLanguageValue(langVal);
          if (pageSignupLanguage) {
            pageSignupLanguage.dispatchEvent(new Event("change"));
          }
        }
      });
    }

    const btns = toggle.querySelectorAll(".lang-pill-btn");
    btns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const langVal = btn.getAttribute("data-lang");
        if (langVal) {
          setPageSignupLanguageValue(langVal);
          if (pageSignupLanguage) {
            pageSignupLanguage.dispatchEvent(new Event("change"));
          }
        }
      };
    });
  };

  if (pageSignupLanguage) {
    pageSignupLanguage.addEventListener("change", () => {
      setPageSignupLanguageValue(pageSignupLanguage.value);
    });
  }

  // Faculty Subjects Selection for Signup Page
  let pageFacultySelectedSubjects = [];
  let pageFacultySubjectDivisions = {};
  let pageFacultySubjectSearchQuery = "";
  const pageSignupSelectedSubjectsWrap = document.getElementById("pageSignupSelectedSubjectsWrap");
  const pageSignupSubject = document.getElementById("pageSignupSubject");
  const pageFacultySubjectSearch = document.getElementById("pageFacultySubjectSearch");
  const pageBtnSearchFacultySubject = document.getElementById("pageBtnSearchFacultySubject");

  const renderPageFacultySubjects = (query = pageFacultySubjectSearchQuery) => {
    pageFacultySubjectSearchQuery = query;
    if (typeof renderDirectSubjectSearchResults === "function") {
      renderDirectSubjectSearchResults({
        containerId: "pageSignupDirectSubjectsList",
        query,
        selectedIds: pageFacultySelectedSubjects,
        onAddFnName: "addPageFacultySubject"
      });
    }
  };

  const renderPageFacultyChips = () => {
    if (!pageSignupSelectedSubjectsWrap) return;
    if (!pageFacultySelectedSubjects.length) {
      pageSignupSelectedSubjectsWrap.innerHTML = "";
      pageSignupSelectedSubjectsWrap.style.display = "none";
      if (pageSignupSubject) pageSignupSubject.value = "";
      return;
    }
    pageSignupSelectedSubjectsWrap.style.display = "flex";
    if (pageSignupSubject) pageSignupSubject.value = pageFacultySelectedSubjects[0];
    pageSignupSelectedSubjectsWrap.innerHTML = pageFacultySelectedSubjects.map((id, idx) => {
      const s = (typeof subjectById === "function" ? subjectById(id) : null) || { name: id, short: id };
      const sem = s.semester || (typeof getSemesterForSubject === "function" ? getSemesterForSubject(id) : "");
      const yr = typeof getCourseYearForSemester === "function" ? getCourseYearForSemester(sem) : null;
      const currentDiv = pageFacultySubjectDivisions[id] || "Both Divisions";
      return `
        <div class="assigned-subject-config-item" style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:6px 10px; margin:3px 0; width:100%;">
          <div style="min-width:0; flex:1; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="font-weight:700; color:#1e40af; font-size:12.5px;">${escapeHtml(s.short || s.name)}</span>
            <small style="color:#3b82f6; font-size:11px; font-weight:600;">(${escapeHtml(sem)})</small>
            ${idx === 0 ? `<span style="font-size:9.5px; background:#dbeafe; color:#1d4ed8; padding:1px 5px; border-radius:4px; font-weight:700;">Primary</span>` : ''}
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
            <select onchange="window.updatePageFacultySubjectDivision('${escapeHtml(id)}', this.value)" title="Assigned division for this subject" style="padding:3px 6px; font-size:11px; font-weight:700; border-radius:6px; border:1px solid #93c5fd; background:#ffffff; color:#1e293b; cursor:pointer;">
              ${typeof renderFacultyDivisionSelectOptions === "function" ? renderFacultyDivisionSelectOptions(currentDiv, yr) : `<option value="Both Divisions">Both Divisions</option>`}
            </select>
            <button type="button" onclick="window.removePageFacultySubject('${escapeHtml(id)}')" style="border:none; background:transparent; color:#ef4444; font-size:14px; cursor:pointer; padding:0 3px; line-height:1; font-weight:bold;" title="Remove">✕</button>
          </div>
        </div>
      `;
    }).join("");
  };

  window.addPageFacultySubject = (subId) => {
    const id = subId || "";
    if (!id) return;
    if (!pageFacultySelectedSubjects.includes(id)) {
      pageFacultySelectedSubjects.push(id);
    }
    if (!pageFacultySubjectDivisions[id]) {
      pageFacultySubjectDivisions[id] = "Both Divisions";
    }
    renderPageFacultyChips();
    renderPageFacultySubjects();
    if (pageSignupMessage) pageSignupMessage.textContent = "";
  };

  window.removePageFacultySubject = (id) => {
    pageFacultySelectedSubjects = pageFacultySelectedSubjects.filter(item => item !== id);
    delete pageFacultySubjectDivisions[id];
    renderPageFacultyChips();
    renderPageFacultySubjects();
  };

  window.updatePageFacultySubjectDivision = (id, val) => {
    if (id) {
      pageFacultySubjectDivisions[id] = val || "Both Divisions";
      renderPageFacultyChips();
    }
  };

  if (pageBtnSearchFacultySubject && pageFacultySubjectSearch) {
    const runSearch = () => renderPageFacultySubjects(pageFacultySubjectSearch.value);
    pageBtnSearchFacultySubject.addEventListener("click", runSearch);
    pageFacultySubjectSearch.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        runSearch();
      }
    });
  }

  // Password toggle for signup page
  if (togglePageSignupPassword && pageSignupPassword) {
    togglePageSignupPassword.addEventListener("click", () => {
      const isPass = pageSignupPassword.type === "password";
      pageSignupPassword.type = isPass ? "text" : "password";
      togglePageSignupPassword.innerHTML = isPass ? eyeCloseSVG : eyeOpenSVG;
      togglePageSignupPassword.setAttribute("aria-label", isPass ? "Hide password" : "Show password");
      togglePageSignupPassword.setAttribute("title", isPass ? "Hide password" : "Show password");
    });
  }

  if (tabStudent) tabStudent.addEventListener("click", () => setPageSignupRole("student"));
  if (tabFaculty) tabFaculty.addEventListener("click", () => setPageSignupRole("faculty"));

  // Initial population of dropdowns and segmented toggles
  populatePageDivisionSelect();
  updatePageSemesterOptions("");
  wirePageLanguagePillEvents();
  setPageSignupLanguageValue("");

  // Signup Page Form Submission
  if (pageSignupForm) {
    pageSignupForm.addEventListener("submit", async e => {
      e.preventDefault();
      const role = pageSignupRole ? pageSignupRole.value : "student";
      const name = $("pageSignupName") ? $("pageSignupName").value.trim() : "";
      const username = $("pageSignupUsername") ? $("pageSignupUsername").value.trim() : "";
      const password = pageSignupPassword ? pageSignupPassword.value : "";
      const email = $("pageSignupEmail") ? $("pageSignupEmail").value.trim().toLowerCase() : "";
      const department = role === "faculty" ? ($("pageSignupDepartment") ? $("pageSignupDepartment").value.trim() : "Department of Computer Science & Applications") : null;

      const subjects = role === "faculty" ? (pageFacultySelectedSubjects.length ? pageFacultySelectedSubjects : ($("pageSignupSubject") && $("pageSignupSubject").value ? [$("pageSignupSubject").value] : [])) : null;
      const subject = role === "faculty" ? (subjects && subjects.length ? subjects[0] : null) : null;
      const primarySubjectDivision = (role === "faculty" && subject && pageFacultySubjectDivisions[subject]) ? pageFacultySubjectDivisions[subject] : "Both Divisions";
      const facultyDivision = role === "faculty" ? primarySubjectDivision : null;
      const subjectDivisions = role === "faculty" ? pageFacultySubjectDivisions : null;

      const course = role === "student" ? ($("pageSignupCourse") ? $("pageSignupCourse").value.trim() : "Bachelor of Computer Applications (BCA)") : null;
      const courseYear = role === "student" ? (pageSignupCourseYear ? pageSignupCourseYear.value : "") : null;
      const semester = role === "student" ? (pageSignupSemester ? pageSignupSemester.value : "") : null;
      const division = role === "student" ? (pageSignupDivision ? pageSignupDivision.value : "") : facultyDivision;
      const languageChoice = role === "student" ? ($("pageSignupLanguage") ? $("pageSignupLanguage").value : "") : null;
      const mathChoice = role === "student" ? ($("pageSignupMathChoice") ? $("pageSignupMathChoice").value : "") : null;

      if (role === "faculty" && (!subjects || !subjects.length)) {
        if (pageSignupMessage) {
          pageSignupMessage.textContent = "Please select and add at least one subject/class for the faculty member.";
          pageSignupMessage.className = "message error";
        }
        return;
      }

      if (role === "student") {
        if (!courseYear || !semester || !division || !languageChoice) {
          if (pageSignupMessage) {
            pageSignupMessage.textContent = "Please select all required academic details (Course Year, Semester, Division, Language Choice).";
            pageSignupMessage.className = "message error";
          }
          return;
        }
      }

      if (!password) {
        if (pageSignupMessage) {
          pageSignupMessage.textContent = "Password is required.";
          pageSignupMessage.className = "message error";
        }
        return;
      }

      const error = typeof validateUserInput === "function" ? validateUserInput({ username, password, email, role, subject, currentUsername: null }) : null;
      if (error) {
        if (pageSignupMessage) {
          pageSignupMessage.textContent = error;
          pageSignupMessage.className = "message error";
        }
        return;
      }

      const submitBtn = pageSignupForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const created = await createUserOnServer({
          name, username, password, email, role, subject, subjects, subjectDivisions, department,
          division, semester, courseYear, course, languageChoice, mathChoice
        });
        USERS[role].push(created);
        if (role === "student") {
          ensureStudentRecord(username);
          saveAcademicData();
        }
        saveUsers();
        await hydrateUsersFromServer();
        await hydrateAcademicDataFromServer();
        if (typeof render === "function") render();

        if (pageSignupMessage) {
          pageSignupMessage.textContent = "Account created successfully! Redirecting to Sign In...";
          pageSignupMessage.className = "message success";
        }

        const loginUserField = document.getElementById("username");
        const loginPassField = document.getElementById("password");
        if (loginUserField) loginUserField.value = username;
        if (loginPassField) loginPassField.value = "";
        currentRole = role;
        document.querySelectorAll(".role-tab[data-role]").forEach(b => b.classList.toggle("active", b.dataset.role === role));
        const roleLabel = document.getElementById("loginUsernameLabel");
        if (roleLabel) roleLabel.textContent = "Username";

        setTimeout(() => {
          pageSignupForm.reset();
          pageFacultySelectedSubjects = [];
          pageFacultySubjectDivisions = {};
          renderPageFacultyChips();
          setPageSignupCourseYearValue("");
          updatePageSemesterOptions("");
          populatePageDivisionSelect();
          setPageSignupLanguageValue("");
          if (pageSignupMessage) {
            pageSignupMessage.textContent = "";
            pageSignupMessage.className = "message";
          }
          if (typeof showLogin === "function") {
            showLogin(true);
          }
        }, 1100);
      } catch (err) {
        console.error("Signup error:", err);
        if (pageSignupMessage) {
          pageSignupMessage.textContent = err.message || "Unable to create account.";
          pageSignupMessage.className = "message error";
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  window.CampusSpherePublic = { showHome, showLogin, showSignup, setPageSignupRole, loadHomeStatsCount };
  window.loadHomeStatsCount = loadHomeStatsCount;
  window.refreshCampusSphereStats = () => loadHomeStatsCount(true);

  document.querySelectorAll("[data-open-login]").forEach(btn => {
    btn.addEventListener("click", () => showLogin(true));
  });

  document.querySelectorAll("[data-open-signup]").forEach(btn => {
    btn.addEventListener("click", () => {
      showSignup("student", true);
    });
  });

  document.querySelectorAll("[data-back-home]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showHome();
    });
  });

  document.querySelectorAll("[data-footer-placeholder]").forEach(link => {
    link.addEventListener("click", e => e.preventDefault());
  });

  const nav = home.querySelector(".public-nav");
  const toggle = home.querySelector(".public-menu-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    });
    nav.querySelectorAll(".public-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const year = document.getElementById("homeCurrentYear");
  if (year) year.textContent = String(new Date().getFullYear());

  // Aesthetic scroll-triggered reveal animations
  const revealElements = home.querySelectorAll(".reveal-item");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add("is-revealed"));
  }

  const sections = [
    { id: "publicHome", links: ["Home"] },
    { id: "why-campussphere", links: ["Why CampusSphere", "Features"] },
    { id: "students-faculty-count", links: ["Students", "Faculty"] },
    { id: "student-community", links: ["Community"] }
  ];
  const navLinks = Array.from(home.querySelectorAll(".public-nav-link"));
  const updateActiveNav = () => {
    const y = window.scrollY + 130;
    let activeId = "publicHome";
    sections.forEach(item => {
      const section = document.getElementById(item.id);
      if (section && section.offsetTop <= y) activeId = item.id;
    });
    navLinks.forEach(link => {
      const text = link.textContent.trim();
      const item = sections.find(s => s.id === activeId);
      const isMatch = !!item && item.links.some(l => text === l || text.startsWith(l + " "));
      link.classList.toggle("active", isMatch);
    });
  };
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  window.addEventListener("hashchange", () => {
    if (sessionStorage.getItem("portalUser")) return;
    const h = window.location.hash.toLowerCase();
    if (h === "#signup") {
      showSignup("student", false);
    } else if (h === "#login" || h === "#signin") {
      showLogin(false);
    } else if (h === "#students" || h === "#student-statistics" || h === "#students-faculty-count") {
      showHome();
      loadHomeStatsCount();
    } else if (h === "#publichome" || h === "" || h.startsWith("#why") || h.startsWith("#courses") || h.startsWith("#student")) {
      showHome();
    }
  });

  /* If a logged-in session is restored, the existing openPortal()
     remains authoritative and hides this public layer. */
  const savedSession = sessionStorage.getItem("portalUser");
  if (savedSession) {
    home.classList.add("hidden");
    document.querySelectorAll(".bg-orb").forEach(el => { el.style.display = "none"; });
  } else if (window.location.hash.toLowerCase() === "#signup" || window.location.pathname.toLowerCase().startsWith("/signup")) {
    showSignup("student", false);
  } else if (window.location.hash.toLowerCase() === "#login" || window.location.hash.toLowerCase() === "#signin" || window.location.pathname.toLowerCase().startsWith("/login")) {
    showLogin(false);
  } else {
    showHome();
  }
})();
