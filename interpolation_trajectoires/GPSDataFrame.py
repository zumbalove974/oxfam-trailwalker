""" Package servant d'interface entre le programme et la base de donnees """

import psycopg2
import pandas as pd
import sys
from sqlalchemy import create_engine


def connect():
    # Connection a la base de donnees
    # Returns: psycopg2 connection object

    conn = None
    try:
        conn = psycopg2.connect(
            dbname="postgres_user",
            user="postgres_user",
            password="postgres_password",
            host="localhost",
            port="6500"
        )
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        sys.exit(1)

    return conn


def sql_to_df(conn, query, column_names):
    # Transforme une requete SQL en DataFrame

    cursor = conn.cursor()

    try:
        cursor.execute(query)
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error: %s" % error)
        cursor.close()
        return 1

    # The execute returns a list of tuples:
    tuples_list = cursor.fetchall()
    cursor.close()
    # Now we need to transform the list into a pandas DataFrame:
    df = pd.DataFrame(tuples_list, columns=column_names)
    return df


def deviceList():
    # Liste les tables de donnees initiales

    query = """
        SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Device%';
        """
    column_names = ["table_name"]
    conn = connect()
    df = sql_to_df(conn, query, column_names)
    conn.close()
    return df


def deviceDF(tableName):
    # R

    query = """
        SELECT "timestamp","x", "y" 
        FROM public."{table_name}" ORDER BY "timestamp"
        """.format(table_name=tableName)
    # creating a list with columns names to pass into the function
    column_names = ["timestamp",
                    "x", "y"]
    # opening the connection
    conn = connect()
    # loading our dataframe
    df = sql_to_df(conn, query, column_names)
    # closing the connection
    conn.close()
    # Let’s see if we loaded the df successfully
    return df


def df_to_sql(df, table_name):

    engine = create_engine(
        'postgresql://postgres_user:postgres_password@localhost:6500/postgres_user'
    )
    df.to_sql(
        table_name,
        con=engine,
        method='multi',
        if_exists='replace')
    engine.dispose()
