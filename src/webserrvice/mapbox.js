export const geocodeAddress = async (url, errorcb=null) => {
  try {
    const response = await fetch(url);
    if (response.status !== 200) {
      errorcb ? errorcb(`Received status ${response.status}`) :
        console.log(`Error in request. Status Code: ${response.status}`);
      return {'error': true};
    }
    const results = await response.json();
    if(!results.error){
      return {'error': false, 'data': results.results};
    }
    return {'error': true};
  }
  catch (err) {
    errorcb ? errorcb(err) : console.log(`Fetch Error : ${err}`);
    return {'error': true};
  }
}