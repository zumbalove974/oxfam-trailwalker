import GPSDataFrame
import Interpolation

reference_device = 'Device_3883'

def main():
    
    device_list = GPSDataFrame.deviceList()
    
    """ Build Reference """
    df_device = GPSDataFrame.deviceDF(reference_device)
    df_moyenne = Interpolation.moyennageDF(df_device)
    df_ref = Interpolation.buildReference(df_moyenne)
    
    
    """ Interpolation """
    for label, device in device_list['table_name'].items():
        print(device)
        df_device = GPSDataFrame.deviceDF(device)
        df_moy = Interpolation.moyennageDF(df_device)
        df_speed = Interpolation.calculateSpeeds(df_moy)
        df_ip = Interpolation.interpolationDF(df_speed, df_ref)
        GPSDataFrame.df_to_sql(df_ip, device.replace('Device', 'Interpolation'))
    
    return 0

main()