from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

BASE_URL = 'http://localhost:8000'

def test_hod_reject():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 5)

    try:
        driver.get(f'{BASE_URL}/login.html')
        wait.until(EC.presence_of_element_located((By.NAME, 'loginEmail'))).send_keys('hod_it@tce.edu')
        driver.find_element(By.NAME, 'loginPassword').send_keys('Hod@12345')
        
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        popup_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue')]")))
        popup_btn.click()
        
        wait.until(EC.url_contains('approval-permission.html'))
        time.sleep(1)
        
        reject_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Reject')]")))
        reject_btn.click()
        
        modal_textarea = wait.until(EC.presence_of_element_located((By.XPATH, "//textarea[@placeholder='Enter the reason for rejecting this booking...']")))
        
        modal_textarea.clear()
        modal_textarea.send_keys('This is a test rejection reason.')
        
        confirm_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Reject Booking')]")))
        confirm_btn.click()
        
        time.sleep(1)
        try:
            alert = driver.switch_to.alert
            print('ALERT FOUND:', alert.text)
            alert.accept()
        except:
            print('No alert found.')
            
    except Exception as e:
        print(f'Error: {e}')
    finally:
        driver.quit()

test_hod_reject()
