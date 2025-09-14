// DigiMind - Digital Psychological Intervention Web App
// Global Variables
let currentUser = null;
let isLoginMode = true;
let breathingInterval = null;
let sosBreathingInterval = null;
let uiConfig = null;

// Load UI Configuration
async function loadUIConfig() {
    try {
        const response = await fetch('data/ui-config.json');
        if (response.ok) {
            uiConfig = await response.json();
            console.log('UI Configuration loaded successfully');
        } else {
            console.warn('UI Configuration file not found, using defaults');
            uiConfig = {
                theme: { primaryColor: '#6366f1' },
                features: { enableNotifications: true }
            };
        }
    } catch (error) {
        console.warn('Error loading UI configuration:', error);
        uiConfig = {
            theme: { primaryColor: '#6366f1' },
            features: { enableNotifications: true }
        };
    }
}

// Counsellor Management Functions
function openAddCounsellorModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add New Counsellor</h3>
            <form id="addCounsellorForm">
                <div class="form-group">
                    <input type="text" id="counsellorName" placeholder="Full Name" required>
                </div>
                <div class="form-group">
                    <input type="email" id="counsellorEmail" placeholder="Email" required>
                </div>
                <div class="form-group">
                    <input type="tel" id="counsellorPhone" placeholder="Phone Number" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorSpecialization" placeholder="Specialization" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorLanguages" placeholder="Languages (comma separated)" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorExperience" placeholder="Years of Experience" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Counsellor</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('addCounsellorForm').addEventListener('submit', handleAddCounsellor);
}

function handleAddCounsellor(e) {
    e.preventDefault();
    const newCounsellor = {
        id: 'c' + Date.now(),
        name: document.getElementById('counsellorName').value,
        email: document.getElementById('counsellorEmail').value,
        phone: document.getElementById('counsellorPhone').value,
        specialization: document.getElementById('counsellorSpecialization').value,
        languages: document.getElementById('counsellorLanguages').value.split(',').map(lang => lang.trim()),
        experience: document.getElementById('counsellorExperience').value,
        location: 'Coimbatore',
        available: true
    };

    // In a real application, this would be an API call
    let counsellors = JSON.parse(localStorage.getItem('counsellors') || '{"counsellors": []}');
    counsellors.counsellors.push(newCounsellor);
    localStorage.setItem('counsellors', JSON.stringify(counsellors));

    closeModal();
    loadCounsellorManagement();
}

function editCounsellor(counsellorId) {
    const counsellors = JSON.parse(localStorage.getItem('counsellors') || '{"counsellors": []}');
    const counsellor = counsellors.counsellors.find(c => c.id === counsellorId);
    
    if (!counsellor) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Counsellor</h3>
            <form id="editCounsellorForm">
                <input type="hidden" id="counsellorId" value="${counsellor.id}">
                <div class="form-group">
                    <input type="text" id="counsellorName" value="${counsellor.name}" required>
                </div>
                <div class="form-group">
                    <input type="email" id="counsellorEmail" value="${counsellor.email}" required>
                </div>
                <div class="form-group">
                    <input type="tel" id="counsellorPhone" value="${counsellor.phone}" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorSpecialization" value="${counsellor.specialization}" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorLanguages" value="${counsellor.languages.join(', ')}" required>
                </div>
                <div class="form-group">
                    <input type="text" id="counsellorExperience" value="${counsellor.experience}" required>
                </div>
                <button type="submit" class="btn btn-primary">Update Counsellor</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('editCounsellorForm').addEventListener('submit', handleEditCounsellor);
}

function handleEditCounsellor(e) {
    e.preventDefault();
    const counsellorId = document.getElementById('counsellorId').value;
    const updatedCounsellor = {
        id: counsellorId,
        name: document.getElementById('counsellorName').value,
        email: document.getElementById('counsellorEmail').value,
        phone: document.getElementById('counsellorPhone').value,
        specialization: document.getElementById('counsellorSpecialization').value,
        languages: document.getElementById('counsellorLanguages').value.split(',').map(lang => lang.trim()),
        experience: document.getElementById('counsellorExperience').value,
        location: 'Coimbatore',
        available: true
    };

    let counsellors = JSON.parse(localStorage.getItem('counsellors') || '{"counsellors": []}');
    const index = counsellors.counsellors.findIndex(c => c.id === counsellorId);
    if (index !== -1) {
        counsellors.counsellors[index] = updatedCounsellor;
        localStorage.setItem('counsellors', JSON.stringify(counsellors));
    }

    closeModal();
    loadCounsellorManagement();
}

function deleteCounsellor(counsellorId) {
    if (confirm('Are you sure you want to delete this counsellor?')) {
        let counsellors = JSON.parse(localStorage.getItem('counsellors') || '{"counsellors": []}');
        counsellors.counsellors = counsellors.counsellors.filter(c => c.id !== counsellorId);
        localStorage.setItem('counsellors', JSON.stringify(counsellors));
        loadCounsellorManagement();
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Counsellor Management Functions
function loadCounsellorManagement() {
    fetch('counsellors.json')
        .then(response => response.json())
        .then(data => {
            const counsellors = data.counsellors || data;
            const adminContent = document.getElementById('adminContent');
            adminContent.innerHTML = `
                <div class="management-section">
                    <div class="section-header">
                        <h3>Manage Counsellors</h3>
                        <button class="btn btn-primary" onclick="openAddCounsellorModal()">Add New Counsellor</button>
                    </div>
                    <div class="counsellors-list">
                        ${counsellors.map(counsellor => `
                            <div class="counsellor-card">
                                <div class="counsellor-info">
                                    <h4>${counsellor.name}</h4>
                                    <p>📍 ${counsellor.location || 'Coimbatore'}</p>
                                    <p>🔬 ${counsellor.specialty}</p>
                                    <p>🗣️ ${counsellor.languages ? counsellor.languages.join(', ') : 'Tamil, English'}</p>
                                    <p>📞 ${counsellor.phone || 'N/A'}</p>
                                    <p>⭐ Rating: ${counsellor.rating || 'N/A'}/5.0</p>
                                    <p>📚 ${counsellor.qualification || 'Professional Qualification'}</p>
                                </div>
                                <div class="counsellor-actions">
                                    <button class="btn btn-secondary" onclick="editCounsellor('${counsellor.id}')">Edit</button>
                                    <button class="btn btn-danger" onclick="deleteCounsellor('${counsellor.id}')">Delete</button>
                                    <button class="btn btn-info" onclick="viewCounsellorDetails('${counsellor.id}')">View Details</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error loading counsellors:', error);
            const adminContent = document.getElementById('adminContent');
            adminContent.innerHTML = '<p>Error loading counsellors data. Please try again.</p>';
        });
}

// Chat functionality
function openChatModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content chat-modal">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Patient Chat 💬</h2>
            <div class="chat-container">
                <div class="chat-header">
                    <select id="chatStudentSelect" onchange="loadChatHistory()">
                        <option value="">Select a patient...</option>
                    </select>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <p>Select a patient to start chatting</p>
                </div>
                <div class="chat-input">
                    <input type="text" id="chatInput" placeholder="Type your message..." disabled onkeypress="handleChatKeyPress(event)">
                    <button onclick="sendMessage()" disabled id="sendBtn">Send 📤</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    loadChatPatients();
}

// Open chat with specific student
function openChatWithStudent(studentId) {
    openChatModal();
    setTimeout(() => {
        const select = document.getElementById('chatStudentSelect');
        select.value = studentId;
        loadChatHistory();
    }, 100);
}

// Load chat patients
function loadChatPatients() {
    const select = document.getElementById('chatStudentSelect');
    const bookings = getBookingData();
    const users = getUserData();
    
    const patientIds = [...new Set(bookings.filter(b => b.counsellorId === currentUser.id).map(b => b.studentId))];
    const patients = users.filter(u => patientIds.includes(u.id));
    
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = patient.name || patient.email.split('@')[0];
        select.appendChild(option);
    });
}

