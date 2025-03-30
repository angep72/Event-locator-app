const {Router}= require('express');
const router = Router();
const client = require('../connection');
router.get('/',(req,res)=>{
    client.query(`SELECT * FROM users`,(err,result)=>{
        if(err) throw err;
        res.send(result.rows);
    })
})

router.get('/:id',(req,res)=>{
    client.query(`SELECT * FROM users WHERE user_id=${req.params.id}`,(err,result)=>{
        if(err) throw err;
        res.send(result.rows);
    })
})

module.exports = router;


