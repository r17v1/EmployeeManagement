import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
import pandas as pd
import sqlite3
import time

#Setting up variables
#os.chdir('..')
DIR = os.getcwd()

PATH = DIR + "\\driver\\chromedriver.exe"
LOGIN_URL = "http://192.168.1.21"
DEPT_URL = "http://192.168.1.21/csl/dpm"
USER_URL = "http://192.168.1.21/csl/user?first=0&last=999"
LOG_URL = "http://192.168.1.21/csl/download?first=0&last=999"




#Setting up connection to database
SQL = sqlite3.connect(DIR + "/database/database.db")

#Clearing previous data becuase there may be updates, eg. a user changed department 
SQL.execute("delete from log")
SQL.execute("delete from user")
SQL.execute("delete from department")


#Options for headless browing and download
def enable_download_headless(browser, download_dir):
    browser.command_executor._commands["send_command"] = (
        "POST",
        "/session/$sessionId/chromium/send_command",
    )
    params = {
        "cmd": "Page.setDownloadBehavior",
        "params": {"behavior": "allow", "downloadPath": download_dir},
    }
    browser.execute("send_command", params)


options = Options()
options.add_argument("--disable-notifications")
options.add_argument("--no-sandbox")
options.add_argument("--verbose")
options.add_experimental_option(
    "prefs",
    {
        "download.default_directory": "C:\\tmp",
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing_for_trusted_sources_enabled": False,
        "safebrowsing.enabled": False,
    },
) 
options.binary_location = DIR+"\\driver\\chrome\\App\\Chrome-bin\\chrome.exe"
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--disable-software-rasterizer")
driver = webdriver.Chrome(PATH, chrome_options=options)
enable_download_headless(driver, DIR + "\\downloads\\")



# LOGIN
#----------------------------------------------------------------------------------------
USERID = "2001"
PWD = "2001"

driver.get(LOGIN_URL)


user_id_box = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, "username"))
)

pwd_box = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, "userpwd"))
)

user_id_box.send_keys(USERID)
pwd_box.send_keys(PWD)
pwd_box.send_keys(Keys.RETURN)


# Department data Scrapper
#-----------------------------------------------------------------------------------
driver.get(DEPT_URL)

body = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.TAG_NAME, "tbody"))
)

raw_data = WebDriverWait(body, 10).until(
    EC.presence_of_all_elements_located((By.TAG_NAME, "tr"))
)

flag = False
data = []
for tag in raw_data:
    if flag:
        data.append(tag.text.split(" "))
    if tag.text == "ID Department Name Person Delete":
        flag = True
for row in data:
    SQL.execute(
        "insert or ignore into department values(" + row[0] + ',"' + row[1] + '",0)'
    ) 



#User data scrapper
#---------------------------------------------------------------------------------------------
driver.get(USER_URL)
body = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "cc")))

raw_data = body.find_elements_by_tag_name("tr")
data = []
for row in raw_data:
    row_data = []
    cells = row.find_elements_by_tag_name("td")
    for element in cells[1:]:
        if len(element.text) == 0:
            row_data.append("null")
        else:
            row_data.append(element.text)
    data.append(row_data)

#Replacing department name with department ID
dept = []
for d in SQL.execute("select id, name from department"):
    dept.append(d)
for i in range(len(data)):
    for j in range(len(dept)):
        if dept[j][1] == data[i][0]:
            data[i][0] = dept[j][0]
            break

for row in data:
    SQL.execute(
        "insert or ignore into user values("
        + str(row[1])
        + ',"'
        + str(row[2])
        + '",'
        + str(row[0])
        + ")"
    )

#Attendance log data scrapper
#----------------------------------------------------------------------------
driver.get(LOG_URL)

sdate_box = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, "sdate"))
)
#deleting default start datte and replacing it with 200-01-01 so that we get all data in one file
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys(Keys.BACKSPACE)
sdate_box.send_keys("2000-01-01")

#deleting previous download
if os.path.exists(DIR + "/downloads/attlog.dat"):
    os.remove(DIR + "/downloads/attlog.dat")

download_btn = driver.find_element_by_xpath(
    "/html/body/table[1]/tbody/tr[1]/td/table/tbody/tr[3]/td[2]/input"
)
download_btn.click()

#waiting for file to download
for i in range(20):
    if os.path.exists(DIR + "/downloads/attlog.dat"):
        break
    else:
        time.sleep(1)

#reading downloaded file 
CSV = pd.read_csv(DIR + "/downloads/attlog.dat", delimiter="\t", header=None)

for i in range(len(CSV)):
    SQL.execute(
        'insert or ignore into log values("'
        + str(CSV[2][i])
        + '",'
        + str(CSV[0][i])
        + ")"
    )

#data2 = SQL.execute("select * from log_backup")
#for d in data2:
#    SQL.execute(
#        'insert or ignore into log values("' + str(d[0]) + '",' + str(d[1]) + ")"
#    )


#closing connections and drivers
SQL.commit()
SQL.close()
driver.quit()
