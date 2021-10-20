import fs from "fs";
import neatCsv from "neat-csv";

let argType = process.argv[2]
let argFile = process.argv[3]
let argColl = process.argv[4]
let argLang = process.argv[5]


let delimiters = /[\s_-]/

let characterFilters = [
    /\n/g,
    /\r/g,
    /\"/g,
    /:/g,
    /\./g,
    /,/g,
]

let wordFilters = [
    /PDF/i,
    /MSG/i,
    /XLSX/i,
    /JPG/i,
    /DOCX/i,
    /DOC/i,
    /JFIF/i,
    /ZIP/i,
    /[0-9]+/,
    /re/i,
    /aw/i,
    /fw/i,

    //
]

let stopWords = {
    "French": [
        /au/i,
        /de/i,
        /du/i
    ],
    "German": [
        /und/i,
        /zum/i,
        /ab/i,
        /der/i,
    ],
    "Dutch": [
        /van/i,
        /de/i,
        /en/i,
        /naar/i
    ]

}

fs.promises.readFile(argFile).then(buffer => {
    let content = buffer.toString();
    if (argType=="csv")  content = getColumnContent(content,argColl);
    if (argType=="txt")  content = getPlainTextContent(content);

    content.then(content => {
        console.log(new Date(),"Content read")
        for (let filter of characterFilters) {
            content = content.replace(filter," ")
        }
        content = content.replace(/ +(?= )/g,''); // replace all multiple spaces by a single space
        console.log(new Date(),"Characters filtered")

        let contentArray = content.split(delimiters);
        console.log(new Date(),`Content split into ${contentArray.length} words`)
        
    
        contentArray = contentArray.filter(word => {
            if (!isExcludedWord(word)) {
                return word
            }
        })
        console.log(new Date(),`Words filtered into ${contentArray.length} words`)


        contentArray = contentArray.filter(word => {
            if (!isStopWord(word,argLang)) {
                return word
            }
        })
        console.log(new Date(),`Language specific stop words filtered into ${contentArray.length} words`)


        let wordCount = contentArray.map((word,index) => {
            process.stdout.clearLine(); 
            process.stdout.cursorTo(0); 
            process.stdout.write(`Counting word ${index.toString().padStart((contentArray.length).toString().length,"0")} of ${contentArray.length}`)
            return {
                word: word.toUpperCase(),
                count: contentArray.filter(countWord => countWord.toUpperCase() == word.toUpperCase()).length
            }
        })
        process.stdout.clearLine(); 
        process.stdout.cursorTo(0); 
        console.log(new Date(),`Counted frequency`)

        wordCount = dedup(wordCount);
        console.log(new Date(),"Words deduplicated")

        wordCount = wordCount.sort(sortObjects)
        console.log(new Date(),"Words sorted on frequency")

        console.log(wordCount.slice(0,50))
    })
})

function isExcludedWord(word) {
    for (let filter of wordFilters) {
        if (filter.test(word.toUpperCase())) {
            return true
        }
    }
    return false
}

function isStopWord(word, language) {
    for (let filter of stopWords[language]) {
        if (filter.test(word.toUpperCase())) {
            return true
        }
    }
    return false
}

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