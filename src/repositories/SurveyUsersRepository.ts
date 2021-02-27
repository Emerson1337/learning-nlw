import { SurveyUser } from '../models/SurveyUsers';
import { Entity, EntityRepository, Repository } from 'typeorm';


@EntityRepository(SurveyUser)
class SurveyUsersRepository extends Repository<SurveyUser>{

}

export { SurveyUsersRepository }