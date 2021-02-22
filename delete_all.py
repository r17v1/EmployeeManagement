import os
import sqlite3


DIR = os.getcwd()
SQL = sqlite3.connect(DIR+'/database/database.db')



SQL.close()