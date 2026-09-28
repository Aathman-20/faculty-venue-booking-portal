import unittest
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

BASE_URL = "http://localhost:8000"
ARTIFACTS_DIR = r"C:\Users\aathm\.gemini\antigravity-ide\brain\6fed4b78-13fc-49ba-9b67-48a121d44817"

class FacultyVenuePortalTests(unittest.TestCase):
    def setUp(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(5)
        # Clear local storage before each test to ensure clean state
        self.driver.get(f"{BASE_URL}/login.html")
        self.driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        self.driver.refresh()

    def tearDown(self):
        if self.driver:
            self.driver.quit()
    
    def save_screenshot(self, name):
        try:
            path = os.path.join(ARTIFACTS_DIR, f"{name}.png")
            self.driver.save_screenshot(path)
            print(f"Saved screenshot: {path}")
        except Exception as e:
            print(f"Failed to save screenshot {name}: {e}")

    def _login_helper(self, wait):
        email_field = wait.until(EC.presence_of_element_located((By.NAME, "loginEmail")))
        password_field = self.driver.find_element(By.NAME, "loginPassword")
        login_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        # Robustly set values for Angular
        set_val_script = '''
            var el = arguments[0];
            el.value = arguments[1];
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        '''
        self.driver.execute_script(set_val_script, email_field, "faculty1@tce.edu")
        self.driver.execute_script(set_val_script, password_field, "faculty123")
        
        wait.until(lambda d: login_btn.is_enabled())
        login_btn.click()
        
        popup_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue to Dashboard')]")))
        popup_btn.click()
        wait.until(EC.url_contains("dashboard.html"))

    def test_a_usability_and_interface_checks(self):
        """E. Usability and interface checks"""
        self.driver.get(f"{BASE_URL}/login.html")
        wait = WebDriverWait(self.driver, 10)
        
        # Verify login logo/brand
        logo = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".header-brand h2")))
        self.assertTrue(logo.is_displayed(), "Logo should be visible")
        
        # Verify username/email field
        email_field = self.driver.find_element(By.NAME, "loginEmail")
        self.assertTrue(email_field.is_displayed(), "Email field should be visible")
        self.assertEqual(email_field.get_attribute("placeholder"), "e.g., faculty@tce.edu")
        
        # Verify password field
        password_field = self.driver.find_element(By.NAME, "loginPassword")
        self.assertTrue(password_field.is_displayed(), "Password field should be visible")
        self.assertEqual(password_field.get_attribute("placeholder"), "Enter your password")
        
        # Verify login button
        login_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        self.assertTrue(login_btn.is_displayed(), "Login button should be visible")
        self.assertIn("Login", login_btn.text)
        
        self.save_screenshot("usability_login_page")

    def test_b_invalid_login(self):
        """B. Invalid login"""
        self.driver.get(f"{BASE_URL}/login.html")
        wait = WebDriverWait(self.driver, 10)
        
        email_field = wait.until(EC.presence_of_element_located((By.NAME, "loginEmail")))
        password_field = self.driver.find_element(By.NAME, "loginPassword")
        login_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        email_field.send_keys("invalid@tce.edu")
        password_field.send_keys("wrongpass")
        
        # Wait for angular to validate form
        wait.until(lambda d: login_btn.is_enabled())
        login_btn.click()
        
        # Assert error message
        error_msg = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".error-message")))
        self.assertIn("Invalid email or password", error_msg.text)
        
        # Verify not authenticated (still on login page)
        self.assertIn("login.html", self.driver.current_url)
        self.save_screenshot("invalid_login_test")

    def test_c_valid_login(self):
        """A. Valid login"""
        self.driver.get(f"{BASE_URL}/login.html")
        wait = WebDriverWait(self.driver, 10)
        self._login_helper(wait)
        self.assertIn("dashboard.html", self.driver.current_url)
        self.save_screenshot("valid_login_test")

    def test_d_venue_booking_navigation(self):
        """C. Venue booking navigation"""
        self.driver.get(f"{BASE_URL}/login.html")
        wait = WebDriverWait(self.driver, 10)
        self._login_helper(wait)
            
        self.driver.get(f"{BASE_URL}/venue-booking.html")
        
        # Wait for angular to render list and click "Book Now"
        def get_book_now_btn(driver):
            try:
                btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Book Now')]")
                if btn.is_displayed() and btn.is_enabled():
                    return btn
            except:
                pass
            return False
            
        book_now_btn = wait.until(get_book_now_btn)
        self.driver.execute_script("arguments[0].scrollIntoView();", book_now_btn)
        self.driver.execute_script("arguments[0].click();", book_now_btn)
        
        # Verify navigation to booking-details
        wait.until(EC.url_contains("booking-details.html"))
        self.assertIn("booking-details.html", self.driver.current_url)
        
        self.save_screenshot("venue_booking_navigation")

    def test_e_date_time_validation(self):
        """D. Date/time validation and Continue"""
        self.driver.get(f"{BASE_URL}/login.html")
        wait = WebDriverWait(self.driver, 10)
        self._login_helper(wait)
            
        self.driver.get(f"{BASE_URL}/venue-booking.html")
        
        # Wait for angular to render list and click "Book Now"
        def get_book_now_btn(driver):
            try:
                btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Book Now')]")
                if btn.is_displayed() and btn.is_enabled():
                    return btn
            except:
                pass
            return False
            
        book_now_btn = wait.until(get_book_now_btn)
        self.driver.execute_script("arguments[0].scrollIntoView();", book_now_btn)
        self.driver.execute_script("arguments[0].click();", book_now_btn)
        
        # Wait for navigation to booking-details
        wait.until(EC.url_contains("booking-details.html"))
        
        # Wait for angular to render inputs
        date_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='date']")))
        start_time_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='time'][ng-model='slot.selectedStartTime']")
        end_time_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='time'][ng-model='slot.selectedEndTime']")
        continue_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
        
        # 1. Invalid time (End time <= Start time)
        # Using javascript to reliably set date and time inputs across browsers
        set_val_script = '''
            var el = arguments[0];
            el.value = arguments[1];
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        '''
        self.driver.execute_script(set_val_script, date_input, '2026-09-25')
        self.driver.execute_script(set_val_script, start_time_input, '10:00')
        self.driver.execute_script(set_val_script, end_time_input, '09:00')
        
        # Verify validation error
        # wait for the div to be displayed
        error_msg = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div[ng-show='slot.timeError']")))
        self.assertIn("End time must be after start time", error_msg.text)
        
        # Verify button is disabled (has disabled attribute)
        self.assertFalse(continue_btn.is_enabled())
        self.save_screenshot("invalid_time_test")
        
        # 2. Valid time
        self.driver.execute_script(set_val_script, end_time_input, '12:00')
        
        # Wait for the continue button to be enabled (Angular digest loop)
        wait.until(lambda d: continue_btn.is_enabled())
        self.assertTrue(continue_btn.is_enabled())
        
        # Click continue via JS to avoid interception by scrolling elements
        self.driver.execute_script("arguments[0].scrollIntoView(true);", continue_btn)
        self.driver.execute_script("arguments[0].click();", continue_btn)
        
        # Verify navigation to Technical Requirements
        wait.until(EC.url_contains("technical-requirements.html"))
        self.assertIn("technical-requirements.html", self.driver.current_url)
        
        self.save_screenshot("date_time_validation_continue")

if __name__ == '__main__':
    unittest.main(verbosity=2)
