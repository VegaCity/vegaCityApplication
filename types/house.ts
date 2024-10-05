
export interface HouseTypePatch {
    houseName: string,
    location: string,
    address: string
}

export interface HouseType extends HouseTypePatch{
    zoneId: string,
}