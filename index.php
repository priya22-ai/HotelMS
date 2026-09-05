<?php
require_once 'includes/config.php';
$page_title = 'Welcome';
$base_path = '';
include 'includes/header.php';
?>

<!-- HERO SECTION -->
<section class="hero" id="home">
    <div class="hero-content">
        <div class="hero-badge">
            <i class="fa fa-star"></i>
            Premium Meal Management
        </div>
        <h1 class="hero-title">
            Delicious Meals,
            <span>Perfectly Managed</span>
        </h1>
        <p class="hero-subtitle">
            Track your daily meals, manage payments, and enjoy a seamless dining experience — all in one place.
        </p>

        <!-- Entry Form Card -->
        <div class="entry-card">
            <h3><i class="fa fa-door-open" style="color:var(--gold);margin-right:8px;"></i>Select Your Entry</h3>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:20px;text-align:center;">Choose how you want to continue</p>
            <input type="hidden" id="entry_type" value="">
            <div class="entry-options">
                <div class="entry-option" id="opt-admin" onclick="selectEntry('admin')">
                    <i class="fa fa-shield-halved"></i>
                    <strong>Admin</strong>
                    <small style="display:block;font-size:11px;margin-top:4px;opacity:0.7;">Manage & Control</small>
                </div>
                <div class="entry-option" id="opt-user" onclick="selectEntry('user')">
                    <i class="fa fa-user-circle"></i>
                    <strong>User</strong>
                    <small style="display:block;font-size:11px;margin-top:4px;opacity:0.7;">Order & Track</small>
                </div>
            </div>
            <button class="btn-proceed" onclick="proceedEntry()">
                <i class="fa fa-arrow-right-to-bracket"></i> &nbsp;Continue
            </button>
        </div>
    </div>
</section>

<!-- FEATURES SECTION -->
<section class="features-section" id="about">
    <div class="section-header">
        <span class="section-tag">Why MealMate?</span>
        <h2 class="section-title">Everything You Need <br><span>In One System</span></h2>
    </div>
    <div class="features-grid">
        <div class="feature-card">
            <div class="feature-icon"><i class="fa fa-utensils"></i></div>
            <h3>Smart Menu Setup</h3>
            <p>Admin can set breakfast, lunch, and dinner menus for every day — edit or delete anytime with ease.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon"><i class="fa fa-clock"></i></div>
            <h3>Timed Meal Slots</h3>
            <p>Customizable meal timing windows. Users get notified when meals are ready or time is running out.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon"><i class="fa fa-credit-card"></i></div>
            <h3>Flexible Payments</h3>
            <p>Pay daily, weekly, or monthly. Multiple payment methods including bKash, Nagad, and cash.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon"><i class="fa fa-chart-bar"></i></div>
            <h3>Detailed Reports</h3>
            <p>Both admins and users get full reports — who paid, who didn't, how many meals, and expenses.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon"><i class="fa fa-bell"></i></div>
            <h3>Live Notifications</h3>
            <p>Real-time meal notifications — know when your meal is ready and how many people ordered today.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon"><i class="fa fa-users"></i></div>
            <h3>User Categories</h3>
            <p>Student, Guest, Employee, Cleaner — with COZY, Premium, and VIP tiers for personalized service.</p>
        </div>
    </div>
</section>

<!-- ABOUT SECTION -->
<section class="about-section">
    <div class="about-inner">
        <div class="about-img-wrap">
            <img src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80"
                alt="Meal Management" class="about-img">
        </div>
        <div class="about-text">
            <span class="section-tag">About System</span>
            <h2>Built for Hostels, Offices & Institutions</h2>
            <p>MealMate is a complete meal management solution designed for hostels, corporate offices, universities, and institutions. It bridges the gap between kitchen management and user convenience.</p>
            <br>
            <p>With role-based access, smart notifications, and detailed reporting, managing daily meals has never been easier. From setting the day's menu to tracking payments — everything is automated.</p>
            <br>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
                <div style="text-align:center;">
                    <div style="font-family:'Playfair Display',serif;font-size:32px;color:var(--gold);font-weight:700;">3x</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">Meals Per Day</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-family:'Playfair Display',serif;font-size:32px;color:var(--primary-light);font-weight:700;">100%</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">Tracked</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-family:'Playfair Display',serif;font-size:32px;color:var(--gold-light);font-weight:700;">∞</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">Users</div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CONTACT SECTION -->
<section id="contact" style="padding:80px 20px;background:var(--light-2);">
    <div style="max-width:600px;margin:0 auto;text-align:center;">
        <span class="section-tag">Contact Us</span>
        <h2 class="section-title" style="margin-bottom:30px;">Get In <span>Touch</span></h2>
        <div class="card">
            <div class="card-body">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                    <div style="background:var(--light);padding:20px;border-radius:var(--radius);text-align:center;">
                        <i class="fa fa-envelope" style="font-size:24px;color:var(--primary);margin-bottom:8px;display:block;"></i>
                        <strong>Email</strong><br>
                        <span style="font-size:13px;color:var(--mid);">admin@mealmate.com</span>
                    </div>
                    <div style="background:var(--light);padding:20px;border-radius:var(--radius);text-align:center;">
                        <i class="fa fa-phone" style="font-size:24px;color:var(--primary);margin-bottom:8px;display:block;"></i>
                        <strong>Phone</strong><br>
                        <span style="font-size:13px;color:var(--mid);">+880 1700-000000</span>
                    </div>
                </div>
                <a href="index.php" class="btn btn-primary" style="width:100%;justify-content:center;">
                    <i class="fa fa-arrow-right-to-bracket"></i> Get Started Now
                </a>
            </div>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>