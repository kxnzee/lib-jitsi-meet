import Moderator from './moderator';

function createModerator(): any {
    return new Moderator({
        connection: {},
        eventEmitter: {
            emit: () => undefined
        },
        options: {
            hosts: {
                domain: 'example.com'
            }
        }
    });
}

function conferenceResponse(focusRegion?: string): Element {
    const property = typeof focusRegion === 'undefined'
        ? ''
        : `<property name="focus-region" value="${focusRegion}"/>`;

    return new DOMParser().parseFromString(
        `<iq><conference focusjid="focus@example.com" ready="true">${property}</conference></iq>`,
        'text/xml').documentElement;
}

describe('Moderator focus region', () => {
    it('parses a non-empty focus region', () => {
        const moderator = createModerator();
        const response = moderator._parseConferenceIq(conferenceResponse('eu-west'));

        expect(response.properties['focus-region']).toBe('eu-west');
    });

    it('treats an empty focus region as absent', () => {
        const moderator = createModerator();
        const response = moderator._parseConferenceIq(conferenceResponse(''));

        expect(response.properties['focus-region']).toBeUndefined();
    });

    it('does not replace the initial focus region with a later response', () => {
        const moderator = createModerator();
        const callback = () => undefined;

        moderator._handleSuccess(
            'room@example.com',
            moderator._parseConferenceIq(conferenceResponse('eu-west')),
            callback,
            callback);
        moderator._handleSuccess(
            'room@example.com',
            moderator._parseConferenceIq(conferenceResponse('us-east')),
            callback,
            callback);

        expect(moderator.getFocusRegion()).toBe('eu-west');
    });

    it('keeps an initially absent focus region absent', () => {
        const moderator = createModerator();
        const callback = () => undefined;

        moderator._handleSuccess(
            'room@example.com',
            moderator._parseConferenceIq(conferenceResponse()),
            callback,
            callback);
        moderator._handleSuccess(
            'room@example.com',
            moderator._parseConferenceIq(conferenceResponse('us-east')),
            callback,
            callback);

        expect(moderator.getFocusRegion()).toBeUndefined();
    });
});
