from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

BASE_URL = "http://localhost:8000"

def run_test():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--window-size=1920,1080')
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 5)

    try:
        print("Logging in...")
        driver.get(f"{BASE_URL}/login.html")
        email_field = wait.until(EC.presence_of_element_located((By.NAME, "loginEmail")))
        password_field = driver.find_element(By.NAME, "loginPassword")
        
        email_field.send_keys("faculty1@tce.edu")
        password_field.send_keys("faculty123")
        
        set_val_script = '''
            var el = arguments[0];
            el.value = arguments[1];
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        '''
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        wait.until(lambda d: login_btn.is_enabled())
        login_btn.click()
        
        popup_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue to Dashboard')]")))
        popup_btn.click()
        wait.until(EC.url_contains("dashboard.html"))
        
        print("Going to venue booking...")
        driver.find_element(By.XPATH, "//li[contains(., 'Venue Bookings')]").click()
        wait.until(EC.url_contains("venue-booking.html"))
        time.sleep(1)
        
        # Click "Book Now" for KS Auditorium
        driver.execute_script('''
            var btns = document.querySelectorAll('button');
            for(var i=0; i<btns.length; i++) {
                if(btns[i].innerText.includes('Book Now') && btns[i].closest('.venue-card').innerText.includes('KS Auditorium')) {
                    btns[i].click();
                    break;
                }
            }
        ''')
        
        wait.until(EC.url_contains("booking-details.html"))
        time.sleep(1)
        
        print("Filling date and time for booking 1...")
        # Select date
        date_field = driver.find_element(By.XPATH, "//input[@type='date']")
        driver.execute_script("angular.element(arguments[0]).scope().slot.selectedDate = new Date('2030-04-21T00:00:00'); angular.element(arguments[0]).scope().$apply();", date_field)
        
        # Select time
        s_time = driver.find_element(By.XPATH, "//input[@ng-model='slot.selectedStartTime']")
        e_time = driver.find_element(By.XPATH, "//input[@ng-model='slot.selectedEndTime']")
        driver.execute_script("angular.element(arguments[0]).scope().slot.selectedStartTime = new Date('2030-04-21T10:00:00'); angular.element(arguments[0]).scope().$apply();", s_time)
        driver.execute_script("angular.element(arguments[0]).scope().slot.selectedEndTime = new Date('2030-04-21T12:00:00'); angular.element(arguments[0]).scope().$apply();", e_time)
        
        # Click continue
        continue_btn = driver.find_element(By.XPATH, "//button[contains(., 'Continue')]")
        wait.until(lambda d: continue_btn.is_enabled())
        driver.execute_script("arguments[0].click();", continue_btn)
        
        wait.until(EC.url_contains("technical-requirements.html"))
        time.sleep(1)
        
        print("Submitting booking 1...")
        event_title = driver.find_element(By.NAME, "eventTitle")
        driver.execute_script(set_val_script, event_title, "Test Booking 1 Title")
        purpose = driver.find_element(By.NAME, "purpose")
        driver.execute_script(set_val_script, purpose, "Test Booking 1 Purpose")
        attendees = driver.find_element(By.NAME, "attendeeCount")
        driver.execute_script(set_val_script, attendees, "100")
        tech_staff = driver.find_element(By.NAME, "techStaffRequired")
        driver.execute_script(set_val_script, tech_staff, "Yes")
        submit_btn = driver.find_element(By.XPATH, "//button[contains(., 'Submit Booking')]")
        wait.until(lambda d: submit_btn.is_enabled())
        driver.execute_script("angular.element(arguments[0]).scope().confirmBooking()", submit_btn)
        
        wait.until(EC.url_contains("booking-confirmation.html"))
        print("Booking 1 successful!")
        
        print("Starting Booking 2 for the same venue and time...")
        driver.get(f"{BASE_URL}/venue-booking.html")
        time.sleep(1)
        
        # Click "Book Now" for KS Auditorium again
        driver.execute_script('''
            var btns = document.querySelectorAll('button');
            for(var i=0; i<btns.length; i++) {
                if(btns[i].innerText.includes('Book Now') && btns[i].closest('.venue-card').innerText.includes('KS Auditorium')) {
                    btns[i].click();
                    break;
                }
            }
        ''')
        
        wait.until(EC.url_contains("booking-details.html"))
        time.sleep(1)
        
        # Select date
        date_field = driver.find_element(By.XPATH, "//input[@type='date']")
        driver.execute_script("angular.element(arguments[0]).scope().slot.selectedDate = new Date('2030-04-21T00:00:00'); angular.element(arguments[0]).scope().$apply();", date_field)
        
        # Select time
        s_time = driver.find_element(By.XPATH, "//input[@ng-model='slot.selectedStartTime']")
        e_time = driver.find_element(By.XPATH, "//input[@ng-model='slot.selectedEndTime']")
        driver.execute_script("angular.element(arguments[0]).scope().slot.selectedStartTime = new Date('2030-04-21T11:00:00'); angular.element(arguments[0]).scope().$apply();", s_time)
        driver.execute_script("angular.element(arguments[0]).scope().slot.selectedEndTime = new Date('2030-04-21T13:00:00'); angular.element(arguments[0]).scope().$apply();", e_time)
        
        # Click continue
        continue_btn = driver.find_element(By.XPATH, "//button[contains(., 'Continue')]")
        wait.until(lambda d: continue_btn.is_enabled())
        driver.execute_script("arguments[0].click();", continue_btn)
        
        wait.until(EC.url_contains("technical-requirements.html"))
        time.sleep(1)
        
        print("Submitting booking 2...")
        event_title = driver.find_element(By.NAME, "eventTitle")
        driver.execute_script(set_val_script, event_title, "Test Booking 2 Title")
        purpose = driver.find_element(By.NAME, "purpose")
        driver.execute_script(set_val_script, purpose, "Test Booking 2 Overlap")
        attendees = driver.find_element(By.NAME, "attendeeCount")
        driver.execute_script(set_val_script, attendees, "100")
        tech_staff = driver.find_element(By.NAME, "techStaffRequired")
        driver.execute_script(set_val_script, tech_staff, "Yes")
        submit_btn = driver.find_element(By.XPATH, "//button[contains(., 'Submit Booking')]")
        wait.until(lambda d: submit_btn.is_enabled())
        driver.execute_script("angular.element(arguments[0]).scope().confirmBooking()", submit_btn)
        
        # It should NOT go to confirmation. We should wait for the conflict UI
        time.sleep(2)
        driver.save_screenshot("conflict_ui.png")
        
        try:
            conflict_msg = driver.find_element(By.XPATH, "//h3[contains(., 'Venue Already Booked')]")
            print("Conflict UI appeared correctly!")
        except:
            print("ERROR: Conflict UI did not appear.")
            return
            
        print("Clicking Book This Venue for an alternative...")
        alt_btn = driver.find_element(By.XPATH, "//button[contains(., 'Book This Venue')]")
        driver.execute_script("arguments[0].click();", alt_btn)
        time.sleep(1)
        
        driver.save_screenshot("after_alt_selected.png")
        
        print("Submitting alternative booking...")
        submit_btn = driver.find_element(By.XPATH, "//button[contains(., 'Submit Booking')]")
        wait.until(lambda d: submit_btn.is_enabled())
        driver.execute_script("angular.element(arguments[0]).scope().confirmBooking()", submit_btn)
        
        wait.until(EC.url_contains("booking-confirmation.html"))
        print("Alternative booking successful!")
        
    except Exception as e:
        print(f"Error: {e}")
        driver.save_screenshot("error_novelty.png")
        for entry in driver.get_log('browser'):
            print(entry)
    finally:
        driver.quit()

run_test()
