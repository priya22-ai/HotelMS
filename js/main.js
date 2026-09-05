// =============================================
// Meal Management System - Main JS
// =============================================

// Mobile Nav Toggle
function toggleNav() {
    const nav = document.querySelector('.main-nav');
    if (nav) nav.classList.toggle('open');
}

// Entry Selection (Home Page)
function selectEntry(type) {
    document.querySelectorAll('.entry-option').forEach(el => el.classList.remove('selected'));
    const selected = document.getElementById('opt-' + type);
    if (selected) selected.classList.add('selected');
    document.getElementById('entry_type').value = type;
}

function proceedEntry() {
    const type = document.getElementById('entry_type')?.value;
    if (!type) { showToast('Please select Admin or User', 'warning'); return; }
    if (type === 'admin') window.location.href = 'admin/login.php';
    else window.location.href = 'user/login.php';
}

// Meal Toggle
function toggleMeal(el) {
    el.classList.toggle('active');
    const input = el.querySelector('input[type=hidden]');
    if (input) input.value = el.classList.contains('active') ? '1' : '0';
}

// Payment method select
function selectPayMethod(type) {
    document.querySelectorAll('.pay-method').forEach(el => el.classList.remove('active'));
    const selected = document.querySelector(`.pay-method[data-type="${type}"]`);
    if (selected) selected.classList.add('active');
    const input = document.getElementById('payment_type');
    if (input) input.value = type;
    // Show/hide calendar
    const calSection = document.getElementById('cal-section');
    if (calSection) {
        calSection.style.display = (type === 'daily') ? 'block' : 'none';
    }
    const weekSection = document.getElementById('week-section');
    if (weekSection) {
        weekSection.style.display = (type === 'weekly') ? 'block' : 'none';
    }
    const monthSection = document.getElementById('month-section');
    if (monthSection) {
        monthSection.style.display = (type === 'monthly') ? 'block' : 'none';
    }
}

// Toast Notification
function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = `<i class="fa fa-${type==='success'?'check-circle':type==='danger'?'times-circle':'info-circle'}"></i> ${msg}`;
    toast.style.cssText = `
        position:fixed; bottom:24px; right:24px; z-index:9999;
        background:${type==='success'?'#2e9e5b':type==='danger'?'#d43a3a':type==='warning'?'#e09b2a':'#2a7ec8'};
        color:white; padding:14px 22px; border-radius:10px;
        font-size:14px; font-weight:500;
        box-shadow:0 6px 24px rgba(0,0,0,0.3);
        display:flex; align-items:center; gap:10px;
        animation: slideIn 0.3s ease;
        font-family:'DM Sans',sans-serif;
    `;
    const style = document.createElement('style');
    style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all 0.3s'; setTimeout(()=>toast.remove(),300); }, 3500);
}

// Confirm delete
function confirmDelete(url, msg) {
    if (confirm(msg || 'Are you sure you want to delete this?')) {
        window.location.href = url;
    }
}

// Simple Calendar for Payment
function buildCalendar(containerId, year, month) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <button onclick="buildCalendar('${containerId}',${month===0?year-1:year},${month===0?11:month-1})" class="btn btn-sm btn-outline"><i class="fa fa-chevron-left"></i></button>
        <strong style="font-family:'Playfair Display',serif;font-size:16px;">${months[month]} ${year}</strong>
        <button onclick="buildCalendar('${containerId}',${month===11?year+1:year},${month===11?0:month+1})" class="btn btn-sm btn-outline"><i class="fa fa-chevron-right"></i></button>
    </div>
    <div class="calendar-grid">`;
    days.forEach(d => html += `<div class="cal-header">${d}</div>`);
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;
    for (let d = 1; d <= totalDays; d++) {
        const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        html += `<div class="cal-day${isToday?' today':''}" onclick="selectCalDay(this,${year},${month+1},${d})">${d}</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

function selectCalDay(el, y, m, d) {
    document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const inp = document.getElementById('selected_date');
    if (inp) inp.value = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const lbl = document.getElementById('selected_date_label');
    if (lbl) lbl.textContent = `Selected: ${d}/${m}/${y}`;
}

// Bar chart renderer
function renderBarChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const max = Math.max(...data.map(d => d.value), 1);
    container.innerHTML = data.map(d => `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
            <div style="font-size:11px;color:#7a5c3a;font-weight:600;">${d.value > 0 ? d.label_val || d.value : ''}</div>
            <div class="chart-bar" style="width:100%;height:${Math.max((d.value/max)*150,4)}px;" title="${d.value}"></div>
            <div style="font-size:10px;color:#7a5c3a;text-align:center;">${d.label}</div>
        </div>
    `).join('');
}

// Auto-dismiss alerts
document.addEventListener('DOMContentLoaded', function() {
    // Animate hero on load
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'all 0.8s ease';
        setTimeout(() => { heroContent.style.opacity = '1'; heroContent.style.transform = 'translateY(0)'; }, 100);
    }

    // Auto dismiss alerts
    document.querySelectorAll('.alert').forEach(alert => {
        setTimeout(() => { alert.style.opacity = '0'; alert.style.transition = 'opacity 0.5s'; setTimeout(()=>alert.remove(),500); }, 5000);
    });

    // Build default calendar
    const now = new Date();
    if (document.getElementById('payment-calendar')) {
        buildCalendar('payment-calendar', now.getFullYear(), now.getMonth());
    }

    // Feature cards scroll animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.feature-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.5s ease ${i * 0.1}s`;
        observer.observe(card);
    });

    // Stat counter animation
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = parseInt(el.textContent.replace(/\D/g, ''));
        if (!isNaN(target) && target > 0) {
            let current = 0;
            const step = target / 40;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) { current = target; clearInterval(timer); }
                el.textContent = Math.floor(current);
            }, 30);
        }
    });
});