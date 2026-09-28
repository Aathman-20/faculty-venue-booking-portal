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
        driver.execute_script(set_val_script, email_field, "hod@tce.edu")
        driver.execute_script(set_val_script, password_field, "Hod@12345")
        
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        wait.until(lambda d: login_btn.is_enabled())
        login_btn.click()
        
        print("Waiting for continue modal...")
        try:
            popup_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue to Dashboard')]")))
            popup_btn.click()
        except Exception as e:
            print("Modal wait failed. Screenshotting.")
            driver.save_screenshot("login_failed_hod.png")
            raise e
        
        wait.until(EC.url_contains("hod-dashboard.html"))
        
        hodUser = driver.execute_script("return angular.element(document.body).scope().currentUser;")
        print("HOD Dashboard currentUser:", hodUser)
        
        print("Navigating to Venue Booking...")
        venue_btn = driver.find_element(By.XPATH, "//li[contains(., 'Venue Bookings')]")
        venue_btn.click()
        
        wait.until(EC.url_contains("venue-booking.html"))
        time.sleep(1)
        
        venueUser = driver.execute_script("return angular.element(document.body).scope().currentUser;")
        print("Venue Booking currentUser:", venueUser)
        
        sessionStr = driver.execute_script("return window.sessionStorage.getItem('authUser');")
        print("sessionStorage authUser:", sessionStr)

        app_perm = driver.execute_script("return document.body.innerHTML.includes('Approval / Permission')")
        print("Approval / Permission visible in HTML?", app_perm)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.quit()

test_hod()
