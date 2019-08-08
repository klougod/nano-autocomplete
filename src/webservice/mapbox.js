// a module to geocode mapbox in js
export default class MapBox {

  constructor(params = {}){
    const {
      proximity="-46.632998,-23.551427", 
      language="pt-BR", 
      autocomplete="true",
      types="address,poi",
      country="BR"
    } = params;
    this.key = "pk.eyJ1IjoicGVndWVmcmV0YWRvIiwiYSI6ImNqeTBuM3hkMzA0dzAzYm81dzV0bmp0am4ifQ.L5-5dMeX1DlMxPiI6J4q-A";
    this.baseUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
    this.address = "";
    this.proximity = proximity;
    this.language = language
    this.autocomplete = autocomplete;
    this.types = types;
    this.country=country;
  }

  async geocode(address) {
    this.address = address;
    const url = this._buildUrl();
    const result = await this._geocodeAddress(url);
    return result;
  }

  _buildUrl() {
    return `${this.baseUrl}${this.address}.json?access_token=${this.key}&proximity=${this.proximity}&types=${this.types}&coutry=${this.country}`;
  }

  async _geocodeAddress(url, errorcb=null) {
    try {
      const response = await fetch(url);
      if (response.status !== 200) {
        errorcb ? errorcb(`Received status ${response.status}`) :
          console.log(`Error in request. Status Code: ${response.status}`);
        return {'error': true};
      }
      const results = await response.json();
      if(results.features){
        return {'error': false, 'data': results.features};
      }
      return {'error': true};
    }
    catch (err) {
      errorcb ? errorcb(err) : console.log(`Fetch Error : ${err}`);
      return {'error': true};
    }
  }
}