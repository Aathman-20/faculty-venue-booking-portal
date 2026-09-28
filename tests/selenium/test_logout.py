from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time
import sys

BASE_URL = "http://localhost:8000"

def test_logout():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 5)

    try:
        print("Logging in as faculty...")
        driver.get(f"{BASE_URL}/login.html")
        email_field = wait.until(EC.presence_of_element_located((By.NAME, "loginEmail")))
        password_field = driver.find_element(By.NAME, "loginPassword")
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        # Robustly set values for Angular
        set_val_script = '''
            var el = arguments[0];
            el.value = arguments[1];
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        '''
        driver.execute_script(set_val_script, email_field, "faculty1@tce.edu")
        driver.execute_script(set_val_script, password_field, "faculty123")
        
        wait.until(lambda d: login_btn.is_enabled())
        login_btn.click()
        
        popup_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue to Dashboard')]")))
        popup_btn.click()
        wait.until(EC.url_contains("dashboard.html"))
        
        print("Opening profile dropdown...")
        user_pill = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "user-pill")))
        
        user_pill.click()
        time.sleep(0.5)
        
        driver.save_screenshot("before_logout_click.png")
        
        print("Clicking logout...")
        logout_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Logout')]")))
        
        # Try moving mouse to it first (simulate user action)
        actions = ActionChains(driver)
        actions.move_to_element(logout_btn).perform()
        
        time.sleep(0.5)
        driver.save_screenshot("during_logout_hover.png")
        
        logout_btn.click()
        time.sleep(1)
        driver.save_screenshot("after_logout_click.png")
        
        # Verify redirect
        wait.until(EC.url_contains("login.html"))
        print("Redirected to login.html successfully!")
        
    except Exception as e:
        print(f"Test Failed: {e}")
        driver.save_screenshot("logout_error.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_logout()
