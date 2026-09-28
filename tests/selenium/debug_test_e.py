import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1920,1080")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
driver = webdriver.Chrome(options=options)
driver.implicitly_wait(5)
wait = WebDriverWait(driver, 10)

BASE_URL = "http://localhost:8000"

print("Logging in...")
driver.get(f"{BASE_URL}/login.html")
driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
driver.refresh()

email_field = wait.until(EC.presence_of_element_located((By.NAME, "loginEmail")))
password_field = driver.find_element(By.NAME, "loginPassword")
login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

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

print("Navigating to venue booking...")
driver.get(f"{BASE_URL}/venue-booking.html")
def get_book_now_btn(driver):
    try:
        btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Book Now')]")
        if btn.is_displayed() and btn.is_enabled():
            return btn
    except:
        pass
    return False

book_now_btn = wait.until(get_book_now_btn)
driver.execute_script("arguments[0].scrollIntoView();", book_now_btn)
driver.execute_script("arguments[0].click();", book_now_btn)
wait.until(EC.url_contains("booking-details.html"))
print("On booking details.")

date_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='date']")))
start_time_input = driver.find_element(By.CSS_SELECTOR, "input[type='time'][ng-model='slot.selectedStartTime']")
end_time_input = driver.find_element(By.CSS_SELECTOR, "input[type='time'][ng-model='slot.selectedEndTime']")

# Important: make sure we use a unique selector for the Continue button
continue_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
print("Continue btn HTML:", continue_btn.get_attribute("outerHTML"))

driver.execute_script(set_val_script, date_input, '2026-09-25')
driver.execute_script(set_val_script, start_time_input, '10:00')
driver.execute_script(set_val_script, end_time_input, '12:00')

wait.until(lambda d: continue_btn.is_enabled())
print("Continue button is enabled. Clicking via Javascript...")
driver.execute_script("arguments[0].click();", continue_btn)

time.sleep(2)
print("URL after clicking:", driver.current_url)
logs = driver.get_log("browser")
for log in logs:
    print("BROWSER LOG:", log)

driver.quit()
