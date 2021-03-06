import { OperationTypeNode } from 'graphql';
import { ApolloLink, Observable, Operation, NextLink, FetchResult } from 'apollo-link';
export declare namespace RestLink {
    type URI = string;
    type Endpoint = string;
    interface EndpointOptions {
        uri: Endpoint;
        responseTransformer?: ResponseTransformer | null;
    }
    interface Endpoints {
        [endpointKey: string]: Endpoint | EndpointOptions;
    }
    type Header = string;
    interface HeadersHash {
        [headerKey: string]: Header;
    }
    type InitializationHeaders = HeadersHash | Headers | string[][];
    type HeadersMergePolicy = (...headerGroups: Headers[]) => Headers;
    interface FieldNameNormalizer {
        (fieldName: string, keypath?: string[]): string;
    }
    /** injects __typename using user-supplied code */
    interface FunctionalTypePatcher {
        (data: any, outerType: string, patchDeeper: FunctionalTypePatcher): any;
    }
    /** Table of mappers that help inject __typename per type described therein */
    interface TypePatcherTable {
        [typename: string]: FunctionalTypePatcher;
    }
    interface SerializedBody {
        body: any;
        headers: InitializationHeaders;
    }
    interface Serializer {
        (data: any, headers: Headers): SerializedBody;
    }
    interface Serializers {
        [bodySerializer: string]: Serializer;
    }
    type CustomFetch = (request: RequestInfo, init: RequestInit) => Promise<Response>;
    type ResponseTransformer = (data: any, typeName: string) => any;
    interface RestLinkHelperProps {
        /** Arguments passed in via normal graphql parameters */
        args: {
            [key: string]: any;
        };
        /** Arguments added via @export(as: ) directives */
        exportVariables: {
            [key: string]: any;
        };
        /** Arguments passed directly to @rest(params: ) */
        /** Apollo Context */
        context: {
            [key: string]: any;
        };
        /** All arguments passed to the `@rest(...)` directive */
        '@rest': {
            [key: string]: any;
        };
    }
    interface PathBuilderProps extends RestLinkHelperProps {
        replacer: (opts: RestLinkHelperProps) => string;
    }
    /**
     * Used for any Error from the server when requests:
     * - terminate with HTTP Status >= 300
     * - and the response contains no data or errors
     */
    type ServerError = Error & {
        response: Response;
        result: any;
        statusCode: number;
    };
    type Options = {
        /**
         * The URI to use when fetching operations.
         *
         * Optional if endpoints provides a default.
         */
        uri?: URI;
        /**
         * A root endpoint (uri) to apply paths to or a map of endpoints.
         */
        endpoints?: Endpoints;
        /**
         * An object representing values to be sent as headers on the request.
         */
        headers?: InitializationHeaders;
        /**
         * A function that takes the response field name and converts it into a GraphQL compliant name
         *
         * @note This is called *before* @see typePatcher so that it happens after
         *       optional-field-null-insertion.
         */
        fieldNameNormalizer?: FieldNameNormalizer;
        /**
         * A function that takes a GraphQL-compliant field name and converts it back into an endpoint-specific name
         * Can be overridden at the mutation-call-site (in the rest-directive).
         */
        fieldNameDenormalizer?: FieldNameNormalizer;
        /**
         * Structure to allow you to specify the __typename when you have nested objects in your REST response!
         *
         * If you want to force Required Properties, you can throw an error in your patcher,
         *  or `delete` a field from the data response provided to your typePatcher function!
         *
         * @note: This is called *after* @see fieldNameNormalizer because that happens
         *        after optional-nulls insertion, and those would clobber normalized names.
         *
         * @warning: We're not thrilled with this API, and would love a better alternative before we get to 1.0.0
         *           Please see proposals considered in https://github.com/apollographql/apollo-link-rest/issues/48
         *           And consider submitting alternate solutions to the problem!
         */
        typePatcher?: TypePatcherTable;
        /**
         * The credentials policy you want to use for the fetch call.
         */
        credentials?: RequestCredentials;
        /**
         * Use a custom fetch to handle REST calls.
         */
        customFetch?: CustomFetch;
        /**
         * Add serializers that will serialize the body before it is emitted and will pass on
         * headers to update the request.
         */
        bodySerializers?: Serializers;
        /**
         * Set the default serializer for the link
         * @default JSON serialization
         */
        defaultSerializer?: Serializer;
        /**
         * Parse the response body of an HTTP request into the format that Apollo expects.
         */
        responseTransformer?: ResponseTransformer;
    };
    /** @rest(...) Directive Options */
    interface DirectiveOptions {
        /**
         * What HTTP method to use.
         * @default `GET`
         */
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        /** What GraphQL type to name the response */
        type?: string;
        /**
         * What path (including query) to use
         * - @optional if you provide @see DirectiveOptions.pathBuilder
         */
        path?: string;
        /**
         * What endpoint to select from the map of endpoints available to this link.
         * @default `RestLink.endpoints[DEFAULT_ENDPOINT_KEY]`
         */
        endpoint?: string;
        /**
         * Function that constructs a request path out of the Environmental
         *  state when processing this @rest(...) call.
         *
         * - @optional if you provide: @see DirectiveOptions.path
         * - **note**: providing this function means it's your responsibility to call
         *             encodeURIComponent directly if needed!
         *
         * Warning: This is an Advanced API and we are looking for syntactic & ergonomics feedback.
         */
        pathBuilder?: (props: PathBuilderProps) => string;
        /**
         * Optional method that constructs a RequestBody out of the Environmental state
         * when processing this @rest(...) call.
         * @default function that extracts the bodyKey from the args.
         *
         * Warning: This is an Advanced API and we are looking for syntactic & ergonomics feedback.
         */
        bodyBuilder?: (props: RestLinkHelperProps) => object;
        /**
         * Optional field that defines the name of the env var to extract and use as the body
         * @default "input"
         * @see https://dev-blog.apollodata.com/designing-graphql-mutations-e09de826ed97
         */
        bodyKey?: string;
        /**
         * Optional serialization function or a key that will be used look up the serializer to serialize the request body before transport.
         * @default if null will fallback to the default serializer
         */
        bodySerializer?: RestLink.Serializer | string;
        /**
         * A per-request name denormalizer, this permits special endpoints to have their
         * field names remapped differently from the default.
         * @default Uses RestLink.fieldNameDenormalizer
         */
        fieldNameDenormalizer?: RestLink.FieldNameNormalizer;
        /**
         * A method to allow insertion of __typename deep in response objects
         */
        typePatcher?: RestLink.FunctionalTypePatcher;
    }
}
/** Internal Tool that Parses Paths for RestLink -- This API should be considered experimental */
export declare class PathBuilder {
    /** For accelerating the replacement of paths that are used a lot */
    private static cache;
    /** Table to limit the amount of nagging (due to probable API Misuse) we do to once per path per launch */
    private static warnTable;
    /** Regexp that finds things that are eligible for variable replacement */
    private static argReplacement;
    static replacerForPath(path: string): (props: RestLink.PathBuilderProps) => string;
}
/**
 * Helper that makes sure our headers are of the right type to pass to Fetch
 */
