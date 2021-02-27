import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { AppError } from '../errors/AppError';
import { UsersRepository } from "../repositories/UsersRepository";
import * as yup from 'yup';

class UserController {
    async create(request: Request, response: Response){

        const schema = yup.object().shape({
            name: yup.string().required("Username should be a value not null!"),
            email: yup.string().email().required(),
        })

        //if(!(await schema.isValid(request.body))){
        //    return response.status(400).json({
        //        error: "Validation failed!"
        //    });
        //}

        try{
            await schema.validate(request.body, {abortEarly: false});
        } catch(err) {
            return response.status(400).json({
                error: err,
            });
        }

        const { name, email } = request.body;
        //conexão com o banco de dados.
        const usersRepository = getCustomRepository(UsersRepository);
        const userAlreadyExists = await usersRepository.findOne({
            email
        });
        if(userAlreadyExists){
            throw new AppError("Users Already exists!");
        }
        const user = usersRepository.create({
            name, 
            email,
        });
        await usersRepository.save(user)
        return response.status(201).json(user);
    }
}

export { UserController };
