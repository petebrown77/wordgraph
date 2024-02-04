const fs = require("fs");
const Trie = require("./trie.js");
const { all } = require("axios");

function coverage_test(name, trie, list_of_words) {
    let counter = 0;

    console.log(`Testing coverage for model ${name}`);

    for (const word of list_of_words) {
        if (trie.contains(word)) {
            counter += 1;
        }
    }
    let percent_cover = (counter / list_of_words.length) * 100;
    console.log(`Model ${name} contains ${percent_cover} of all words in list`);
}

function readablizeBytes(bytes) {
    var s = ["bytes", "kB", "MB", "GB", "TB", "PB"];
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + " " + s[e];
}

if (require.main === module) {

    const all_words_file = fs.readFileSync("data/words_alpha.txt").toString();
    const popular_file = fs.readFileSync("data/popular_words_en_us.txt").toString();
    const scrabble_file = fs.readFileSync("data/scrabble_dictionary.txt").toString();

    const all_words = all_words_file.split("\r\n");
    const popular_words = popular_file.split("\n");
    const scrabble_words = scrabble_file.split("\n");
    
    const all_trie = new Trie();
    const popular_trie = new Trie();
    const scrabble_trie = new Trie();

    for (const word of all_words) {
        all_trie.insert(word);
    }

    for (const word of popular_words) {
        popular_trie.insert(word);
    }

    for (const word of scrabble_words) {
        scrabble_trie.insert(word);
    }

    all_trie.optimize();
    all_trie.suffixes();

    popular_trie.optimize();
    popular_trie.suffixes();

    scrabble_trie.optimize();
    scrabble_trie.suffixes();

    fs.mkdir("./models", function(err) {
        if (err) {
            if (err.code === "EEXist") {};
        }
    })

    const all_string = all_trie.serialize();
    console.log(
        `Writing all string of length ${readablizeBytes(all_string.length)}`
    );
    fs.writeFileSync("models/all_words.dawg", all_string);

    const pop_string = popular_trie.serialize();
    console.log(
        `Writing popular string of length ${readablizeBytes(pop_string.length)}`
    );
    fs.writeFileSync("models/popular_words.dawg", pop_string);

    const scrabble_string = scrabble_trie.serialize();
    console.log(`Writing scrabble string of length ${readablizeBytes(scrabble_string.length)}`);
    fs.writeFileSync("models/scrabble_words.dawg", scrabble_string);


    const all_dawg_string = fs.readFileSync("models/all_words.dawg").toString();
    const scrabble_dawg_string = fs.readFileSync("models/scrabble_words.dawg").toString();
    const pop_dawg_string = fs.readFileSync("models/popular_words.dawg").toString();

    const test_all_trie = Trie.deserialize(all_dawg_string);
    const test_scrabble_trie = Trie.deserialize(scrabble_dawg_string);
    const test_pop_trie = Trie.deserialize(pop_dawg_string);

    coverage_test("All Words", test_all_trie, all_words);
    coverage_test("Scrabble", test_scrabble_trie, scrabble_words);
    coverage_test("Popular", test_pop_trie, popular_words);
}