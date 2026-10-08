from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = webdriver.ChromeOptions()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 5)

def login(email, password):
    driver.get("http://localhost:8000/login.html")
    wait.until(EC.presence_of_element_located((By.NAME, "loginEmail"))).send_keys(email)
    driver.find_element(By.NAME, "loginPassword").send_keys(password)
    btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    wait.until(lambda d: btn.is_enabled())
    btn.click()
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue to Dashboard')]"))).click()
    time.sleep(1)

def reject_first_pending(reason_text):
    driver.get("http://localhost:8000/approval-permission.html")
    time.sleep(2)
    reject_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Reject')]")
    if reject_btns:
        reject_btns[0].click()
        time.sleep(1)
        textarea = driver.find_element(By.XPATH, "//textarea[@ng-model='rejectModal.reason']")
        textarea.send_keys(reason_text)
        
        submit_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Reject Booking')]")
        submit_btn.click()
        time.sleep(2)
        print("Reject submitted:", reason_text)
    else:
        print("No pending bookings to reject.")

def check_faculty_dashboard():
    driver.get("http://localhost:8000/my-bookings.html")
    time.sleep(2)
    cards = driver.find_elements(By.CLASS_NAME, "card-body")
    for card in cards:
        text = card.text
        if "HOD_REJECTED" in text or "ADMIN_REJECTED" in text:
            print("Found rejected booking:")
            print(text.replace('\n', ' '))
            print("---")

try:
    print("Logging in as HOD...")
    login("hod_it@tce.edu", "Hod@12345")
    reject_first_pending("HOD rejected due to clash")
    
    print("Logging in as Admin...")
    login("admin@tce.edu", "Hod@12345")
    reject_first_pending("Admin rejected due to maintenance")
    
    print("Logging in as Faculty to check...")
    login("faculty1@tce.edu", "faculty123")
    check_faculty_dashboard()
except Exception as e:
    print(e)
finally:
    driver.quit()
