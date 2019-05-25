import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import ReactDOM from 'react-dom';
import {
  cleanup,
  render,
  fireEvent,
  wait,
  waitForDomChange,
} from '@testing-library/react';
import { createBrowserHistory } from 'history';
import { mockApolloClient } from '../../test-helpers';
import ChatsList, { getChatsQuery } from './ChatsList';

describe('ChatsList', () => {
  afterEach(() => {
    cleanup();
    window.location.pathname = '/';
  });

  it('renders fetched chats data', async () => {
    const client = mockApolloClient([
      {
        request: { query: getChatsQuery },
        result: {
          data: {
            chats: [
              {
                __typename: 'Chat',
                id: 1,
                name: 'Foo Bar',
                picture: 'https://localhost:4000/picture.jpg',
                lastMessage: {
                  __typename: 'Message',
                  id: 1,
                  content: 'Hello',
                  createdAt: new Date('1 Jan 2019 GMT'),
                },
              },
            ],
          },
        },
      },
    ]);

    const history = createBrowserHistory();

    {
      const { container, getByTestId } = render(
        <ApolloProvider client={client}>
          <ChatsList history={history}/>
        </ApolloProvider>
      );

      await waitForDomChange({ container });

      expect(getByTestId('name')).toHaveTextContent('Foo Bar');
      expect(getByTestId('picture')).toHaveAttribute(
        'src',
        'https://localhost:4000/picture.jpg'
      );
      expect(getByTestId('content')).toHaveTextContent('Hello');
      expect(getByTestId('date')).toHaveTextContent('02:00');
    }
  });

  it('should navigate to the target chat room on chat item click', async () => {
    const client = mockApolloClient([
      {
        request: { query: getChatsQuery },
        result: {
          data: {
            chats: [
              {
                __typename: 'Chat',
                id: 1,
                name: 'Foo Bar',
                picture: 'https://localhost:4000/picture.jpg',
                lastMessage: {
                  __typename: 'Message',
                  id: 1,
                  content: 'Hello',
                  createdAt: new Date('1 Jan 2019 GMT'),
                },
              },
            ],
          },
        },
      },
    ]);

    const history = createBrowserHistory();

    {
      const { container, getByTestId } = render(
        <ApolloProvider client={client}>
          <ChatsList history={history} />
        </ApolloProvider>
      );

      await waitForDomChange({ container });

      fireEvent.click(getByTestId('chat'));

      await wait(() => expect(history.location.pathname).toEqual('/chats/1'));
    }
  });
});

// IMPORTANT
// Below is a temporary hack to suppress warnings generated by a React bug.
// Source: https://github.com/testing-library/react-testing-library/issues/281
// @todo: remove this when React 16.9.0 is stable and we upgrade.
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: string[]) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
