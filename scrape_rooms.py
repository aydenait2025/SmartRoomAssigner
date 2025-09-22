import csv
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, NoSuchElementException, TimeoutException

URL = "https://lsm.utoronto.ca/webapp/f?p=210:1::::::"
BUILDINGS_CSV = "buildings.csv"
ROOMS_CSV = "rooms.csv"

options = webdriver.FirefoxOptions()
options.add_argument("--headless")
driver = webdriver.Firefox(options=options)
wait = WebDriverWait(driver, 10)

# --- Read buildings ---
with open(BUILDINGS_CSV, newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    buildings = [row[0] for row in reader]

with open(ROOMS_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Building", "Room", "Room Capacity", "Testing Capacity"])

    for building in buildings:
        print(f"Processing building: {building}")
        driver.get(URL)

        # Select building
        try:
            wait.until(EC.presence_of_element_located((By.ID, "P1_BLDG")))
            Select(driver.find_element(By.ID, "P1_BLDG")).select_by_visible_text(building)
            driver.find_element(By.ID, "P1_BLDG").submit()
        except Exception as e:
            print(f"Failed to select building {building}: {e}")
            continue

        time.sleep(2)  # wait for rooms to load

        # Get room values (not WebElements)
        try:
            select_room = Select(driver.find_element(By.ID, "P1_ROOM"))
            room_values = [opt.get_attribute("value") for opt in select_room.options if "%null%" not in opt.get_attribute("value")]
        except Exception as e:
            print(f"No rooms found for building {building}: {e}")
            continue

        # Loop through rooms by value
        for room_value in room_values:
            try:
                # Re-find the select element each time
                select_room = Select(driver.find_element(By.ID, "P1_ROOM"))
                select_room.select_by_value(room_value)
                driver.find_element(By.ID, "P1_ROOM").submit()
                time.sleep(2)

                # Get room name
                select_room = Select(driver.find_element(By.ID, "P1_ROOM"))
                room_name = select_room.first_selected_option.text.strip()

                # Extract capacities
                try:
                    room_capacity = driver.find_element(
                        By.XPATH,
                        "//table[@id='report_R667714867440047120']//tr[td[text()='Room Capacity']]/td[2]"
                    ).text.strip()
                except:
                    room_capacity = ""
                try:
                    testing_capacity = driver.find_element(
                        By.XPATH,
                        "//table[@id='report_R667714867440047120']//tr[td[text()='Testing Capacity']]/td[2]"
                    ).text.strip()
                except:
                    testing_capacity = ""

                print(building, room_name, room_capacity, testing_capacity)
                writer.writerow([building, room_name, room_capacity, testing_capacity])

            except Exception as e:
                print(f"Failed to process room {room_value} in building {building}: {e}")

driver.quit()
print("Done! All buildings and rooms saved to rooms.csv")
