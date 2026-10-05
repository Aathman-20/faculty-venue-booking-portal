import os
import re

directory = r"d:\Aathman\TCE\Web Technologies\Mini-project_team\Combined App 3\Combined App"

SIDEBAR_TEMPLATE = """<aside class="sidebar">
            <ul class="nav-list">
                <li class="nav-item {overview_active}" onclick="window.location.href='dashboard.html'"><span class="icon">🏠</span> Overview</li>
                <li class="nav-item {venues_active}" ng-if="currentUser.role !== 'ADMIN'" onclick="window.location.href='venue-booking.html'"><span class="icon">📅</span> Venue Bookings</li>
                <li class="nav-item {mybookings_active}" ng-if="currentUser.role !== 'ADMIN'" onclick="window.location.href='my-bookings.html'"><span class="icon">📋</span> My Requests</li>
                <li class="nav-item {approval_active}" ng-if="currentUser.role === 'ADMIN'" onclick="window.location.href='approval-permission.html'"><span class="icon">✅</span> Approval / Permission</li>
                <li class="nav-item {approval_active}" ng-if="currentUser.role === 'HOD'" onclick="window.location.href='approval-permission.html'"><span class="icon">✅</span> Department Approvals</li>
                <li class="nav-item {account_active}" onclick="window.location.href='account.html'"><span class="icon">👤</span> Account</li>
            </ul>
        </aside>"""

html_files = [
    "dashboard.html",
    "approval-permission.html",
    "venue-booking.html",
    "booking-details.html",
    "technical-requirements.html",
    "booking-confirmation.html",
    "my-bookings.html",
    "account.html"
]

for filename in html_files:
    filepath = os.path.join(directory, filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename} - not found")
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    overview_active = 'active' if filename in ['dashboard.html'] else ''
    venues_active = 'active' if filename in ['venue-booking.html', 'booking-details.html', 'technical-requirements.html', 'booking-confirmation.html'] else ''
    mybookings_active = 'active' if filename in ['my-bookings.html'] else ''
    approval_active = 'active' if filename in ['approval-permission.html'] else ''
    account_active = 'active' if filename in ['account.html'] else ''
    
    new_sidebar = SIDEBAR_TEMPLATE.format(
        overview_active=overview_active,
        venues_active=venues_active,
        mybookings_active=mybookings_active,
        approval_active=approval_active,
        account_active=account_active
    )
    
    aside_pattern = re.compile(r'<aside\b[^>]*>[\s\S]*?</aside>')
    asides = aside_pattern.findall(content)
    
    if len(asides) > 0:
        content = content.replace(asides[0], new_sidebar)
        for i in range(1, len(asides)):
            content = content.replace(asides[i], "")
            
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filename} (Replaced {len(asides)} asides)")
    else:
        print(f"No sidebar found in {filename}")
