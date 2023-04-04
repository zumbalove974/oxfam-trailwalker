import pandas as pd
import numpy as np
import math

import GPSDataFrame
import Interpolation

def main_test():
    
    return \
        moyennageDFTest() and \
        calculateSpeedsTest() and \
        buildReferenceTest() and \
        interpolationCoordTest() and \
        interpolationDFTest()


def moyennageDFTest():
    
    df = pd.DataFrame(
            {'x':[0, 1, 2, 3, 4, 5, 10, 11, 12, 13],
             'y':[100, 110, 120, 130, 140, 150, 200, 210, 220, 230],
             'timestamp':[
                     pd.Timestamp('2017-01-01 12:00:00'),
                     pd.Timestamp('2017-01-01 12:01:00'),
                     pd.Timestamp('2017-01-01 12:02:00'),
                     pd.Timestamp('2017-01-01 12:03:00'),
                     pd.Timestamp('2017-01-01 12:03:00'),
                     pd.Timestamp('2017-01-01 12:04:00'),
                     pd.Timestamp('2017-01-01 12:05:00'),
                     pd.Timestamp('2017-01-01 12:06:00'),
                     pd.Timestamp('2017-01-01 12:07:00'),
                     pd.Timestamp('2017-01-01 12:08:00')
                     ]
             })

    df_assess = pd.DataFrame(
            {'x':[1, 2, 2.5, 4+1/6, 6-1/6, 7.5, 10.2, 11.5, 12],
             'y':[110, 120, 125, 141+2/3, 158+1/3, 175, 202, 215, 220], 
             'timestamp':[
                     pd.Timestamp('2017-01-01 12:00:00'),
                     pd.Timestamp('2017-01-01 12:01:00'),
                     pd.Timestamp('2017-01-01 12:02:00'),
                     pd.Timestamp('2017-01-01 12:03:00'),
                     pd.Timestamp('2017-01-01 12:04:00'),
                     pd.Timestamp('2017-01-01 12:05:00'),
                     pd.Timestamp('2017-01-01 12:06:00'),
                     pd.Timestamp('2017-01-01 12:07:00'),
                     pd.Timestamp('2017-01-01 12:08:00')
                    ]
             })
    
    return df_assess.equals(Interpolation.moyennageDF(df))


def calculateSpeedsTest():
    
    df = pd.DataFrame(
            {'x':[0, 1, 1, 5],
             'y':[1, 1, 5, 5], 
             'timestamp':[
                     pd.Timestamp('2017-01-01 12:00:00'),
                     pd.Timestamp('2017-01-01 12:01:00'),
                     pd.Timestamp('2017-01-01 12:02:00'),
                     pd.Timestamp('2017-01-01 12:03:00')
                    ]
             })
    
    df_assess = pd.DataFrame(
            {'x':[0, 1, 1, 5],
             'y':[1, 1, 5, 5], 
             'timestamp':[
                     pd.Timestamp('2017-01-01 12:00:00'),
                     pd.Timestamp('2017-01-01 12:01:00'),
                     pd.Timestamp('2017-01-01 12:02:00'),
                     pd.Timestamp('2017-01-01 12:03:00')
                    ],
             'speed':[
                     0,
                     (1 + 4)/120,
                     (4 + 4)/120,
                     0
                    ]
            })
    
    return df_assess.equals(Interpolation.calculateSpeeds(df))


def buildReferenceTest():
    
    df = pd.DataFrame(
            {'x':[1, 2, 500, 501],
             'y':[1, 2, 500, 501],
             'timestamp':[
                     pd.Timestamp('2017-01-01 12:00:00'),
                     pd.Timestamp('2017-01-01 12:01:00'),
                     pd.Timestamp('2017-01-01 12:02:00'),
                     pd.Timestamp('2017-01-01 12:03:00')
                     ]
            })
    
    df_assess = pd.DataFrame(
            {'x':[1.0, 2.0, 168.0, 334.0, 500.0, 501.0],
             'y':[1.0, 2.0, 168.0, 334.0, 500.0, 501.0]
            })
    
    return df_assess.equals(Interpolation.buildReference(df))


def interpolationCoordTest():
    
    df = pd.DataFrame(
            {'x':[0, 1, 1, 5],
             'y':[1, 1, 5, 5], 
             'timestamp':[
                     pd.Timestamp('2017-01-01 12:00:00'),
                     pd.Timestamp('2017-01-01 12:01:00'),
                     pd.Timestamp('2017-01-01 12:02:00'),
                     pd.Timestamp('2017-01-01 12:03:00')
                    ],
             'speed':[
                     0,
                     (1 + 4)/120,
                     (4 + 4)/120,
                     0
                    ]
            })
    
    x = 2
    y = 4
    
    idxmin_assert = 2;
    mini_assert = math.sqrt(2)
    
    idxmin, mini = Interpolation.interpolationCoord(x, y, df)
    
    return idxmin_assert == idxmin and mini_assert == mini


def interpolationDFTest():
    
    df_traj = pd.DataFrame(
            {'x':[0, 1, 1, 5],
             'y':[1, 1, 5, 5], 
             'timestamp':[
                     pd.Timestamp('2017-01-01 12:00:00'),
                     pd.Timestamp('2017-01-01 12:01:00'),
                     pd.Timestamp('2017-01-01 12:02:00'),
                     pd.Timestamp('2017-01-01 12:03:00')
                    ],
             'speed':[
                     0,
                     (1 + 4)/120,
                     (4 + 4)/120,
                     0
                    ]
            })
    
    df_ref = pd.DataFrame(
            {'x':[0, 1, 2, 3, 4, 5],
             'y':[0, 1, 2, 3, 4, 5]
             })
    
    df_assess = pd.DataFrame(
            {'x':[0, 1, 2, 3, 4, 5],
             'y':[0, 1, 2, 3, 4, 5],
             'speed':[0.0, 5/120, 5/120, 5/120, 0.0, 0.0],
             'timestamp':[
                         pd.Timestamp('2017-01-01 12:00:00'),
                         pd.Timestamp('2017-01-01 12:01:00'),
                         pd.Timestamp('2017-01-01 12:01:00'),
                         pd.Timestamp('2017-01-01 12:01:00'),
                         pd.Timestamp('2017-01-01 12:03:00'),
                         pd.Timestamp('2017-01-01 12:03:00')
                     ],
             'interpolation_error': [1.0, 0.0, math.sqrt(2), math.sqrt(8), math.sqrt(2), 0.0],
             'x_GPS': [0.0, 1.0, 1.0, 1.0, 5.0, 5.0],
             'y_GPS': [1.0, 1.0, 1.0, 1.0, 5.0, 5.0]
             })
    
    return np.array_equal(df_assess, Interpolation.interpolationDF(df_traj, df_ref))
