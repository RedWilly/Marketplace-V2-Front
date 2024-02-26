import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: 'https://api.studio.thegraph.com/query/65229/nftindex/version/latest',
    cache: new InMemoryCache(),
});



export default client;
