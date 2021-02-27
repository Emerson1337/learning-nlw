import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { UsersRepository } from '../repositories/UsersRepository';
import { SurveyUsersRepository } from '../repositories/SurveyUsersRepository';
import SendMailService from '../services/SendMailService';
import { resolve } from 'path';
import { AppError } from '../errors/AppError';

class SendMailController {

    async execute(request: Request, response: Response) {
        const { email, survey_id} = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveyRepository = getCustomRepository(SurveysRepository);
        const surveyUsersRepository = getCustomRepository(SurveyUsersRepository);

        const user = await usersRepository.findOne({ email });

        
        
        if(!user){
            throw new AppError("Users isn't exists!");
        }

        const survey = await surveyRepository.findOne({ id: survey_id });

        if(!survey){
            throw new AppError("Survey isn't exists!");
        }

        


        //Se tudo estiver OK, então vamos salvar na nossa tabela surveys_users
        const SurveyUserAlreadyExists = await surveyUsersRepository.findOne({
            where: {user_id: user.id, value: null},
            relations: ["user", "survey"]
            });
        
        const npsPath = resolve(__dirname + "/../views/emails/npsMail.hbs");
        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
            }

        if(SurveyUserAlreadyExists){
            //pegando o id da SurveyUser já existente
            variables.id = SurveyUserAlreadyExists.id;
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(SurveyUserAlreadyExists)
        }

        const surveyUser = surveyUsersRepository.create({
            user_id: user.id,
            survey_id
        });
        await surveyUsersRepository.save(surveyUser);

        //pegando o id da SurveyUser criada
        variables.id = surveyUser.id;

        SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser)

    }
}


export { SendMailController };