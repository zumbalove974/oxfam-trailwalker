import pandas as pd
import math
import numpy as np

pd.options.mode.chained_assignment = None  # default='warn'


def dist(x1, y1, x2, y2):
    return math.sqrt((x1-x2)**2 + (y1-y2)**2)


def moyennageDF(df_origin):

    df_rolled = df_origin.copy()
    df_result = df_rolled.rolling('5min', on="timestamp", center=True).mean()

    df_result.drop_duplicates(
        subset="timestamp",
        inplace=True,
        keep='last',
    )
    df_result = df_result.reset_index().drop(columns=['index'])

    return df_result


def buildReference(df):

    df_copy = df.copy()
    df_copy['sort'] = 3

    diff = df_copy.diff()
    mask = (diff['x'].pow(2)+diff['y'].pow(2)) < 1000
    diff_to_divide = diff.mask(mask).dropna()

    df_1 = df.copy()
    df_1['x'] = df_copy['x'] - diff_to_divide['x']*2/3
    df_1['y'] = df_copy['y'] - diff_to_divide['y']*2/3
    df_1['sort'] = 1
    df_2 = df.copy()
    df_2['x'] = df_copy['x'] - diff_to_divide['x']/3
    df_2['y'] = df_copy['y'] - diff_to_divide['y']/3
    df_2['sort'] = 2

    return pd.concat([df_1.dropna(), df_2.dropna(), df_copy]) \
        .sort_values(by=['timestamp', 'sort']) \
        .reset_index(drop=True) \
        .drop(columns=['timestamp', 'sort'])


def interpolationCoord(x, y, df):

    df_copy = df.copy()
    df_copy.insert(0, 'dist', (df['x']-x)**2 + (df['y']-y)**2)

    idxmin = df_copy['dist'].idxmin()
    return idxmin, math.sqrt(df_copy['dist'][idxmin])


def interpolationDF(df_traj, df_ref):

    df_result = df_ref.copy()

    df_result['speed'] = np.nan
    df_result['timestamp'] = np.nan
    df_result['interpolation_error'] = np.nan
    df_result['x_GPS'] = np.nan
    df_result['y_GPS'] = np.nan

    for i in list(df_ref.index.values):
        idxmin, mini = interpolationCoord(
            df_ref['x'][i], df_ref['y'][i], df_traj)
        df_result['speed'][i] = df_traj['speed'][idxmin]
        df_result['timestamp'][i] = df_traj['timestamp'][idxmin]
        df_result['interpolation_error'][i] = mini
        df_result['x_GPS'][i] = df_traj['x'][idxmin]
        df_result['y_GPS'][i] = df_traj['y'][idxmin]

    return df_result


def validateInterpolation(df_ip, error_max):
    return df_ip['interpolation_error'] < error_max


def calculateSpeeds(df_moy):

    df_result = df_moy.copy()
    index_list = list(df_result.index.values)

    df_result['speed'] = np.nan

    df_result['speed'][index_list[0]] = 0
    df_result['speed'][index_list[len(index_list)-1]] = 0

    for i in range(1, len(index_list)-1):
        total_dist = dist(df_moy['x'][index_list[i]],
                          df_moy['y'][index_list[i]],
                          df_moy['x'][index_list[i+1]],
                          df_moy['y'][index_list[i+1]]) + \
            dist(df_moy['x'][index_list[i]],
                 df_moy['y'][index_list[i]],
                 df_moy['x'][index_list[i-1]],
                 df_moy['y'][index_list[i-1]])
        time_diff = df_moy['timestamp'][index_list[i+1]] - \
            df_moy['timestamp'][index_list[i-1]]
        df_result['speed'][index_list[i]] = total_dist / \
            time_diff.total_seconds()

    return df_result
