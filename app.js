const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// const date = require(__dirname + "/date.js");


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine", "ejs");

const mongoAtlasCluster = "mongodb+srv://admin-joy:123joy@cluster0-6qspo.mongodb.net/todolistDB";
const mongoLocalCluster = "mongodb://localhost:27017/todolistDB";

mongoose.connect(mongoAtlasCluster, {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

const a = new Item({
    name: "brush"
});

const b = new Item({
    name: "go fresh up"
});

const c = new Item({
    name: "paint"
});

const defaultItems = [a, b, c];


app.get("/", function(req, res){
    // const day = date();

    Item.find({}, function(err, foundItems){
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    // mongoose.connection.close();
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newitem: foundItems});
        }
    });
});

app.get("/:customListName", function(req, res){
    const listName = _.capitalize(req.params.customListName);

    List.findOne({name: listName}, function(err, foundList){
        if (!err) {
            if (foundList) {
                res.render("list", {listTitle: listName, newitem: foundList.items});
            } else {
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
                list.save();

                res.redirect("/"+listName);
            }
        }
    });
    

    
});

// app.get("/work", function(req, res){
//     res.render("list", {listTitle: "Work", newitem: workItems});
// });

app.post("/", function(req, res) { 
    const itemName = req.body.newItem;
    const listName = req.body.workList;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            if (err) {
                console.log(err);
            } else {
                // console.log(foundList.items);
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName);            
            }
        });
    }
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.check;
    const listName = req.body.listName;

    if(listName === "Today") {
        if (checkedItemId) {
            Item.findByIdAndRemove({_id: checkedItemId}, function(err){
                if (!err) {
                    res.redirect("/");
                }
            });
        }
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (err) {
                console.log(err);
            } else {
                res.redirect("/"+listName);
            }
        });  
    }
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('server started on port: ' + port);
});

