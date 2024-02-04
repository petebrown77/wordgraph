const fs = require("fs");

class Trie {
    constructor() {
        this.root = {};
        this.end = {};
        this.keepEnd = {};
        this.endings = [0];
    }

    insert(word) {
        var cur = this.root;
        for (var i = 0; i < word.length; i++) {
            var letter = word[i];
            var pos = cur[letter];

            if (pos == null) {
                cur = cur[letter] = i === word.length - 1 ? 0 : {};
            } else if (pos === 0) {
                cur = cur[letter] = { $: 0 };
            } else {
                cur = cur[letter];
            }
        }
    }

    contains(word, val) {
        var cur = val || this.root; //problem!

        for (var node in cur) {
            if (word.indexOf(node) === 0) {
                // If it's a number
                var val =
                    typeof cur[node] === "number" && cur[node]
                        ? // Substitute in the removed suffix object
                          this.endings[cur[node]]
                        : // Otherwise use the current value
                          cur[node];

                // If this leaf finishes the word
                if (node.length === word.length) {
                    // Return 'true' only if we've reached a final leaf
                    return val === 0 || val.$ === 0;

                    // Otherwise continue traversing deeper
                    // down the tree until we find a match
                } else {
                    //console.log(node.length);
                    //console.log(val);
                    return this.contains(word.slice(node.length), val);
                }
            }
        }

        return false;
    }

    /**
     * Find all words within trie that start with suffix
     * @param {string} prefix prefix of words to find
     * @returns {Array} - List of words that start with prefix
     */
    /*getPrefixes(prefix) {
        var cur = this.root;

        //TODO: handle errors
        //TODO: Need to handle this.endings too
        for (const part of prefix) {
            cur = cur[part];
        }

        const initial_node = cur;
        
        var stack = [cur];

        while (stack.length > 0) {
            var str = "";
            const node = stack.shift();
            for (const key in node) {
                str += key;
                stack.push(node[key]);
            }
            //console.log(str);
        }
    }*/

    genWord(val, prefix = null) {
        let cur = val || this.root;
        let result = '';

        if (prefix !== null) {
            for (const letter of prefix) {
                cur = cur[letter];
                if (cur === undefined) {
                    return '';
                }
            }
        }

        while (true) {
            const keys = Object.keys(cur);
            const randKey = keys[Math.floor(Math.random() * keys.length)];

            if (randKey === "$") {
                break;
            }

            result += randKey;

            const nextVal = typeof cur[randKey] === "number" && cur[randKey] ? this.endings[cur[randKey]] : cur[randKey];

            if (nextVal === 0) {
                break;
            }

            cur = nextVal;
        }

        return prefix ? prefix + result : result;
    }


    optimize() {
        var cur = this.root;
        var num = 0;
        var last;

        this._optimize(cur, num, last);
    }

    _optimize(cur, num, last) {
        for (var node in cur) {
            if (typeof cur[node] === "object") {
                var ret = this._optimize(cur[node], num, last);

                if (ret) {
                    delete cur[node];
                    cur[node + ret.name] = ret.value;
                    node = node + ret.name;
                }
            }

            last = node;
            num++;
        }
        if (num === 1) {
            return { name: last, value: cur[last] };
        }
    }

    suffixes() {
        var hasObject = false,
            key = "";

        this._suffix(this.root, this.end, hasObject, key);

        for (var key in this.end) {
            if (this.end[key].count >= 5) {
                this.keepEnd[key] = this.endings.length;
                this.endings.push(this.end[key].obj);
            }
        }

        this._finish(this.root, this.keepEnd, this.end);
    }

    _finish(root, keepEnd, end) {
        for (var node in root) {
            var val = root[node];

            if (typeof val === "object") {
                this._finish(val, keepEnd, end);
            } else if (typeof val === "string") {
                root[node] = keepEnd[val] || end[val].obj;
            }
        }
    }

    _suffix(cur, end, hasObject, key) {
        for (var node in cur) {
            if (typeof cur[node] === "object") {
                hasObject = true;

                var ret = this._suffix(cur[node], end, false, "");

                if (ret) {
                    cur[node] = ret;
                }
            }

            key += "," + node;
        }

        if (!hasObject) {
            if (end[key]) {
                end[key].count++;
            } else {
                end[key] = { obj: cur, count: 1 };
            }

            return key;
        }
    }

