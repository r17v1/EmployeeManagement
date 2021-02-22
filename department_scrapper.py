import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import sqlite3


DIR = os.getcwd()
SQL = sqlite3.connect(DIR+'/database/database.db')
PATH= DIR+'\\driver\\chromedriver.exe'
LOGIN_URL="http://192.168.1.21"
DEPT_URL="http://192.168.1.21/csl/dpm"



SQL.execute('delete from log')
SQL.execute('delete from user')
SQL.execute('delete from department')




driver= webdriver.Chrome(PATH)


#LOGIN
USERID='2001'
PWD='2001'

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


#Department
driver.get(DEPT_URL)

body=WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "tbody"))
    )

raw_data=WebDriverWait(body, 10).until(
        EC.presence_of_all_elements_located((By.TAG_NAME, "tr"))
    )


flag=False
data=[]
for tag in raw_data:
    if(flag):
        data.append(tag.text.split(' '))
    if(tag.text=='ID Department Name Person Delete'):
        flag=True
for row in data:
    SQL.execute('insert or ignore into department values('+row[0]+',"'+row[1]+'",0)')    #insert in SQL
SQL.commit()


SQL.close()
driver.quit()
