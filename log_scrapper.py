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


DIR = os.getcwd()
PATH= DIR+'\\driver\\chromedriver.exe'
LOGIN_URL="http://192.168.1.21"
LOG_URL="http://192.168.1.21/csl/download?first=0&last=999"


#LOGIN
USERID='2001'
PWD='2001'


DIR= os.getcwd()

if(os.path.exists(DIR+'/downloads/attlog.dat')):
    os.remove(DIR+'/downloads/attlog.dat')


SQL = sqlite3.connect(DIR+'/database/database.db')


def enable_download_headless(browser,download_dir):
    browser.command_executor._commands["send_command"] = ("POST", '/session/$sessionId/chromium/send_command')
    params = {'cmd':'Page.setDownloadBehavior', 'params': {'behavior': 'allow', 'downloadPath': download_dir}}
    browser.execute("send_command", params)


options = Options()
options.add_argument("--disable-notifications")
options.add_argument('--no-sandbox')
options.add_argument('--verbose')
options.add_experimental_option("prefs", {
    "download.default_directory": "C:\\tmp",
    "download.prompt_for_download": False,
    "download.directory_upgrade": True,
    "safebrowsing_for_trusted_sources_enabled": False,
    "safebrowsing.enabled": False
})
options.add_argument('--disable-gpu')
options.add_argument('--disable-software-rasterizer')
options.add_argument('--headless')
driver = webdriver.Chrome(PATH, chrome_options=options)
enable_download_headless(driver, DIR+'\\downloads\\')

driver.get(LOGIN_URL)


user_id_box = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "username"))
    )

pwd_box = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "userpwd"))
    )

#user_id_box= driver.find_element_by_name("username")
user_id_box.send_keys(USERID)
#pwd_box=driver.find_element_by_name("userpwd")
pwd_box.send_keys(PWD)
pwd_box.send_keys(Keys.RETURN)

driver.get(LOG_URL)

sdate_box=WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "sdate"))
    )
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
sdate_box.send_keys('2000-01-01')

if(os.path.exists(DIR+'/downloads/attlog.dat')):
    os.remove(DIR+'/downloads/attlog.dat')

download_btn=driver.find_element_by_xpath('/html/body/table[1]/tbody/tr[1]/td/table/tbody/tr[3]/td[2]/input')
download_btn.click()

for i in range(20):
    if (os.path.exists(DIR+'/downloads/attlog.dat')):
        break
    else:
        time.sleep(1)



CSV=pd.read_csv(DIR+'/downloads/attlog.dat',delimiter='\t',header=None)

for i in range(len(CSV)):
    SQL.execute('insert or ignore into log values("'+str(CSV[2][i])+'",'+str(CSV[0][i])+')')

data2=SQL.execute('select * from log_backup')
for d in data2:
    SQL.execute('insert or ignore into log values("'+str(d[0])+'",'+str(d[1])+')')

SQL.commit()
SQL.close()
driver.quit()