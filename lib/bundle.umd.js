(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('apollo-link'), require('graphql-anywhere/lib/async'), require('qs'), require('apollo-utilities')) :
    typeof define === 'function' && define.amd ? define(['exports', 'apollo-link', 'graphql-anywhere/lib/async', 'qs', 'apollo-utilities'], factory) :
    (factory((global['apollo-link-rest'] = {}),global.apolloLink.core,global.graphqlAnywhere.async,global.qs,global.apollo.utilities));
}(this, (function (exports,apolloLink,async,qs,apolloUtilities) { 'use strict';

    var connectionRemoveConfig = {
        test: function (directive) { return directive.name.value === 'rest'; },
        remove: true,
    };
    var removed = new Map();
    function removeRestSetsFromDocument(query) {
        var cached = removed.get(query);
        if (cached)
            return cached;
        apolloUtilities.checkDocument(query);
        var docClone = apolloUtilities.removeDirectivesFromDocument([connectionRemoveConfig], query);
        removed.set(query, docClone);
        return docClone;
    }

    var __extends = (undefined && undefined.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __assign = (undefined && undefined.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var _this = undefined;
    var popOneSetOfArrayBracketsFromTypeName = function (typename) {
        var noSpace = typename.replace(/\s/g, '');
        var sansOneBracketPair = noSpace.replace(/\[(.*)\]/, function (str, matchStr, offset, fullStr) {
            return (((matchStr != null && matchStr.length) > 0 ? matchStr : null) || noSpace);
        });
        return sansOneBracketPair;
    };
    var addTypeNameToResult = function (result, __typename, typePatcher) {
        if (Array.isArray(result)) {
            var fixedTypename_1 = popOneSetOfArrayBracketsFromTypeName(__typename);
            // Recursion needed for multi-dimensional arrays
            return result.map(function (e) { return addTypeNameToResult(e, fixedTypename_1, typePatcher); });
        }
        if (null == result ||
            typeof result === 'number' ||
            typeof result === 'boolean' ||
            typeof result === 'string') {
            return result;
        }
        return typePatcher(result, __typename, typePatcher);
    };
    var quickFindRestDirective = function (field) {
        if (field.directives && field.directives.length) {
            return field.directives.find(function (directive) { return 'rest' === directive.name.value; });
        }
        return null;
    };
    /**
     * The way graphql works today, it doesn't hand us the AST tree for our query, it hands us the ROOT
     * This method searches for REST-directive-attached nodes that are named to match this query.
     *
     * A little bit of wasted compute, but alternative would be a patch in graphql-anywhere.
     *
     * @param resultKey SearchKey for REST directive-attached item matching this sub-query
     * @param current current node in the REST-JSON-response
     * @param mainDefinition Parsed Query Definition
     * @param fragmentMap Map of Named Fragments
     * @param currentSelectionSet Current selection set we're filtering by
     */
    function findRestDirectivesThenInsertNullsForOmittedFields(resultKey, current, // currentSelectionSet starts at root, so wait until we're inside a Field tagged with an @rest directive to activate!
    mainDefinition, fragmentMap, currentSelectionSet) {
        if (currentSelectionSet == null ||
            null == current ||
            typeof current === 'number' ||
            typeof current === 'boolean' ||
            typeof current === 'string') {
            return current;
        }
        currentSelectionSet.selections.forEach(function (node) {
            if (apolloUtilities.isInlineFragment(node)) {
                findRestDirectivesThenInsertNullsForOmittedFields(resultKey, current, mainDefinition, fragmentMap, node.selectionSet);
            }
            else if (node.kind === 'FragmentSpread') {
                var fragment = fragmentMap[node.name.value];
                findRestDirectivesThenInsertNullsForOmittedFields(resultKey, current, mainDefinition, fragmentMap, fragment.selectionSet);
            }
            else if (apolloUtilities.isField(node)) {
                var name_1 = apolloUtilities.resultKeyNameFromField(node);
                if (name_1 === resultKey && quickFindRestDirective(node) != null) {
                    // Jackpot! We found our selectionSet!
                    insertNullsForAnyOmittedFields(current, mainDefinition, fragmentMap, node.selectionSet);
                }
                else {
                    findRestDirectivesThenInsertNullsForOmittedFields(resultKey, current, mainDefinition, fragmentMap, node.selectionSet);
                }
            }
            else {
                // This will give a TypeScript build-time error if you did something wrong or the AST changes!
                return (function (node) {
                    throw new Error('Unhandled Node Type in SelectionSetNode.selections');
                })(node);
            }
        });
        // Return current to have our result pass to next link in async promise chain!
        return current;
    }
    /**
     * Recursively walks a handed object in parallel with the Query SelectionSet,
     *  and inserts `null` for any field that is missing from the response.
     *
     * This is needed because ApolloClient will throw an error automatically if it's
     *  missing -- effectively making all of rest-link's selections implicitly non-optional.
     *
     * If you want to implement required fields, you need to use typePatcher to *delete*
     *  fields when they're null and you want the query to fail instead.
     *
     * @param current Current object we're patching
     * @param mainDefinition Parsed Query Definition
     * @param fragmentMap Map of Named Fragments
     * @param currentSelectionSet Current selection set we're filtering by
     */
    function insertNullsForAnyOmittedFields(current, // currentSelectionSet starts at root, so wait until we're inside a Field tagged with an @rest directive to activate!
    mainDefinition, fragmentMap, currentSelectionSet) {
        if (null == current ||
            typeof current === 'number' ||
            typeof current === 'boolean' ||
            typeof current === 'string') {
            return;
        }
        if (Array.isArray(current)) {
            // If our current value is an array, process our selection set for each entry.
            current.forEach(function (c) {
                return insertNullsForAnyOmittedFields(c, mainDefinition, fragmentMap, currentSelectionSet);
            });
            return;
        }
        currentSelectionSet.selections.forEach(function (node) {
            if (apolloUtilities.isInlineFragment(node)) {
                insertNullsForAnyOmittedFields(current, mainDefinition, fragmentMap, node.selectionSet);
            }
            else if (node.kind === 'FragmentSpread') {
                var fragment = fragmentMap[node.name.value];
                insertNullsForAnyOmittedFields(current, mainDefinition, fragmentMap, fragment.selectionSet);
            }
            else if (apolloUtilities.isField(node)) {
                var value = current[node.name.value];
                if (node.name.value === '__typename') ;
                else if (typeof value === 'undefined') {
                    // Patch in a null where the field would have been marked as missing
                    current[node.name.value] = null;
                }
                else if (value != null &&
                    typeof value === 'object' &&
                    node.selectionSet != null) {
                    insertNullsForAnyOmittedFields(value, mainDefinition, fragmentMap, node.selectionSet);
                }
            }
            else {
                // This will give a TypeScript build-time error if you did something wrong or the AST changes!
                return (function (node) {
                    throw new Error('Unhandled Node Type in SelectionSetNode.selections');
                })(node);
            }
        });
    }
    var getEndpointOptions = function (endpoints, endpoint) {
        var result = endpoints[endpoint || DEFAULT_ENDPOINT_KEY] ||
            endpoints[DEFAULT_ENDPOINT_KEY];
        if (typeof result === 'string') {
            return { uri: result };
        }
        return __assign({ responseTransformer: null }, result);
    };
    /** Replaces params in the path, keyed by colons */
    var replaceLegacyParam = function (endpoint, name, value) {
        if (value === undefined || name === undefined) {
            return endpoint;
        }
        return endpoint.replace(":" + name, value);
    };
    /** Internal Tool that Parses Paths for RestLink -- This API should be considered experimental */
    var PathBuilder = /** @class */ (function () {
        function PathBuilder() {
        }
        PathBuilder.replacerForPath = function (path) {
            if (path in PathBuilder.cache) {
                return PathBuilder.cache[path];
            }
            var queryOrigStartIndex = path.indexOf('?');
            var pathBits = path.split(PathBuilder.argReplacement);
            var chunkActions = [];
            var hasBegunQuery = false;
            pathBits.reduce(function (processedCount, bit) {
                if (bit === '' || bit === '{}') {
                    // Empty chunk, do nothing
                    return processedCount + bit.length;
                }
                var nextIndex = processedCount + bit.length;
                if (bit[0] === '{' && bit[bit.length - 1] === '}') {
                    // Replace some args!
                    var _keyPath_1 = bit.slice(1, bit.length - 1).split('.');
                    chunkActions.push(function (props, useQSEncoder) {
                        try {
                            var value = PathBuilderLookupValue(props, _keyPath_1);
                            if (!useQSEncoder ||
                                (typeof value !== 'object' || value == null)) {
                                return String(value);
                            }
                            else {
                                return qs.stringify(value);
                            }
                        }
                        catch (e) {
                            var key = [path, _keyPath_1.join('.')].join('|');
                            if (!(key in PathBuilder.warnTable)) {
                                console.warn('Warning: RestLink caught an error while unpacking', key, "This tends to happen if you forgot to pass a parameter needed for creating an @rest(path, or if RestLink was configured to deeply unpack a path parameter that wasn't provided. This message will only log once per detected instance. Trouble-shooting hint: check @rest(path: and the variables provided to this query.");
                                PathBuilder.warnTable[key] = true;
                            }
                            return '';
                        }
                    });
                }
                else {
                    chunkActions.push(bit);
                    if (!hasBegunQuery && nextIndex >= queryOrigStartIndex) {
                        hasBegunQuery = true;
                        chunkActions.push(true);
                    }
                }
                return nextIndex;
            }, 0);
            var result = function (props) {
                var hasEnteredQuery = false;
                var tmp = chunkActions.reduce(function (accumulator, action) {
                    if (typeof action === 'string') {
                        return accumulator + action;
                    }
                    else if (typeof action === 'boolean') {
                        hasEnteredQuery = true;
                        return accumulator;
                    }
                    else {
                        return accumulator + action(props, hasEnteredQuery);
                    }
                }, '');
                return tmp;
            };
            return (PathBuilder.cache[path] = result);
        };
        /** For accelerating the replacement of paths that are used a lot */
        PathBuilder.cache = {};
        /** Table to limit the amount of nagging (due to probable API Misuse) we do to once per path per launch */
        PathBuilder.warnTable = {};
        /** Regexp that finds things that are eligible for variable replacement */
        PathBuilder.argReplacement = /({[._a-zA-Z0-9]*})/;
        return PathBuilder;
    }());
    /** Private Helper Function */
    function PathBuilderLookupValue(tmp, keyPath) {
        if (keyPath.length === 0) {
            return tmp;
        }
        var remainingKeyPath = keyPath.slice(); // Copy before mutating
        var key = remainingKeyPath.shift();
        return PathBuilderLookupValue(tmp[key], remainingKeyPath);
    }
    /**
     * Some keys should be passed through transparently without normalizing/de-normalizing
     */
    var noMangleKeys = ['__typename'];
    /** Recursively descends the provided object tree and converts all the keys */
    var convertObjectKeys = function (object, __converter, keypath) {
        if (keypath === void 0) { keypath = []; }
        var converter = null;
        if (__converter.length != 2) {
            converter = function (name, keypath) {
                return __converter(name);
            };
        }
        else {
            converter = __converter;
        }
        if (object == null || typeof object !== 'object') {
            // Object is a scalar or null / undefined => no keys to convert!
            return object;
        }
        if (object instanceof FileList || object instanceof File) {
            // Object is a FileList or File object => no keys to convert!
            return object;
        }
        if (Array.isArray(object)) {
            return object.map(function (o, index) {
                return convertObjectKeys(o, converter, keypath.concat([String(index)]));
            });
        }
        return Object.keys(object).reduce(function (acc, key) {
            var value = object[key];
            if (noMangleKeys.indexOf(key) !== -1) {
                acc[key] = value;
                return acc;
            }
            var nestedKeyPath = keypath.concat([key]);
            acc[converter(key, nestedKeyPath)] = convertObjectKeys(value, converter, nestedKeyPath);
            return acc;
        }, {});
    };
    var noOpNameNormalizer = function (name) {
        return name;
    };
    /**
     * Helper that makes sure our headers are of the right type to pass to Fetch
     */
    var normalizeHeaders = function (headers) {
        // Make sure that our headers object is of the right type
        if (headers instanceof Headers) {
            return headers;
        }
        else {
            return new Headers(headers || {});
        }
    };
    /**
     * Returns a new Headers Group that contains all the headers.
     * - If there are duplicates, they will be in the returned header set multiple times!
     */
    var concatHeadersMergePolicy = function () {
        var headerGroups = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            headerGroups[_i] = arguments[_i];
        }
        return headerGroups.reduce(function (accumulator, current) {
            if (!current) {
                return accumulator;
            }
            if (!current.forEach) {
                current = normalizeHeaders(current);
            }
            current.forEach(function (value, key) {
                accumulator.append(key, value);
            });
            return accumulator;
        }, new Headers());
    };
    /**
     * This merge policy deletes any matching headers from the link's default headers.
     * - Pass headersToOverride array & a headers arg to context and this policy will automatically be selected.
     */
    var overrideHeadersMergePolicy = function (linkHeaders, headersToOverride, requestHeaders) {
        var result = new Headers();
        linkHeaders.forEach(function (value, key) {
            if (headersToOverride.indexOf(key) !== -1) {
                return;
            }
            result.append(key, value);
        });
        return concatHeadersMergePolicy(result, requestHeaders || new Headers());
    };
    var makeOverrideHeadersMergePolicy = function (headersToOverride) {
        return function (linkHeaders, requestHeaders) {
            return overrideHeadersMergePolicy(linkHeaders, headersToOverride, requestHeaders);
        };
    };
    var SUPPORTED_HTTP_VERBS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    var validateRequestMethodForOperationType = function (method, operationType) {
        switch (operationType) {
            case 'query':
                if (SUPPORTED_HTTP_VERBS.indexOf(method.toUpperCase()) !== -1) {
                    return;
                }
                throw new Error("A \"query\" operation can only support \"GET\" requests but got \"" + method + "\".");
            case 'mutation':
                if (SUPPORTED_HTTP_VERBS.indexOf(method.toUpperCase()) !== -1) {
                    return;
                }
                throw new Error('"mutation" operations do not support that HTTP-verb');
            case 'subscription':
                throw new Error('A "subscription" operation is not supported yet.');
            default:
                var _exhaustiveCheck = operationType;
                return _exhaustiveCheck;
        }
    };
    /**
     * Utility to build & throw a JS Error from a "failed" REST-response
     * @param response: HTTP Response object for this request
     * @param result: Promise that will render the body of the response
     * @param message: Human-facing error message
     */
    var rethrowServerSideError = function (response, result, message) {
        var error = new Error(message);
        error.response = response;
        error.statusCode = response.status;
        error.result = result;
        throw error;
    };
    var addTypeToNode = function (node, typename) {
        if (node === null || node === undefined || typeof node !== 'object') {
            return node;
        }
        if (!Array.isArray(node)) {
            node['__typename'] = typename;
            return node;
        }
        return node.map(function (item) {
            return addTypeToNode(item, typename);
        });
    };
    var resolver = function (fieldName, root, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
        var directives, isLeaf, resultKey, exportVariables, aliasedNode, preAliasingNode, isATypeCall, isNotARestCall, credentials, endpoints, headers, customFetch, operationType, typePatcher, mainDefinition, fragmentDefinitions, fieldNameNormalizer, linkLevelNameDenormalizer, serializers, responseTransformer, fragmentMap, _a, path, endpoint, pathBuilder, endpointOption, neitherPathsProvided, allParams, pathWithParams, _b, method, type, bodyBuilder, bodyKey, perRequestNameDenormalizer, bodySerializer, body, overrideHeaders, maybeBody_1, serializedBody, requestParams, requestUrl, response, result, parsed, error_1, transformer, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    directives = info.directives, isLeaf = info.isLeaf, resultKey = info.resultKey;
                    exportVariables = context.exportVariables;
                    aliasedNode = (root || {})[resultKey];
                    preAliasingNode = (root || {})[fieldName];
                    if (root && directives && directives.export) {
                        // @export(as:) is only supported with apollo-link-rest at this time
                        // so use the preAliasingNode as we're responsible for implementing aliasing!
                        exportVariables[directives.export.as] = preAliasingNode;
                    }
                    isATypeCall = directives && directives.type;
                    if (!isLeaf && isATypeCall) {
                        // @type(name: ) is only supported inside apollo-link-rest at this time
                        // so use the preAliasingNode as we're responsible for implementing aliasing!
                        // Also: exit early, since @type(name: ) && @rest() can't both exist on the same node.
                        if (directives.rest) {
                            throw new Error('Invalid use of @type(name: ...) directive on a call that also has @rest(...)');
                        }
                        return [2 /*return*/, addTypeToNode(preAliasingNode, directives.type.name)];
                    }
                    isNotARestCall = !directives || !directives.rest;
                    if (isNotARestCall) {
                        // This is not tagged with @rest()
                        // This might not belong to us so return the aliasNode version preferentially
                        return [2 /*return*/, aliasedNode || preAliasingNode];
                    }
                    credentials = context.credentials, endpoints = context.endpoints, headers = context.headers, customFetch = context.customFetch, operationType = context.operationType, typePatcher = context.typePatcher, mainDefinition = context.mainDefinition, fragmentDefinitions = context.fragmentDefinitions, fieldNameNormalizer = context.fieldNameNormalizer, linkLevelNameDenormalizer = context.fieldNameDenormalizer, serializers = context.serializers, responseTransformer = context.responseTransformer;
                    fragmentMap = apolloUtilities.createFragmentMap(fragmentDefinitions);
                    _a = directives.rest, path = _a.path, endpoint = _a.endpoint, pathBuilder = _a.pathBuilder;
                    endpointOption = getEndpointOptions(endpoints, endpoint);
                    neitherPathsProvided = path == null && pathBuilder == null;
                    if (neitherPathsProvided) {
                        throw new Error("One of (\"path\" | \"pathBuilder\") must be set in the @rest() directive. This request had neither, please add one");
                    }
                    if (!pathBuilder) {
                        if (!path.includes(':')) {
                            // Colons are the legacy route, and aren't uri encoded anyhow.
                            pathBuilder = PathBuilder.replacerForPath(path);
                        }
                        else {
                            console.warn("Deprecated: '@rest(path:' contains a ':' colon, this format will be removed in future versions");
                            pathBuilder = function (_a) {
                                var args = _a.args, exportVariables = _a.exportVariables;
                                var legacyArgs = __assign({}, args, exportVariables);
                                var pathWithParams = Object.keys(legacyArgs).reduce(function (acc, e) { return replaceLegacyParam(acc, e, legacyArgs[e]); }, path);
                                if (pathWithParams.includes(':')) {
                                    throw new Error('Missing parameters to run query, specify it in the query params or use ' +
                                        'an export directive. (If you need to use ":" inside a variable string' +
                                        ' make sure to encode the variables properly using `encodeURIComponent' +
                                        '`. Alternatively see documentation about using pathBuilder.)');
                                }
                                return pathWithParams;
                            };
                        }
                    }
                    allParams = {
                        args: args,
                        exportVariables: exportVariables,
                        context: context,
                        '@rest': directives.rest,
                        replacer: pathBuilder,
                    };
                    pathWithParams = pathBuilder(allParams);
                    _b = directives.rest, method = _b.method, type = _b.type, bodyBuilder = _b.bodyBuilder, bodyKey = _b.bodyKey, perRequestNameDenormalizer = _b.fieldNameDenormalizer, bodySerializer = _b.bodySerializer;
                    if (!method) {
                        method = 'GET';
                    }
                    if (!bodyKey) {
                        bodyKey = 'input';
                    }
                    body = undefined;
                    overrideHeaders = undefined;
                    if (-1 === ['GET', 'DELETE'].indexOf(method)) {
                        // Prepare our body!
                        if (!bodyBuilder) {
                            maybeBody_1 = allParams.exportVariables[bodyKey] ||
                                (allParams.args && allParams.args[bodyKey]);
                            if (!maybeBody_1) {
                                throw new Error("[GraphQL " + method + " " + operationType + " using a REST call without a body]. No `" + bodyKey + "` was detected. Pass bodyKey, or bodyBuilder to the @rest() directive to resolve this.");
                            }
                            bodyBuilder = function (argsWithExport) {
                                return maybeBody_1;
                            };
                        }
                        body = convertObjectKeys(bodyBuilder(allParams), perRequestNameDenormalizer ||
                            linkLevelNameDenormalizer ||
                            noOpNameNormalizer);
                        serializedBody = void 0;
                        if (typeof bodySerializer === 'string') {
                            if (!serializers.hasOwnProperty(bodySerializer)) {
                                throw new Error('"bodySerializer" must correspond to configured serializer. ' +
                                    ("Please make sure to specify a serializer called " + bodySerializer + " in the \"bodySerializers\" property of the RestLink."));
                            }
                            serializedBody = serializers[bodySerializer](body, headers);
                        }
                        else {
                            serializedBody = bodySerializer
                                ? bodySerializer(body, headers)
                                : serializers[DEFAULT_SERIALIZER_KEY](body, headers);
                        }
                        body = serializedBody.body;
                        overrideHeaders = new Headers(serializedBody.headers);
                    }
                    validateRequestMethodForOperationType(method, operationType || 'query');
                    requestParams = __assign({ method: method, headers: overrideHeaders || headers, body: body }, (credentials ? { credentials: credentials } : {}));
                    requestUrl = "" + endpointOption.uri + pathWithParams;
                    return [4 /*yield*/, (customFetch || fetch)(requestUrl, requestParams)];
                case 1:
                    response = _c.sent();
                    context.responses.push(response);
                    if (!response.ok) return [3 /*break*/, 2];
                    if (response.status === 204 ||
                        response.headers.get('Content-Length') === '0') {
                        // HTTP-204 means "no-content", similarly Content-Length implies the same
                        // This commonly occurs when you POST/PUT to the server, and it acknowledges
                        // success, but doesn't return your Resource.
                        result = {};
                    }
                    else {
                        result = response;
                    }
                    return [3 /*break*/, 9];
                case 2:
                    if (!(response.status === 404)) return [3 /*break*/, 3];
                    // In a GraphQL context a missing resource should be indicated by
                    // a null value rather than throwing a network error
                    result = null;
                    return [3 /*break*/, 9];
                case 3:
                    parsed = void 0;
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 8]);
                    return [4 /*yield*/, response.clone().json()];
                case 5:
                    parsed = _c.sent();
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _c.sent();
                    return [4 /*yield*/, response.clone().text()];
                case 7:
                    // its not json
                    parsed = _c.sent();
                    return [3 /*break*/, 8];
                case 8:
                    rethrowServerSideError(response, parsed, "Response not successful: Received status code " + response.status);
                    _c.label = 9;
                case 9:
                    transformer = endpointOption.responseTransformer || responseTransformer;
                    if (!transformer) return [3 /*break*/, 14];
                    _c.label = 10;
                case 10:
                    _c.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, transformer(result, type)];
                case 11:
                    result = _c.sent();
                    return [3 /*break*/, 13];
                case 12:
                    err_1 = _c.sent();
                    console.warn('An error occurred in a responseTransformer:');
                    throw err_1;
                case 13: return [3 /*break*/, 16];
                case 14:
                    if (!(result && result.json)) return [3 /*break*/, 16];
                    return [4 /*yield*/, result.json()];
                case 15:
                    result = _c.sent();
                    _c.label = 16;
                case 16:
                    if (fieldNameNormalizer !== null) {
                        result = convertObjectKeys(result, fieldNameNormalizer);
                    }
                    result = findRestDirectivesThenInsertNullsForOmittedFields(resultKey, result, mainDefinition, fragmentMap, mainDefinition.selectionSet);
                    return [2 /*return*/, addTypeNameToResult(result, type, typePatcher)];
            }
        });
    }); };
    /**
     * Default key to use when the @rest directive omits the "endpoint" parameter.
     */
    var DEFAULT_ENDPOINT_KEY = '';
    /**
     * Default key to use when the @rest directive omits the "bodySerializers" parameter.
     */
    var DEFAULT_SERIALIZER_KEY = '';
    var DEFAULT_JSON_SERIALIZER = function (data, headers) {
        headers.append('Content-Type', 'application/json');
        return {
            body: JSON.stringify(data),
            headers: headers,
        };
    };
    /**
     * RestLink is an apollo-link for communicating with REST services using GraphQL on the client-side
     */
    var RestLink = /** @class */ (function (_super) {
        __extends(RestLink, _super);
        function RestLink(_a) {
            var _b;
            var uri = _a.uri, endpoints = _a.endpoints, headers = _a.headers, fieldNameNormalizer = _a.fieldNameNormalizer, fieldNameDenormalizer = _a.fieldNameDenormalizer, typePatcher = _a.typePatcher, customFetch = _a.customFetch, credentials = _a.credentials, bodySerializers = _a.bodySerializers, defaultSerializer = _a.defaultSerializer, responseTransformer = _a.responseTransformer;
            var _this = _super.call(this) || this;
            var fallback = {};
            fallback[DEFAULT_ENDPOINT_KEY] = uri || '';
            _this.endpoints = Object.assign({}, endpoints || fallback);
            if (uri == null && endpoints == null) {
                throw new Error('A RestLink must be initialized with either 1 uri, or a map of keyed-endpoints');
            }
            if (uri != null) {
                var currentDefaultURI = (endpoints || {})[DEFAULT_ENDPOINT_KEY];
                if (currentDefaultURI != null && currentDefaultURI != uri) {
                    throw new Error("RestLink was configured with a default uri that doesn't match what's passed in to the endpoints map.");
                }
                _this.endpoints[DEFAULT_ENDPOINT_KEY] = uri;
            }
            if (_this.endpoints[DEFAULT_ENDPOINT_KEY] == null) {
                console.warn('RestLink configured without a default URI. All @rest(…) directives must provide an endpoint key!');
            }
            if (typePatcher == null) {
                _this.typePatcher = function (result, __typename, _2) {
                    return __assign({ __typename: __typename }, result);
                };
            }
            else if (!Array.isArray(typePatcher) &&
                typeof typePatcher === 'object' &&
                Object.keys(typePatcher)
                    .map(function (key) { return typePatcher[key]; })
                    .reduce(
                // Make sure all of the values are patcher-functions
                function (current, patcher) { return current && typeof patcher === 'function'; }, true)) {
                var table_1 = typePatcher;
                _this.typePatcher = function (data, outerType, patchDeeper) {
                    var __typename = data.__typename || outerType;
                    if (Array.isArray(data)) {
                        return data.map(function (d) { return patchDeeper(d, __typename, patchDeeper); });
                    }
                    var subPatcher = table_1[__typename] || (function (result) { return result; });
                    return __assign({ __typename: __typename }, subPatcher(data, __typename, patchDeeper));
                };
            }
            else {
                throw new Error('RestLink was configured with a typePatcher of invalid type!');
            }
            if (bodySerializers &&
                bodySerializers.hasOwnProperty(DEFAULT_SERIALIZER_KEY)) {
                console.warn('RestLink was configured to override the default serializer! This may result in unexpected behavior');
            }
            _this.responseTransformer = responseTransformer || null;
            _this.fieldNameNormalizer = fieldNameNormalizer || null;
            _this.fieldNameDenormalizer = fieldNameDenormalizer || null;
            _this.headers = normalizeHeaders(headers);
            _this.credentials = credentials || null;
            _this.customFetch = customFetch;
            _this.serializers = __assign((_b = {}, _b[DEFAULT_SERIALIZER_KEY] = defaultSerializer || DEFAULT_JSON_SERIALIZER, _b), (bodySerializers || {}));
            return _this;
        }
        RestLink.prototype.request = function (operation, forward) {
            var query = operation.query, variables = operation.variables, getContext = operation.getContext, setContext = operation.setContext;
            var context = getContext();
            var isRestQuery = apolloUtilities.hasDirectives(['rest'], query);
            if (!isRestQuery) {
                return forward(operation);
            }
            var nonRest = removeRestSetsFromDocument(query);
            // 1. Use the user's merge policy if any
            var headersMergePolicy = context.headersMergePolicy;
            if (headersMergePolicy == null &&
                Array.isArray(context.headersToOverride)) {
                // 2.a. Override just the passed in headers, if user provided that optional array
                headersMergePolicy = makeOverrideHeadersMergePolicy(context.headersToOverride);
            }
            else if (headersMergePolicy == null) {
                // 2.b Glue the link (default) headers to the request-context headers
                headersMergePolicy = concatHeadersMergePolicy;
            }
            var headers = headersMergePolicy(this.headers, context.headers);
            if (!headers.has('Accept')) {
                // Since we assume a json body on successful responses set the Accept
                // header accordingly if it is not provided by the user
                headers.append('Accept', 'application/json');
            }
            var credentials = context.credentials || this.credentials;
            var queryWithTypename = apolloUtilities.addTypenameToDocument(query);
            var mainDefinition = apolloUtilities.getMainDefinition(query);
            var fragmentDefinitions = apolloUtilities.getFragmentDefinitions(query);
            var operationType = (mainDefinition || {}).operation || 'query';
            var requestContext = {
                headers: headers,
                endpoints: this.endpoints,
                // Provide an empty hash for this request's exports to be stuffed into
                exportVariables: {},
                credentials: credentials,
                customFetch: this.customFetch,
                operationType: operationType,
                fieldNameNormalizer: this.fieldNameNormalizer,
                fieldNameDenormalizer: this.fieldNameDenormalizer,
                mainDefinition: mainDefinition,
                fragmentDefinitions: fragmentDefinitions,
                typePatcher: this.typePatcher,
                serializers: this.serializers,
                responses: [],
                responseTransformer: this.responseTransformer,
            };
            var resolverOptions = {};
            var obs;
            if (nonRest && forward) {
                operation.query = nonRest;
                obs = forward(operation);
            }
            else
                obs = apolloLink.Observable.of({ data: {} });
            return obs.flatMap(function (_a) {
                var data = _a.data, errors = _a.errors;
                return new apolloLink.Observable(function (observer) {
                    async.graphql(resolver, queryWithTypename, data, requestContext, variables, resolverOptions)
                        .then(function (data) {
                        setContext({
                            restResponses: (context.restResponses || []).concat(requestContext.responses),
                        });
                        observer.next({ data: data, errors: errors });
                        observer.complete();
                    })
                        .catch(function (err) {
                        if (err.name === 'AbortError')
                            return;
                        if (err.result && err.result.errors) {
                            observer.next(err.result);
                        }
                        observer.error(err);
                    });
                });
            });
        };
        return RestLink;
    }(apolloLink.ApolloLink));

    exports.RestLink = RestLink;
    exports.PathBuilder = PathBuilder;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bundle.umd.js.map
