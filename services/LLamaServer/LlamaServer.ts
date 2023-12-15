import sendSms from '../../tools/sendSms';
import { bolderize } from '../../tools/tools';
import User from '../../user/User';
import Service from '../Service';
import Model from './model';

class llamaServer extends Service {
	model: Array<Model>;
	constructor() {
		super();
		this.name = 'llama one';
		this.model = [
			new Model('monaGpt', '/opt/llama.cpp/server', 8081),
			new Model('meta llama', '/opt/llama.cpp/server', 8082)
		];
	}
	newAction(user: User, message: string) {
		if (typeof user.otherInfo.get('LlamaServer_modelNumber') == 'number') {
			this.model[user.otherInfo.get('LlamaServer_modelNumber')].message(user.phoneNumber, message);
			return;
		}
		const modelNumber = parseInt(message.split(' ')[0]);
		if (!isNaN(modelNumber) && modelNumber >= 0 && modelNumber < this.model.length) {
			if (this.model[modelNumber].started) {
				sendSms(user.phoneNumber, 'Sory this model is alredy use, try later.');
				return;
			}
			this.modelStarting(user, modelNumber);
			return;
		}
		let modelList = '';
		for (let i = 0; i < this.model.length; i++) {
			modelList = modelList.concat('%0a' + i + ':' + this.model[i].name);
		}
		sendSms(user.phoneNumber, `Please select your model: ${modelList}%0a%0a${bolderize('home')}: go to main menu`);
	}

	modelStarting(reqUser: User, modelNumber: number) {
		this.model[modelNumber].start().then(() => this.modelStarted(reqUser, modelNumber));
		sendSms(
			reqUser.phoneNumber,
			`Model ${this.model[modelNumber].name} starting up. ${bolderize('Wait')} for a new message.`
		);
	}

	modelStarted(reqUser: User, modelNumber: number) {
		reqUser.otherInfo.set('LlamaServer_modelNumber', modelNumber);

		sendSms(
			reqUser.phoneNumber,
			`Model started, you can talk to him. If you don't talk to him for 5 minutes the model will be closed.`
		);
	}
}

export default llamaServer;