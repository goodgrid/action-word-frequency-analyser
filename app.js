import fs from "fs";
import neatCsv from "neat-csv";

let argType = process.argv[2]
let argFile = process.argv[3]
let argColl = process.argv[4]


let delimiters = /[\s_-]/

let filters = [
    /\n/g,
    /\r/g,
    /\"/g,
    /:/g,
    /\./g,
    /,/g,
]

fs.promises.readFile(argFile).then(buffer => {
    let content = buffer.toString();
    if (argType=="csv")  content = getColumnContent(content,argColl);
    if (argType=="txt")  content = getPlainTextContent(content);

    content.then(content => {
        for (let filter of filters) {
            content = content.replace(filter," ")
        }
        content = content.replace(/ +(?= )/g,''); // replace all multiple spaces by a single space
        
        let contentArray = content.split(delimiters);
        
    
        let wordCount = contentArray.map(word => {
            return {
                word: word.toUpperCase(),
                count: contentArray.filter(countWord => countWord.toUpperCase() == word.toUpperCase()).length
            }
        })
        wordCount = dedup(wordCount);
        wordCount = wordCount.sort(sortObjects)
    
        console.log(dedup(wordCount))
    })
})


function sortObjects(word1, word2) {
    return word2.count - word1.count
}

function dedup(arr) {
	var hashTable = {};

	return arr.filter(function (el) {
		var key = JSON.stringify(el);
		var match = Boolean(hashTable[key]);

		return (match ? false : hashTable[key] = true);
	});
}

async function getPlainTextContent(content) {
    /*
        This is a dummy function only to have a promise returned, just like 
        when a CSV string is processed, so we can keep the rest generic
    */
    return content
}

async function getColumnContent(content, column) {
    let csv = await neatCsv(content,{separator:";"})

    csv = csv.map(line => line[column]);

    return csv.join(" ");
    
}