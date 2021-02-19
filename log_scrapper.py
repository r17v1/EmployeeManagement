import pandas as pd
import os
import sqlite3


DIR= os.getcwd()

SQL = sqlite3.connect(DIR+'/database/database.db')
CSV=pd.read_csv(DIR+'/downloads/attlog.dat',delimiter='\t',header=None)

for i in range(len(CSV)):
    SQL.execute('insert into log values("'+str(CSV[2][i])+'","'+str(CSV[0][i])+'")')


SQL.commit()
SQL.close()