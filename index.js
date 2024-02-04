const Trie = require("./trie.js");

if (require.main === module) {

    //Prints tree in formatted manner
    function getFormatted(object, prefix) {
        var result = "";
        Object.entries(object).forEach(([k, v], i, { length }) => {
            result += prefix + (i + 1 === length ? "└─ " : "├─ ") + k;
            if (v && typeof v === "object") {
                result += "\n";
                result += getFormatted(
                    v,
                    prefix + (i + 1 === length ? "   " : "│  ")
                );
            } else {
                if (v) result += ": " + v;
                result += "\n";
            }
        });
        return result;
    }

    const test_tree = new Trie();

    test_tree.insert("hello");
    test_tree.insert("trello");
    test_tree.insert("tollo");
    test_tree.insert("help");
    test_tree.insert("mello");
    test_tree.insert("mallo");

    console.log(getFormatted(test_tree.root, ""));

    test_tree.suffixes();
    test_tree.optimize();

    for (const word of ["hello", "trello", "tollo", "help", "mello", "mallo"]) {
        console.log(`Contains ${word} : ${test_tree.contains(word)}`);
    }

    console.log(getFormatted(test_tree.root, ""));

    const serial_str = test_tree.serialize();
    console.log(`Serialized data to ${serial_str.length} bytes`);

    //const new_trie = new Trie();
    let new_trie = Trie.deserialize(serial_str);

    for (const word of ["hello", "trello", "tollo", "help", "mello", "mallo"]) {
        console.log(`Contains ${word} : ${new_trie.contains(word)}`);
    }
}

module.exports = {Trie};