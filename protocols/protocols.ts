const getProtocol = (req, res, next) => {

    //si el protocolo no se ha encontrado mostrara un error
    if (!req.body.protocols || req.body.protocols.length === 0) {
      res.status(400).json("There must be at least one valid protocol")
    }
    //comprobacion, comprueba que uno de los protocolos recividos no estan permitidos
    const disallowedProtocol = getIncorretProtocols(req.body.protocols)
    if(disallowedProtocol === true){
        res.status(400).json("There are incorrect protocols, check them")
    }
    //para evitar conflictos entre protocolos se estarblece la funcion getConflictions y se declara una comprobacion
    const conflict = getConflictions(req.body.protocols)
    if (conflict === true) {
        res.status(400).json("You cannot include protocols that conflict with each other.")
    }
    //vemos la cantidad de ataques enemigos (los que estan a mas de 100 metros no cuentan)
  const validProtocols = skipLonger(req.body.scan)
  
  const correctProtocols = {...req.body, scan: validProtocols}

  //si solo hay un protocolo, le clavamos la mirada
  if (correctProtocols.protocols.length === 1) {
    console.log("1")
    correctProtocols.protocols[0] === "closest-enemies"
    ? 
    res.status(200).json(closestEnemies(correctProtocols))
    : correctProtocols.protocols[0] === "furthest-enemies"
    ? res.status(200).json(furthestEnemies(correctProtocols))
    : correctProtocols.protocols[0] === "assist-allies"
    ? res.status(200).json(closestEnemies(assistAllies(correctProtocols)))
    : correctProtocols.protocols[0] === "avoid-crossfire"
    ? (!avoidCrossfire(correctProtocols) ? res.status(400).json("There is no coords without allies") : res.status(200).json(closestEnemies(avoidCrossfire(correctProtocols)))) 
    : correctProtocols.protocols[0] === "prioritize-mech"
    ? res.status(200).json(closestEnemies(prioritizeMech(correctProtocols)))
    : correctProtocols.protocols[0] === "avoid-mech"
    ? (!avoidMech(correctProtocols) ? res.status(400).json("There is no coords without mechs") : res.status(200).json(closestEnemies(avoidMech(correctProtocols)))) 
    : null
  }
//atake a los droides
  if(correctProtocols.protocols.length > 1){
    let attack
    let attack2 
    let attack3  

    if(correctProtocols.protocols.includes("assist-allies")){
      attack = assistAllies(correctProtocols)
    }
    if(correctProtocols.protocols.includes("avoid-crossfire")){
      !attack ? attack = avoidCrossfire(correctProtocols) : attack2 = avoidCrossfire(attack) 
    }
    if(correctProtocols.protocols.includes("prioritize-mech")){
      !attack ? attack = prioritizeMech(correctProtocols) : attack2 = prioritizeMech(attack) 
    }
    if(correctProtocols.protocols.includes("avoid-mech")){
      !attack ? attack = avoidMech(correctProtocols) : attack2 = avoidMech(attack) 
    }
    if(correctProtocols.protocols.includes("furthest-enemies")){
      !attack2 ? attack2 = furthestEnemies(attack) : attack3 = furthestEnemies(attack2) 
    }else{
      !attack2 ? attack2 = closestEnemies(attack) : attack3 = closestEnemies(attack2) 
    }
    !attack3 ? res.status(200).json(attack2) : res.status(200).json(attack3) 
  }

  //cuando no hay coordenadas libres de enemigos
const closestEnemies = (attack) => {
  let longest = 100
  let cordAttack = {}
  attack.scan.map(x => {
    const num = calculateDistance(x.coordinates)
    if (num < longest){
      longest = num
      cordAttack = x.coordinates
      return cordAttack
    }
  })
  return cordAttack
}

//el enemigo no tiene coordenadas
const furthestEnemies = (attack) => {
  let longest = 0
  let cordAttack = {} 
  attack.scan.map(x => {
    const num = calculateDistance(x.coordinates)
    if (num > longest){
      longest = num
      cordAttack = x.coordinates
    }
    return cordAttack
  })
  return cordAttack
}
//aliados
const assistAllies = (attack) => {
  validCood = []
  attack.scan.filter(x => {
    if(x.allies !== undefined){
      validCood.push(x)
    }
  })
  //sin retorno de coordenadas, habra una llluvia de ataques
  if(validCood.length === 0){
    return attack
  }
  validAttack = {...attack, scan: validCood}
  return validAttack
}

const avoidCrossfire = (attack) => {
  validCood = []
  attack.scan.filter(x => {
    if(x.allies === undefined){
      validCood.push(x)
    }
  })
  
  if(validCood.length === 0){
    return false
  }
  validAttack = {...attack, scan: validCood}
  return validAttack
} 
//
const prioritizeMech = (attack) => {
  validCood = []
  attack.scan.filter(x => {
    if(x.enemies.type === "mech"){
      validCood.push(x)
    }
  })
  //we will return all attacks without filtering.
  if(validCood.length === 0){
    return attack
  }
  validAttack = {...attack, scan: validCood}
  return validAttack
}

const avoidMech = (attack) => {
  validCood = []
  attack.scan.filter(x => {
    if(x.enemies.type !== "mech"){
      validCood.push(x)
    }
  })
  // retorno sin filtros cuando no hay coordenadas
  if(validCood.length === 0){
    return false
  }
  validAttack = {...attack, scan: validCood}
  return validAttack
  }
  //los takes a mas 100 metros es agua
const skipLonger = (scan) => {
  validCood = []
  scan.map((x) => {
    num = calculateDistance(x.coordinates)
    if (num <= 100){
      validCood.push(scan.filter(y => y.coordinates === x.coordinates)[0])
    }else{
      null
    }
  })
  return validCood
}

//calculando los puntos de distancia entre dos puntos del eje cartesiano
const calculateDistance = (end) => {
  const start = { x: 0, y: 0 }
  const distance = Math.sqrt((Math.pow((end.x - start.x), 2)) + (Math.pow((end.y - start.y), 2))) 
  return distance
}

//conflicto entre protocolos
const getConflictions = (protocols) => {
  if (protocols.includes("avoid-mech") && protocols.includes("prioritize-mech")) return true
  if (protocols.includes("closest-enemies") && protocols.includes("furthers-enemies")) return true
  if (protocols.includes("assist-allies") && protocols.includes("avoid-crossfire")) return true
  return false
}

//comprobamos que no hay protocolos incorecots
const getIncorretProtocols = (protocols) => {
  const prot = ["closest-enemies", "furthest-enemies", "assist-allies", "avoid-crossfire", "prioritize-mech", "avoid-mech"]
  
  const valid = protocols.map((x) => {  
    if (!prot.includes(x)) return true
    return false
  })
  return valid.includes(true)
}

module.exports = getProtocol

}