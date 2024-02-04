# wordgraph - a DAWG implementation
---
wordgraph is a simple implementation of a Directed Acyclic Word Graph in Javascript.  wordgraph contains the following features:
- [x] insert word
- [x] Check if word is contained within the trie
- [x] serialize to string (to write to file)
- [x] load serialized data into a trie
## Background
In developing this project, the following articles were used as guides for a good chunk of development:
- [Javascript Trie Performance Analysis by John Resig](https://johnresig.com/blog/javascript-trie-performance-analysis)
- [DWARF Serialization Explanation by Eli Bendersky](https://eli.thegreenplace.net/2011/09/29/an-interesting-tree-serialization-algorithm-from-dwarf)
## Install
```
git clone https://www.github.com/petebrown77/wordgraph.git
cd wordgraph
npm install
```
## Basic Usage
```js
// Importing it
const { Trie } = require("wordgraph");

// Initialise it and insert words
const new_trie = new Trie();
new_trie.insert("hello");

// Check if trie contains word
console.log(new_trie.contains("hello"); // "true"
console.log(new_trie.contains("marsh"); // "false"

// wordgraph does not consider partials to be a word, "hello" is valid, but not any substring
// "he" would need to be inserted separately for this to return true
console.log(new_trie.contains("he"); // "false" 

// Serialize and deserialize
const serialized = new_trie.serialize(); // returns string representation of trie
console.log(serialized.length) // should be about 40-60% reduction in size of data inserted

// now, you can write the string to a file to be loaded later
fs.writeFileSync("./example.dawg", serialized);

// to read a Dawg from a file, simply read the string into Trie.deserialize(<string>);
const deserialized_string = fs.readFileSync("path/to/dawg.txt").toString();
const deserial_trie = Trie.deserialize(deserialized_string);

// Now, the new trie has the same data as the old one
console.log(deserial_trie.contains("hello"); // true
```
## License
License is MIT

## Development
wordgraph is still under active developement, and not everything is documented and working.
- [ ] Add jsdoc strings to functions
- [ ] implement genWord function
- [ ] speed up deserialize() function
