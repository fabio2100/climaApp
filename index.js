require('dotenv').config()

const { leerInput, inquirerMenu,pausa,listadoCiudades } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () =>{
  let opt;
  const busquedas = new Busquedas();


  do{
    opt = await inquirerMenu();
    switch (opt){
      case 1: 
        //mostrar mensaje
        const lugar = await leerInput("Ingrese ciudad a buscar: ")
        const lugares = await busquedas.ciudad(lugar);
        
        const seleccion = await listadoCiudades(lugares);
        if (seleccion == 0){
          continue;
        }
        //aca puedo guardar en db 

        

        const lugarSel = lugares.find(lugar => lugar.id === seleccion);
        busquedas.agregarHistorial(lugarSel.nombre)
        //OPENWEATHER
        const respuesta = await busquedas.clima(lugarSel.lat,lugarSel.longi);
        //console.log(respuesta)
        //, buscar ciudad, mostrar los lugares, seleccionar el lugar 
        //clima, mostrar resultados 
        console.log('\nInformación de la ciudad: \n'.green)
        console.log("Ciudad: ",lugarSel.nombre)
        console.log("Latitud:",lugarSel.lat)
        console.log("Longitud:",lugarSel.longi)
        console.log("El clima está: ",respuesta.desc)
        console.log("Temperatura: ",respuesta.temp)
        console.log("Temp minima: ",respuesta.min)
        console.log("Temp máxima:",respuesta.max)
        break;
      case 2: 
        busquedas.historial.forEach(lugar=>{
          console.log(lugar)
        })

        break;

      
    
    }
    if (opt !== '0') await pausa();
  }while(opt != 0);
}

main()