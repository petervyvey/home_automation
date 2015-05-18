var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ArangoDB;
(function (ArangoDB) {
    var ArangoServiceProvider = (function () {
        function ArangoServiceProvider() {
            this.$get = ['$http', '$q', function ($http, $q) {
                return new ArangoService($http, $q);
            }];
        }
        return ArangoServiceProvider;
    })();
    ArangoDB.ArangoServiceProvider = ArangoServiceProvider;
    var ArangoService = (function () {
        function ArangoService($http, $q) {
            this.$http = $http;
            this.$q = $q;
        }
        ArangoService.prototype.open = function (options) {
            return Database.Open(this.$http, this.$q, options);
        };
        return ArangoService;
    })();
    ArangoDB.ArangoService = ArangoService;
    var ObjectId = (function () {
        function ObjectId() {
        }
        ObjectId.ToObjectID = function (instance) {
            return angular.extend(new ObjectId(), instance);
        };
        return ObjectId;
    })();
    ArangoDB.ObjectId = ObjectId;
    var ApiResponse = (function () {
        function ApiResponse() {
            this.error = false;
            this.code = null;
            this.errorNum = null;
            this.errorMessage = null;
        }
        return ApiResponse;
    })();
    ArangoDB.ApiResponse = ApiResponse;
    var OptionsBase = (function () {
        function OptionsBase() {
        }
        OptionsBase.prototype.toParameters = function () {
            var _this = this;
            return Object.keys(this).reduce(function (previous, current, c) {
                var parameter = current + '=' + _this[current];
                return !previous ? '?' + parameter : previous + '&' + parameter;
            }, '');
        };
        return OptionsBase;
    })();
    ArangoDB.OptionsBase = OptionsBase;
    var Database = (function () {
        function Database(connection) {
            this.connection = connection;
            this.cursor = new Cursor(this.connection);
            this.document = new Document(this.connection);
            this.edge = new Edge(this.connection);
            this.edges = new Edges(this.connection);
            this.query = new Query(this.connection);
            this.simple = new Simple(this.connection);
        }
        Database.Open = function ($http, $q, options) {
            var connection = Connection.Open($http, $q, ConnectionOptions.Create(options));
            var instance = new Database(connection);
            return instance;
        };
        return Database;
    })();
    ArangoDB.Database = Database;
    var ConnectionOptions = (function () {
        function ConnectionOptions(protocol, address, port, user, password, database) {
            this.protocol = 'http';
            this.address = 'localhost';
            this.port = '8529';
            this.user = '';
            this.password = '';
            this.database = '';
            this.protocol = protocol ? protocol : this.protocol;
            this.address = address ? address : this.address;
            this.port = port ? port : this.port;
            this.user = user ? user : this.user;
            this.password = password ? password : this.password;
            this.database = database ? database : this.database;
        }
        ConnectionOptions.Create = function (options) {
            var instance = new ConnectionOptions(options.protocol, options.address, options.port, options.user, options.password, options.database);
            return instance;
        };
        ConnectionOptions.prototype.getServerUrl = function () {
            return this.protocol + '://' + this.user + ':' + this.password + '@' + this.address + ':' + this.port + '/_db/' + this.database + '/';
        };
        return ConnectionOptions;
    })();
    ArangoDB.ConnectionOptions = ConnectionOptions;
    var Connection = (function () {
        function Connection($http, $q, serverUrl) {
            this.$http = $http;
            this.$q = $q;
            this.serverUrl = serverUrl;
        }
        Connection.Open = function ($http, $q, options) {
            var serverUrl = options.getServerUrl();
            var instance = new Connection($http, $q, serverUrl);
            return instance;
        };
        Connection.prototype.getRequest = function (path) {
            var url = this.serverUrl + path;
            var deferred = this.$q.defer();
            this.$http.get(url).success(function (response) {
                deferred.resolve(response);
            }).error(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };
        Connection.prototype.postRequest = function (path, data) {
            var url = this.serverUrl + path;
            var deferred = this.$q.defer();
            this.$http.post(url, data).success(function (response) {
                deferred.resolve(response);
            }).error(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };
        Connection.prototype.putRequest = function (path, data) {
            var url = this.serverUrl + path;
            var deferred = this.$q.defer();
            this.$http.put(url, data).success(function (response) {
                deferred.resolve(response);
            }).error(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };
        Connection.prototype.patchRequest = function (path, data) {
            var url = this.serverUrl + path;
            var deferred = this.$q.defer();
            this.$http.patch(url, data).success(function (response) {
                deferred.resolve(response);
            }).error(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };
        return Connection;
    })();
    ArangoDB.Connection = Connection;
    var CursorRequest = (function () {
        function CursorRequest(query, count, batchSize, ttl, bindVars, options) {
            this.count = false;
            this.batchSize = null;
            this.ttl = null;
            this.bindVars = null;
            this.options = null;
            this.query = query ? query : this.query;
            this.count = count ? count : this.count;
            this.batchSize = batchSize ? batchSize : this.batchSize;
            this.ttl = ttl ? ttl : this.ttl;
            this.bindVars = bindVars ? bindVars : this.bindVars;
            this.options = options ? options : this.options;
        }
        CursorRequest.Create = function (request) {
            var instance = new CursorRequest(request.query, request.count, request.batchSize, request.ttl, request.bindVars, request.options);
            return instance;
        };
        return CursorRequest;
    })();
    ArangoDB.CursorRequest = CursorRequest;
    var CursorOptions = (function () {
        function CursorOptions() {
            this.fullCount = false;
        }
        return CursorOptions;
    })();
    ArangoDB.CursorOptions = CursorOptions;
    var CursorResponse = (function (_super) {
        __extends(CursorResponse, _super);
        function CursorResponse() {
            _super.apply(this, arguments);
            this.id = null;
            this.result = null;
            this.hasMore = false;
            this.count = 0;
            this.extra = null;
        }
        return CursorResponse;
    })(ApiResponse);
    ArangoDB.CursorResponse = CursorResponse;
    var Cursor = (function () {
        function Cursor(connection) {
            this.connection = connection;
        }
        Cursor.prototype.execute = function (request) {
            var deferred = this.connection.$q.defer();
            var _request = CursorRequest.Create(request);
            this.connection.postRequest(Cursor.PATH, _request).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Cursor.PATH = '_api/cursor';
        return Cursor;
    })();
    ArangoDB.Cursor = Cursor;
    var DocumentOptions = (function (_super) {
        __extends(DocumentOptions, _super);
        function DocumentOptions(createCollection, waitForSync) {
            _super.call(this);
            this.collection = '';
            this.createCollection = false;
            this.waitForSync = false;
            this.createCollection = createCollection ? createCollection : false;
            this.waitForSync = waitForSync ? waitForSync : false;
        }
        return DocumentOptions;
    })(OptionsBase);
    ArangoDB.DocumentOptions = DocumentOptions;
    var DocumentListResponse = (function () {
        function DocumentListResponse() {
        }
        return DocumentListResponse;
    })();
    ArangoDB.DocumentListResponse = DocumentListResponse;
    var DocumentHandle = (function () {
        function DocumentHandle(collection, key) {
            this.collection = collection;
            this.key = key;
        }
        DocumentHandle.Parse = function (id) {
            if (!id)
                return null;
            var parts = id.split('/');
            if (parts.length != 2)
                throw Error('BAD DOCUMENT HANDLE');
            var documentHandle = new DocumentHandle(parts[0], parts[1]);
            return documentHandle;
        };
        DocumentHandle.prototype.toString = function () {
            return this.collection + '/' + this.key;
        };
        return DocumentHandle;
    })();
    ArangoDB.DocumentHandle = DocumentHandle;
    var Document = (function () {
        function Document(connection) {
            this.connection = connection;
        }
        Document.prototype.createDocument = function (collection, document, options) {
            var deferred = this.connection.$q.defer();
            if (!options) {
                options = new DocumentOptions();
            }
            options.collection = collection;
            var parameters = options.toParameters();
            this.connection.postRequest(Document.PATH + parameters, document).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Document.prototype.getDocument = function (documentHandle) {
            var deferred = this.connection.$q.defer();
            this.connection.getRequest(Document.PATH + '/' + documentHandle.toString()).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Document.prototype.storeDocument = function (documentHandle, data) {
            var deferred = this.connection.$q.defer();
            this.connection.putRequest(Document.PATH + '/' + documentHandle.toString(), data).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Document.prototype.updateDocument = function (documentHandle, data) {
            var deferred = this.connection.$q.defer();
            this.connection.patchRequest(Document.PATH + '/' + documentHandle.toString(), data).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Document.prototype.getDocumentList = function (collection) {
            var deferred = this.connection.$q.defer();
            var options = new DocumentOptions();
            options.collection = collection;
            var parameters = options.toParameters();
            this.connection.getRequest(Document.PATH + parameters).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Document.PATH = '_api/document';
        return Document;
    })();
    ArangoDB.Document = Document;
    var Edge = (function () {
        function Edge(connection) {
            this.connection = connection;
        }
        Edge.PATH = '_api/edge';
        return Edge;
    })();
    ArangoDB.Edge = Edge;
    (function (EdgeDirection) {
        EdgeDirection[EdgeDirection["IN"] = 'in'] = "IN";
        EdgeDirection[EdgeDirection["OUT"] = 'out'] = "OUT";
    })(ArangoDB.EdgeDirection || (ArangoDB.EdgeDirection = {}));
    var EdgeDirection = ArangoDB.EdgeDirection;
    var EdgesOptions = (function (_super) {
        __extends(EdgesOptions, _super);
        function EdgesOptions(vertex, direction) {
            _super.call(this);
            this.vertex = vertex ? vertex.toString() : null;
            this.direction = direction ? direction : null;
        }
        return EdgesOptions;
    })(OptionsBase);
    ArangoDB.EdgesOptions = EdgesOptions;
    var EdgesResponse = (function (_super) {
        __extends(EdgesResponse, _super);
        function EdgesResponse() {
            _super.apply(this, arguments);
        }
        return EdgesResponse;
    })(ApiResponse);
    ArangoDB.EdgesResponse = EdgesResponse;
    var EdgesItem = (function (_super) {
        __extends(EdgesItem, _super);
        function EdgesItem() {
            _super.apply(this, arguments);
        }
        return EdgesItem;
    })(ObjectId);
    ArangoDB.EdgesItem = EdgesItem;
    var Edges = (function () {
        function Edges(connection) {
            this.connection = connection;
        }
        Edges.prototype.getEdges = function (collection, options) {
            var deferred = this.connection.$q.defer();
            if (!options) {
                options = new EdgesOptions();
            }
            var parameters = options.toParameters();
            this.connection.getRequest(Edges.PATH + '/' + collection + parameters).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Edges.PATH = '_api/edges';
        return Edges;
    })();
    ArangoDB.Edges = Edges;
    var QueryResponse = (function (_super) {
        __extends(QueryResponse, _super);
        function QueryResponse() {
            _super.apply(this, arguments);
        }
        return QueryResponse;
    })(ApiResponse);
    ArangoDB.QueryResponse = QueryResponse;
    var Query = (function () {
        function Query(connection) {
            this.connection = connection;
        }
        Query.prototype.execute = function (query) {
            var deferred = this.connection.$q.defer();
            this.connection.postRequest(Query.PATH, { query: query }).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Query.PATH = '_api/query';
        return Query;
    })();
    ArangoDB.Query = Query;
    var Simple = (function () {
        function Simple(connection) {
            this.connection = connection;
        }
        Simple.prototype.first = function (collection) {
            var deferred = this.connection.$q.defer();
            this.connection.putRequest(Simple.PATH + '/first', { collection: collection }).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Simple.prototype.last = function (collection) {
            var deferred = this.connection.$q.defer();
            this.connection.putRequest(Simple.PATH + '/last', { collection: collection }).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Simple.prototype.all = function (collection) {
            var deferred = this.connection.$q.defer();
            this.connection.putRequest(Simple.PATH + '/all', { collection: collection }).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Simple.prototype.byExample = function (collection, example) {
            var deferred = this.connection.$q.defer();
            this.connection.putRequest(Simple.PATH + '/by-example', { collection: collection, example: example }).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error ? error : { error: true });
            });
            return deferred.promise;
        };
        Simple.PATH = '_api/simple';
        return Simple;
    })();
    ArangoDB.Simple = Simple;
})(ArangoDB || (ArangoDB = {}));
module.exports = ArangoDB;