// Load chat history
function loadChatHistory() {
    const studentId = document.getElementById('chatStudentSelect').value;
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (!studentId) {
        chatMessages.innerHTML = '<p>Select a patient to start chatting</p>';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        return;
    }
    
    chatInput.disabled = false;
    sendBtn.disabled = false;
    
    const messages = getChatMessages(currentUser.id, studentId);
    
    if (messages.length === 0) {
        chatMessages.innerHTML = '<p>No messages yet. Start the conversation!</p>';
        return;
    }
    
    chatMessages.innerHTML = messages.map(msg => `
        <div class="message ${msg.senderId === currentUser.id ? 'sent' : 'received'}">
            <div class="message-content">${msg.content}</div>
            <div class="message-time">${formatTime(msg.timestamp)}</div>
        </div>
    `).join('');
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle chat key press
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send message
function sendMessage() {
    const studentId = document.getElementById('chatStudentSelect').value;
    const chatInput = document.getElementById('chatInput');
    const content = chatInput.value.trim();
    
    if (!content || !studentId) return;
    
    const message = {
        id: generateId(),
        senderId: currentUser.id,
        receiverId: studentId,
        content: content,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    saveChatMessage(message);
    chatInput.value = '';
    loadChatHistory();
}

// Get chat messages between counsellor and student
function getChatMessages(counsellorId, studentId) {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    return messages.filter(msg => 
        (msg.senderId === counsellorId && msg.receiverId === studentId) ||
        (msg.senderId === studentId && msg.receiverId === counsellorId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Save chat message
function saveChatMessage(message) {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// Start counselling session
function startSession(bookingId) {
    const bookings = getBookingData();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
        booking.status = 'in-progress';
        booking.startTime = new Date().toISOString();
        saveBookingData(bookings);
        
        showNotification('Session started successfully! 🎯', 'success');
        loadCounsellorAppointments();
    }
}

// View student profile
function viewStudentProfile(studentId) {
    const users = getUserData();
    const student = users.find(u => u.id === studentId);
    
    if (!student) {
        showNotification('Student profile not found.', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>👤 Student Profile</h2>
            <div class="profile-info">
                <p><strong>Name:</strong> ${student.name || student.email.split('@')[0]}</p>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Join Date:</strong> ${formatDate(student.joinDate || new Date())}</p>
                <p><strong>Total Sessions:</strong> ${getStudentSessionCount(studentId)}</p>
                <p><strong>Current Streak:</strong> ${student.streak || 0} days</p>
                <p><strong>Wellness Points:</strong> ${student.points || 0}</p>
            </div>
            <div class="profile-actions">
                <button class="btn btn-primary" onclick="openChatWithStudent('${studentId}')">Start Chat 💬</button>
                <button class="btn btn-secondary" onclick="viewStudentHistory('${studentId}')">View History 📊</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Get student session count
function getStudentSessionCount(studentId) {
    const bookings = getBookingData();
    return bookings.filter(b => b.studentId === studentId && b.status === 'completed').length;
}

// Update availability
function updateAvailability() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Update Schedule 🕰️</h2>
            <form id="availabilityForm">
                <div class="form-group">
                    <label>Available Days:</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" value="monday"> Monday</label>
                        <label><input type="checkbox" value="tuesday"> Tuesday</label>
                        <label><input type="checkbox" value="wednesday"> Wednesday</label>
                        <label><input type="checkbox" value="thursday"> Thursday</label>
                        <label><input type="checkbox" value="friday"> Friday</label>
                        <label><input type="checkbox" value="saturday"> Saturday</label>
                        <label><input type="checkbox" value="sunday"> Sunday</label>
                    </div>
                </div>
                <div class="form-group">
                    <label>Start Time:</label>
                    <input type="time" id="startTime" value="09:00" required>
                </div>
                <div class="form-group">
                    <label>End Time:</label>
                    <input type="time" id="endTime" value="17:00" required>
                </div>
                <button type="submit" class="btn btn-primary">Update Schedule 📅</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    document.getElementById('availabilityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAvailability();
    });
}

// Save availability
function saveAvailability() {
    const checkedDays = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (checkedDays.length === 0) {
        showNotification('Please select at least one available day.', 'error');
        return;
    }
    
    const availability = {
        days: checkedDays,
        startTime: startTime,
        endTime: endTime
    };
    
    currentUser.availability = availability;
    
    const users = getUserData();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    showNotification('Schedule updated successfully! 📅', 'success');
    closeModal();
}

// View patient records
function viewPatientRecords() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Patient Records 📁</h2>
            <div class="records-container">
                <div id="patientRecordsList">
                    Loading patient records...
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    loadPatientRecords();
}

// Load patient records
function loadPatientRecords() {
    const container = document.getElementById('patientRecordsList');
    const bookings = getBookingData();
    const users = getUserData();
    
    const counsellorBookings = bookings.filter(b => b.counsellorId === currentUser.id);
    const patientIds = [...new Set(counsellorBookings.map(b => b.studentId))];
    const patients = users.filter(u => patientIds.includes(u.id));
    
    if (patients.length === 0) {
        container.innerHTML = '<p>No patient records found.</p>';
        return;
    }
    
    container.innerHTML = patients.map(patient => {
        const patientBookings = counsellorBookings.filter(b => b.studentId === patient.id);
        const completedSessions = patientBookings.filter(b => b.status === 'completed').length;
        const upcomingSessions = patientBookings.filter(b => b.status === 'confirmed' && new Date(b.date) > new Date()).length;
        
        return `
            <div class="patient-record-card">
                <div class="patient-info">
                    <h4>👤 ${patient.name || patient.email.split('@')[0]}</h4>
                    <p><strong>Email:</strong> ${patient.email}</p>
                    <p><strong>Total Sessions:</strong> ${completedSessions}</p>
                    <p><strong>Upcoming:</strong> ${upcomingSessions}</p>
                </div>
                <div class="patient-actions">
                    <button class="btn btn-primary" onclick="openChatWithStudent('${patient.id}')">Chat 💬</button>
                </div>
            </div>
        `;
    }).join('');
}

// Load reports
function loadReports() {
    loadMoodReport();
    loadAssessmentReport();
    loadActivityReport();
    loadRewardsReport();
}

// Load mood report
function loadMoodReport() {
    const container = document.getElementById('moodReport');
    const moodData = getMoodData().filter(m => m.userId === currentUser.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (moodData.length === 0) {
        container.innerHTML = '<p>No mood data yet. Start tracking! 😊</p>';
        return;
    }
    
    // Calculate mood statistics
    const moodCounts = moodData.reduce((acc, mood) => {
        acc[mood.mood] = (acc[mood.mood] || 0) + 1;
        return acc;
    }, {});
    
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
    const last7Days = moodData.slice(0, 7);
    
    container.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <p><strong>Total Mood Entries:</strong> ${moodData.length}</p>
            <p><strong>Most Common Mood:</strong> ${getMoodEmoji(mostCommonMood)} ${mostCommonMood}</p>
        </div>
        <p><strong>Recent 7 entries:</strong></p>
        <div style="max-height: 200px; overflow-y: auto;">
            ${last7Days.map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; margin: 3px 0; background: #f8f9ff; border-radius: 6px;">
                    <span style="font-size: 0.9rem;">${new Date(m.date).toLocaleDateString()}</span>
                    <span style="font-size: 1.1rem;">${getMoodEmoji(m.mood)} ${m.mood}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Load assessment report
function loadAssessmentReport() {
    const container = document.getElementById('assessmentReport');
    const assessments = getAssessmentData().filter(a => a.userId === currentUser.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (assessments.length === 0) {
        container.innerHTML = '<p>No assessments completed yet. 📋</p>';
        return;
    }
    
    const lastAssessment = assessments[0];
    const avgScore = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;
    
    // Calculate trend
    let trendText = '';
    let trendIcon = '';
    if (assessments.length > 1) {
        const secondLast = assessments[1];
        if (lastAssessment.score < secondLast.score) {
            trendText = 'Improving! 📈';
            trendIcon = '⬆️';
        } else if (lastAssessment.score > secondLast.score) {
            trendText = 'Needs attention 📉';
            trendIcon = '⬇️';
        } else {
            trendText = 'Stable ➡️';
            trendIcon = '➡️';
        }
    }
    
    container.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <p><strong>Total Assessments:</strong> ${assessments.length}</p>
            <p><strong>Average Score:</strong> ${avgScore.toFixed(1)}/5</p>
            ${trendText ? `<p><strong>Trend:</strong> ${trendIcon} ${trendText}</p>` : ''}
        </div>
        <p><strong>Latest Assessment:</strong></p>
        <div style="background: #f8f9ff; padding: 10px; border-radius: 6px;">
            <p>Date: ${new Date(lastAssessment.date).toLocaleDateString()}</p>
            <p>Risk Level: <strong style="color: ${lastAssessment.riskLevel === 'Low' ? '#28a745' : lastAssessment.riskLevel === 'High' ? '#dc3545' : '#ffc107'}">${lastAssessment.riskLevel}</strong></p>
            <p>Score: ${lastAssessment.score.toFixed(1)}/5</p>
        </div>
    `;
}

// Load activity report
function loadActivityReport() {
    const container = document.getElementById('activityReport');
    const activities = getActivityData().filter(a => a.userId === currentUser.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (activities.length === 0) {
        container.innerHTML = '<p>No activities yet. Start exploring! 🌱</p>';
        return;
    }
    
    const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
    const recentActivities = activities.slice(0, 8); // Show 8 most recent
    
    // Calculate activity breakdown
    const activityBreakdown = activities.reduce((acc, a) => {
        const type = a.reason.toLowerCase().includes('mood') ? 'Mood Tracking' :
                    a.reason.toLowerCase().includes('assessment') ? 'Assessments' :
                    a.reason.toLowerCase().includes('journal') ? 'Journaling' :
                    a.reason.toLowerCase().includes('breathing') ? 'Wellness' :
                    a.reason.toLowerCase().includes('session') ? 'Bookings' :
                    'Other';
        acc[type] = (acc[type] || 0) + (a.points || 0);
        return acc;
    }, {});
    
    container.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <p><strong>Total Points Earned:</strong> ${totalPoints} 🎖️</p>
            <p><strong>Total Activities:</strong> ${activities.length}</p>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <p><strong>Points by Category:</strong></p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                ${Object.entries(activityBreakdown).map(([type, points]) => `
                    <span style="background: var(--secondary-color); padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem;">
                        ${type}: ${points}pts
                    </span>
                `).join('')}
            </div>
        </div>
        
        <p><strong>Recent Activities:</strong></p>
        <div style="max-height: 200px; overflow-y: auto;">
            ${recentActivities.map(a => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 3px 0; background: #f8f9ff; border-radius: 6px;">
                    <div style="flex: 1;">
                        <div style="font-size: 0.9rem; font-weight: 500;">${a.reason}</div>
                        <small style="color: #666;">${new Date(a.date).toLocaleDateString()} at ${new Date(a.date).toLocaleTimeString()}</small>
                    </div>
                    <span style="background: var(--primary-color); color: white; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                        +${a.points} pts
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

// Load rewards report
function loadRewardsReport() {
    const container = document.getElementById('rewardsReport');
    
    container.innerHTML = `
        <p><strong>Total Points:</strong> ${currentUser.points} 🎖️</p>
        <p><strong>Badges Earned:</strong> ${currentUser.badges ? currentUser.badges.length : 0} 🏆</p>
        <p><strong>Current Streak:</strong> ${currentUser.streak} days 🔥</p>
    `;
}

// Export data
function exportData() {
    const userData = {
        user: currentUser,
        moods: getMoodData().filter(m => m.userId === currentUser.id),
        assessments: getAssessmentData().filter(a => a.userId === currentUser.id),
        activities: getActivityData().filter(a => a.userId === currentUser.id),
        journals: getJournalData().filter(j => j.userId === currentUser.id),
        bookings: getBookingData().filter(b => b.userId === currentUser.id)
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `digimind-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully! 📄', 'success');
}

// Load admin dashboard
function loadAdminDashboard() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const bookings = getBookingData();
    const assessments = getAssessmentData();
    const moods = getMoodData();
    const activities = getActivityData();
    const journals = getJournalData();
    
    // Update statistics
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('totalMoodEntries').textContent = moods.length;
    
    // Calculate additional stats
    const activeUsers = users.filter(u => {
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(u.lastMoodCheck || 0) > lastWeek;
    }).length;
    
    const highRiskAssessments = assessments.filter(a => a.riskLevel === 'High').length;
    const averagePoints = users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (u.points || 0), 0) / users.length) : 0;
    
    // Create detailed admin view
    const adminContainer = document.querySelector('#admin .container');
    if (adminContainer) {
        // Add additional stats after existing stat cards
        const existingStats = adminContainer.querySelector('.admin-stats');
        if (existingStats && !adminContainer.querySelector('.admin-details')) {
            const detailsSection = document.createElement('div');
            detailsSection.className = 'admin-details';
            detailsSection.innerHTML = `
                <div class="card" style="margin-top: 2rem;">
                    <h3>Detailed Analytics 📊</h3>
                    <div class="details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                        <div style="background: #f8f9ff; padding: 1rem; border-radius: 8px; text-align: center;">
                            <strong>${activeUsers}</strong><br>
                            <small>Active Users (last 7 days)</small>
                        </div>
                        <div style="background: #f8f9ff; padding: 1rem; border-radius: 8px; text-align: center;">
                            <strong>${highRiskAssessments}</strong><br>
                            <small>High Risk Assessments</small>
                        </div>
                        <div style="background: #f8f9ff; padding: 1rem; border-radius: 8px; text-align: center;">
                            <strong>${averagePoints}</strong><br>
                            <small>Average User Points</small>
                        </div>
                        <div style="background: #f8f9ff; padding: 1rem; border-radius: 8px; text-align: center;">
                            <strong>${journals.length}</strong><br>
                            <small>Journal Entries</small>
                        </div>
                    </div>
                    <div style="margin-top: 2rem;">
                        <h4>User Breakdown by Role:</h4>
                        <div style="margin-top: 0.5rem;">
                            ${['student', 'counsellor', 'admin'].map(role => {
                                const count = users.filter(u => u.role === role).length;
                                return `<span style="margin-right: 1rem; background: var(--primary-color); padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem;">${role}: ${count}</span>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
            adminContainer.appendChild(detailsSection);
        }
    }
}

// SOS functions
function openSOS() {
    document.getElementById('sosModal').style.display = 'block';
}

function closeSOS() {
    document.getElementById('sosModal').style.display = 'none';
    stopSOSBreathing();
}

function startSOSBreathing() {
    const circle = document.getElementById('sosBreathingCircle');
    const text = document.getElementById('sosBreathingText');
    const btn = document.getElementById('sosBreathingBtn');
    
    if (sosBreathingInterval) {
        stopSOSBreathing();
        return;
    }
    
    circle.classList.add('breathing');
    btn.textContent = 'Stop Breathing';
    
    let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
    const phases = ['Breathe In Slowly', 'Hold', 'Breathe Out Slowly', 'Hold'];
    const durations = [4000, 2000, 6000, 2000]; // 4-2-6-2 calming pattern
    
    function nextPhase() {
        if (!sosBreathingInterval) return;
        
        text.textContent = phases[phase];
        
        setTimeout(() => {
            if (sosBreathingInterval) {
                phase = (phase + 1) % 4;
                nextPhase();
            }
        }, durations[phase]);
    }
    
    nextPhase();
    
    // Auto-stop after 5 minutes for emergency sessions
    sosBreathingInterval = setTimeout(() => {
        if (sosBreathingInterval) {
            stopSOSBreathing();
            showNotification('Emergency breathing completed. You\'re safe. 💙', 'success');
        }
    }, 300000); // 5 minutes
}

function stopSOSBreathing() {
    const circle = document.getElementById('sosBreathingCircle');
    const text = document.getElementById('sosBreathingText');
    const btn = document.getElementById('sosBreathingBtn');
    
    if (sosBreathingInterval) {
        clearTimeout(sosBreathingInterval);
        sosBreathingInterval = null;
    }
    
    circle.classList.remove('breathing');
    text.textContent = 'Take a Deep Breath';
    btn.textContent = 'Start Breathing';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showSection('auth');
    showNotification('Logged out successfully! 👋', 'info');
}

// Utility functions
function updateCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function getMoodData() {
    return JSON.parse(localStorage.getItem('moodData') || '[]');
}

function getAssessmentData() {
    return JSON.parse(localStorage.getItem('assessmentData') || '[]');
}

function getActivityData() {
    return JSON.parse(localStorage.getItem('activityData') || '[]');
}

function getJournalData() {
    return JSON.parse(localStorage.getItem('journalData') || '[]');
}

function getBookingData() {
    return JSON.parse(localStorage.getItem('bookingData') || '[]');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function createConfetti() {
    const colors = ['#a8e6cf', '#ffd3a5', '#ffa8cc', '#88d8c0', '#ffc1cc'];
    const confettiContainer = document.getElementById('confetti');
    
    for (let i = 0; i < 50; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.className = 'confetti-piece';
        confettiPiece.style.left = Math.random() * 100 + '%';
        confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiPiece.style.animationDelay = Math.random() * 3 + 's';
        confettiContainer.appendChild(confettiPiece);
        
        // Remove after animation
        setTimeout(() => {
            if (confettiPiece.parentNode) {
                confettiPiece.parentNode.removeChild(confettiPiece);
            }
        }, 3000);
    }
}

async function loadMockData() {
    console.info('VERIFY: Starting loadMockData()');
    
    // Initialize with JSON data or fallback data if fetch fails
    if (!localStorage.getItem('users')) {
        try {
            const response = await fetch('./data/users.json');
            const users = await response.json();
            localStorage.setItem('users', JSON.stringify(users));
            console.info(`VERIFY: Loaded ${users.length} users from users.json`);
        } catch (error) {
            console.warn('VERIFY: Failed to load users.json, using fallback data');
            // Fallback data if JSON file not accessible
            const sampleUsers = [
                {
                    id: 1,
                    email: 'admin@digimind.com',
                    password: 'admin123',
                    role: 'admin',
                    name: 'Admin User',
                    joinDate: new Date().toISOString(),
                    streak: 0,
                    points: 0,
                    badges: [],
                    lastMoodCheck: null
                },
                {
                    id: 2,
                    email: 'student@example.com',
                    password: 'student123',
                    role: 'student',
                    name: 'Student User',
                    joinDate: new Date().toISOString(),
                    streak: 0,
                    points: 0,
                    badges: [],
                    lastMoodCheck: null
                }
            ];
            localStorage.setItem('users', JSON.stringify(sampleUsers));
            console.info(`VERIFY: Loaded ${sampleUsers.length} fallback users`);
        }
    } else {
        const existingUsers = JSON.parse(localStorage.getItem('users'));
        console.info(`VERIFY: Found ${existingUsers.length} existing users in localStorage`);
    }
    
    // Load counsellors data
    if (!localStorage.getItem('counsellors')) {
        try {
            const response = await fetch('./data/counsellors.json');
            const counsellors = await response.json();
            localStorage.setItem('counsellors', JSON.stringify(counsellors));
            console.info(`VERIFY: Loaded ${counsellors.length} counsellors from counsellors.json`);
        } catch (error) {
            console.warn('VERIFY: Failed to load counsellors.json');
        }
    } else {
        const existingCounsellors = JSON.parse(localStorage.getItem('counsellors'));
        console.info(`VERIFY: Found ${existingCounsellors.length} existing counsellors in localStorage`);
    }
    
    // Load wellness data
    if (!localStorage.getItem('wellness')) {
        try {
            const response = await fetch('./data/wellness.json');
            const wellness = await response.json();
            localStorage.setItem('wellness', JSON.stringify(wellness));
            const musicCount = wellness.music_suggestions ? wellness.music_suggestions.length : 0;
            const journalCount = wellness.journal_prompts ? wellness.journal_prompts.length : 0;
            const breathingCount = wellness.breathing_exercises ? wellness.breathing_exercises.length : 0;
            console.info(`VERIFY: Loaded wellness data - ${musicCount} music tracks, ${journalCount} journal prompts, ${breathingCount} breathing exercises`);
        } catch (error) {
            console.warn('VERIFY: Failed to load wellness.json');
        }
    } else {
        const existingWellness = JSON.parse(localStorage.getItem('wellness'));
        const musicCount = existingWellness.music_suggestions ? existingWellness.music_suggestions.length : 0;
        console.info(`VERIFY: Found existing wellness data with ${musicCount} music tracks in localStorage`);
    }
    
    // Initialize other data stores if not exists
    const dataStores = ['moodData', 'assessmentData', 'bookingData', 'journalData', 'activityData'];
    let initializedCount = 0;
    dataStores.forEach(store => {
        if (!localStorage.getItem(store)) {
            localStorage.setItem(store, JSON.stringify([]));
            initializedCount++;
        }
    });
    console.info(`VERIFY: Initialized ${initializedCount} new data stores in localStorage`);
}

// Load reports section
function loadReports() {
    console.info('VERIFY: Loading reports section');
    loadMoodHistory();
    loadAssessmentSummary();
    loadActivitySummary();
    loadDataExport();
    console.info('VERIFY: Reports section loaded with mood history, assessments, and activity data');
}

// Load mood history
function loadMoodHistory() {
    console.info('VERIFY: Loading mood history');
    const container = document.getElementById('moodHistoryChart');
    const moodData = getMoodData().filter(m => m.userId === currentUser.id);
    
    if (moodData.length === 0) {
        container.innerHTML = '<p>No mood data yet. Start tracking your mood! 😊</p>';
        return;
    }
    
    // Create simple mood history display
    const last7Days = moodData.slice(-7);
    let historyHTML = '<div class="mood-history">';
    
    last7Days.forEach(mood => {
        const date = new Date(mood.date).toLocaleDateString();
        const emoji = getMoodEmoji(mood.mood);
        historyHTML += `<div class="mood-entry"><span>${date}</span> <span>${emoji} ${mood.mood}</span></div>`;
    });
    
    historyHTML += '</div>';
    container.innerHTML = historyHTML;
    console.info(`VERIFY: Mood history displayed - ${last7Days.length} recent entries`);
}

// Load assessment summary
function loadAssessmentSummary() {
    console.info('VERIFY: Loading assessment summary');
    const container = document.getElementById('assessmentSummary');
    const assessments = getAssessmentData().filter(a => a.userId === currentUser.id);
    
    if (assessments.length === 0) {
        container.innerHTML = '<p>No assessments completed yet. 📋</p>';
        return;
    }
    
    const latestAssessment = assessments[assessments.length - 1];
    const avgScore = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;
    
    container.innerHTML = `
        <div class="assessment-stats">
            <h4>Assessment Summary</h4>
            <p><strong>Total Assessments:</strong> ${assessments.length}</p>
            <p><strong>Latest Risk Level:</strong> ${latestAssessment.riskLevel}</p>
            <p><strong>Average Score:</strong> ${avgScore.toFixed(1)}/5</p>
            <p><strong>Latest Date:</strong> ${new Date(latestAssessment.date).toLocaleDateString()}</p>
        </div>
    `;
    console.info(`VERIFY: Assessment summary loaded - ${assessments.length} total assessments, average score: ${avgScore.toFixed(1)}`);
}

// Load activity summary
function loadActivitySummary() {
    console.info('VERIFY: Loading activity summary');
    const container = document.getElementById('activitySummary');
    const activities = getActivityData().filter(a => a.userId === currentUser.id);
    const journals = getJournalData().filter(j => j.userId === currentUser.id);
    const bookings = getBookingData().filter(b => b.userId === currentUser.id);
    
    container.innerHTML = `
        <div class="activity-stats">
            <h4>Activity Summary</h4>
            <p><strong>Total Points:</strong> ${currentUser.points || 0}</p>
            <p><strong>Current Streak:</strong> ${currentUser.streak || 0} days</p>
            <p><strong>Journal Entries:</strong> ${journals.length}</p>
            <p><strong>Counselling Sessions:</strong> ${bookings.length}</p>
            <p><strong>Badges Earned:</strong> ${currentUser.badges ? currentUser.badges.length : 0}</p>
        </div>
    `;
    console.info(`VERIFY: Activity summary loaded - ${currentUser.points || 0} points, ${journals.length} journal entries, ${bookings.length} bookings`);
}

// Load data export
function loadDataExport() {
    console.info('VERIFY: Loading data export functionality');
    const container = document.getElementById('dataExport');
    
    container.innerHTML = `
        <div class="data-export">
            <h4>Export Your Data</h4>
            <p>Download your data as JSON for backup or transfer.</p>
            <button class="btn btn-secondary" onclick="exportUserData()">Export Data 📁</button>
        </div>
    `;
    console.info('VERIFY: Data export functionality loaded');
}

// Export user data
function exportUserData() {
    console.info('VERIFY: Exporting user data');
    const userData = {
        user: currentUser,
        moods: getMoodData().filter(m => m.userId === currentUser.id),
        assessments: getAssessmentData().filter(a => a.userId === currentUser.id),
        journals: getJournalData().filter(j => j.userId === currentUser.id),
        bookings: getBookingData().filter(b => b.userId === currentUser.id),
        activities: getActivityData().filter(a => a.userId === currentUser.id)
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `digimind-data-${currentUser.email}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.info(`VERIFY: User data exported - ${Object.keys(userData).length} data categories`);
    showNotification('Data exported successfully! 📁', 'success');
}

// Load admin dashboard
function loadAdminDashboard() {
    console.info('VERIFY: Loading admin dashboard');
    if (currentUser.role !== 'admin') {
        console.warn('VERIFY: Non-admin user attempted to access admin dashboard');
        showSection('dashboard');
        return;
    }
    
    loadUserStats();
    loadSystemStats();
    loadUsageAnalytics();
    console.info('VERIFY: Admin dashboard loaded with user stats, system stats, and analytics');
}

// Load user statistics
function loadUserStats() {
    console.info('VERIFY: Loading user statistics for admin');
    const container = document.getElementById('userStats');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const studentCount = users.filter(u => u.role === 'student').length;
    const counsellorCount = users.filter(u => u.role === 'counsellor').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    
    container.innerHTML = `
        <div class="admin-stats">
            <h3>User Statistics</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <h4>${users.length}</h4>
                    <p>Total Users</p>
                </div>
                <div class="stat-item">
                    <h4>${studentCount}</h4>
                    <p>Students</p>
                </div>
                <div class="stat-item">
                    <h4>${counsellorCount}</h4>
                    <p>Counsellors</p>
                </div>
                <div class="stat-item">
                    <h4>${adminCount}</h4>
                    <p>Admins</p>
                </div>
            </div>
        </div>
    `;
    console.info(`VERIFY: User stats loaded - ${users.length} total users (${studentCount} students, ${counsellorCount} counsellors, ${adminCount} admins)`);
}

// Load system statistics
function loadSystemStats() {
    console.info('VERIFY: Loading system statistics for admin');
    const container = document.getElementById('systemStats');
    const moods = getMoodData();
    const assessments = getAssessmentData();
    const journals = getJournalData();
    const bookings = getBookingData();
    
    // Calculate mood distribution
    const moodCounts = moods.reduce((acc, mood) => {
        acc[mood.mood] = (acc[mood.mood] || 0) + 1;
        return acc;
    }, {});
    
    container.innerHTML = `
        <div class="admin-stats">
            <h3>System Statistics</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <h4>${moods.length}</h4>
                    <p>Mood Entries</p>
                </div>
                <div class="stat-item">
                    <h4>${assessments.length}</h4>
                    <p>Assessments</p>
                </div>
                <div class="stat-item">
                    <h4>${journals.length}</h4>
                    <p>Journal Entries</p>
                </div>
                <div class="stat-item">
                    <h4>${bookings.length}</h4>
                    <p>Bookings</p>
                </div>
            </div>
            <div class="mood-distribution">
                <h4>Mood Distribution</h4>
                ${Object.entries(moodCounts).map(([mood, count]) => 
                    `<p>${getMoodEmoji(mood)} ${mood}: ${count} (${((count/moods.length)*100).toFixed(1)}%)</p>`
                ).join('')}
            </div>
        </div>
    `;
    console.info(`VERIFY: System stats loaded - ${moods.length} moods, ${assessments.length} assessments, ${journals.length} journals, ${bookings.length} bookings`);
}

// Load usage analytics
function loadUsageAnalytics() {
    console.info('VERIFY: Loading usage analytics for admin');
    const container = document.getElementById('usageAnalytics');
    const activities = getActivityData();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Calculate active users (users with recent activity)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = users.filter(user => 
        user.lastMoodCheck && new Date(user.lastMoodCheck) > weekAgo
    ).length;
    
    container.innerHTML = `
        <div class="admin-stats">
            <h3>Usage Analytics</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <h4>${activeUsers}</h4>
                    <p>Active Users (7 days)</p>
                </div>
                <div class="stat-item">
                    <h4>${activities.length}</h4>
                    <p>Total Activities</p>
                </div>
                <div class="stat-item">
                    <h4>${(activeUsers / users.length * 100).toFixed(1)}%</h4>
                    <p>Engagement Rate</p>
                </div>
            </div>
        </div>
    `;
    console.info(`VERIFY: Usage analytics loaded - ${activeUsers} active users, ${activities.length} total activities`);
}

// Load mindfulness activities
function loadMindfulnessActivities() {
    console.info('VERIFY: Loading mindfulness activities');
    const container = document.getElementById('mindfulnessActivities');
    const wellnessData = localStorage.getItem('wellness');
    
    if (wellnessData) {
        const data = JSON.parse(wellnessData);
        const activities = data.mindfulness_activities || [];
        
        container.innerHTML = activities.map(activity => `
            <div class="mindfulness-activity">
                <h4>${activity.name}</h4>
                <p>${activity.description}</p>
                <p><strong>Duration:</strong> ${Math.floor(activity.duration / 60)} minutes</p>
                <button class="btn btn-secondary" onclick="startMindfulness('${activity.id}', '${activity.name}')">
                    Start Activity 🧘
                </button>
            </div>
        `).join('');
        console.info(`VERIFY: Mindfulness activities loaded - ${activities.length} activities available`);
    } else {
        container.innerHTML = '<p>Loading mindfulness activities...</p>';
    }
}

// Start mindfulness activity
function startMindfulness(id, name) {
    console.info(`VERIFY: Starting mindfulness activity - ${name} (ID: ${id})`);
    awardPoints(20, `Completed mindfulness: ${name}! 🧘`);
    awardBadge('mindful', '🧘 Mindful', 'Practiced mindfulness exercises', '🧘');
    showNotification(`Great job completing ${name}! 🧘`, 'success');
}

// Load wellness tips
function loadWellnessTips() {
    console.info('VERIFY: Loading wellness tips');
    const container = document.getElementById('wellnessTips');
    const wellnessData = localStorage.getItem('wellness');
    
    if (wellnessData) {
        const data = JSON.parse(wellnessData);
        const tips = data.wellness_tips || [];
        
        // Show random tip
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        if (randomTip) {
            container.innerHTML = `
                <div class="wellness-tip">
                    <h4>💡 Wellness Tip</h4>
                    <p>${randomTip.tip}</p>
                    <small>Category: ${randomTip.category}</small>
                </div>
            `;
            console.info(`VERIFY: Wellness tip loaded - ${randomTip.category}: ${randomTip.tip.substring(0, 50)}...`);
        }
    } else {
        container.innerHTML = '<p>Loading wellness tips...</p>';
    }
}

function updateDateTime() {
    // Update any time-dependent displays immediately and then every minute
    function updateDisplay() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
        const dateStr = now.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        // Update current time displays if they exist
        const timeElements = document.querySelectorAll('.current-time');
        timeElements.forEach(el => el.textContent = timeStr);
        
        const dateElements = document.querySelectorAll('.current-date');
        dateElements.forEach(el => el.textContent = dateStr);
        
        // Update welcome message with time-based greeting
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage && currentUser) {
            const hour = now.getHours();
            let greeting = 'Good evening';
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 17) greeting = 'Good afternoon';
            
            const userName = currentUser.name || currentUser.email.split('@')[0];
            welcomeMessage.textContent = `${greeting}, ${userName}! 🌈`;
        }
    }
    
    updateDisplay();
    setInterval(updateDisplay, 60000); // Update every minute
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('sosModal');
    if (event.target === modal) {
        closeSOS();
    }
};

// Format time helper
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Counsellor appointment loading
function loadCounsellorAppointments() {
    const appointmentsContainer = document.getElementById('todayAppointments');
    if (!appointmentsContainer) return;
    
    const bookings = getBookingData();
    const today = new Date().toDateString();
    
    const todayBookings = bookings.filter(booking => 
        booking.counsellorId === currentUser.id && 
        new Date(booking.date).toDateString() === today
    );
    
    if (todayBookings.length === 0) {
        appointmentsContainer.innerHTML = '<p>No appointments scheduled for today. 📅</p>';
        return;
    }
    
    appointmentsContainer.innerHTML = todayBookings.map(booking => `
        <div class="appointment-card">
            <h4>👤 ${booking.studentName || 'Student'}</h4>
            <p><strong>⏰ Time:</strong> ${booking.time}</p>
            <p><strong>📋 Type:</strong> ${booking.type || 'General Counseling'}</p>
            <p><strong>📊 Status:</strong> <span class="status-${booking.status.toLowerCase()}">${booking.status}</span></p>
            <div class="appointment-actions">
                <button class="btn btn-primary" onclick="startSession('${booking.id}')">Start Session 🎯</button>
                <button class="btn btn-secondary" onclick="viewStudentProfile('${booking.studentId}')">View Profile 👁️</button>
                <button class="btn btn-info" onclick="openChatWithStudent('${booking.studentId}')">Chat 💬</button>
            </div>
        </div>
    `).join('');
}

// Load counsellor notifications
function loadCounsellorNotifications() {
    const notificationsContainer = document.getElementById('counsellorNotifications');
    if (!notificationsContainer) return;
    
    const notifications = getCounsellorNotifications();
    
    if (notifications.length === 0) {
        notificationsContainer.innerHTML = '<p>No new notifications. 🔕</p>';
        return;
    }
    
    notificationsContainer.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.type}">
            <div class="notification-icon">${getNotificationIcon(notification.type)}</div>
            <div class="notification-content">
                <p><strong>${notification.title}</strong></p>
                <p>${notification.message}</p>
                <small>${formatDate(notification.timestamp)}</small>
            </div>
            <button class="btn btn-sm" onclick="markNotificationRead('${notification.id}')">✓</button>
        </div>
    `).join('');
}

// Load patient statistics
function loadPatientStats() {
    const statsContainer = document.getElementById('patientStats');
    if (!statsContainer) return;
    
    const bookings = getBookingData();
    const users = getUserData();
    
    const counsellorBookings = bookings.filter(b => b.counsellorId === currentUser.id);
    const totalPatients = new Set(counsellorBookings.map(b => b.studentId)).size;
    const completedSessions = counsellorBookings.filter(b => b.status === 'completed').length;
    const upcomingSessions = counsellorBookings.filter(b => b.status === 'confirmed' && new Date(b.date) > new Date()).length;
    
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h4>👥 Total Patients</h4>
                <p class="stat-number">${totalPatients}</p>
            </div>
            <div class="stat-card">
                <h4>✅ Completed Sessions</h4>
                <p class="stat-number">${completedSessions}</p>
            </div>
            <div class="stat-card">
                <h4>📅 Upcoming Sessions</h4>
                <p class="stat-number">${upcomingSessions}</p>
            </div>
            <div class="stat-card">
                <h4>⭐ Average Rating</h4>
                <p class="stat-number">${currentUser.rating || '4.8'}</p>
            </div>
        </div>
    `;
}

// Get counsellor notifications
function getCounsellorNotifications() {
    const notifications = JSON.parse(localStorage.getItem('counsellorNotifications')) || [];
    return notifications.filter(n => n.counsellorId === currentUser.id && !n.read);
}

// Mark notification as read
function markNotificationRead(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('counsellorNotifications')) || [];
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        localStorage.setItem('counsellorNotifications', JSON.stringify(notifications));
        loadCounsellorNotifications();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DigiMind app initializing...');
    initializeApp();
});

// Initialize the application
function initializeApp() {
    console.log('VERIFY: Initializing DigiMind application');
    
    // Load UI configuration
    loadUIConfig();
    
    // Initialize data stores
    initializeDataStores();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('VERIFY: User found in storage:', currentUser.email);
            showDashboard();
        } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('currentUser');
            showSection('auth');
        }
    } else {
        showSection('auth');
    }
    
    // Update date/time displays
    updateDateTime();
    
    console.log('VERIFY: App initialization complete');
}

// Setup event listeners
function setupEventListeners() {
    // Auth form submission
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
    }

    // Assessment form submission
    const assessmentForm = document.getElementById('assessmentForm');
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', handleAssessment);
    }
    
    // Close modal when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Authentication handling
function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (isLoginMode) {
        // Login logic
        const users = getUserData();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log('VERIFY: User logged in successfully:', currentUser.email);
            showNotification(`Welcome back, ${currentUser.email}! 🎉`, 'success');
            showDashboard();
        } else {
            showNotification('Invalid email or password', 'error');
        }
    } else {
        // Signup logic
        if (!role) {
            showNotification('Please select a role', 'error');
            return;
        }
        
        // Prevent admin self-signup
        if (role === 'admin') {
            showNotification('Admin accounts cannot be created through signup', 'error');
            return;
        }
        
        const users = getUserData();
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            showNotification('User already exists with this email', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateId(),
            email: email,
            password: password,
            role: role,
            joinDate: new Date().toISOString(),
            streak: 0,
            points: 0,
            badges: [],
            lastMoodCheck: null
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        console.log('VERIFY: New user created:', currentUser.email);
        showNotification(`Welcome to DigiMind, ${currentUser.email}! 🎉`, 'success');
        awardPoints(50, 'Welcome bonus for joining DigiMind! 🎉');
        showDashboard();
    }
}

// Show section
function showSection(sectionName) {
    console.log('VERIFY: Showing section:', sectionName);
    
    // Hide all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show navigation if user is logged in
    const nav = document.getElementById('mainNav');
    if (currentUser && sectionName !== 'auth') {
        nav.style.display = 'flex';
        
        // Show admin button for admin users
        const adminBtn = document.getElementById('adminNavBtn');
        if (currentUser.role === 'admin') {
            adminBtn.style.display = 'block';
        }
    } else {
        nav.style.display = 'none';
    }
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Load section-specific content
        switch(sectionName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'counsellor':
                loadCounsellorDashboard();
                break;
            case 'admin':
                loadAdminDashboard();
                break;
            case 'wellness':
                loadWellnessHub();
                break;
            case 'bookings':
                loadBookings();
                break;
            case 'reports':
                loadReports();
                break;
            case 'assessment':
                loadAssessmentForm();
                break;
        }
    }
}

// Show dashboard based on user role
function showDashboard() {
    if (currentUser.role === 'admin') {
        showSection('admin');
    } else if (currentUser.role === 'counsellor') {
        showSection('counsellor');
    } else {
        showSection('dashboard');
    }
}

// Toggle between login and signup
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const button = document.querySelector('.auth-form button[type="submit"]');
    const switchText = document.querySelector('.auth-switch p');
    const roleGroup = document.querySelector('.role-group');
    
    if (isLoginMode) {
        button.innerHTML = 'Login 🔑';
        switchText.textContent = "Don't have an account?";
        roleGroup.style.display = 'none';
    } else {
        button.innerHTML = 'Sign Up 📝';
        switchText.textContent = 'Already have an account?';
        roleGroup.style.display = 'block';
    }
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showSection('auth');
    showNotification('Logged out successfully', 'info');
}

// Generate unique ID
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize data stores
function initializeDataStores() {
    // Initialize users with default admin
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 'admin_001',
                email: 'admin@digimind.com',
                password: 'admin123',
                role: 'admin',
                joinDate: new Date().toISOString(),
                streak: 0,
                points: 0,
                badges: []
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Initialize other data stores
    if (!localStorage.getItem('bookingData')) {
        localStorage.setItem('bookingData', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('moodData')) {
        localStorage.setItem('moodData', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('assessmentData')) {
        localStorage.setItem('assessmentData', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('activityData')) {
        localStorage.setItem('activityData', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('journalData')) {
        localStorage.setItem('journalData', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('chatMessages')) {
        localStorage.setItem('chatMessages', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('counsellorNotifications')) {
        localStorage.setItem('counsellorNotifications', JSON.stringify([]));
    }
}

// Data getter functions
function getUserData() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function getBookingData() {
    return JSON.parse(localStorage.getItem('bookingData')) || [];
}

function getMoodData() {
    return JSON.parse(localStorage.getItem('moodData')) || [];
}

function getAssessmentData() {
    return JSON.parse(localStorage.getItem('assessmentData')) || [];
}

function getActivityData() {
    return JSON.parse(localStorage.getItem('activityData')) || [];
}

function getJournalData() {
    return JSON.parse(localStorage.getItem('journalData')) || [];
}

// Data setter functions
function saveBookingData(data) {
    localStorage.setItem('bookingData', JSON.stringify(data));
}

function saveMoodData(data) {
    localStorage.setItem('moodData', JSON.stringify(data));
}

function saveAssessmentData(data) {
    localStorage.setItem('assessmentData', JSON.stringify(data));
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Award points
function awardPoints(points, reason) {
    if (!currentUser) return;
    
    currentUser.points = (currentUser.points || 0) + points;
    
    // Update user in storage
    const users = getUserData();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Show notification
    showNotification(`+${points} points: ${reason}`, 'success');
}

// Format date helper
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}