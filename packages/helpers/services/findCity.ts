export function findCity(lat: number, lng: number): string {
    if (lat >= 57.7 && lat <= 59.82 && lng >= 23.56 && lng <= 28.2) {
        if (
            lat >= 58.313669 &&
            lat <= 58.426893 &&
            lng >= 26.609005 &&
            lng <= 26.813995
        ) {
            return "Tartu";
        } else if (
            lat >= 58.234964 &&
            lat <= 58.506581 &&
            lng >= 24.184961 &&
            lng <= 24.760961
        ) {
            return "Pärnu";
        } else {
            return "Tallinn";
        }
    }
    return "Unknown";
}