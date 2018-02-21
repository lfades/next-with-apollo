/**
 * react-apollo@^2.0.0 has an issue with lodash types
 * https://github.com/apollographql/react-apollo/issues/1286
 *
 * although it's fixed with react-apollo beta, adding it may not be the best
 * idea and it's also not compatible with next
 * https://github.com/apollographql/react-apollo/issues/1591
 */
declare module 'lodash.flowright';
