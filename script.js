const SUPABASE_URL = 'https://zxxkxwwmlyuidttvuugh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8kXFl3GsHG5RHXaAgUtQuw_7CalBfIm';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentTemplate = 'modern';
let experienceItems = [];
let educationItems = [];
let authMode = 'signin';
let userSession = null;

// Initialize
window.onload = async () => {
    addItem('experience');
    addItem('education');
    updatePreview();
    window.addEventListener('resize', scalePreview);
    
    // Check session
    const { data } = await sb.auth.getSession();
    userSession = data.session;
    updateAuthUI();

    // Listen for auth changes
    sb.auth.onAuthStateChange((_event, session) => {
        userSession = session;
        updateAuthUI();
    });
};

function updateAuthUI() {
    const statusDiv = document.getElementById('auth-status');
    const dashboardLink = document.getElementById('dashboard-link');
    if (userSession) {
        statusDiv.innerHTML = `
            <span>Logged in as: ${userSession.user.email}</span>
            <button class="btn-auth-action" onclick="handleLogout()">Sign Out</button>
        `;
        dashboardLink.style.display = 'block';
    } else {
        statusDiv.innerHTML = `
            <span>Welcome!</span>
            <button class="btn-auth-action" onclick="openAuthModal()">Sign In</button>
        `;
        dashboardLink.style.display = 'none';
    }
}

function scalePreview() {
    const container = document.querySelector('.resume-container');
    const preview = document.getElementById('resume-preview');
    if (!container || !preview) return;

    const containerWidth = container.offsetWidth - 64; // subtract padding
    const previewWidth = 794; // 210mm in pixels at 96dpi is ~794px
    
    const scale = Math.min(containerWidth / previewWidth, 1);
    preview.style.transform = `scale(${scale})`;
    
    // Adjust container height to match scaled content if needed
    // container.style.height = `${preview.offsetHeight * scale}px`;
}

function addItem(type) {
    const item = { id: Date.now(), company: '', role: '', duration: '', description: '', school: '', degree: '' };
    if (type === 'experience') {
        experienceItems.push(item);
        renderList('experience');
    } else {
        educationItems.push(item);
        renderList('education');
    }
}

function removeItem(type, id) {
    if (type === 'experience') {
        experienceItems = experienceItems.filter(i => i.id !== id);
        renderList('experience');
    } else {
        educationItems = educationItems.filter(i => i.id !== id);
        renderList('education');
    }
    updatePreview();
}

function updateItem(type, id, field, value) {
    const list = type === 'experience' ? experienceItems : educationItems;
    const item = list.find(i => i.id === id);
    if (item) {
        item[field] = value;
        updatePreview();
    }
}

function renderList(type) {
    const container = document.getElementById(`${type}-list`);
    const list = type === 'experience' ? experienceItems : educationItems;
    
    container.innerHTML = list.map(item => `
        <div class="item-card">
            <button class="btn-remove" onclick="removeItem('${type}', ${item.id})">×</button>
            ${type === 'experience' ? `
                <div class="form-group"><label>Company</label><input type="text" value="${item.company}" oninput="updateItem('experience', ${item.id}, 'company', this.value)"></div>
                <div class="form-group"><label>Role</label><input type="text" value="${item.role}" oninput="updateItem('experience', ${item.id}, 'role', this.value)"></div>
                <div class="form-group"><label>Duration</label><input type="text" value="${item.duration}" placeholder="2020 - Present" oninput="updateItem('experience', ${item.id}, 'duration', this.value)"></div>
                <div class="form-group"><label>Description</label><textarea oninput="updateItem('experience', ${item.id}, 'description', this.value)">${item.description}</textarea></div>
            ` : `
                <div class="form-group"><label>School/University</label><input type="text" value="${item.school}" oninput="updateItem('education', ${item.id}, 'school', this.value)"></div>
                <div class="form-group"><label>Degree</label><input type="text" value="${item.degree}" oninput="updateItem('education', ${item.id}, 'degree', this.value)"></div>
                <div class="form-group"><label>Duration</label><input type="text" value="${item.duration}" placeholder="2016 - 2020" oninput="updateItem('education', ${item.id}, 'duration', this.value)"></div>
            `}
        </div>
    `).join('');
}

function setTemplate(template) {
    currentTemplate = template;
    document.getElementById('btn-modern').classList.toggle('active', template === 'modern');
    document.getElementById('btn-plane').classList.toggle('active', template === 'plane');
    updatePreview();
}

