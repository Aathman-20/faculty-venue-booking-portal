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

def check_faculty_dashboard():
    driver.get("http://localhost:8000/my-bookings.html")
    time.sleep(2)
    cards = driver.find_elements(By.CLASS_NAME, "card-body")
    for card in cards:
        text = card.text
        if "Rejected by HOD" in text or "Rejected by Admin" in text:
            print("Found rejected booking:")
            print(text.replace('\n', ' '))
            print("---")

try:
    print("Logging in as Faculty to check...")
    login("faculty1@tce.edu", "faculty123")
    check_faculty_dashboard()
except Exception as e:
    print(e)
finally:
    driver.quit()
