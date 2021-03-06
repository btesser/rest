describe('Rest Base Repository', function(){
  var $httpBackend, unitTestMocker, userSchema, projectSchema, teamSchema, nagRestSchemaManager, nagRestRepositoryFactory, nagRestConfig;

  userSchema = {
    route: '/users',
    properties: {
      id: {
        sync: false
      },
      firstName: {},
      lastName: {},
      username: {},
      managerId: {}
    },
    relations: {
      job: {
        resource: 'project'
      },
      manager: {
        resource: 'user',
        property: 'managerId'
      }
    },
    dataListLocation: 'response.data.users',
    dataItemLocation: 'response.data.user'
  };

  projectSchema = {
    route: '/projects',
    properties: {
      projectId: {
        sync: false
      },
      name: {}
    },
    relations: {
      team: {
        resource: 'team',
        flatten: false
      }
    },
    idProperty: 'projectId',
    dataListLocation: 'response.data.projects',
    dataItemLocation: 'response.data.project'
  };

  teamSchema = {
    route: '/teams',
    properties: {
      id: {
        sync: false
      },
      name: {}
    },
    dataListLocation: 'response.data.teams',
    dataItemLocation: 'response.data.team'
  };

  beforeEach(module('nag.rest'));
  beforeEach(module('unitTestMocker'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    unitTestMocker = $injector.get('unitTestMocker');
    nagRestSchemaManager = $injector.get('nagRestSchemaManager');
    nagRestRepositoryFactory = $injector.get('nagRestRepositoryFactory');
    nagRestConfig = $injector.get('nagRestConfig');

    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);
    nagRestSchemaManager.add('team', teamSchema);
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  /*******************************************************************************************************************/
  /***** REPOSITORY CREATION *****************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to create and instance of a repository", function() {
    var repository = nagRestRepositoryFactory.create('user');

    expect(repository.mngr.resourceName).to.equal('user');
  });

  it("should be able to override schema values", function() {
    var repository = nagRestRepositoryFactory.create('user', {
      route: '/session',
      properties: {
        test: {},
        id: {
          sync: 'create'
        }
      }
    });

    var expectedSchema = {
      route: '/session',
      idProperty: 'id',
      properties: {
        id: {
          sync: 'create'
        },
        firstName: {},
        lastName: {},
        username: {},
        managerId: {},
        test: {}
      },
      relations: {
        job: {
          resource: 'project'
        },
        manager: {
          resource: 'user',
          property: 'managerId'
        }
      },
      dataListLocation: 'response.data.users',
      dataItemLocation: 'response.data.user',
      autoParse: true,
      requestFormatter: nagRestConfig.getRequestFormatter(),
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    };

    expect(repository.mngr.schema).to.deep.equal(expectedSchema);
  });

  /*******************************************************************************************************************/
  /***** MODEL CREATION **********************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to create instance of model", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model = repository.mngr.create();

    expect(model.mngr.state).to.equal('new');
  });

  it("should be able to create instance of model with initial data", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model = repository.mngr.create({
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(model.mngr.toJson()).to.deep.equal({
      id: null,
      firstName: 'John',
      lastName: 'Doe',
      username: null,
      managerId: null
    });
  });

  it("should be able to create instance of model with initial data", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model = repository.mngr.create({
      id: 1,
      firstName: 'John',
      lastName: 'Doe'
    }, true);

    expect(model.mngr.state).to.equal('loaded');
  });

  it("should be able to create instance of model with a customized schema", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model = repository.mngr.create({
      id: 1,
      firstName: 'John',
      lastName: 'Doe'
    }, true, {
      route: '/session',
      properties: {
        test: {},
        id: {
          sync: 'create'
        }
      }
    });

    var expectedSchema = {
      route: '/session',
      idProperty: 'id',
      properties: {
        id: {
          sync: 'create'
        },
        firstName: {},
        lastName: {},
        username: {},
        managerId: {},
        test: {}
      },
      relations: {
        job: {
          resource: 'project'
        },
        manager: {
          resource: 'user',
          property: 'managerId'
        }
      },
      dataListLocation: 'response.data.users',
      dataItemLocation: 'response.data.user',
      autoParse: true,
      requestFormatter: nagRestConfig.getRequestFormatter(),
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    };

    expect(model.mngr.schema).to.deep.equal(expectedSchema);
  });

  /*******************************************************************************************************************/
  /***** ROUTE *******************************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to generate route", function() {
    var repository = nagRestRepositoryFactory.create('user');

    expect(repository.mngr.route).to.equal('/users');
  });

  it("should not include base url in route property", function() {
    nagRestConfig.setBaseUrl('/api');
    var repository = nagRestRepositoryFactory.create('user');

    expect(repository.mngr.route).to.equal('/users');
  });

  it("should include base url in full route property", function() {
    nagRestConfig.setBaseUrl('/api');
    var repository = nagRestRepositoryFactory.create('user');

    expect(repository.mngr.fullRoute).to.equal('/api/users');
  });

  /*******************************************************************************************************************/
  /***** FIND ********************************************************************************************************/
  /*******************************************************************************************************************/

  it("should be and to find multiple models using promise method", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var models = [];

    $httpBackend.expect('GET', '/users?firstName=John').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    repository.mngr.find({
      firstName: 'John'
    }).then(function(data) {
      models = data.parsedData;

      expect(data.rawResponse).to.deep.equal({
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      });
    }, function(rawResponse) {

    });
    $httpBackend.flush();

    expect(models.length).to.equal(2);
    expect(models[0].mngr.toJson()).to.deep.equal({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
    expect(models[1].mngr.toJson()).to.deep.equal({
      id: 2,
      firstName: 'John',
      lastName: 'Doe2',
      username: 'john.doe2',
      managerId: null
    });
  });

  it("should be and to find multiple models using return value", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('GET', '/users?firstName=John').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    var models = repository.mngr.find({
      firstName: 'John'
    }).models;
    $httpBackend.flush();

    expect(models.length).to.equal(2);
    expect(models[0].mngr.toJson()).to.deep.equal({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
    expect(models[1].mngr.toJson()).to.deep.equal({
      id: 2,
      firstName: 'John',
      lastName: 'Doe2',
      username: 'john.doe2',
      managerId: null
    });
  });

  it("should be and to find a single model using promise method", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model;

    $httpBackend.expect('GET', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    repository.mngr.find(1).then(function(data) {
      model = data.parsedData;

      expect(data.rawResponse).to.deep.equal({
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      });
    }, function(rawResponse) {

    });
    $httpBackend.flush();

    expect(_.isObject(model.mngr)).to.equal(true);
    expect(model.mngr.toJson()).to.deep.equal({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
  });

  it("should be and to find a single model using return value", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('GET', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    var model = repository.mngr.find(1).models;
    $httpBackend.flush();

    expect(_.isObject(model.mngr)).to.equal(true);
    expect(model.mngr.toJson()).to.deep.equal({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
  });

  it("should be able to send custom header with the find request", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('GET', '/users?firstName=John', undefined, function(headers) {
      return headers['X-Custom-Header-UT'] === 'unit-test';
    }).respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    var models = repository.mngr.find({
      firstName: 'John'
    }, {
      headers: {
        'X-Custom-Header-UT': 'unit-test'
      }
    }).models;
    $httpBackend.flush();

    expect(models.length).to.equal(2);
  });

  it("should be able to find data with the POST http method", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('POST', '/users?firstName=John', '{"filters":[{"field":"username","condition":"LIKE","value":"john.%"}]}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    var models = repository.mngr.find({
      firstName: 'John'
    }, {
      method: 'POST',
      data: {
        filters: [{
          field: 'username',
          condition: 'LIKE',
          value: 'john.%'
        }]
      }
    }).models;
    $httpBackend.flush();

    expect(models.length).to.equal(2);
  });

  it("should support JSONP", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('JSONP', '/users/1?callback=JSON_CALLBACK').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    var model = repository.mngr.find(1, {
      method: 'JSONP'
    }).models;
    $httpBackend.flush();

    expect(_.isObject(model.mngr)).to.be.true;
  });

  /*******************************************************************************************************************/
  /***** IS ARRAY ****************************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to use the schema's isArray configuration to override the schema as a single record and not the default logic", function() {
    var repository = nagRestRepositoryFactory.create('user', {
      route: '/session',
      isArray: false
    });

    $httpBackend.expect('GET', '/session').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    var session = repository.mngr.find().models;
    $httpBackend.flush();

    expect(_.isObject(session.mngr)).to.be.true;
  });

  it("should be able to force the next request to get the data as an array even though the url says it should be a single record", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('GET', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    var models = repository.mngr.forceIsArray(true).find(1).models;
    $httpBackend.flush();

    expect(models.length).to.equal(2);
  });

  it("should be able to get data as a single record even though the url show it as a multi-record result", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('POST', '/users?firstName=John', '{"filters":[{"field":"username","condition":"LIKE","value":"john.%"}]}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    var model = repository.mngr.forceIsArray(false).find({
      firstName: 'John'
    }, {
      method: 'POST',
      data: {
        filters: [{
          field: 'username',
          condition: 'LIKE',
          value: 'john.%'
        }]
      }
    }).models;
    $httpBackend.flush();

    expect(_.isObject(model.mngr)).to.be.true;
  });

  /*******************************************************************************************************************/
  /***** FLATTENED URL ***********************************************************************************************/
  /*******************************************************************************************************************/

  it("should flattern the url when retrieving single record and flattenItemRoute is set to true", function() {
    var repository = nagRestRepositoryFactory.create('user', {
      route: '/projects/1/users',
      flattenItemRoute: true
    });

    $httpBackend.expect('GET', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    var model = repository.mngr.find(1).models;
    $httpBackend.flush();

    expect(_.isObject(model.mngr)).to.be.true;
  });

  /*******************************************************************************************************************/
  /***** DATA NORMALIZATION ******************************************************************************************/
  /*******************************************************************************************************************/

  describe("Data Normalization", function() {
    it("should be able to convert incoming data to a different format/name", function() {
      var repository = nagRestRepositoryFactory.create('user', {
        properties: {
          firstName: {
            remoteProperty: 'first_name'
          },
          lastName: {
            remoteProperty: 'lastname'
          },
          username: {
            remoteProperty: 'USERNAME'
          },
          managerId: {
            remoteProperty: 'MANAGER_IDENTIFIER'
          }
        }
      });

      $httpBackend.expect('GET', '/users/1').respond(function(method, url, data) {
        return [200, {
          response: {
            status: 'success',
            data: {
              user: {
                id: 1,
                first_name: 'John',
                lastname: 'Doe',
                USERNAME: 'john.doe',
                MANAGER_IDENTIFIER: null
              }
            }
          }
        }, {}];
      });
      var user = repository.mngr.find(1).models;
      $httpBackend.flush();

      expect(user.mngr.toJson()).to.deep.equal({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'john.doe',
        managerId: null
      });
    });
  });

  describe("Query Strings", function() {
    it("should be supported for the find() method", function() {
      var repository = nagRestRepositoryFactory.create('user');

      $httpBackend.expect('GET', '/users/1?foo=bar').respond(function(method, url, data) {
        return [200, {
          response: {
            status: 'success',
            data: {
              user: {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                username: 'john.doe',
                managerId: null
              }
            }
          }
        }, {}];
      });
      var model = repository.mngr.find(1, {}, {
        foo: 'bar'
      }).models;
      $httpBackend.flush();

      expect(_.isObject(model.mngr)).to.be.true;
    });

    it("should be supported for the find() method when using mutliple values for the find", function() {
      var repository = nagRestRepositoryFactory.create('user');

      $httpBackend.expect('GET', '/users?firstName=John&foo=bar').respond(function(method, url, data) {
        return [200, {
          response: {
            status: 'success',
            data: {
              users: [{
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                username: 'john.doe',
                managerId: null
              }, {
                id: 2,
                firstName: 'John',
                lastName: 'Doe2',
                username: 'john.doe2',
                managerId: null
              }]
            }
          }
        }, {}];
      });
      var models = repository.mngr.find({
        firstName: 'John'
      }, {}, {
        foo: 'bar'
      }).models;
      $httpBackend.flush();

      expect(models.length).to.equal(2);
    });
  });
});
