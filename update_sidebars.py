import os
import re

directory = r"d:\Aathman\TCE\Web Technologies\Mini-project_team\Combined App 3\Combined App"

# We will define the generic sidebar template.
# The placeholder {ACTIVE_OVERVIEW} etc will be replaced per file.
SIDEBAR_TEMPLATE = """<aside class="sidebar">
            <ul class="nav-list">
                <li class="nav-item {overview_active}" onclick="window.location.href='dashboard.html'"><span class="icon">🏠</span> Overview</li>
                <li class="nav-item {venues_active}" onclick="window.location.href='venue-booking.html'"><span class="icon">📅</span> Venue Bookings</li>
                <li class="nav-item {mybookings_active}" onclick="window.location.href='my-bookings.html'"><span class="icon">📋</span> My Requests</li>
                <li class="nav-item {approval_active}" ng-if="currentUser.role.indexOf('HOD') !== -1" onclick="window.location.href='hod-dashboard.html'"><span class="icon">✅</span> Approval / Permission</li>
                <li class="nav-item {account_active}" onclick="window.location.href='account.html'"><span class="icon">👤</span> Account</li>
            </ul>
        </aside>"""

html_files = [
    "dashboard.html",
    "hod-dashboard.html",
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
        
    # Determine which item should be active
    overview_active = 'active' if filename in ['dashboard.html'] else ''
    venues_active = 'active' if filename in ['venue-booking.html', 'booking-details.html', 'technical-requirements.html', 'booking-confirmation.html'] else ''
    mybookings_active = 'active' if filename in ['my-bookings.html'] else ''
    approval_active = 'active' if filename in ['hod-dashboard.html'] else ''
    account_active = 'active' if filename in ['account.html'] else ''
    
    new_sidebar = SIDEBAR_TEMPLATE.format(
        overview_active=overview_active,
        venues_active=venues_active,
        mybookings_active=mybookings_active,
        approval_active=approval_active,
        account_active=account_active
    )
    
    # In some files, there are multiple aside blocks (e.g. one for HOD view, one for faculty view)
    # The requirement is to have a single common sidebar.
    # So we should replace all <aside class="sidebar"...> ... </aside> with the new single sidebar,
    # but wait, if there are multiple asides in one file, replacing them all with ONE might require
    # replacing the first one and removing the others, OR just replacing them all with the new one
    # and ensuring we only insert it once if they were next to each other.
    
    # Let's find all aside blocks
    aside_pattern = re.compile(r'<aside\b[^>]*>[\s\S]*?</aside>')
    asides = aside_pattern.findall(content)
    
    if len(asides) > 0:
        # Replace the first aside with the new sidebar
        content = content.replace(asides[0], new_sidebar)
        # Remove subsequent asides to ensure we don't duplicate
        for i in range(1, len(asides)):
            content = content.replace(asides[i], "")
            
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filename} (Replaced {len(asides)} asides)")
    else:
        print(f"No sidebar found in {filename}")

