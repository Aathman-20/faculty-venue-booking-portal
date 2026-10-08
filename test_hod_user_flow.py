from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

BASE_URL = "http://localhost:8000"

def test_hod():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 5)

    try:
        print("Logging in as HOD...")
        driver.get(f"{BASE_URL}/login.html")
        email_field = wait.until(EC.presence_of_element_located((By.NAME, "loginEmail")))
        password_field = driver.find_element(By.NAME, "loginPassword")
        
        set_val_script = '''
            var el = arguments[0];
            el.value = arguments[1];
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        '''
        driver.execute_script(set_val_script, email_field, "admin@tce.edu")
        driver.execute_script(set_val_script, password_field, "Hod@12345")
        
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        wait.until(lambda d: login_btn.is_enabled())
        login_btn.click()
        
        popup_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue to Dashboard')]")))
        popup_btn.click()
        
        wait.until(EC.url_contains("hod-dashboard.html"))
        print("Step 1: Reached HOD Dashboard")
        
        # Go to Dashboard (Overview)
        driver.find_element(By.XPATH, "//li[contains(., 'Overview')]").click()
        wait.until(EC.url_contains("dashboard.html"))
        print("Step 2: Reached Dashboard")
        
        # Go to Venue Bookings
        driver.find_element(By.XPATH, "//li[contains(., 'Venue Bookings')]").click()
        wait.until(EC.url_contains("venue-booking.html"))
        print("Step 3: Reached Venue Bookings")
        time.sleep(1)
        
        # Go to Approval/Permission
        driver.find_element(By.XPATH, "//li[contains(., 'Approval / Permission')]").click()
        wait.until(EC.url_contains("hod-dashboard.html"))
        print("Step 4: Reached HOD Dashboard again")
        time.sleep(1)
        
        print("ALL TESTS PASSED!")
        
    except Exception as e:
        print(f"Error: {e}")
        driver.save_screenshot("error_hod_flow2.png")
    finally:
        driver.quit()

test_hod()
