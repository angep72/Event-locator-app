const {Router}= require('express');
const router = Router();
const {getAllUsers, getSingleUser, updateUser, registerUser, loginUser} = require('../controllers/users.controller');

router.get('/',getAllUsers)

router.get('/:id',getSingleUser)

router.put('/:id',updateUser);


router.post("/", registerUser);


router.post("/login", loginUser)

module.exports = router;


