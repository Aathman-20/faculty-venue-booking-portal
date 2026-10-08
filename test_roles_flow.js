const BASE_URL = "http://localhost:3000/api";

const faculty = { email: "faculty@tce.edu", password: "Faculty@12345", role: "FACULTY", department: "Information Technology" };
const hod_it = { email: "hod_it@tce.edu", password: "Hod@12345", role: "HOD", department: "Information Technology" };
const hod_cs = { email: "hod_cs@tce.edu", password: "Hod@12345", role: "HOD", department: "Computer Science" };
const admin = { email: "admin@tce.edu", password: "Hod@12345", role: "ADMIN", department: "Administration" };

async function login(user) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: user.password })
    });
    const data = await res.json();
    if (res.ok) return data.user;
    throw new Error(`Login failed: ${JSON.stringify(data)}`);
}

async function createBooking(user, venue = "KS Auditorium", department = null) {
    const data = {
        user,
        department: department || user.department,
        venue,
        building: "Main Building",
        date: Date.now().toString(),
        slot: "10:00 AM - 12:00 PM",
        faculty: user.name,
        email: user.email
    };
    const res = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Create booking failed: ${await res.text()}`);
    return await res.json();
}

async function updateStatus(user, bookingId, status) {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, status })
    });
    return res;
}

async function runTests() {
    try {
        const u_faculty = await login(faculty);
        const u_hod_it = await login(hod_it);
        const u_hod_cs = await login(hod_cs);
        const u_admin = await login(admin);
        console.log("Logged in successfully.");

        // Test 1: test_faculty_create_booking_pending
        console.log("Test 1: test_faculty_create_booking_pending");
        let b1 = await createBooking(u_faculty);
        if (b1.status !== "pending") throw new Error("Expected pending");

        // Test 3: test_hod_cannot_approve_other_department
        console.log("Test 3: test_hod_cannot_approve_other_department");
        let r = await updateStatus(u_hod_cs, b1.id, "HOD_APPROVED");
        if (r.status !== 403) throw new Error("Expected 403");

        // Test 4: test_admin_cannot_approve_pending
        console.log("Test 4: test_admin_cannot_approve_pending");
        r = await updateStatus(u_admin, b1.id, "APPROVED");
        if (r.status !== 403) throw new Error("Expected 403");

        // Test 2: test_hod_can_approve_own_department
        console.log("Test 2: test_hod_can_approve_own_department");
        r = await updateStatus(u_hod_it, b1.id, "HOD_APPROVED");
        if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);

        // Test 5: test_admin_can_approve_hod_approved
        console.log("Test 5: test_admin_can_approve_hod_approved");
        r = await updateStatus(u_admin, b1.id, "APPROVED");
        if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);

        // Test 6: test_hod_reject
        console.log("Test 6: test_hod_reject");
        let b2 = await createBooking(u_faculty);
        r = await updateStatus(u_hod_it, b2.id, "HOD_REJECTED");
        if (r.status !== 200) throw new Error("Expected 200");

        // Test 7: test_admin_reject
        console.log("Test 7: test_admin_reject");
        let b3 = await createBooking(u_faculty);
        r = await updateStatus(u_hod_it, b3.id, "HOD_APPROVED");
        if (r.status !== 200) throw new Error("Expected 200");
        r = await updateStatus(u_admin, b3.id, "ADMIN_REJECTED");
        if (r.status !== 200) throw new Error("Expected 200");

        // Test 8: test_faculty_booking_history_shows_correct_status
        console.log("Test 8: test_faculty_booking_history_shows_correct_status");
        let resBookings = await fetch(`${BASE_URL}/bookings`);
        let allBookings = await resBookings.json();
        let facultyBookings = allBookings.filter(b => b.email === u_faculty.email);
        let statuses = facultyBookings.map(b => b.status);
        console.log("Faculty statuses:", statuses);
        if (!statuses.includes("APPROVED")) throw new Error("Missing APPROVED");
        if (!statuses.includes("HOD_REJECTED")) throw new Error("Missing HOD_REJECTED");
        if (!statuses.includes("ADMIN_REJECTED")) throw new Error("Missing ADMIN_REJECTED");

        console.log("ALL TESTS PASSED SUCCESSFULLY!");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

runTests();
