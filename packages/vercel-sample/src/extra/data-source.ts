import { RESTDataSource } from 'apollo-datasource-rest';
import { DogType } from '../graphql/dog.type';

export class DogsAPISource extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://dog.ceo/api/breeds/image/random';
  }

  async getRandomDog(): Promise<DogType> {
    const response: DogType = await this.get('');

    return response;
  }
}
