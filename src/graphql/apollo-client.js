import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: 'https://api.studio.thegraph.com/query/65229/nftindex/v0.1.1',
    cache: new InMemoryCache(),
});



export default client;
