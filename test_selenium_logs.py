from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import requests

BASE_URL = 'http://localhost:8000'

def test_hod_reject():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 5)

    try:
        driver.get(f'{BASE_URL}/login.html')
        email_field = wait.until(EC.presence_of_element_located((By.NAME, 'loginEmail')))
        password_field = driver.find_element(By.NAME, 'loginPassword')
        
        set_val_script = '''
            var el = arguments[0];
            el.value = arguments[1];
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        '''
        driver.execute_script(set_val_script, email_field, 'hod_it@tce.edu')
        driver.execute_script(set_val_script, password_field, 'Hod@12345')
        
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        popup_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue')]")))
        popup_btn.click()
        
        wait.until(EC.url_contains('approval-permission.html'))
        time.sleep(1)
        
        reject_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Reject')]")))
        reject_btn.click()
        
        modal_textarea = wait.until(EC.presence_of_element_located((By.XPATH, "//textarea[@placeholder='Enter the reason for rejecting this booking...']")))
        
        driver.execute_script(set_val_script, modal_textarea, 'This is a test rejection reason.')
        
        confirm_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Reject Booking')]")
        confirm_btn.click()
        
        time.sleep(2)
        print('Checking browser logs:')
        for entry in driver.get_log('browser'):
            print(entry)
            
    except Exception as e:
        print(f'Error: {e}')
    finally:
        driver.quit()

test_hod_reject()