function updatePreview() {
    const preview = document.getElementById('resume-preview');
    const data = {
        name: document.getElementById('fullName').value || 'Your Name',
        title: document.getElementById('title').value || 'Professional Title',
        email: document.getElementById('email').value || 'email@example.com',
        phone: document.getElementById('phone').value || '+1 234 567 890',
        location: document.getElementById('location').value || 'City, Country',
        summary: document.getElementById('summary').value || 'Your professional summary will appear here...',
        skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s !== ''),
        experience: experienceItems,
        education: educationItems
    };

    if (currentTemplate === 'modern') {
        renderModern(preview, data);
    } else {
        renderPlane(preview, data);
    }
    
    // Scale after rendering
    setTimeout(scalePreview, 50);
}

function renderPlane(container, data) {
    container.className = 'template-plane';
    container.style.padding = '20mm';
    container.innerHTML = `
        <h2>${data.name}</h2>
        <div class="contact-info">
            ${data.email} | ${data.phone} | ${data.location}
        </div>
        
        <div class="section-header">Summary</div>
        <p>${data.summary}</p>

        <div class="section-header">Experience</div>
        ${data.experience.map(exp => `
            <div style="margin-bottom: 10px;">
                <strong>${exp.role}</strong> - ${exp.company} (${exp.duration})
                <p style="font-size: 0.9rem;">${exp.description}</p>
            </div>
        `).join('')}

        <div class="section-header">Education</div>
        ${data.education.map(edu => `
            <div style="margin-bottom: 10px;">
                <strong>${edu.degree}</strong> - ${edu.school} (${edu.duration})
            </div>
        `).join('')}

        <div class="section-header">Skills</div>
        <p>${data.skills.join(', ')}</p>
    `;
}

function renderModern(container, data) {
    container.className = 'template-modern';
    container.style.padding = '0';
    container.innerHTML = `
        <div class="modern-sidebar">
            <div class="name">${data.name}</div>
            <div class="modern-item-sub" style="color: rgba(255,255,255,0.8); margin-bottom: 2rem;">${data.title}</div>
            
            <div class="modern-section-title" style="color: white; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 5px;">Contact</div>
            <div class="contact-item">📧 ${data.email}</div>
            <div class="contact-item">📱 ${data.phone}</div>
            <div class="contact-item">📍 ${data.location}</div>

            <div class="modern-section-title" style="color: white; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 5px; margin-top: 2rem;">Skills</div>
            <div class="skills-container">
                ${data.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
        </div>
        <div class="modern-main">
            <div class="modern-section-title">Professional Summary</div>
            <p style="margin-bottom: 2rem; color: var(--text-main);">${data.summary}</p>

            <div class="modern-section-title">Work Experience</div>
            ${data.experience.map(exp => `
                <div class="modern-item">
                    <div class="modern-item-header">
                        <span>${exp.role}</span>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${exp.duration}</span>
                    </div>
                    <div class="modern-item-sub">${exp.company}</div>
                    <p style="font-size: 0.875rem; color: var(--text-main);">${exp.description}</p>
                </div>
            `).join('')}

            <div class="modern-section-title">Education</div>
            ${data.education.map(edu => `
                <div class="modern-item">
                    <div class="modern-item-header">
                        <span>${edu.degree}</span>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${edu.duration}</span>
                    </div>
                    <div class="modern-item-sub">${edu.school}</div>
                </div>
            `).join('')}
        </div>
    `;
}

