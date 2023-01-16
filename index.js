const express = require('express');
const app = express();
const mongo = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 8000;
const peoples = require('./model');

mongo.connect("mongodb+srv://admin:admin@cluster0.ai5oh1s.mongodb.net/?retryWrites=true&w=majority", (err) => {
    if (err) {
        console.log("error occured", err);
    } else {
        console.log("connected to db");
    }
})

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());

app.post('/add/people', async (req, res) => {
    const { name, rel_type, ref } = req.body;
    // const {rel_type,ref} = relation;

    await peoples.create({ name, relation: { rel_type, ref } }).then(data => {
        res.status(200).json({
            msg: "successfully added"
        })
    }).catch(err => {
        res.status(400).json({
            msg: "error in saving",
            err: err
        })
    })
})

app.get('/get/peoples', async (req, res) => {
    await peoples.find().then(data => {
        res.status(200).json({
            msg: "success",
            data: data
        })
    }).catch(err => {
        res.status(400).json({
            msg: "err occured",
            err
        })
    })
})

const findConnection = (data, a) => {
    // console.log();
    let connections = data.filter((val) => {
        if (val.relation.ref.includes(a._id))
            return val
    });
    return connections;
}

const recurse = (path, a, b, data) => {
    let conn = findConnection(data, a);
       if (conn == null || conn.length == 0) {
        return path
    }
    if (path.length >6) {
            return path;
        }
    for (let con of conn) {
        if (con.relation.ref.includes(b._id)) {
            console.log(111);
            return [...path,con.name,b.name];
        }
        return recurse([...path, con.name], con, b, data);
    }
}

app.post('/get/relation', async (req, res) => {
    try {
        let source = req.body.src;
        let target = req.body.tar;

        let connections = await peoples.find();
        // console.log(connections);
        var result = [];
        let friend = await findConnection(connections, source);
        for (let f of friend) {
            if(f._id==target._id){
                result.push([source.name,f.name])
            }else{
                let path = recurse([source.name, f.name], f, target, connections);
                if(path[path.length-1]!=target.name){
                    continue;
                }
                else
                result.push(path)
            }
        }
        res.status(200).json({
            data: result
        })
    } catch (err) {
        res.status(400).json({
            msg: 'err in calculation',
            data: err
        })
    }
})

app.listen(port, () => console.log("server is up at port:", port));