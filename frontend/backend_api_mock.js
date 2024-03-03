const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "Life is like riding a bicycle. To keep your balance...",
    "In the beginning, God created the heavens and the earth.",
    "All that glitters is not gold; often have you heard that told.",
    "The only thing we have to fear is fear itself.",
    "To be yourself in a world that is constantly trying...",
    "Success is not final, failure is not fatal: It is...",
    "It does not matter how slowly you go as long...",
    "The future belongs to those who believe in the beauty..."
];


Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))]; 
}

export function get_more_words() {
    return sentences.random()
}
