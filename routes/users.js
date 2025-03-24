const router = require("express").Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router
    .route("/user")
    .post((req,res) => userController.create(req,res));

router
    .route("/user/login")
    .post((req,res) => userController.login(req,res));

    router
    .route("/user/logout")
    .post(authMiddleware, (req, res) => userController.logout(req, res));
    
router
    .route("/user")
    .get((req,res) => userController.getAll(req,res));

router
    .route("/user/:id")
    .get((req,res) => userController.get(req,res));

router
    .route("/user/:id")
    .delete((req,res) => userController.delete(req,res));
router
    .route("/user/:id")
    .put((req,res) => userController.update(req,res));

router
    .route("/user/password-update")
    .patch(authMiddleware, (req, res) => userController.passwordUpdate(req, res));

module.exports = router;