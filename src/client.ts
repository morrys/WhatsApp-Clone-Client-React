import { InMemoryCache } from 'apollo-cache-inmemory';
import { getMainDefinition } from 'apollo-utilities';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink, split } from 'apollo-link';
import { ApolloClient } from "@wora/apollo-offline";
import ApolloCache from '@wora/apollo-cache';

const httpUri = process.env.REACT_APP_SERVER_URL + '/graphql';
const wsUri = httpUri.replace(/^https?/, 'ws');

const httpLink = new HttpLink({
  uri: httpUri,
  credentials: 'include',
});

const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    // Automatic reconnect in case of connection error
    reconnect: true,
  },
});

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    // If this is a subscription query, use wsLink, otherwise use httpLink
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

const link = ApolloLink.from([terminatingLink]);

const offlineOptions = {
  manualExecution: false, //optional
  link, //optional
  finish: (isSuccess: any, mutations: any) => { //optional
    console.log("finish offline", isSuccess, mutations)
  },
  onComplete: (options: any ) => { //optional
    const { id, offlinePayload, response } = options;
    return true;
  },
  onDiscard: ( options: any ) => { //optional
    const { id, offlinePayload , error } = options;
    return true;
  },
  onPublish: (offlinePayload: any) => { //optional
    const rand = Math.floor(Math.random() * 4) + 1  
    offlinePayload.serial = rand===1;
    console.log("offlinePayload", offlinePayload.serial)
    console.log("offlinePayload", offlinePayload)
    return offlinePayload
  }
};


const apolloCache = new ApolloCache()

export default new ApolloClient({
  link,
  cache: apolloCache,
}, offlineOptions);
