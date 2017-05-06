App.service('signalGo', function () {
  var currentService = this;
  /* service connection status:
  0: not connected
  1: connected
  2: trying to connect
  */
  this.status = 0;

  this.observersNotifyServerConnected = [];
  this.observersServerStatusChanged = [];
  this.observersNotifyAddedService = [];
  this.observersNotifySetResponseService = [];
  this.observersNotifyCancelService = [];
  this.observersNotifyCancelServicePanel = [];
  this.observersNotifySuccessService = [];
  this.observersNotifyTransportCancelService = [];
  this.observersOnlineTransport = [];
  this.observersOnServiceStatusChanged = [];
  this.observersOfflineTransport = [];
  this.observersOnAddPassenger = [];

  this.connectToServer = connectToServer;
  this.notifyServerConnected = notifyServerConnected;
  this.notifyServerStatusChanged = notifyServerStatusChanged;
  this.notifyAddedService = notifyAddedService;
  this.notifySetResponseService = notifySetResponseService;
  this.notifyCancelService = notifyCancelService;
  this.notifyCancelServicePanel = notifyCancelServicePanel;
  this.notifySuccessService = notifySuccessService;
  this.notifyTransportCancelService = notifyTransportCancelService;
  this.notifyServiceStatusChanged = notifyServiceStatusChanged;
  this.notifyOnlineTransport = notifyOnlineTransport;
  this.notifyOfflineTransport = notifyOfflineTransport;
  this.notifyOnAddPassenger = notifyOnAddPassenger;


  /*
  func is a function
  when a server connected, server call the argument func
  */
  function notifyServerConnected(func) {
    this.observersNotifyServerConnected.push(func);
  }
  /*
  func is a function
  when a server status changed, server call the argument func
  */
  function notifyServerStatusChanged(func) {
    this.observersServerStatusChanged.push(func);
  }

  function notifyAddedService(func) {
    this.observersNotifyAddedService.push(func);
  }

  function notifySetResponseService(func) {
    this.observersNotifySetResponseService.push(func);
  }

  function notifyCancelService(func) {
    this.observersNotifyCancelService.push(func);
  }

  function notifyCancelServicePanel(func) {
    this.observersNotifyCancelServicePanel.push(func);
  }

  function notifySuccessService(func) {
    this.observersNotifySuccessService.push(func);
  }

  function notifyTransportCancelService(func) {
    this.observersNotifyTransportCancelService.push(func);
  }

  function notifyServiceStatusChanged(func) {
    this.observersOnServiceStatusChanged.push(func);
  }

  function notifyOnlineTransport(func) {
    this.observersOnlineTransport.push(func);
  }

  function notifyOfflineTransport(func) {
    this.observersOfflineTransport.push(func);
  }

  function notifyOnAddPassenger(func) {
    this.observersOnAddPassenger.push(func);
  }

  function connectToServer(onSuccessCallback, onErrorCallback, onCloseCallback) {
    if (currentService.status == 1) return;
    currentService.provider = new ClientProvider();
    currentService.status = 2;
    for (var i = 0; i < currentService.observersServerStatusChanged.length; i++) {
      currentService.observersServerStatusChanged[i](currentService.status);
    }

    // connect to server
    currentService.provider.Connect('ws://' + sysConfig.urlIP + ':' + sysConfig.urlPort + '/OffSeeServices/SignalGo', currentService.provider,
    function () { // on success connect
      currentService.provider.RegisterService("TransportService", function (myService) {
        currentService.service = myService;
        currentService.status = 1;
        if (onSuccessCallback) onSuccessCallback();
        for (var i = 0; i < currentService.observersNotifyServerConnected.length; i++) {
          currentService.observersNotifyServerConnected[i]();
        }
        for (var i = 0; i < currentService.observersServerStatusChanged.length; i++) {
          currentService.observersServerStatusChanged[i](currentService.status);
        }
      });

      currentService.providerCallback = currentService.provider.RegisterCallbackService("TransportServiceCallback");

      currentService.providerCallback.NotifyAddedService = function (serviceInfo) {
        for (var i = 0; i < currentService.observersNotifyAddedService.length; i++) {
          currentService.observersNotifyAddedService[i](serviceInfo);
        }
      }

      currentService.providerCallback.NotifySetResponseServicePanel = function (transportName, serviceId, driverInfo) {
        for (var i = 0; i < currentService.observersNotifySetResponseService.length; i++) {
          currentService.observersNotifySetResponseService[i](transportName, serviceId, driverInfo);
        }
      }

      currentService.providerCallback.NotifyCancelService = function (serviceId) {
        for (var i = 0; i < currentService.observersNotifyCancelService.length; i++) {
          currentService.observersNotifyCancelService[i](serviceId);
        }
      }

      currentService.providerCallback.NotifyCancelServicePanel = function (serviceId, reason) {
        for (var i = 0; i < currentService.observersNotifyCancelServicePanel.length; i++) {
          currentService.observersNotifyCancelServicePanel[i](serviceId, reason);
        }
      }

      currentService.providerCallback.NotifySuccessService = function (serviceInfo, driverInfo) {
        for (var i = 0; i < currentService.observersNotifySuccessService.length; i++) {
          currentService.observersNotifySuccessService[i](serviceInfo, driverInfo);
        }
      }
      currentService.providerCallback.OnlineTransport = function (transportInfo) {
        for (var i = 0; i < currentService.observersOnlineTransport.length; i++) {
          currentService.observersOnlineTransport[i](transportInfo);
        }
      }
      currentService.providerCallback.OnServiceStatusChanged = function (service) {
        for (var i = 0; i < currentService.observersOnServiceStatusChanged.length; i++) {
          currentService.observersOnServiceStatusChanged[i](service);
        }
      }
      currentService.providerCallback.OfflineTransport = function (transportId) {
        for (var i = 0; i < currentService.observersOfflineTransport.length; i++) {
          currentService.observersOfflineTransport[i](transportId);
        }
      }
      currentService.providerCallback.OnAddedPassenger = function (passenger) {
        for (var i = 0; i < currentService.observersOnAddPassenger.length; i++) {
          currentService.observersOnAddPassenger[i](passenger);
        }
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

  this.loginPanel = function (username, password, callback) {
    this.service.Send("LoginPanel", username, password, callback);
  }

  this.getAllTransports = function (index, length, callback) {
    this.service.Send("GetAllTransports", index, length, callback);
  }

  this.filterPassengers = function (name, family, phone, fromDate, toDate, index, length, callback) {
    this.service.Send("FilterPassengerList", name, family, phone, fromDate, toDate, index, length, callback);
  }

  this.filterServices = function (driversId, passengersId, contactsId, startTime, endTime, index, length, callback) {
    this.service.Send("FilterServices", driversId, passengersId, contactsId, startTime, endTime, index, length, callback);
  }

  this.getListOfServices = function (startTime, endTime, index, length, callback) {
    this.service.Send("GetListOfServices", startTime, endTime, index, length, callback);
  }

  this.getDriverInfo = function (driverId, callback) {
    this.service.Send("GetDriverInfo", driverId, callback);
  }

  this.getWaitingForCheckServices = function (callback) {
    this.service.Send("GetWaitingForCheckServices", callback);
  }

  this.getConnectedSessions = function (callback) {
    this.service.Send("GetConnectedSessions", callback);
  }

  this.getStatistics = function (from, to, callback) {
    this.service.Send("GetStatistics", from, to, callback);
  }

  this.confirmTransport = function (transportId, confirm, callback) {
    this.service.Send("ConfirmTransport", transportId, confirm, callback);
  }

  this.increaseTransportCharge = function (transportId, charge, callback) {
    this.service.Send("IncreaseTransportCharge", transportId, charge, callback);
  }

  this.editTransport = function (agencyInfo, callback) {
    this.service.Send("EditTransport", agencyInfo, callback);
  }

  this.deleteTransport = function (id, callback) {
    this.service.Send("DeleteTransport", id, callback);
  }

  this.changeTransportPassword = function (transportId, newPassword, oldPassword, callback) {
    this.service.Send("ChangeTransportPassword", transportId, newPassword, oldPassword, callback);
  }

  this.getDriversByTransportId = function (transportId, callback) {
    this.service.Send("GetDriversByTransportId", transportId, callback);
  }

  this.getTransportServicesOfDay = function (transportId, day, callback) {
    this.service.Send("GetTransportServicesOfDay", transportId, day, callback);
  }

  this.getListOfServiceDiscounts = function (startDate, endDate, index, length, callback) {
    this.service.Send("GetListOfServiceDiscounts", startDate, endDate, index, length, callback);
  }

  this.setResponse = function (transportId, serviceId, driverId, serviceMaxDelayTime, driverCommission, transportPayment, callback) {
    this.service.Send("WSetResponse", transportId, serviceId, driverId, serviceMaxDelayTime, driverCommission, transportPayment, callback);
  }

  this.editService = function (serviceInfo, callback) {
    this.service.Send("EditServiceFromPanel", serviceInfo, callback);
  }


  this.filterQuestionsQOK = function (index, length, callback) {
    this.service.Send("FilterQuestionsQOK", index, length, callback);
  }
  this.updateQuestionQOK = function (question, callback) {
    this.service.Send("UpdateQuestionQOK", question, callback);
  }
  this.addQuestionQOK = function (question, callback) {
    this.service.Send("AddQuestionQOK", question, callback);
  }
  this.removeQuestionQOK = function (questionId, callback) {
    this.service.Send("RemoveQuestionQOK", questionId, callback);
  }
  this.getAllSubjectsQOK = function (callback) {
    this.service.Send("GetAllSubjectsQOK", callback);
  }
});
