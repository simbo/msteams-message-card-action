import { describe, it, jest } from '@jest/globals';

jest.unstable_mockModule('msteams-message-cards', () => ({
  createMessageCardPayload: jest.fn(),
  sendMessageCard: jest.fn()
}));
jest.unstable_mockModule('@actions/core', () => ({
  startGroup: jest.fn(),
  endGroup: jest.fn(),
  getInput: jest.fn(),
  info: jest.fn()
}));

const { createMessageCardPayload, sendMessageCard } = await import('msteams-message-cards');
const { getInput } = await import('@actions/core');
const { action } = await import('../src/action.js');

describe('Action', () => {
  it('should call message card lib functions', async () => {
    (createMessageCardPayload as unknown as jest.Mock).mockClear().mockReturnValueOnce({ fake: true });
    (sendMessageCard as unknown as jest.Mock).mockClear().mockReturnValueOnce(Promise.resolve());
    (getInput as unknown as jest.Mock).mockClear().mockImplementation(input => {
      switch (input) {
        case 'webhook': {
          return 'https://my-webhook.com/';
        }
        case 'message': {
          return 'Hello World!';
        }
        case 'title': {
          return 'Hiho!';
        }
        case 'color': {
          return 'red';
        }
        default: {
          return '';
        }
      }
    });
    await expect(action()).resolves.not.toThrow();
    expect(createMessageCardPayload).toHaveBeenCalledWith({
      buttons: [],
      sections: [],
      text: 'Hello World!',
      title: 'Hiho!',
      color: 'red'
    });
    expect(sendMessageCard).toHaveBeenCalledWith({ payload: { fake: true }, webhookURL: 'https://my-webhook.com/' });
  });

  it('should parse buttons', async () => {
    (createMessageCardPayload as unknown as jest.Mock).mockClear().mockReturnValueOnce({ fake: true });
    (sendMessageCard as unknown as jest.Mock).mockClear().mockReturnValueOnce(Promise.resolve());
    (getInput as unknown as jest.Mock).mockClear().mockImplementation(input => {
      switch (input) {
        case 'webhook': {
          return 'https://my-webhook.com/';
        }
        case 'message': {
          return 'Hello World!';
        }
        case 'buttons': {
          return 'foo http://foo.com/\nbar\nhttp://bar.com/';
        }
        default: {
          return '';
        }
      }
    });
    await expect(action()).resolves.not.toThrow();
    expect(createMessageCardPayload).toHaveBeenCalledWith({
      buttons: [{ label: 'foo', url: 'http://foo.com/' }],
      sections: [],
      text: 'Hello World!'
    });
    expect(sendMessageCard).toHaveBeenCalledWith({ payload: { fake: true }, webhookURL: 'https://my-webhook.com/' });
  });

  it('should pass-through sections', async () => {
    (createMessageCardPayload as unknown as jest.Mock).mockClear().mockReturnValueOnce({ fake: true });
    (sendMessageCard as unknown as jest.Mock).mockClear().mockReturnValueOnce(Promise.resolve());
    (getInput as unknown as jest.Mock).mockClear().mockImplementation(input => {
      switch (input) {
        case 'webhook': {
          return 'https://my-webhook.com/';
        }
        case 'message': {
          return 'Hello World!';
        }
        case 'sections': {
          return '-\n  facts:\n    -\n      name: foo\n      value: bar';
        }
        default: {
          return '';
        }
      }
    });
    await expect(action()).resolves.not.toThrow();
    expect(createMessageCardPayload).toHaveBeenCalledWith({
      buttons: [],
      sections: [{ facts: [{ name: 'foo', value: 'bar' }] }],
      text: 'Hello World!'
    });
    expect(sendMessageCard).toHaveBeenCalledWith({ payload: { fake: true }, webhookURL: 'https://my-webhook.com/' });
  });
});
