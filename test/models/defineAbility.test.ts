import defineAbilityFor, { Subject, UserAction } from '../../src/models/defineAbility';

describe('Define Ability', () => {
	test('should assign edit/write roles', () => {
		const ability = defineAbilityFor(['Edit Role']);
		expect(ability.can(UserAction.read, Subject.policy)).toBeTruthy();
		expect(ability.can(UserAction.create, Subject.policy)).toBeTruthy();
		expect(ability.can(UserAction.update, Subject.policy)).toBeTruthy();
		expect(ability.can(UserAction.delete, Subject.policy)).toBeTruthy();
	});

	test('should assign read roles', () => {
		const ability = defineAbilityFor(['Read Role']);
		expect(ability.can(UserAction.read, Subject.policy)).toBeTruthy();
		expect(ability.can(UserAction.create, Subject.policy)).toBeFalsy();
		expect(ability.can(UserAction.update, Subject.policy)).toBeFalsy();
		expect(ability.can(UserAction.delete, Subject.policy)).toBeFalsy();
	});
});
