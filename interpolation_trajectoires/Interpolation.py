import pandas as pd
import math
import numpy as np

# Evite de saturer les logs de warnings sur la reassignation d'une case de DataFrame
pd.options.mode.chained_assignment = None  # default='warn'


def dist(x1, y1, x2, y2):
    # return: Distance euclydienne entre les points (x1, y1) et (x2, y2)
    return math.sqrt((x1-x2)**2 + (y1-y2)**2)


def moyennageDF(df_origin):
    # Realise une moyenne glissante sur le temps des donnees GPS,
    # pour reduire considerablement le bruit des donnees.
    #
    # df_origin: pandas DataFrame
    # return: pandas DataFrame

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
    # Contruit la trajectoire de reference a partir d'une trajectoire moyennee,
    # on augmente le nombre de points aux endroits ou les points sont les plus espaces
    #
    # df: pandas DataFrame de la trajectoire moyennee
    # return: pandas DataFrame

    df_copy = df.copy()
    df_copy['sort'] = 3

    # Detection des points trop espaces
    diff = df_copy.diff()
    mask = (diff['x'].pow(2)+diff['y'].pow(2)) < 1000
    diff_to_divide = diff.mask(mask).dropna()

    # Ajout de points intermediaires dans des tables
    df_1 = df.copy()
    df_1['x'] = df_copy['x'] - diff_to_divide['x']*2/3
    df_1['y'] = df_copy['y'] - diff_to_divide['y']*2/3
    df_1['sort'] = 1
    df_2 = df.copy()
    df_2['x'] = df_copy['x'] - diff_to_divide['x']/3
    df_2['y'] = df_copy['y'] - diff_to_divide['y']/3
    df_2['sort'] = 2

    # Concatenation des tables intemediaires
    return pd.concat([df_1.dropna(), df_2.dropna(), df_copy]) \
        .sort_values(by=['timestamp', 'sort']) \
        .reset_index(drop=True) \
        .drop(columns=['timestamp', 'sort'])


def interpolationCoord(x, y, df):
    # Trouve le point de df le plus proche de (x, y)
    #
    # x, y: coordonnes du point a comparer
    # df: pandas DataFrame
    # return: idxmin: indice, dans df, du point le plus proche
    # return: dist: distance entre (x, y) et le point le plus proche dans df

    df_copy = df.copy()
    df_copy.insert(0, 'dist', (df['x']-x)**2 + (df['y']-y)**2)

    idxmin = df_copy['dist'].idxmin()
    return idxmin, math.sqrt(df_copy['dist'][idxmin])


def interpolationDF(df_traj, df_ref):
    # Interpole df_traj en fonction de df_ref
    # Tous les points de la reference sont associes a leur plus proche sur la trajectoire
    #
    # df_traj: pandas DataFrame trajectiore a interpoler
    # df_ref: pandas DataFrame trajectoire de reference
    # return: pandas DataFrame trajectiore interpolee

    # Initialisation de la DataFrame resultante
    df_result = df_ref.copy()
    df_result['speed'] = np.nan
    df_result['timestamp'] = np.nan
    df_result['interpolation_error'] = np.nan
    df_result['x_GPS'] = np.nan
    df_result['y_GPS'] = np.nan

    # Remplissage de la DataFrame resultante, en interpolant tout les points
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
    # Valide l'interpolation
    #
    # df_ip: pandas DataFrame interpolee
    # error_max: marge d'erreur d'interpolation
    # return: boolean
    return df_ip['interpolation_error'] < error_max


def calculateSpeeds(df_moy):
    # Calcule les vitesses des trajectoires moyennees
    #
    # df_moy: pandas DataFrame moyenne
    # return: pandas DataFrame

    # Initialisation de la DataFrame resultante
    df_result = df_moy.copy()
    index_list = list(df_result.index.values)

    df_result['speed'] = np.nan

    df_result['speed'][index_list[0]] = 0
    df_result['speed'][index_list[len(index_list)-1]] = 0

    # Remplissage de la DataFrame resultante
    for i in range(1, len(index_list)-1):
        # Calcul de la distance entre les points avant et apres le point considere
        total_dist = dist(df_moy['x'][index_list[i]],
                          df_moy['y'][index_list[i]],
                          df_moy['x'][index_list[i+1]],
                          df_moy['y'][index_list[i+1]]) + \
            dist(df_moy['x'][index_list[i]],
                 df_moy['y'][index_list[i]],
                 df_moy['x'][index_list[i-1]],
                 df_moy['y'][index_list[i-1]])
        # Temps entre ces deux points
        time_diff = df_moy['timestamp'][index_list[i+1]] - \
            df_moy['timestamp'][index_list[i-1]]
        # Calcul de la vitessse
        df_result['speed'][index_list[i]] = total_dist / \
            time_diff.total_seconds()

    return df_result
