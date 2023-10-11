
export class DetailObj implements IDetailObj {
  beast: IService[] = []
  bolt: IService[] = []
  cityBee: IService[] = []
  elmo: IService[] = []
}

export interface ILocationObj {
  bolt: ILocationFull,
  cityBee: ILocationFull,
}

export interface IDetailObj {
  bolt: IService[],
  cityBee: IService[],
  elmo: IService[],
  beast: IService[],
}
export interface IBoltDataRaw {
  data: {
    categories: Category[]
  }
}

export interface Category {
  id: string,
  vehicles: IVehicle[]
}

export interface IVehicle {
  id: number,
  location: {
    lat: number,
    lng: number
  }
}

export interface IBoltCarDetailsResponse {
  message: string;
  data: IBoltCarDetailsResponseData
}

export interface IBoltCarDetailsResponseData {
  city_area_filters: {value: string}[]
  vehicle_card: {
    header: {
      collapsed_title: string,
      brief_info: {subtitle_html: string, title_html: string }[]
    },
    blocks: {
      payload: {
        location: {lat: number, lng: number}
        items: ICarDetailsResponseDataItemData[]
      }
    }[]
  }
}

export interface ICarDetailsResponseDataItemData {
  text_html: string,
  value_html: string,
}

export interface IPrice {
  km: number,
  minute: number,
  hour: number,
  day: number,
  minimum: number,
}


export interface ILocation {
  serviceId: number;
  carId: number;
  lat: number;
  lng: number;
  city: string
}

export interface IService {
  serviceId: number;
  name: string;
  bodyType: string;
  motorType: string;
  petFriendly: boolean;
  gearbox: string;
  imageUrl?: string;
  price: Object;
  packages: Object[];
  coordinates: ILocation[];
  cities?: string[];
}

export interface ILocationFull {
  provider: string;
  coordinates: ILocation[];
}

export interface IServiceFull {
  provider: string;
  services: IService[];
}