export declare const normalizeHeaders: (headers: RestLink.InitializationHeaders) => Headers;
/**
 * Returns a new Headers Group that contains all the headers.
 * - If there are duplicates, they will be in the returned header set multiple times!
 */
export declare const concatHeadersMergePolicy: RestLink.HeadersMergePolicy;
/**
 * This merge policy deletes any matching headers from the link's default headers.
 * - Pass headersToOverride array & a headers arg to context and this policy will automatically be selected.
 */
export declare const overrideHeadersMergePolicy: (linkHeaders: Headers, headersToOverride: string[], requestHeaders: Headers) => Headers;
export declare const overrideHeadersMergePolicyHelper: (linkHeaders: Headers, headersToOverride: string[], requestHeaders: Headers) => Headers;
export declare const validateRequestMethodForOperationType: (method: string, operationType: OperationTypeNode) => void;
/**
 * RestLink is an apollo-link for communicating with REST services using GraphQL on the client-side
 */
export declare class RestLink extends ApolloLink {
    private readonly endpoints;
    private readonly headers;
    private readonly fieldNameNormalizer;
    private readonly fieldNameDenormalizer;
    private readonly typePatcher;
    private readonly credentials;
    private readonly customFetch;
    private readonly serializers;
    private readonly responseTransformer;
    constructor({ uri, endpoints, headers, fieldNameNormalizer, fieldNameDenormalizer, typePatcher, customFetch, credentials, bodySerializers, defaultSerializer, responseTransformer, }: RestLink.Options);
    request(operation: Operation, forward?: NextLink): Observable<FetchResult> | null;
}
