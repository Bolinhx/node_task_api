const {User : UserModel, User} = require("../models/user");
const bcrypt = require('bcrypt');


const userController = {
    create: async (req, res) => {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            
            const user = {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
            };

        const response = await UserModel.create(user);

        res.status(201).json({response, msg: "Usuario criado com sucesso"})
        } catch (err) {
            console.log(err)
        }
    },

    login: async (req,res) =>{
        try {
            const user = await UserModel.findOne({ email: req.body.email }).select("+password");

            if (!user) {
                return res.status(400).json({ error: 'Dados Invalidos' });
            }

            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: "Dados Invalidos" });
            }

            res.status(200).json({ message: 'Login realizado com sucesso' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor" });
        }
    },

    getAll: async (req, res) => {
        try{
            const users = await UserModel.find();
            res.send(users)
        }catch(err){
            res.status(500).json({message: err.message });
        }
        },
    
    get: async (req, res) => {
        try {
            const id = req.params.id;
            const user = await UserModel.findById(id);

            if(!user){
                res.status(404).json({msg: "User nao encontrado"});
                return;
            }
            res.json(user);
        } catch (err) {
            res.json(err)
        }
    },
    delete: async (req,res) => {
        try {
            const id = req.params.id;
            const user = await UserModel.findById(id);

            if(!user){
                res.status(404).json({msg: "User nao encontrado"});
                return;
            }
            const deletedUser =  await UserModel.findByIdAndDelete(id)

            res.status(200).json({deletedUser, msg: "User excluido com sucesso"})
        } catch (err) {
            res.json(err)
        }
    },
    update: async (req,res) => {
            const id = req.params.id;

            const user = {
                name: req.body.name,
                email: req.body.email
            };

        const updatedUser = await UserModel.findByIdAndUpdate(id, user);
        
        if(!updatedUser){
            res.status(404).json({msg: "Usuario nao encontrado"});
            return;
        }
        res.status(201).json({user, msg: "Usuario atualizado com sucesso"})
    }

};

module.exports = userController;