async function downloadPDF() {
    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData.session) {
        openAuthModal();
        return;
    }

    const element = document.getElementById('resume-preview');
    const fileName = `resume_${Date.now()}.pdf`;
    
    // PDF options
    const opt = {
        margin: 0,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const pdfExporter = html2pdf().set(opt).from(element);

    // Save locally
    pdfExporter.save();

    // Upload to Supabase
    try {
        const blob = await pdfExporter.output('blob');
        const filePath = `${userSession.user.id}/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await sb.storage
            .from('resumes')
            .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: urlData } = sb.storage
            .from('resumes')
            .getPublicUrl(filePath);

        // Also save/update the form data in the database with the PDF link
        await saveResume(urlData.publicUrl);
    } catch (error) {
        console.error('Storage error:', error);
    }
}

// Auth Functions
function openAuthModal() {
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

function toggleAuthMode() {
    authMode = authMode === 'signin' ? 'signup' : 'signin';
    document.getElementById('auth-title').innerText = authMode === 'signin' ? 'Sign In to Download' : 'Create Account';
    document.getElementById('auth-submit-btn').innerText = authMode === 'signin' ? 'Sign In' : 'Sign Up';
    document.getElementById('auth-toggle-text').innerText = authMode === 'signin' ? "Don't have an account?" : "Already have an account?";
    document.getElementById('auth-toggle-link').innerText = authMode === 'signin' ? "Sign Up" : "Sign In";
}

async function handleAuth() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const btn = document.getElementById('auth-submit-btn');

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    btn.disabled = true;
    btn.innerText = 'Processing...';

    try {
        let result;
        if (authMode === 'signin') {
            result = await sb.auth.signInWithPassword({ email, password });
        } else {
            result = await sb.auth.signUp({ email, password });
        }

        if (result.error) throw result.error;

        if (authMode === 'signup') {
            alert('Sign up successful! Please check your email for confirmation.');
        } else {
            userSession = result.data.session;
            closeAuthModal();
            downloadPDF(); // Auto-download after successful login
        }
    } catch (error) {
        alert(error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = authMode === 'signin' ? 'Sign In' : 'Sign Up';
    }
}
async function handleLogout() {
    await sb.auth.signOut();
    userSession = null;
    updateAuthUI();
}

// Dashboard & Persistence
async function saveResume(pdfUrl = null) {
    if (!userSession) {
        if (!pdfUrl) {
            alert('Please sign in to save your resume.');
            openAuthModal();
        }
        return;
    }

    const name = document.getElementById('fullName').value || 'Untitled Resume';
    const data = {
        fullName: document.getElementById('fullName').value,
        title: document.getElementById('title').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        summary: document.getElementById('summary').value,
        skills: document.getElementById('skills').value,
        experience: experienceItems,
        education: educationItems,
        template: currentTemplate
    };

    const payload = { 
        user_id: userSession.user.id, 
        name, 
        data,
        pdf_url: pdfUrl
    };

    const { error } = await sb
        .from('resumes')
        .insert([payload]);

    if (error) {
        if (!pdfUrl) alert('Error saving resume: ' + error.message);
    } else {
        if (!pdfUrl) alert('Resume saved successfully!');
    }
}

async function openDashboard() {
    document.getElementById('dashboard-modal').classList.add('active');
    const listContainer = document.getElementById('resumes-list');
    listContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Loading your resumes...</p>';

    const { data, error } = await sb
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        listContainer.innerHTML = `<p style="color: #ef4444;">Error: ${error.message}</p>`;
        return;
    }

    if (data.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No saved resumes found.</p>';
        return;
    }

    listContainer.innerHTML = data.map(item => `
        <div class="item-card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div>
                <div style="font-weight: 600;">${item.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(item.created_at).toLocaleDateString()}</div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                ${item.pdf_url ? `<a href="${item.pdf_url}" target="_blank" class="btn-auth-action" style="text-decoration: none;">PDF</a>` : ''}
                <button class="btn-auth-action" onclick="loadSavedResume(${JSON.stringify(item.data).replace(/"/g, '&quot;')})">Load</button>
                <button class="btn-remove" style="position: static;" onclick="deleteResume('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function closeDashboard() {
    document.getElementById('dashboard-modal').classList.remove('active');
}

function loadSavedResume(data) {
    document.getElementById('fullName').value = data.fullName || '';
    document.getElementById('title').value = data.title || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('location').value = data.location || '';
    document.getElementById('summary').value = data.summary || '';
    document.getElementById('skills').value = data.skills || '';
    
    experienceItems = data.experience || [];
    educationItems = data.education || [];
    currentTemplate = data.template || 'modern';
    
    renderList('experience');
    renderList('education');
    setTemplate(currentTemplate);
    updatePreview();
    closeDashboard();
}

async function deleteResume(id) {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    const { error } = await sb.from('resumes').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else openDashboard();
}

function newResume() {
    if (!confirm('Start a new resume? Unsaved changes will be lost.')) return;
    document.getElementById('fullName').value = '';
    document.getElementById('title').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('location').value = '';
    document.getElementById('summary').value = '';
    document.getElementById('skills').value = '';
    experienceItems = [];
    educationItems = [];
    addItem('experience');
    addItem('education');
    updatePreview();
}
