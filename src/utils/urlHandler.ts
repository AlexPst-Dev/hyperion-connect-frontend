export function getLocationUrl(address: string) {
  const googleMapsSearchPrefix: string = "https://www.google.fr/maps/search/";
  const formattedAddress = address.toLowerCase().replace(/\s+/g, "+");
  return `${googleMapsSearchPrefix}${formattedAddress}`;
}
