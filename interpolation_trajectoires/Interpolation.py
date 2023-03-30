import pandas as pd
import math

def moyennageDF(df_origin):
    
    df_rolled = df_origin.copy()
    df_result = df_rolled.rolling('3min', on="timestamp").mean()
    
    df_result['speed'] = df_origin['speed']
    df_result['device'] = df_origin['device']
    df_result['alt'] = df_origin['alt']
    df_result.drop_duplicates(
            subset = "timestamp",
            inplace = True,
            keep = 'last'
        )
    
    return df_result


def interpolationCoord(x, y, df):
    
    df_copy = df.copy()
    df_copy.insert(0, 'dist', (df['x']-x)**2 + (df['y']-y)**2)
    
    idxmin = df_copy['dist'].idxmin()
    return idxmin, math.sqrt(df_copy['dist'][idxmin])


def interpolationDF(df_traj, df_ref):
    
    df_result = df_traj.copy()
    
    average_dist = 0
    
    for i in list(df_result.index.values):
        idxmin, mini = interpolationCoord(df_traj['x'][i], df_traj['y'][i], df_ref)
        df_result['x'][i] = df_ref['x'][idxmin]
        df_result['y'][i] = df_ref['y'][idxmin]
        average_dist += mini
    
    return df_result, average_dist/len(df_result)

        