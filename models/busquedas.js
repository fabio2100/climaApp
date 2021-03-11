const fs = require('fs');
const axios = require('axios');
const dbPath = './db/database.json';

class Busquedas{
  historial = []; 
  constructor(){
    // todo leer dbd si existe
    this.leerDB();
  }


  get paramsMapBox (){
    return {
      'access_token':process.env.MAPBOX_KEY || '',

      'limit': 5,
      'language':'es'
    }
  }

  paramsOpenWeather(lat,longi){
    return {
      'appid':process.env.OPENWEATHER_KEY || '',
      'lat':`${lat}`,
      'lon':`${longi}`,
      'units':'metric',
      'lang':'es'
    }
  }

  async ciudad (lugar = ''){
    try {
      //peticiion http
      //enlace: https://reqres.in/api/users?page=2 

      //console.log(lugar);
      //const cadenaBusqueda = "https://api.mapbox.com/geocoding/v5/mapbox.places/"+lugar+".json?access_token=pk.eyJ1Ijoic3F1aXp6YXRvZmFiaW8iLCJhIjoiY2ttMTUxZmpoMHpsYjJ1bzZmN3ZiOHpnOCJ9.zG9aexVcR-BDnoHmU6ZWBw&cachebuster=1615241966034&autocomplete=true&limit=5&language=es"
      //const respuesta = await axios.get("https://api.mapbox.com/geocoding/v5/mapbox.places/mendoza.json?access_token=pk.eyJ1Ijoic3F1aXp6YXRvZmFiaW8iLCJhIjoiY2ttMTUxZmpoMHpsYjJ1bzZmN3ZiOHpnOCJ9.zG9aexVcR-BDnoHmU6ZWBw&cachebuster=1615241966034&autocomplete=true&limit=5&language=es");
      //const respuesta = await axios.get(cadenaBusqueda)

      //paramos no usados  'cachebuster':'1615241966034','autocomplete':'true',
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
        params: this.paramsMapBox
      })

      const respuesta = await instance.get();

      
      return respuesta.data.features.map(lugar => ({
        id:lugar.id,
        nombre:lugar.place_name_es,
        lat: lugar.center[1],
        longi: lugar.center[0]
      }))
    } catch (error) {
      console.log(error)
      console.log('Ciudad no encontrada')
      return [];
    }
  }

  async clima (lat=0,longi=0){
    try {
      const instance = axios.create({
        baseURL: 'https://api.openweathermap.org/data/2.5/weather',
        params: this.paramsOpenWeather(lat,longi)
      })
      const respuesta = await instance.get();
      const {weather,main} = respuesta.data;


      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp
      }
    } catch (error) {
      console.log(error)
      return error;
    }
  }


  agregarHistorial(lugar=''){
    //prevenir duplicados
    if (this.historial.includes( lugar.toLocaleLowerCase())){
      return;
    }
    this.historial.unshift(lugar.toLocaleLowerCase());

    //grabar en db 
    this.guardarDB();
  };



  guardarDB(){
    const payload = {
      historial : this.historial
    };
 
    fs.writeFileSync(dbPath,JSON.stringify(payload))

  }

  leerDB(){
    if (!fs.existsSync(dbPath)){
      return
    }
    const info = fs.readFileSync(dbPath,{"encoding":"utf-8"});
    const data = JSON.parse(info)
    this.historial = data.historial;
  }

  get historialCapitalizado(){
    return this.historial.map(lugar =>{
      let palabras = lugar.split(' ');
      palabras = palabras.map(p=>{
        p[0].toUpperCase()+p.substring(1);
      })
      return palabras.join(' ')
    })
  }
}

module.exports = Busquedas;