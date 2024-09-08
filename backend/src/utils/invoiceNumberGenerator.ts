// generate a random 6 digit invoice number

export default function invoiceNumberGenerator(){
    var finalNumber
    var multiplyFactor = 100000
    for(var i=0; i<6;i++){
        var number = (Math.random() * 9) + 1
        finalNumber = Math.floor(number * multiplyFactor)
        multiplyFactor/10
    }
    return finalNumber
}