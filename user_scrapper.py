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
USER_URL="http://192.168.1.21/csl/user?first=0&last=999"


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



driver.get(USER_URL)
body=WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "cc"))
    )

raw_data=body.find_elements_by_tag_name('tr')
data=[]
for row in raw_data:
    row_data=[]
    cells=row.find_elements_by_tag_name('td')
    for element in cells[1:]:
        if(len(element.text)==0):
            row_data.append('null')
        else:
            row_data.append(element.text)
    data.append(row_data)

dept=[]
for d in SQL.execute('select id, name from department'):
    dept.append(d)
for i in range(len(data)):
    for j in range(len(dept)):
        if dept[j][1]==data[i][0]:
            data[i][0]=dept[j][0]
            break

for row in data:
    SQL.execute( 'insert or ignore into user values('+row[1]+',"'+row[2]+'",'+row[0]+')')
SQL.commit()


SQL.close()
driver.quit()
