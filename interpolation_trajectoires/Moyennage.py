import pandas as pd

def moyennageDF(df_origin):
    
    df_rolled = df_origin.copy()
    df_result = df_rolled.rolling('3min', on="timestamp").mean()
    
    df_result['speed', 'device', 'alt'] = df_origin['speed', 'device', 'alt']
    df_result.drop_duplicates(subset = "timestamp", inplace=True, keep='last')
    
    return df_result