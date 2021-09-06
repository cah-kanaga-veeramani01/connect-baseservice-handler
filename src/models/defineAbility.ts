import { defineAbility } from '@casl/ability';
import config from 'config';

const userEditRoles: string[] = config.get('userEditRoles'),
	userReadRoles: string[] = config.get('userReadRoles'),
	editUser = (role: string, _index: number, _originalArray: string[], editRoles: string[] = userEditRoles) => editRoles.includes(role),
	readUser = (role: string, _index: number, _originalArray: string[], readRoles: string[] = userReadRoles) => readRoles.includes(role);

/**
 * @enum Subject
 */
export enum Subject {
	all = 'all', // all represents any Subject
	policy = 'Policy'
}

/**
 * @enum UserAction
 */
export enum UserAction {
	create = 'create',
	read = 'read',
	update = 'update',
	delete = 'delete',
	manage = 'manage' // manage represents any action
}

/**
 * Model to define access for user roles
 * @param {string[]} userRoles - user roles to define access for.
 */
export default function defineAbilityFor(userRoles: string[]) {
	return defineAbility((can, cannot) => {
		// internal roles
		// Edit / write user roles
		if (userRoles.some(editUser)) {
			can(UserAction.create, Subject.all);
			can(UserAction.read, Subject.all);
			can(UserAction.update, Subject.all);
			can(UserAction.delete, Subject.all);
			can(UserAction.create, Subject.policy);
			can(UserAction.read, Subject.policy);
			can(UserAction.update, Subject.policy);
			can(UserAction.delete, Subject.policy);
		} else if (userRoles.some(readUser)) {
			// read user roles
			can(UserAction.read, Subject.all);
			cannot(UserAction.create, Subject.all);
			cannot(UserAction.update, Subject.all);
			cannot(UserAction.delete, Subject.all);
			can(UserAction.read, Subject.policy);
			cannot(UserAction.create, Subject.policy);
			cannot(UserAction.update, Subject.policy);
			cannot(UserAction.delete, Subject.policy);
		}
	});
}
