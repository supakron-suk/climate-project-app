import geopandas as gpd
import numpy as np
from shapely.geometry import Polygon, MultiPolygon

# โหลด shapefile ของประเทศไทย
gdf = gpd.read_file("src/Geo-data/thailand-Geo.json")

# รายชื่อจังหวัดภาคอีสานและภาคเหนือที่ต้องการ 
def province_coord():
    province_NE = [
        "Nakhon Ratchasima", "Kalasin", "Khon Kaen", "Chaiyaphum", "Nakhon Phanom",
        "Bueng Kan", "Buri Ram", "Maha Sarakham", "Mukdahan", "Yasothon",
        "Roi Et", "Loei", "Si Sa Ket", "Sakon Nakhon", "Surin",
        "Nong Khai", "Nong Bua Lam Phu", "Udon Thani", "Ubon Ratchathani", "Amnat Charoen"
    ]
    
    province_North = [
        "Chiang Rai", "Chiang Mai", "Nan", "Phayao", "Phrae", "Mae Hong Son", "Lampang",
        "Lamphun", "Uttaradit"
    ]
    
    province_South = [
        "Krabi", "Chumphon", "Trang", "Nakhon Si Thammarat", "Narathiwat" , "Pattani", 
        "Phangnga", "Phatthalung", "Phuket", "Yala", "Ranong", "Songkhla", "Satun",
        "Surat Thani"
    ]
    
    province_Middle = [
        "Bangkok Metropolis", "Kamphaeng Phet", "Chai Nat", "Nakhon Nayok", "Nakhon Pathom", "Nakhon Sawan",
        "Nonthaburi", "Pathum Thani", "Phra Nakhon Si Ayutthaya", "Phichit", "Phitsanulok", "Phetchabun",
        "Lop Buri", "Samut Prakan", "Samut Songkhram", "Samut Sakhon", "Saraburi", "Sing Buri", "Sukhothai",
        "Suphan Buri", "Ang Thong", "Uthai Thani"
    ]
    
    #ภาคตะวันออก
    province_East = [
        "Chanthaburi", "Chachoengsao", "Chon Buri", "Trat", "Prachin Buri", "Rayong", "Sa Kaeo"
    ]
   
    #ภาคตะวันตก
    province_West = [
        "Kanchanaburi", "Tak", "Prachuap Khiri Khan", "Phetchaburi", "Ratchaburi"
    ] 
    
    # ดึงพิกัดของแต่ละจังหวัดในรูปแบบ geometry
    ne_list = [(name, gdf[gdf['NAME_1'] == name].geometry.unary_union, "North_East_region") for name in province_NE]
    north_list = [(name, gdf[gdf['NAME_1'] == name].geometry.unary_union, "North_region") for name in province_North]
    south_list = [(name, gdf[gdf['NAME_1'] == name].geometry.unary_union, "South_region") for name in province_South]
    middle_list = [(name, gdf[gdf['NAME_1'] == name].geometry.unary_union, "Middle_region") for name in province_Middle]
    east_list = [(name, gdf[gdf['NAME_1'] == name].geometry.unary_union, "East_region") for name in province_East]
    west_list = [(name, gdf[gdf['NAME_1'] == name].geometry.unary_union, "West_region") for name in province_West]


    # รวมข้อมูลของภาคเหนือและภาคอีสานในลิสต์
    region_coords = [
        north_list,
        ne_list,
        south_list,
        middle_list,
        east_list,
        west_list
    ]
    
    return region_coords







