import GPSDataFrame
import Interpolation
import tests

reference_device = 'Device_3883'
error_max = 100

def main():
    
    device_list = GPSDataFrame.deviceList()
    
    """ Build Reference """
    df_device = GPSDataFrame.deviceDF(reference_device)
    df_moyenne = Interpolation.moyennageDF(df_device)
    df_ref = Interpolation.buildReference(df_moyenne)
    GPSDataFrame.df_to_sql(df_ref, "Reference")
    
    """ Interpolation """
    size = device_list['table_name'].size
    for label, device in device_list['table_name'].items():
        print(label+1, " / ", size, " : ", device)
        df_device = GPSDataFrame.deviceDF(device)
        df_moy = Interpolation.moyennageDF(df_device)
        df_speed = Interpolation.calculateSpeeds(df_moy)
        df_ip = Interpolation.interpolationDF(df_speed, df_ref)
        
        if Interpolation.validateInterpolation(df_ip, error_max):
            GPSDataFrame.df_to_sql(df_ip, device.replace('Device', 'Interpolation'))
    
    return 0

if tests.main_test():
    main()