function __write_to_byte(value,bs, count, decalage = 0, little_endian = true){
    let v = +value; //au cas ou...
    //let bs = 0; //le resultat
    let padding = count; //le nbr de bits, ici toujours 8
      
    let shift = little_endian ? 0 : /* instanbul ignore next */ padding - 1;//index du premier bit a prendre en compte
    
    let step  = little_endian ?  1 : /* instanbul ignore next */ -1 ; //decalage d'index pour le prochain bit a etudier
    
    
    for (let i=0;i<count;i++, shift+=step){
        bs += ((v>>shift&1) == 1) ?  Math.pow(2,i+decalage) : 0;
    } 
    return bs;
}

function __read_from_byte(value, count,decalage=0, little_endian = true){
    let v = +value; //au cas ou...
    let bs = 0; //le resultat
    let padding = 8; //le nbr de bits, ici toujours 8
      
    let shift = little_endian ? decalage : /* instanbul ignore next */ padding - 1- decalage  ;//index du premier bit a prendre en compte
    
    let step  = little_endian ?  1 : /* instanbul ignore next */ -1 ; //decalage d'index pour le prochain bit a etudier
    //let idx =  0; //index 'normalisé' pour calculer la valeur

    
    for (let i=0;i<count;i++, shift+=step) bs += ((v>>shift&1) == 1) ?  Math.pow(2,i) : 0;
    return bs;
}

module.exports = {
    __write_to_byte : __write_to_byte,
    __read_from_byte: __read_from_byte
}