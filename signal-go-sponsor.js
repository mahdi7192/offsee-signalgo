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

  this.login = function (username, password, callback) {
    this.service.Send("LoginSponsorInfo", username, password, callback);
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
  this.addQuestionOrderQOK = function (order, callback) {
    this.service.Send("AddQuestionOrderQOK", order, callback);
  }
  this.getQuestionStatistics = function (questionId, callback) {
    this.service.Send("GetQuestionStatistics", questionId, callback);
  }

  this.getUserPaymentLogs = function (index, length, callback) {
    this.service.Send("GetUserPaymentLogs", index, length, callback);
  }
  this.generateUserTransferCode = function (value, limitUser, callback) {
    this.service.Send("GenerateUserTransferCode", value, limitUser, callback);
  }
  this.getUserCredit = function (callback) {
    this.service.Send("GetUserCredit", callback);
  }
});
