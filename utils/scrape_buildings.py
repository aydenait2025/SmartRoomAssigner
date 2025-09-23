import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options

# --- Setup Selenium ---
options = Options()
options.headless = True  # run in headless mode
service = FirefoxService()  # assumes geckodriver is in PATH
driver = webdriver.Firefox(service=service, options=options)

try:
    url = "https://lsm.utoronto.ca/webapp/f?p=210:1::::::"
    driver.get(url)

    driver.implicitly_wait(5)

    # Find the building dropdown
    building_dropdown = driver.find_element(By.ID, "P1_BLDG")
    building_options = building_dropdown.find_elements(By.TAG_NAME, "option")

    buildings = []
    for option in building_options:
        value = option.get_attribute("value").strip()
        text = option.text.strip()
        if value and value != "%null%":
            # Remove duplicate code prefix from text if present
            if text.startswith(value + " "):
                text = text[len(value):].strip()
            buildings.append((value, text))
            print(f"Found building: {value},{text}")

    # Save to CSV with two columns, no header
    with open("../buildings.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(buildings)

    print("All buildings saved to ../buildings.csv (no header, just Code,Building)")

finally:
    driver.quit()
