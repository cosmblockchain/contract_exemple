function getFee(isMember) {
return (isMember? '€2.00' : '€0.00');
}

console.log(getFee(true))
// sortie attendue : '€2.00'

console.log(getFee(false));
// sortie attendue : '€0.00'

console.log(getFee(null));
// sortie attendue : '€0.00' , null  est considéré comme false

