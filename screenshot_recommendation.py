import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument('--headless')
options.add_argument('--window-size=1200,800')
driver = webdriver.Chrome(options=options)

try:
    driver.get('http://localhost:8000/login.html')
    time.sleep(1)
    driver.find_element(By.XPATH, "//input[@type='email']").send_keys('faculty@tce.edu')
    driver.find_element(By.XPATH, "//input[@type='password']").send_keys('Faculty@12345')
    driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]").click()
    time.sleep(2)
    
    driver.get('http://localhost:8000/venue-booking.html')
    time.sleep(2)
    
    # Enter attendee count 500 (this should show capacity warning for some venues and highlight others)
    attendee_input = driver.find_element(By.XPATH, "//input[@ng-model='attendeeCount']")
    attendee_input.clear()
    attendee_input.send_keys('500')
    time.sleep(2)
    
    driver.save_screenshot('recommendation_500.png')
    print("Screenshot saved: recommendation_500.png")
    
finally:
    driver.quit()