    randomWord(current=null) {
        var current = current || this.root;
        
        const keys = Object.keys(current);

        if (keys.length === 0) {
            return "";
        }

        const randKey = keys[Math.floor(Math.random() * keys.length)];
        const nextObj = current[randKey];

        if (typeof nextObj === "object" && nextObj !== null) {
            // If the value is an object, recursively call the function
            return randKey + this.randomWord(nextObj);
        } else {
            // If the value is not an object, return the key
            return randKey;
        }
    }

    serialize() {
        //var list = [];
        var string = "";

        string += "**" + JSON.stringify(this.end) + "**";
        string += "^^" + JSON.stringify(this.endings) + "^^";

        function srlz(node) {

            // Check if the node has multiple children
            if (Object.keys(node).length > 0) {
                for (const key of Object.keys(node)) {
                    //console.log(key);
                    //console.log(`${key}: ${Object.keys(node[key]).length}`);
                    const has_children =
                        Object.keys(node[key]).length === 0 ? false : true;

                    if (key.length > 1) {
                        string += "'" + key + "'" + (has_children ? 0 : "");
                    } else {
                        string += key + (has_children ? 0 : "");
                    }
                    srlz(node[key]);
                }
                string += "+";

            // IF it doesn't, simply append 
            } else {
                //console.log(node);
                if (typeof node === "number" && node === 0) {
                    return;
                }
                // string += Object.keys(node)[0] + 0;
                string += "\"" + node + "\"";
                return;
                // console.log(node);
            }
        }
        srlz(this.root);

        //console.log(string);
        return string;
    }

    //TODO: Turn this into static method
    static deserialize(str) {
        
        const tree = new Trie();

        //TODO: This split method is slow, find a better way
        var splitted = str.split("**");
        tree.end = JSON.parse(splitted[1]);

        str = splitted[2];

        splitted = str.split("^^");
        tree.endings = JSON.parse(splitted[1]);

        const str_list = splitted[2].split("");
        const root_key = str_list[0];

        var root = {};
        let current_node = root;
        var stack = [root];

        const list_length = str_list.length; // cache length for small performace bump
        for (var i = 0; i < list_length; i++) {
            const node = str_list[i];
            // Ensure node is not null (or in this case, "+")
            if (node !== "+") {
                //handle multchar characters
                var node_val = "";
                if (node === "'") {
                    while (str_list[i + 1] !== "'") {
                        node_val += str_list[++i];
                    }
                    i++;
                    //console.log(node_val);
                } else {
                    node_val = node;
                }

                const key = Object.keys(current_node)[0];

                if (key !== undefined) {
                    if (str_list[i+1] === "\"") {
                        i++;
                        let number = "";
                        while (str_list[i+1] !== "\"") {
                            number += str_list[i+1];
                            i++;
                        }
                        //i++;
                        //console.log(Number(number));
                        current_node[key][node_val] = Number(number);
                        i++;
                    } else {
                        current_node[key][node_val] = 0;
                    }
                    // Item looks like ["A", true]
                } else {
                    current_node[node_val] = {};
                }

                //TODO: For some reason, if we add the 0, we add about 10% to the filesize,
                //TODO: But reduce the deserializing time by almost 40-45%.

                /*
                    Without:
                        length: 1.9Mb
                        TTDs: 340ms

                    With:
                        length: 1.7Mb
                        TTDs: 614ms
                */

                //finaly, if this has children, add them
                //TODO: fix this shit here
                //if (str_list[i+1] !== "1") {
                if (str_list[i+1] === "0") {
                    const new_node = {};
                    new_node[node_val] = {};
                    stack.push(new_node);
                    current_node = new_node;
                    //console.log(stack)
                    i++;
                }
            } else {
                //console.log("POP!");
                const popped_node = stack.pop();

                if (stack.length !== 0) {
                    current_node = stack[stack.length - 1];

                    const key = Object.keys(current_node)[0];
                    const popped_key = Object.keys(popped_node)[0];

                    current_node[key][popped_key] = popped_node[popped_key];
                    //console.log("=",current_node);
                }
            }
        }

        tree.root = root[root_key];
        //console.log(stack);
        //this.root = root[root_key];

        return tree;
    }
}

module.exports = Trie;