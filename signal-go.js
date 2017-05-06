App.service('signalGo', function () {
  var currentService = this;
  // config = {
  //   ip:
  //   port:
  //   path:
  //   service:
  //   callbackService:
  // }
  this.config;

  /* service connection status:
  0: not connected
  1: connected
  2: trying to connect
  */
  this.status = 0;

  this.onCallbacks = {
    'onServerConnect': [],
    'onServerStatusChange': [],
    'onServerError': [],
    'onAddedService': [],
  };

  function addToOnCallback(on, callback){
    if(currentService.onCallbacks[on] == undefined) currentService.onCallbacks[on];
    currentService.onCallbacks[on].push(callback);
  }

  function runCallbacks(on, args){
    for (var i = 0; i < currentService.onCallbacks[on].length; i++) {
      currentService.onCallbacks[on][i](args);
    }
  }

  currentService.configService = function(ip, port, path, service, callbackService){
    currentService.config = {
      'ip': ip,
      'port': port,
      'path': path,
      'service': service,
      'callbackService': callbackService
    }
  }

  function connectToServer(onSuccessCallback, onErrorCallback, onCloseCallback) {
    if (currentService.config == undefined){
      if(onErrorCallback) onErrorCallback({message: 'config not set'});
      return;
    }
    if (currentService.status == 1){
      if(onErrorCallback) onErrorCallback({message: 'you are connected'});
      return;
    }
    currentService.provider = new ClientProvider();
    currentService.status = 2;
    runCallbacks('onServerConnect', currentService.status);

    // connect to server
    currentService.provider.Connect('ws://' + currentService.config.ip + ':' + currentService.config.port + currentService.config.path, currentService.provider,
    function () { // on success connect
      currentService.provider.RegisterService(currentService.config.service, function (myService) {
        currentService.service = myService;
        currentService.status = 1;
        if (onSuccessCallback) onSuccessCallback();
        runCallbacks('onServerConnect');
        runCallbacks('onServerStatusChange', currentService.status);
      });

      currentService.providerCallback = currentService.provider.RegisterCallbackService(currentService.config.callbackService);
      currentService.providerCallback.NotifyAddedService = function (serviceInfo) {
        runCallbacks('onAddedService', serviceInfo);
      }

    }, function () { // on error connect
      currentService.status = 0;
      if (onErrorCallback) onErrorCallback();
      for (var i = 0; i < currentService.observersServerStatusChanged.length; i++) {
        currentService.observersServerStatusChanged[i](currentService.status);
      }
    }, function () { //on close connect
      currentService.status = 0;
      if (onCloseCallback) onCloseCallback();
      for (var i = 0; i < currentService.observersServerStatusChanged.length; i++) {
        currentService.observersServerStatusChanged[i](currentService.status);
      }
    });
  }

  currentService.connection = {
    connect: connectToServer,
    onServerConnect: function(callback){
      addToOnCallback('onServerConnect', callback);
    },
    onServerStatusChange: function(callback){
      addToOnCallback('onServerStatusChange', callback);
    },
    onServerError: function(callback){
      addToOnCallback('onServerError', callback);
    },
  }

  currentService.auth = {
    loginSponser: function(username, password, callback){
      currentService.service.Send('LoginSponsorInfo', username, password, callback);
    },
    loginAdmin: function(username, password, callback){
      currentService.service.Send('LoginPanel', username, password, callback);
    },
    loginOperator: function(username, password, callback){
      currentService.service.Send('LoginOperator', username, password, callback);
    },
    loginTransport: function(username, password, callback){
      currentService.service.Send('WLoginTransport', username, password, callback);
    },
  };

  currentService.question = {
    getMyQuestions: function (index, length, callback) {
      currentService.service.Send("FilterQuestionsQOK", index, length, callback);
    },
    updateQuestion: function (question, callback) {
      currentService.service.Send("UpdateQuestionQOK", question, callback);
    },
    addQuestion: function (question, callback) {
      currentService.service.Send("AddQuestionQOK", question, callback);
    },
    removeQuestion: function (questionId, callback) {
      currentService.service.Send("RemoveQuestionQOK", questionId, callback);
    },
    getSubjects: function (callback) {
      currentService.service.Send("GetAllSubjectsQOK", callback);
    },
    order: function (order, callback) {
      currentService.service.Send("AddQuestionOrderQOK", order, callback);
    },
    getStatistics: function (questionId, callback) {
      currentService.service.Send("GetQuestionStatistics", questionId, callback);
    },
  }

  currentService.credit = {
    getLog: function (index, length, callback) {
      currentService.service.Send("GetUserPaymentLogs", index, length, callback);
    },
    generateCode: function (value, limitUser, callback) {
      currentService.service.Send("GenerateUserTransferCode", value, limitUser, callback);
    },
    getCurrentCredit: function (callback) {
      currentService.service.Send("GetUserCredit", callback);
    },
  }

  currentService.taxi = {
    transport: {
      getAllTransports: function (index, length, callback) {
        currentService.service.Send("GetAllTransports", index, length, callback);
      },
      confirmTransport: function (transportId, confirm, callback) {
        currentService.service.Send("ConfirmTransport", transportId, confirm, callback);
      },
      increaseTransportCharge: function (transportId, charge, callback) {
        currentService.service.Send("IncreaseTransportCharge", transportId, charge, callback);
      },
      editTransport: function (agencyInfo, callback) {
        currentService.service.Send("EditTransport", agencyInfo, callback);
      },
      deleteTransport: function (id, callback) {
        currentService.service.Send("DeleteTransport", id, callback);
      },
      changeTransportPassword: function (transportId, newPassword, oldPassword, callback) {
        currentService.service.Send("ChangeTransportPassword", transportId, newPassword, oldPassword, callback);
      },
    },

    driver:{
      getDriverById: function (driverId, callback) {
        currentService.service.Send("GetDriverInfo", driverId, callback);
      },
      getMyDrivers: function (transportId, callback) {
        currentService.service.Send("GetDriversByTransportId", transportId, callback);
      },
      addDriver: function (DriverInfo, PlaqueInfo, callback) {
        currentService.service.Send("WAddDriver", DriverInfo, PlaqueInfo, callback);
      },
      editDriver: function (driverInfo, callback) {
        currentService.service.Send("EditDriver", driverInfo, callback)
      },
      removeDriver: function (driverId, callback) {
        currentService.service.Send("RemoveDriver", driverId, callback);
      },
      unremoveDriver: function (driverId, callback) {
        currentService.service.Send("UnRemoveDriver", driverId, callback);
      },
      isUsernameExist: function (driverUsername, callback) {//boolean: T or F
        currentService.service.Send("IsExistDriverUserName", driverUsername, callback)
      },
      isCodeExist: function (driverCode, callback) {//boolean: T or F
        currentService.service.Send("IsExistDriverCode", driverCode, callback)
      },
    },

    service: {
      filterServices: function (startTime, endTime, index, length, callback) {
        currentService.service.Send("GetListOfServices", startTime, endTime, index, length, callback);
      },
      setServiceOperatorStep: function (serviceId, step, callback) {
        currentService.service.Send("SetServiceStepFromOperator", serviceId, step, callback);
      },
      setServiceOperator: function (serviceId, callback) {
        currentService.service.Send("SetServiceOperator", serviceId, callback);
      },
      getWaitingForCheckServices: function (callback) {
        currentService.service.Send("GetWaitingForCheckServices", callback);
      },
      setResponse: function (transportId, serviceId, driverId, serviceMaxDelayTime, driverCommission, transportPayment, callback) {
        currentService.service.Send("WSetResponse", transportId, serviceId, driverId, serviceMaxDelayTime, driverCommission, transportPayment, callback);
      },
      editService: function (serviceInfo, callback) {
        currentService.service.Send("EditServiceFromPanel", serviceInfo, callback);
      },
    }
  }
});
