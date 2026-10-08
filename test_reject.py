from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.set_capability('goog:loggingPrefs', {'performance': 'ALL', 'browser': 'ALL'})
driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 5)

try:
    print("Logging in...")
    driver.get("http://localhost:8000/login.html")
    wait.until(EC.presence_of_element_located((By.NAME, "loginEmail"))).send_keys("hod_it@tce.edu")
    driver.find_element(By.NAME, "loginPassword").send_keys("Hod@12345")
    btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    wait.until(lambda d: btn.is_enabled())
    btn.click()
    
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue to Dashboard')]"))).click()
    wait.until(EC.url_contains("approval-permission.html"))
    
    print("Clicking reject...")
    time.sleep(2)
    reject_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Reject')]")
    if reject_btns:
        reject_btns[0].click()
        
        time.sleep(1)
        textarea = driver.find_element(By.XPATH, "//textarea[@ng-model='rejectModal.reason']")
        textarea.send_keys("Venue has already been booked for the same event")
        
        submit_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Reject Booking')]")
        submit_btn.click()
        
        time.sleep(2)
        print("Done. Check logs.")
except Exception as e:
    print(e)
finally:
    for entry in driver.get_log('browser'):
        print(entry)
    driver.quit()
