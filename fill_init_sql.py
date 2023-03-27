import os

l = os.listdir('./db-data')

l = list(filter(lambda s: 'oxfam' in s, l))

names = []

for i in range(len(l)):
    names.append(l[i][6:17])

f = open('./db-data/init.sql', "a")

for i in range(len(names)):
    string = "DROP TABLE IF EXISTS public.\"{device_name}\";\nCREATE TABLE public.\"{device_name}\" (id INT, speed FLOAT, \"timestamp\" TIMESTAMP, device INT, x FLOAT, y FLOAT, alt FLOAT, geom geometry);\n\n".format(device_name = names[i])
    f.write(string)

f.close()