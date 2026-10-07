import requests
import time

BASE_URL = "http://localhost:3000/api"

# Users (from seed)
faculty = {"email": "faculty@tce.edu", "password": "Faculty@12345", "role": "FACULTY", "department": "Information Technology"}
hod_it = {"email": "hod_it@tce.edu", "password": "Hod@12345", "role": "HOD", "department": "Information Technology"}
hod_cs = {"email": "hod_cs@tce.edu", "password": "Hod@12345", "role": "HOD", "department": "Computer Science"}
admin = {"email": "hod@tce.edu", "password": "Hod@12345", "role": "ADMIN", "department": "Administration"}

def login(user):
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": user["email"], "password": user["password"]})
    if r.status_code == 200:
        return r.json().get("user")
    raise Exception(f"Login failed: {r.text}")

u_faculty = login(faculty)
u_hod_it = login(hod_it)
u_hod_cs = login(hod_cs)
u_admin = login(admin)

print("Logged in successfully.")

# Helper to create booking
def create_booking(user, venue="KS Auditorium", department=None, date="2030-05-15"):
    if department is None: department = user["department"]
    data = {
        "user": user,
        "department": department,
        "venue": venue,
        "building": "Main Building",
        "date": date,
        "slot": "10:00 AM - 12:00 PM",
        "faculty": user["name"],
        "email": user["email"],
        "eventTitle": "Test Event",
        "purpose": "Test Purpose",
        "attendeeCount": 50,
        "techReq": {
            "techStaffRequired": "Yes"
        }
    }
    r = requests.post(f"{BASE_URL}/bookings", json=data)
    assert r.status_code == 201, r.text
    return r.json()

# Helper to update status
def update_status(user, booking_id, status):
    r = requests.patch(f"{BASE_URL}/bookings/{booking_id}/status", json={"user": user, "status": status})
    return r

# Test 1: test_faculty_create_booking_pending
print("Test 1: test_faculty_create_booking_pending")
b1 = create_booking(u_faculty)
assert b1["status"] == "pending"

# Test 3: test_hod_cannot_approve_other_department
print("Test 3: test_hod_cannot_approve_other_department")
r = update_status(u_hod_cs, b1["id"], "HOD_APPROVED")
assert r.status_code == 403, r.text

# Test 4: test_admin_cannot_approve_pending
print("Test 4: test_admin_cannot_approve_pending")
r = update_status(u_admin, b1["id"], "APPROVED")
assert r.status_code == 403, r.text

# Test 2: test_hod_can_approve_own_department
print("Test 2: test_hod_can_approve_own_department")
r = update_status(u_hod_it, b1["id"], "HOD_APPROVED")
assert r.status_code == 200, r.text

# Test 5: test_admin_can_approve_hod_approved
print("Test 5: test_admin_can_approve_hod_approved")
r = update_status(u_admin, b1["id"], "APPROVED")
assert r.status_code == 200, r.text

# Test 6: test_hod_reject
print("Test 6: test_hod_reject")
b2 = create_booking(u_faculty, date="2030-05-16")
r = update_status(u_hod_it, b2["id"], "HOD_REJECTED")
assert r.status_code == 200, r.text

# Test 7: test_admin_reject
print("Test 7: test_admin_reject")
b3 = create_booking(u_faculty, date="2030-05-17")
r = update_status(u_hod_it, b3["id"], "HOD_APPROVED")
assert r.status_code == 200, r.text
r = update_status(u_admin, b3["id"], "ADMIN_REJECTED")
assert r.status_code == 200, r.text

# Test 8: test_faculty_booking_history_shows_correct_status
print("Test 8: test_faculty_booking_history_shows_correct_status")
r = requests.get(f"{BASE_URL}/bookings")
assert r.status_code == 200
bookings = r.json()
faculty_bookings = [b for b in bookings if b["email"] == u_faculty["email"]]
statuses = [b["status"] for b in faculty_bookings]
print(statuses)
assert "APPROVED" in statuses
assert "HOD_REJECTED" in statuses
assert "ADMIN_REJECTED" in statuses

print("ALL TESTS PASSED SUCCESSFULLY!")
